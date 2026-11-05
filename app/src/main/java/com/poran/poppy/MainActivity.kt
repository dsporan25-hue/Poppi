package com.poran.poppy

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.ContextCompat
import com.poran.poppy.audio.PoppyVoiceManager
import com.poran.poppy.data.SecurityPreferences
import com.poran.poppy.network.GeminiApiClient
import com.poran.poppy.ui.BgBlack
import com.poran.poppy.ui.CrimsonDark
import com.poran.poppy.ui.NeonRed
import com.poran.poppy.ui.PoppyChatScreen
import com.poran.poppy.ui.SurfaceCard

/**
 * MainActivity - Primary Gateway for POPPY AI (Phase 1: Brain)
 * Engineered by Md Saiful Islam Poran (Poran Studio)
 * Features: Jetpack Compose, Gemini API Dynamic Synthesis,
 * EncryptedSharedPreferences (AES-256), Audio Synthesis, Wake-word recognition.
 */
class MainActivity : ComponentActivity() {

    private lateinit var securityPreferences: SecurityPreferences
    private lateinit var geminiApiClient: GeminiApiClient
    private var voiceManager: PoppyVoiceManager? = null

    private var isListeningState by mutableStateOf(false)

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        if (recordAudioGranted) {
            Toast.makeText(this, "মাইক্রোফোন পারমিশন সক্রিয় করা হয়েছে।", Toast.LENGTH_SHORT).show()
            voiceManager?.speak("মাইক্রোফোন পারমিশন সক্রিয়। হ্যালো পপি বলুন।")
        } else {
            Toast.makeText(this, "ভয়েস ফিচারের জন্য অডিও পারমিশন প্রয়োজন।", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Initialize Encrypted Storage & API Client
        securityPreferences = SecurityPreferences(this)
        geminiApiClient = GeminiApiClient(securityPreferences)

        // 2. Initialize Voice Coordination Manager
        voiceManager = PoppyVoiceManager(
            context = this,
            onWakeWordDetected = {
                runOnUiThread {
                    Toast.makeText(this, "⚡ 'Hello Poppy' ওয়েক-ওয়ার্ড সনাক্ত হয়েছে!", Toast.LENGTH_SHORT).show()
                    voiceManager?.speak("হ্যাঁ, আমি শুনছি। আপনার নির্দেশ বলুন।")
                    voiceManager?.startListening()
                }
            },
            onStopWordDetected = {
                runOnUiThread {
                    Toast.makeText(this, "🛑 'Stop Poppy' নির্দেশ কার্যকর হয়েছে।", Toast.LENGTH_SHORT).show()
                    voiceManager?.stopSpeaking()
                    voiceManager?.stopListening()
                }
            },
            onSpeechRecognized = { transcript ->
                runOnUiThread {
                    // Will be forwarded to ChatScreen through UI state or event bus
                    Toast.makeText(this, "রেকর্ড: $transcript", Toast.LENGTH_SHORT).show()
                }
            },
            onListeningStatusChanged = { listening ->
                runOnUiThread {
                    isListeningState = listening
                }
            },
            onErrorOccurred = { error ->
                runOnUiThread {
                    Toast.makeText(this, error, Toast.LENGTH_SHORT).show()
                }
            }
        )

        // Request runtime permissions if not already granted
        checkAndRequestPermissions()

        // 3. Render Jetpack Compose UI
        setContent {
            val customColorScheme = darkColorScheme(
                primary = NeonRed,
                background = BgBlack,
                surface = SurfaceCard,
                secondary = CrimsonDark
            )

            MaterialTheme(colorScheme = customColorScheme) {
                PoppyChatScreen(
                    securityPreferences = securityPreferences,
                    geminiApiClient = geminiApiClient,
                    voiceManager = voiceManager,
                    isListening = isListeningState,
                    onToggleMic = {
                        if (isListeningState) {
                            voiceManager?.stopListening()
                        } else {
                            if (hasAudioPermission()) {
                                voiceManager?.startListening()
                            } else {
                                checkAndRequestPermissions()
                            }
                        }
                    },
                    onRequestPermissions = {
                        checkAndRequestPermissions()
                    }
                )
            }
        }
    }

    private fun hasAudioPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun checkAndRequestPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (!hasAudioPermission()) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }

        if (permissionsToRequest.isNotEmpty()) {
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    override fun onDestroy() {
        voiceManager?.destroy()
        voiceManager = null
        super.onDestroy()
    }
}
