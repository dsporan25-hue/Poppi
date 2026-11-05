package com.poran.poppy.audio

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

/**
 * PoppyVoiceManager - Dual SpeechRecognizer and TextToSpeech Coordinator
 * Engineered for Poran Studio (Md Saiful Islam Poran)
 * Implements "Hello Poppy" wake-word detection, "Stop Poppy" interruption,
 * and UtteranceProgressListener to eliminate mic-speaker acoustic collisions.
 */
class PoppyVoiceManager(
    private val context: Context,
    private val onWakeWordDetected: () -> Unit,
    private val onStopWordDetected: () -> Unit,
    private val onSpeechRecognized: (String) -> Unit,
    private val onListeningStatusChanged: (Boolean) -> Unit,
    private val onErrorOccurred: (String) -> Unit
) : TextToSpeech.OnInitListener {

    private var speechRecognizer: SpeechRecognizer? = null
    private var textToSpeech: TextToSpeech? = null
    private var isListening: Boolean = false
    private var isSpeaking: Boolean = false
    private var isTtsInitialized: Boolean = false
    private var wasListeningBeforeTts: Boolean = false

    private val mainHandler = Handler(Looper.getMainLooper())

    init {
        mainHandler.post {
            textToSpeech = TextToSpeech(context.applicationContext, this)
            initSpeechRecognizer()
        }
    }

    private fun initSpeechRecognizer() {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            onErrorOccurred("এই ডিভাইসে Speech Recognition উপলব্ধ নেই।")
            return
        }

        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    isListening = true
                    onListeningStatusChanged(true)
                }

                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}

                override fun onEndOfSpeech() {
                    isListening = false
                    onListeningStatusChanged(false)
                }

                override fun onError(error: Int) {
                    isListening = false
                    onListeningStatusChanged(false)

                    // Auto restart listening after silent timeout if not speaking
                    if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                        mainHandler.postDelayed({
                            if (!isSpeaking && wasListeningBeforeTts) {
                                startListening()
                            }
                        }, 500)
                    }
                }

                override fun onResults(results: Bundle?) {
                    isListening = false
                    onListeningStatusChanged(false)

                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        val heard = matches[0].trim()
                        processVoiceInput(heard)
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val partialMatches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!partialMatches.isNullOrEmpty()) {
                        val heard = partialMatches[0].trim().lowercase(Locale.ROOT)
                        if (checkIsStopWord(heard)) {
                            stopSpeaking()
                            onStopWordDetected()
                        }
                    }
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
    }

    private fun processVoiceInput(text: String) {
        val lower = text.lowercase(Locale.ROOT)

        if (checkIsWakeWord(lower)) {
            onWakeWordDetected()
            return
        }

        if (checkIsStopWord(lower)) {
            stopSpeaking()
            onStopWordDetected()
            return
        }

        onSpeechRecognized(text)
    }

    private fun checkIsWakeWord(text: String): Boolean {
        return text.contains("hello poppy") ||
                text.contains("hey poppy") ||
                text.contains("hi poppy") ||
                text.contains("হ্যালো পপি") ||
                text.contains("পপি") ||
                text == "poppy"
    }

    private fun checkIsStopWord(text: String): Boolean {
        return text.contains("stop poppy") ||
                text.contains("stop") ||
                text.contains("থামো") ||
                text.contains("থামো পপি") ||
                text.contains("বন্ধ করো") ||
                text.contains("স্টপ")
    }

    fun startListening() {
        if (isSpeaking) {
            // Do not listen while speaking to prevent loudspeaker feedback
            wasListeningBeforeTts = true
            return
        }

        mainHandler.post {
            try {
                if (speechRecognizer == null) {
                    initSpeechRecognizer()
                }

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD")
                    putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("bn-IN", "en-US"))
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                }

                speechRecognizer?.startListening(intent)
                wasListeningBeforeTts = true
            } catch (e: Exception) {
                onErrorOccurred("মাইক্রোফোন চালু করতে সমস্যা: ${e.message}")
            }
        }
    }

    fun stopListening() {
        wasListeningBeforeTts = false
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                isListening = false
                onListeningStatusChanged(false)
            } catch (_: Exception) {}
        }
    }

    fun speak(text: String) {
        if (!isTtsInitialized || textToSpeech == null) return

        mainHandler.post {
            // 1. Temporarily pause mic before audio output
            if (isListening) {
                wasListeningBeforeTts = true
                speechRecognizer?.stopListening()
                isListening = false
                onListeningStatusChanged(false)
            }

            isSpeaking = true

            // Clean code blocks or markdown syntax before speech
            val cleanText = text
                .replace(Regex("```[\\s\\S]*?```"), "কোড ব্লক তৈরি করা হয়েছে।")
                .replace(Regex("[#*_`\\[\\]()]"), "")
                .trim()

            val utteranceId = "poppy_tts_${System.currentTimeMillis()}"
            textToSpeech?.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
        }
    }

    fun stopSpeaking() {
        mainHandler.post {
            textToSpeech?.stop()
            isSpeaking = false
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            textToSpeech?.apply {
                // Try Bengali first, fallback to US
                val bengaliLocale = Locale("bn", "BD")
                val result = setLanguage(bengaliLocale)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    val bengaliIndia = Locale("bn", "IN")
                    val resultIndia = setLanguage(bengaliIndia)
                    if (resultIndia == TextToSpeech.LANG_MISSING_DATA || resultIndia == TextToSpeech.LANG_NOT_SUPPORTED) {
                        setLanguage(Locale.US)
                    }
                }

                setPitch(0.95f) // Deep futuristic JARVIS tone
                setSpeechRate(1.0f)

                setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        isSpeaking = true
                    }

                    override fun onDone(utteranceId: String?) {
                        isSpeaking = false
                        // Resume listening if active previously
                        if (wasListeningBeforeTts) {
                            mainHandler.postDelayed({
                                startListening()
                            }, 400)
                        }
                    }

                    override fun onError(utteranceId: String?) {
                        isSpeaking = false
                        if (wasListeningBeforeTts) {
                            mainHandler.postDelayed({
                                startListening()
                            }, 400)
                        }
                    }
                })
            }
        } else {
            onErrorOccurred("Text-To-Speech শুরু করা সম্ভব হয়নি।")
        }
    }

    fun destroy() {
        stopSpeaking()
        textToSpeech?.shutdown()
        textToSpeech = null

        speechRecognizer?.destroy()
        speechRecognizer = null
    }
}
