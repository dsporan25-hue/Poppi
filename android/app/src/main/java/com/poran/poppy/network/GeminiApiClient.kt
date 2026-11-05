package com.poran.poppy.network

import com.poran.poppy.data.SecurityPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.util.concurrent.TimeUnit

/**
 * GeminiApiClient - Real Gemini API Integration for POPPY AI
 * Engineered for Poran Studio (Md Saiful Islam Poran)
 * Performs asynchronous coroutine calls via OkHttp with robust Bengali error mapping.
 */
class GeminiApiClient(private val securityPreferences: SecurityPreferences) {

    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun generateContent(
        prompt: String,
        history: List<Pair<String, String>> = emptyList()
    ): Result<String> = withContext(Dispatchers.IO) {
        val apiKey = securityPreferences.getApiKey()
        if (apiKey.isBlank()) {
            return@withContext Result.failure(
                IllegalArgumentException("দয়া করে Settings-এ গিয়ে আপনার Gemini API Key সেট করুন।")
            )
        }

        val model = securityPreferences.getModel()
        val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"

        try {
            // Build Gemini REST payload
            val rootJson = JSONObject()

            // 1. System Instruction
            val systemInstruction = JSONObject()
            val systemParts = JSONArray()
            val systemText = JSONObject().apply {
                put(
                    "text",
                    """
                    You are POPPY AI (version 4.2 Neon Red), an elite Personal AI Coding Assistant, Android System Architect, and GitHub Development Specialist.
                    Created by: Md Saiful Islam Poran (Poran Studio).
                    Identity:
                    - You speak with the sharp intellect and precision of JARVIS.
                    - Respond fluently in Bengali (বাংলা) by default. Keep code blocks in standard Kotlin, Java, XML, or Gradle DSL.
                    - Specialize in Android: Jetpack Compose, Kotlin 2.0, Architecture Components, Gradle, and AndroidManifest.
                    - Never return fake success reports; be truthful, technical, and precise.
                    """.trimIndent()
                )
            }
            systemParts.put(systemText)
            systemInstruction.put("parts", systemParts)
            rootJson.put("system_instruction", systemInstruction)

            // 2. Conversation Contents
            val contentsArray = JSONArray()

            // Append recent conversation context
            for ((role, text) in history.takeLast(6)) {
                val contentObj = JSONObject()
                contentObj.put("role", if (role == "user") "user" else "model")
                val partsArray = JSONArray()
                partsArray.put(JSONObject().apply { put("text", text) })
                contentObj.put("parts", partsArray)
                contentsArray.put(contentObj)
            }

            // Append current prompt
            val currentContent = JSONObject()
            currentContent.put("role", "user")
            val currentParts = JSONArray()
            currentParts.put(JSONObject().apply { put("text", prompt) })
            currentContent.put("parts", currentParts)
            contentsArray.put(currentContent)

            rootJson.put("contents", contentsArray)

            val requestBody = rootJson.toString().toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(url)
                .post(requestBody)
                .header("User-Agent", "POPPY-AI-Android/1.0.0")
                .build()

            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string().orEmpty()

                if (response.isSuccessful) {
                    val parsedText = extractCandidateText(responseBody)
                    if (parsedText.isNotBlank()) {
                        Result.success(parsedText)
                    } else {
                        Result.failure(Exception("Gemini থেকে কোনো টেক্সট উত্তর পাওয়া যায়নি।"))
                    }
                } else {
                    val code = response.code
                    val errorMsg = when (code) {
                        400, 401, 403 -> "ভুল API Key! অনুগ্রহ করে Settings পেজে আপনার Gemini API Key যাচাই করুন।"
                        429 -> "API কোটা শেষ হয়ে গেছে! অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন বা নতুন API Key ব্যবহার করুন।"
                        in 500..599 -> "Gemini সার্ভার সমস্যা (HTTP $code)! কিছুক্ষণ পর আবার চেষ্টা করুন।"
                        else -> "অনুরোধ ব্যর্থ হয়েছে (HTTP $code): ${extractErrorMessage(responseBody)}"
                    }
                    Result.failure(Exception(errorMsg))
                }
            }
        } catch (e: SocketTimeoutException) {
            Result.failure(Exception("অনুরোধ টাইমআউট হয়েছে! সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।"))
        } catch (e: UnknownHostException) {
            Result.failure(Exception("ইন্টারনেট সংযোগ নেই! আপনার মোবাইল ডেটা বা ওয়াইফাই চেক করুন।"))
        } catch (e: IOException) {
            Result.failure(Exception("নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করুন (${e.message})।"))
        } catch (e: Exception) {
            Result.failure(Exception("অপ্রত্যাশিত ত্রুটি: ${e.localizedMessage ?: "অজানা সমস্যা"}"))
        }
    }

    private fun extractCandidateText(jsonStr: String): String {
        return try {
            val root = JSONObject(jsonStr)
            val candidates = root.optJSONArray("candidates") ?: return ""
            if (candidates.length() > 0) {
                val firstCandidate = candidates.getJSONObject(0)
                val content = firstCandidate.optJSONObject("content") ?: return ""
                val parts = content.optJSONArray("parts") ?: return ""
                if (parts.length() > 0) {
                    val firstPart = parts.getJSONObject(0)
                    return firstPart.optString("text", "").trim()
                }
            }
            ""
        } catch (e: Exception) {
            ""
        }
    }

    private fun extractErrorMessage(jsonStr: String): String {
        return try {
            val root = JSONObject(jsonStr)
            val error = root.optJSONObject("error")
            error?.optString("message", "") ?: ""
        } catch (e: Exception) {
            ""
        }
    }
}
