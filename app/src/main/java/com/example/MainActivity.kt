package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.theme.MyApplicationTheme
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // STEP 1: Configure App Check with launch intent before any UI or Firebase operations
        configureAppCheck(this, intent)

        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF1F103B)
                ) {
                    CosmicPopGameScreen()
                }
            }
        }
    }
}

class AndroidCosmicBridge(
    private val context: Context,
    private val onOpenAiArchitect: () -> Unit
) {
    private val prefs by lazy {
        context.getSharedPreferences("cosmic_pop_local_store", Context.MODE_PRIVATE)
    }

    @JavascriptInterface
    fun saveStateJson(json: String) {
        try {
            prefs.edit().putString("saved_game_state", json).apply()
        } catch (_: Exception) {
        }
    }

    @JavascriptInterface
    fun loadStateJson(): String {
        return try {
            prefs.getString("saved_game_state", "") ?: ""
        } catch (_: Exception) {
            ""
        }
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            val clamped = durationMs.coerceIn(5L, 200L)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vm?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(clamped, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vib = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vib?.vibrate(
                        VibrationEffect.createOneShot(clamped, VibrationEffect.DEFAULT_AMPLITUDE)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    vib?.vibrate(clamped)
                }
            }
        } catch (_: Exception) {
        }
    }

    @JavascriptInterface
    fun openAiArchitect() {
        onOpenAiArchitect()
    }

    @JavascriptInterface
    fun openExternalUrl(url: String) {
        try {
            val intent = android.content.Intent(
                android.content.Intent.ACTION_VIEW,
                android.net.Uri.parse(url)
            ).apply {
                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (_: Exception) {
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun CosmicPopGameScreen(
    aiViewModel: CosmicAiViewModel = viewModel()
) {
    val blueprintState by aiViewModel.blueprintState.collectAsStateWithLifecycle()
    val nebulaImageState by aiViewModel.nebulaImageState.collectAsStateWithLifecycle()

    var showAiArchitectModal by rememberSaveable { mutableStateOf(false) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var pageLoaded by remember { mutableStateOf(false) }

    // Push live AI generation status and completed 3D blueprints into the 3D WebGL engine when triggered
    LaunchedEffect(blueprintState, pageLoaded) {
        val wv = webViewRef ?: return@LaunchedEffect
        if (!pageLoaded) return@LaunchedEffect

        when (val state = blueprintState) {
            is BlueprintUiState.Loading -> {
                val safeMsg = JSONObject.quote(state.statusMessage)
                wv.evaluateJavascript("window.setAiGeneratingStatus && window.setAiGeneratingStatus(true, $safeMsg);", null)
            }
            is BlueprintUiState.Success -> {
                val safeJson = JSONObject.quote(state.blueprint.rawJson)
                wv.evaluateJavascript(
                    "window.setAiGeneratingStatus && window.setAiGeneratingStatus(false); window.applyAiCosmicBlueprint && window.applyAiCosmicBlueprint($safeJson);",
                    null
                )
            }
            is BlueprintUiState.Error -> {
                wv.evaluateJavascript("window.setAiGeneratingStatus && window.setAiGeneratingStatus(false);", null)
            }
            BlueprintUiState.Idle -> {
                wv.evaluateJavascript("window.setAiGeneratingStatus && window.setAiGeneratingStatus(false);", null)
            }
        }
    }

    // Push synthesized AI nebula backdrop into the 3D WebGL viewport when ready
    LaunchedEffect(nebulaImageState, pageLoaded) {
        val wv = webViewRef ?: return@LaunchedEffect
        if (!pageLoaded) return@LaunchedEffect

        if (nebulaImageState is NebulaImageUiState.Success) {
            val dataUrl = (nebulaImageState as NebulaImageUiState.Success).dataUrl
            val safeUrl = JSONObject.quote(dataUrl)
            wv.evaluateJavascript("window.applyAiCosmicBackground && window.applyAiCosmicBackground($safeUrl);", null)
        }
    }

    BackHandler(enabled = showAiArchitectModal) {
        showAiArchitectModal = false
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // 1. Full-Screen 9:16 3D WebGL Engine & Minimalist Cosmic HUD (100% Offline Ready)
        AndroidView(
            modifier = Modifier
                .fillMaxSize()
                .testTag("cosmic_webgl_viewport"),
            factory = { ctx ->
                WebView(ctx).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    settings.allowFileAccess = true
                    settings.cacheMode = WebSettings.LOAD_DEFAULT
                    setBackgroundColor(android.graphics.Color.parseColor("#2A164D"))

                    addJavascriptInterface(
                        AndroidCosmicBridge(ctx) {
                            post { showAiArchitectModal = true }
                        },
                        "AndroidCosmicBridge"
                    )

                    webChromeClient = WebChromeClient()
                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            pageLoaded = true
                        }
                    }

                    loadUrl("file:///android_asset/web/index.html")
                    webViewRef = this
                }
            },
            update = { wv ->
                webViewRef = wv
            }
        )

        // 2. AI Cosmic Architect Studio Modal (Powered by Firebase AI Logic: gemini-3.8-flash & gemini-nano-banana-2.1)
        AnimatedVisibility(
            visible = showAiArchitectModal,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            AiCosmicArchitectModal(
                blueprintState = blueprintState,
                nebulaImageState = nebulaImageState,
                onGenerateBlueprint = { prompt ->
                    aiViewModel.generateCosmicBlueprint(prompt)
                },
                onGenerateNebulaImage = { prompt ->
                    aiViewModel.generateNebulaBackdrop(prompt)
                },
                onApplyAndClose = {
                    val state = blueprintState
                    if (state is BlueprintUiState.Success) {
                        val safeJson = JSONObject.quote(state.blueprint.rawJson)
                        webViewRef?.evaluateJavascript(
                            "window.applyAiCosmicBlueprint && window.applyAiCosmicBlueprint($safeJson);",
                            null
                        )
                    }
                    showAiArchitectModal = false
                },
                onDismiss = { showAiArchitectModal = false }
            )
        }
    }
}

@Composable
private fun AiCosmicArchitectModal(
    blueprintState: BlueprintUiState,
    nebulaImageState: NebulaImageUiState,
    onGenerateBlueprint: (String) -> Unit,
    onGenerateNebulaImage: (String) -> Unit,
    onApplyAndClose: () -> Unit,
    onDismiss: () -> Unit
) {
    var promptText by rememberSaveable {
        mutableStateOf("Neon Supernova Star cluster with Hot Magenta, Cyan, and Electric Violet spheres")
    }

    val presetPrompts = listOf(
        "Violet Pyramid • Royal Purple & Pink",
        "Emerald Halo • Tilted Cyber Mint Torus",
        "Solar Torus • Crimson & Golden Sunburst",
        "Indigo Helix • Rotating DNA Spiral",
        "Sakura Heart • Pastel Rose & Lilac",
        "Quantum Diamond • Neon Cyan & Coral"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xCC0D061E))
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 460.dp)
                .border(
                    width = 1.dp,
                    color = Color.White.copy(alpha = 0.28f),
                    shape = RoundedCornerShape(28.dp)
                ),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFF231344).copy(alpha = 0.96f)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp)
            ) {
                // Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = Color(0xFFFFE66D),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = stringResource(R.string.ai_architect_title),
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .size(48.dp)
                            .testTag("close_ai_architect_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = stringResource(R.string.close_Sheet),
                            tint = Color.White
                        )
                    }
                }

                Text(
                    text = stringResource(R.string.ai_architect_subtitle),
                    color = Color.White.copy(alpha = 0.78f),
                    fontSize = 13.sp,
                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                )

                // Hero Banner Preview (shows AI generated Nebula if available, or bundled cosmic hero banner)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(128.dp)
                        .clip(RoundedCornerShape(18.dp))
                        .border(1.dp, Color.White.copy(alpha = 0.22f), RoundedCornerShape(18.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    when (val imgState = nebulaImageState) {
                        is NebulaImageUiState.Success -> {
                            Image(
                                bitmap = imgState.bitmap.asImageBitmap(),
                                contentDescription = "AI Synthesized Cosmic Nebula",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                        else -> {
                            Image(
                                painter = painterResource(id = R.drawable.img_hero_cosmic_cluster_1794482002666),
                                contentDescription = "Cosmic 3D Cluster Hero",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }

                    if (nebulaImageState is NebulaImageUiState.Loading) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color(0xAA120828)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator(
                                    color = Color(0xFFFF4D9D),
                                    modifier = Modifier.size(28.dp),
                                    strokeWidth = 3.dp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = stringResource(R.string.ai_status_generating_bg),
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Quick Preset Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    presetPrompts.forEach { preset ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(999.dp))
                                .background(Color.White.copy(alpha = 0.12f))
                                .border(1.dp, Color.White.copy(alpha = 0.24f), RoundedCornerShape(999.dp))
                                .clickable { promptText = preset }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = preset,
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Prompt Input Field
                OutlinedTextField(
                    value = promptText,
                    onValueChange = { promptText = it },
                    label = {
                        Text(
                            text = stringResource(R.string.ai_prompt_hint),
                            color = Color.White.copy(alpha = 0.75f)
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("ai_prompt_input"),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFFFF4D9D),
                        unfocusedBorderColor = Color.White.copy(alpha = 0.3f),
                        cursorColor = Color(0xFFFFE66D)
                    ),
                    maxLines = 3
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Action Buttons: 1) Generate 3D Model & Palette, 2) Synthesize Nebula Backdrop
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = { onGenerateBlueprint(promptText) },
                        enabled = blueprintState !is BlueprintUiState.Loading,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("generate_3d_blueprint_button"),
                        shape = RoundedCornerShape(999.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF7C3AED),
                            contentColor = Color.White
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Sculpt 3D Model",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    OutlinedButton(
                        onClick = { onGenerateNebulaImage(promptText) },
                        enabled = nebulaImageState !is NebulaImageUiState.Loading,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("generate_nebula_bg_button"),
                        shape = RoundedCornerShape(999.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color.White
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = Color(0xFFFFE66D),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "AI Nebula Art",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Blueprint Status / Result Preview Card
                when (val state = blueprintState) {
                    is BlueprintUiState.Loading -> {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color.White.copy(alpha = 0.08f))
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(
                                color = Color(0xFFFFE66D),
                                modifier = Modifier.size(22.dp),
                                strokeWidth = 2.5.dp
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = state.statusMessage,
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                    is BlueprintUiState.Success -> {
                        val bp = state.blueprint
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(18.dp))
                                .background(
                                    Brush.linearGradient(
                                        colors = listOf(
                                            parseComposeColor(bp.bgInnerHex),
                                            parseComposeColor(bp.bgOuterHex)
                                        )
                                    )
                                )
                                .border(1.dp, Color.White.copy(alpha = 0.28f), RoundedCornerShape(18.dp))
                                .padding(14.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${bp.levelName} (${bp.shapeType.uppercase()})",
                                    color = Color.White,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black
                                )
                                Text(
                                    text = "${bp.timeLimitSeconds}s",
                                    color = Color(0xFFFFE66D),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Text(
                                text = bp.cosmicLore,
                                color = Color.White.copy(alpha = 0.86f),
                                fontSize = 12.sp,
                                modifier = Modifier.padding(top = 4.dp, bottom = 10.dp)
                            )
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "SPHERE PALETTE:",
                                    color = Color.White.copy(alpha = 0.75f),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold
                                )
                                bp.sphereColors.forEach { hex ->
                                    Box(
                                        modifier = Modifier
                                            .size(22.dp)
                                            .clip(CircleShape)
                                            .background(parseComposeColor(hex))
                                            .border(1.dp, Color.White, CircleShape)
                                    )
                                }
                            }
                        }
                    }
                    is BlueprintUiState.Error -> {
                        Text(
                            text = state.message,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                                .testTag("ai_blueprint_error_text")
                        )
                    }
                    BlueprintUiState.Idle -> {}
                }

                if (nebulaImageState is NebulaImageUiState.Error) {
                    Text(
                        text = nebulaImageState.message,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 6.dp)
                            .testTag("ai_nebula_error_text")
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Launch in 3D Viewport Button
                Button(
                    onClick = onApplyAndClose,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .testTag("launch_ai_level_button"),
                    shape = RoundedCornerShape(999.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF2E7E),
                        contentColor = Color.White
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = stringResource(R.string.ai_apply_to_game),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }
    }
}

private fun parseComposeColor(hex: String): Color {
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (_: Exception) {
        Color(0xFF6D4AA8)
    }
}
