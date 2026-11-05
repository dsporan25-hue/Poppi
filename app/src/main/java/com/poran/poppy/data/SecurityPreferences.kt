package com.poran.poppy.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * SecurityPreferences - Secure Storage for POPPY AI
 * Engineered for Poran Studio (Md Saiful Islam Poran)
 * Manages Gemini API Key and Model configuration using hardware-backed EncryptedSharedPreferences (AES-256)
 */
class SecurityPreferences(context: Context) {

    private val prefs: SharedPreferences

    init {
        prefs = try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            EncryptedSharedPreferences.create(
                context,
                PREF_FILE_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            // Graceful fallback to private mode SharedPreferences if hardware Keystore is unavailable
            context.getSharedPreferences("${PREF_FILE_NAME}_fallback", Context.MODE_PRIVATE)
        }
    }

    fun saveApiKey(apiKey: String) {
        prefs.edit().putString(KEY_GEMINI_API_KEY, apiKey.trim()).apply()
    }

    fun getApiKey(): String {
        return prefs.getString(KEY_GEMINI_API_KEY, "") ?: ""
    }

    fun hasApiKey(): Boolean {
        return getApiKey().isNotBlank()
    }

    fun saveModel(model: String) {
        prefs.edit().putString(KEY_GEMINI_MODEL, model.trim()).apply()
    }

    fun getModel(): String {
        val saved = prefs.getString(KEY_GEMINI_MODEL, DEFAULT_MODEL) ?: DEFAULT_MODEL
        return if (saved.isNotBlank()) saved else DEFAULT_MODEL
    }

    fun saveLanguage(language: String) {
        prefs.edit().putString(KEY_LANGUAGE, language).apply()
    }

    fun getLanguage(): String {
        return prefs.getString(KEY_LANGUAGE, "bn") ?: "bn"
    }

    fun clearAll() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREF_FILE_NAME = "poppy_secure_prefs"
        private const val KEY_GEMINI_API_KEY = "gemini_api_key"
        private const val KEY_GEMINI_MODEL = "gemini_model"
        private const val KEY_LANGUAGE = "app_language"

        const val DEFAULT_MODEL = "gemini-2.5-flash"
    }
}
