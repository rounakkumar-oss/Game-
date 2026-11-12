package com.example

import android.graphics.Bitmap
import android.util.Base64
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.ImagePart
import com.google.firebase.ai.type.ResponseModality
import com.google.firebase.ai.type.Schema
import com.google.firebase.ai.type.generationConfig
import java.io.ByteArrayOutputStream
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import org.json.JSONObject

private const val TAG = "CosmicAiViewModel"

data class CosmicBlueprint(
    val levelName: String,
    val shapeType: String,
    val bgInnerHex: String,
    val bgOuterHex: String,
    val sphereColors: List<String>,
    val twistFactor: Double,
    val timeLimitSeconds: Int,
    val cosmicLore: String,
    val rawJson: String
)

sealed interface BlueprintUiState {
    data object Idle : BlueprintUiState
    data class Loading(val statusMessage: String) : BlueprintUiState
    data class Success(val blueprint: CosmicBlueprint) : BlueprintUiState
    data class Error(val message: String) : BlueprintUiState
}

sealed interface NebulaImageUiState {
    data object Idle : NebulaImageUiState
    data object Loading : NebulaImageUiState
    data class Success(val bitmap: Bitmap, val dataUrl: String) : NebulaImageUiState
    data class Error(val message: String) : NebulaImageUiState
}

class CosmicAiViewModel : ViewModel() {

    private val cosmicBlueprintSchema = Schema.obj(
        properties = mapOf(
            "levelName" to Schema.string(
                description = "2-3 word evocative cosmic title, e.g. 'Violet Pyramid' or 'Astral Nova Helix'"
            ),
            "shapeType" to Schema.enumeration(
                values = listOf(
                    "pyramid",
                    "halo",
                    "torus",
                    "star",
                    "helix",
                    "cube",
                    "diamond",
                    "heart",
                    "crescent",
                    "doublering",
                    "spherecore"
                ),
                description = "3D geometric cluster topology"
            ),
            "bgInnerHex" to Schema.string(
                description = "Center radial gradient hex color (#RRGGBB), deep luminous cosmic tone"
            ),
            "bgOuterHex" to Schema.string(
                description = "Outer radial gradient hex color (#RRGGBB), darker deep-space tone"
            ),
            "sphereColors" to Schema.array(
                items = Schema.string(description = "Vibrant glossy pastel-neon sphere hex color (#RRGGBB)"),
                description = "3 or 4 high-contrast harmonious sphere hex colors"
            ),
            "twistFactor" to Schema.double(
                description = "3D axial twist modifier between -0.65 and 0.65"
            ),
            "timeLimitSeconds" to Schema.integer(
                description = "Countdown timer in seconds between 60 and 90"
            ),
            "cosmicLore" to Schema.string(
                description = "Short 1-sentence visual description of this 3D cosmic cluster"
            )
        )
    )

    private val blueprintModel by lazy {
        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = generationConfig {
                responseMimeType = "application/json"
                responseSchema = cosmicBlueprintSchema
            }
        )
    }

    private val nebulaImageModel by lazy {
        Firebase.ai.generativeModel(
            modelName = "gemini-nano-banana-2.1",
            generationConfig = generationConfig {
                responseModalities = listOf(ResponseModality.IMAGE)
            }
        )
    }

    private val _blueprintState = MutableStateFlow<BlueprintUiState>(BlueprintUiState.Idle)
    val blueprintState: StateFlow<BlueprintUiState> = _blueprintState.asStateFlow()

    private val _nebulaImageState = MutableStateFlow<NebulaImageUiState>(NebulaImageUiState.Idle)
    val nebulaImageState: StateFlow<NebulaImageUiState> = _nebulaImageState.asStateFlow()

    private var initialAiBootTriggered = false

    fun triggerInitialAiCreationIfNeeded() {
        if (initialAiBootTriggered) return
        initialAiBootTriggered = true
        generateCosmicBlueprint(
            userPrompt = "Create an iconic dreamy 3D Violet Pyramid cosmic sphere cluster with royal purple to soft lavender radial space backdrop and vibrant Deep Violet, Lavender, and Pastel Pink glossy spheres"
        )
    }

    fun generateCosmicBlueprint(userPrompt: String) {
        val cleanPrompt = userPrompt.trim().ifEmpty {
            "Sculpt a vibrant 3D cosmic sphere cluster with a dreamy neon-pastel color palette and deep space radial gradient"
        }

        viewModelScope.launch {
            _blueprintState.value = BlueprintUiState.Loading("AI sculpting 3D cluster & palette…")
            try {
                val fullPrompt = """
                    Design a 3D sphere-cluster puzzle shooter level based on this request: "$cleanPrompt".
                    Ensure all hex colors are valid 6-digit #RRGGBB strings (3 to 4 distinct sphereColors that pop clearly against bgInnerHex and bgOuterHex).
                """.trimIndent()

                val response = withTimeout(60_000L) {
                    blueprintModel.generateContent(fullPrompt)
                }

                val jsonString = response.text
                if (jsonString.isNullOrBlank()) {
                    _blueprintState.value = BlueprintUiState.Error("Model returned an empty blueprint.")
                    return@launch
                }

                val json = JSONObject(jsonString)
                val colorsArr = json.getJSONArray("sphereColors")
                val parsedColors = mutableListOf<String>()
                for (i in 0 until colorsArr.length()) {
                    val c = colorsArr.getString(i).trim()
                    if (c.startsWith("#") && (c.length == 7 || c.length == 4)) {
                        parsedColors.add(c)
                    }
                }
                val finalColors = if (parsedColors.size >= 3) {
                    parsedColors.take(4)
                } else {
                    listOf("#5E2BFF", "#B892FF", "#FF85C0")
                }

                val blueprint = CosmicBlueprint(
                    levelName = json.optString("levelName", "Cosmic Pyramid"),
                    shapeType = json.optString("shapeType", "pyramid"),
                    bgInnerHex = sanitizeHex(json.optString("bgInnerHex", "#6D4AA8"), "#6D4AA8"),
                    bgOuterHex = sanitizeHex(json.optString("bgOuterHex", "#3B2268"), "#3B2268"),
                    sphereColors = finalColors,
                    twistFactor = json.optDouble("twistFactor", 0.0).coerceIn(-0.7, 0.7),
                    timeLimitSeconds = json.optInt("timeLimitSeconds", 75).coerceIn(45, 120),
                    cosmicLore = json.optString("cosmicLore", "A resonant 3D lattice suspended above a translucent collector ring."),
                    rawJson = jsonString
                )

                _blueprintState.value = BlueprintUiState.Success(blueprint)
            } catch (e: TimeoutCancellationException) {
                Log.e(TAG, "AI 3D blueprint generation timed out", e)
                _blueprintState.value = BlueprintUiState.Error(
                    "AI 3D model generation timed out after 60 seconds. Please try again."
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Failed to generate AI 3D blueprint", e)
                _blueprintState.value = BlueprintUiState.Error(
                    e.localizedMessage ?: "AI 3D generation failed."
                )
            }
        }
    }

    fun generateNebulaBackdrop(themeDescription: String) {
        val cleanDesc = themeDescription.trim().ifEmpty {
            "Dreamy minimalist deep-space royal violet and soft cyan bokeh nebula with soft starlight dust, no text"
        }

        viewModelScope.launch {
            _nebulaImageState.value = NebulaImageUiState.Loading
            try {
                val bitmap = withTimeout(60_000L) {
                    val response = nebulaImageModel.generateContent(
                        "Minimalist dreamy cosmic deep space background art for a 3D mobile puzzle game: $cleanDesc. Soft glowing bokeh starlight, smooth atmospheric gradients, no text, no UI."
                    )
                    response.candidates.firstOrNull()
                        ?.content?.parts?.filterIsInstance<ImagePart>()
                        ?.firstOrNull()?.image
                }

                if (bitmap != null) {
                    val dataUrl = bitmapToDataUrl(bitmap)
                    _nebulaImageState.value = NebulaImageUiState.Success(bitmap, dataUrl)
                } else {
                    _nebulaImageState.value = NebulaImageUiState.Error(
                        "No image was returned by the model."
                    )
                }
            } catch (e: TimeoutCancellationException) {
                Log.e(TAG, "Nebula backdrop generation timed out", e)
                _nebulaImageState.value = NebulaImageUiState.Error(
                    "Backdrop generation timed out after 60 seconds."
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Nebula backdrop generation failed", e)
                _nebulaImageState.value = NebulaImageUiState.Error(
                    e.localizedMessage ?: "Nebula backdrop generation failed."
                )
            }
        }
    }

    private fun sanitizeHex(input: String, fallback: String): String {
        val trimmed = input.trim()
        return if (trimmed.matches(Regex("^#[0-9A-Fa-f]{6}$"))) trimmed else fallback
    }

    private fun bitmapToDataUrl(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 82, stream)
        val bytes = stream.toByteArray()
        val b64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
        return "data:image/jpeg;base64,$b64"
    }
}
