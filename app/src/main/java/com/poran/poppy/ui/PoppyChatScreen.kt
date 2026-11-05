package com.poran.poppy.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poran.poppy.R
import com.poran.poppy.audio.PoppyVoiceManager
import com.poran.poppy.data.SecurityPreferences
import com.poran.poppy.network.GeminiApiClient
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// Black + Red Neon Theme Palette
val BgBlack = Color(0xFF050508)
val SurfaceCard = Color(0xFF110E14)
val NeonRed = Color(0xFFFF2A4B)
val CrimsonDark = Color(0xFF28070D)
val BorderDark = Color(0xFF332026)
val TextMuted = Color(0xFF9E9EA8)
val TextWhite = Color(0xFFF5F5F7)
val CodeBg = Color(0xFF0A090E)

data class UiChatMessage(
    val id: String = "${System.currentTimeMillis()}-${(100..999).random()}",
    val role: String, // "user" or "assistant"
    val content: String,
    val timestamp: String = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date()),
    val isError: Boolean = false
)

@Composable
fun PoppyChatScreen(
    securityPreferences: SecurityPreferences,
    geminiApiClient: GeminiApiClient,
    voiceManager: PoppyVoiceManager?,
    isListening: Boolean,
    onToggleMic: () -> Unit,
    onRequestPermissions: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current
    val listState = rememberLazyListState()

    var inputText by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var currentError by remember { mutableStateOf<String?>(null) }

    val messages = remember {
        mutableStateListOf(
            UiChatMessage(
                role = "assistant",
                content = "নমস্কার! আমি POPPY AI, মোঃ সাইফুল ইসলাম পরান (Poran Studio) দ্বারা নির্মিত আপনার অ্যান্ড্রয়েড কোডিং ও গিটহাব সহকারী।\n\nউপরে ডানদিকের ⚙️ সেটিংসে গিয়ে আপনার Gemini API Key সেট করুন। তারপর ভয়েসে 'Hello Poppy' বলুন বা নিচে টাইপ করুন!"
            )
        )
    }

    // Auto scroll when new messages arrive
    LaunchedEffect(messages.size, isLoading) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    // Handle sending message to Gemini API
    val sendMessage = { textToSend: String ->
        if (textToSend.isNotBlank() && !isLoading) {
            val userText = textToSend.trim()
            inputText = ""
            currentError = null

            messages.add(UiChatMessage(role = "user", content = userText))
            isLoading = true

            coroutineScope.launch {
                val history = messages.filter { !it.isError }.takeLast(8).map {
                    Pair(it.role, it.content)
                }

                val result = geminiApiClient.generateContent(userText, history)

                isLoading = false
                result.fold(
                    onSuccess = { reply ->
                        messages.add(UiChatMessage(role = "assistant", content = reply))
                        voiceManager?.speak(reply)
                    },
                    onFailure = { err ->
                        val errMessage = err.message ?: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।"
                        currentError = errMessage
                        messages.add(
                            UiChatMessage(
                                role = "assistant",
                                content = "⚠️ ত্রুটি: $errMessage",
                                isError = true
                            )
                        )
                        voiceManager?.speak("ত্রুটি ঘটেছে: $errMessage")
                    }
                )
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgBlack)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // 1. Header Bar: Avatar, Title, Developer Brand, Settings Gear
            HeaderSection(
                isListening = isListening,
                hasApiKey = securityPreferences.hasApiKey(),
                onOpenSettings = { showSettingsDialog = true }
            )

            Spacer(modifier = Modifier.height(10.dp))

            // 2. Chat Message List
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    ChatBubble(
                        message = msg,
                        onSpeak = { voiceManager?.speak(msg.content) },
                        onCopy = { clipboardManager.setText(AnnotatedString(msg.content)) },
                        onOpenSettings = { showSettingsDialog = true }
                    )
                }

                if (isLoading) {
                    item {
                        LoadingIndicatorRow()
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 3. Bottom Controls: Voice trigger & Text Input Field
            BottomControlBar(
                inputText = inputText,
                onInputTextChange = { inputText = it },
                onSend = { sendMessage(inputText) },
                isListening = isListening,
                onToggleMic = onToggleMic,
                onRequestPermissions = onRequestPermissions
            )
        }

        // Settings Dialog Modal (API Key & Model Selection)
        if (showSettingsDialog) {
            SettingsDialog(
                securityPreferences = securityPreferences,
                onDismiss = { showSettingsDialog = false }
            )
        }
    }
}

@Composable
fun HeaderSection(
    isListening: Boolean,
    hasApiKey: Boolean,
    onOpenSettings: () -> Unit
) {
    Surface(
        color = SurfaceCard,
        shape = RoundedCornerShape(18.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Anime Avatar
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .border(2.dp, NeonRed, CircleShape)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.poppy_avatar),
                    contentDescription = "POPPY Avatar",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "POPPY AI",
                        color = NeonRed,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (isListening) NeonRed.copy(alpha = 0.2f) else Color(0xFF1E1E28),
                                shape = RoundedCornerShape(6.dp)
                            )
                            .border(
                                width = 1.dp,
                                color = if (isListening) NeonRed else Color(0xFF444455),
                                shape = RoundedCornerShape(6.dp)
                            )
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (isListening) "🎙️ LISTENING" else "STANDBY",
                            color = if (isListening) NeonRed else TextMuted,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Text(
                    text = "Poran Studio • Md Saiful Islam Poran",
                    color = TextMuted,
                    fontSize = 12.sp
                )

                if (!hasApiKey) {
                    Text(
                        text = "⚠️ API Key নেই - ⚙️ সেটিংসে সেট করুন",
                        color = Color(0xFFFFB74D),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Settings Gear Button
            IconButton(
                onClick = onOpenSettings,
                modifier = Modifier
                    .size(42.dp)
                    .background(Color(0xFF1E1722), CircleShape)
                    .border(1.dp, BorderDark, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = NeonRed,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
fun ChatBubble(
    message: UiChatMessage,
    onSpeak: () -> Unit,
    onCopy: () -> Unit,
    onOpenSettings: () -> Unit
) {
    val isUser = message.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .border(1.dp, NeonRed, CircleShape)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.poppy_avatar),
                    contentDescription = "Poppy",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Surface(
            color = if (isUser) CrimsonDark else SurfaceCard,
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isUser) 16.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 16.dp
            ),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (message.isError) Color(0xFFFF453A) else if (isUser) NeonRed.copy(alpha = 0.5f) else BorderDark
            ),
            modifier = Modifier.fillMaxWidth(if (isUser) 0.85f else 0.90f)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isUser) "আপনি" else "POPPY AI",
                        color = if (isUser) NeonRed else Color(0xFFFF7088),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = message.timestamp,
                        color = TextMuted,
                        fontSize = 10.sp
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                SelectionContainer {
                    Text(
                        text = message.content,
                        color = if (message.isError) Color(0xFFFF9E9E) else TextWhite,
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )
                }

                if (message.isError && message.content.contains("API Key")) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = onOpenSettings,
                        colors = ButtonDefaults.buttonColors(containerColor = NeonRed),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(34.dp)
                    ) {
                        Text("⚙️ Settings-এ API Key দিন", fontSize = 12.sp, color = Color.White)
                    }
                }

                if (!isUser && !message.isError) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        IconButton(onClick = onCopy, modifier = Modifier.size(28.dp)) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = "Copy",
                                tint = TextMuted,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        IconButton(onClick = onSpeak, modifier = Modifier.size(28.dp)) {
                            Icon(
                                imageVector = Icons.Default.VolumeUp,
                                contentDescription = "Listen",
                                tint = NeonRed,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LoadingIndicatorRow() {
    val infiniteTransition = rememberInfiniteTransition()
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.9f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(700),
            repeatMode = RepeatMode.Reverse
        )
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .scale(pulseScale)
                .background(CrimsonDark, CircleShape)
                .border(1.5.dp, NeonRed, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(16.dp),
                color = NeonRed,
                strokeWidth = 2.dp
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Text(
            text = "POPPY চিন্তা করছে এবং উত্তর তৈরি করছে...",
            color = TextMuted,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun BottomControlBar(
    inputText: String,
    onInputTextChange: (String) -> Unit,
    onSend: () -> Unit,
    isListening: Boolean,
    onToggleMic: () -> Unit,
    onRequestPermissions: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition()
    val pulseBorder by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 3.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(600),
            repeatMode = RepeatMode.Reverse
        )
    )

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (isListening) "🎙️ শুনছি... বলুন" else "🗣️ ওয়েক-ওয়ার্ড: 'Hello Poppy' বা 'হ্যালো পপি'",
                color = if (isListening) NeonRed else TextMuted,
                fontSize = 11.sp,
                fontWeight = if (isListening) FontWeight.Bold else FontWeight.Normal
            )

            Text(
                text = "JARVIS Core",
                color = TextMuted,
                fontSize = 10.sp
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Microphone Button
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        color = if (isListening) NeonRed else Color(0xFF1C1318),
                        shape = CircleShape
                    )
                    .border(
                        width = if (isListening) pulseBorder.dp else 1.dp,
                        color = if (isListening) Color.White else NeonRed,
                        shape = CircleShape
                    )
                    .clickable {
                        onRequestPermissions()
                        onToggleMic()
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isListening) Icons.Default.Mic else Icons.Default.MicOff,
                    contentDescription = "Microphone",
                    tint = if (isListening) Color.White else NeonRed,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            // Text Input Box
            OutlinedTextField(
                value = inputText,
                onValueChange = onInputTextChange,
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp),
                placeholder = {
                    Text(
                        text = "Android কোড বা নির্দেশ লিখুন...",
                        color = TextMuted,
                        fontSize = 13.sp
                    )
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = NeonRed,
                    unfocusedBorderColor = BorderDark,
                    focusedTextColor = TextWhite,
                    unfocusedTextColor = TextWhite,
                    focusedContainerColor = SurfaceCard,
                    unfocusedContainerColor = SurfaceCard,
                    cursorColor = NeonRed
                ),
                shape = RoundedCornerShape(26.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.width(10.dp))

            // Send Button
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        brush = Brush.linearGradient(listOf(NeonRed, Color(0xFFB00020))),
                        shape = CircleShape
                    )
                    .clickable { onSend() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
fun SettingsDialog(
    securityPreferences: SecurityPreferences,
    onDismiss: () -> Unit
) {
    var apiKeyInput by remember { mutableStateOf(securityPreferences.getApiKey()) }
    var selectedModel by remember { mutableStateOf(securityPreferences.getModel()) }
    var isKeyVisible by remember { mutableStateOf(false) }

    val models = listOf(
        Pair("gemini-2.5-flash", "gemini-2.5-flash (প্রস্তাবিত ও দ্রুত)"),
        Pair("gemini-2.5-pro", "gemini-2.5-pro (উন্নত যুক্তি ও আর্কিটেকচার)"),
        Pair("gemini-2.0-flash", "gemini-2.0-flash (স্থিতিশীল)")
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF0F0C12),
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = null,
                    tint = NeonRed,
                    modifier = Modifier.size(22.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "POPPY AI Settings (ফেজ ১)",
                    color = TextWhite,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Gemini API Key:",
                    color = NeonRed,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(4.dp))

                OutlinedTextField(
                    value = apiKeyInput,
                    onValueChange = { apiKeyInput = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("AIzaSy...", color = TextMuted, fontSize = 12.sp) },
                    visualTransformation = if (isKeyVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { isKeyVisible = !isKeyVisible }) {
                            Icon(
                                imageVector = if (isKeyVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = "Toggle Visibility",
                                tint = TextMuted
                            )
                        }
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonRed,
                        unfocusedBorderColor = BorderDark,
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite,
                        cursorColor = NeonRed
                    ),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Gemini Model:",
                    color = NeonRed,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(6.dp))

                models.forEach { (modelId, label) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedModel = modelId }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedModel == modelId,
                            onClick = { selectedModel = modelId },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = NeonRed,
                                unselectedColor = BorderDark
                            )
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = label,
                            color = if (selectedModel == modelId) TextWhite else TextMuted,
                            fontSize = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF16111B), RoundedCornerShape(8.dp))
                        .padding(10.dp)
                ) {
                    Text(
                        text = "🔒 নিরাপত্তা: আপনার API Key ডিভাইসের হার্ডওয়্যার-ব্যাকড EncryptedSharedPreferences (AES-256 GCM) দ্বারা সুরক্ষিত থাকে।",
                        color = Color(0xFF81C784),
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    securityPreferences.saveApiKey(apiKeyInput.trim())
                    securityPreferences.saveModel(selectedModel)
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = NeonRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("সংরক্ষণ করুন", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("বাতিল", color = TextMuted)
            }
        }
    )
}
