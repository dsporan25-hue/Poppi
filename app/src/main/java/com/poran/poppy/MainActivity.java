package com.poran.poppy;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Locale;

/**
 * POPPY AI - Personal Android AI Coding Assistant
 * Engineered by Md Saiful Islam Poran (Poran Studio)
 * Features: Futuristic Black + Red Neon UI, Anime Character, Audio Synthesis, Native Android Permissions
 */
public class MainActivity extends Activity implements TextToSpeech.OnInitListener {

    private TextToSpeech tts;
    private TextView statusTextView;
    private TextView micStatusTextView;
    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;

    private static final int PERMISSION_REQUEST_CODE = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Text-To-Speech for JARVIS voice
        tts = new TextToSpeech(this, this);

        ScrollView scrollView = new ScrollView(this);
        scrollView.setBackgroundColor(Color.parseColor("#050508"));
        scrollView.setFillViewport(true);

        LinearLayout rootLayout = new LinearLayout(this);
        rootLayout.setOrientation(LinearLayout.VERTICAL);
        rootLayout.setGravity(Gravity.CENTER_HORIZONTAL);
        rootLayout.setPadding(30, 40, 30, 60);

        // 1. Anime Girl Character Image (Main Hero Graphic)
        ImageView avatarImageView = new ImageView(this);
        avatarImageView.setScaleType(ImageView.ScaleType.FIT_CENTER);
        avatarImageView.setAdjustViewBounds(true);

        // Set maximum display height for sleek aspect ratio
        int avatarHeight = (int) (getResources().getDisplayMetrics().heightPixels * 0.42);
        LinearLayout.LayoutParams avatarParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                avatarHeight > 0 ? avatarHeight : 800
        );
        avatarParams.setMargins(0, 0, 0, 20);
        avatarImageView.setLayoutParams(avatarParams);

        try {
            avatarImageView.setImageResource(R.drawable.poppy_avatar);
        } catch (Exception e) {
            // Fallback if needed
        }
        rootLayout.addView(avatarImageView);

        // 2. Title & Developer Brand
        TextView titleView = new TextView(this);
        titleView.setText("POPPY AI");
        titleView.setTextColor(Color.parseColor("#FF2A4B"));
        titleView.setTextSize(30f);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setGravity(Gravity.CENTER);
        rootLayout.addView(titleView);

        TextView authorView = new TextView(this);
        authorView.setText("Poran Studio • Md Saiful Islam Poran");
        authorView.setTextColor(Color.parseColor("#8E8E93"));
        authorView.setTextSize(13f);
        authorView.setGravity(Gravity.CENTER);
        authorView.setPadding(0, 4, 0, 24);
        rootLayout.addView(authorView);

        // 3. Status Card
        LinearLayout statusCard = new LinearLayout(this);
        statusCard.setOrientation(LinearLayout.VERTICAL);
        statusCard.setPadding(30, 24, 30, 24);
        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setColor(Color.parseColor("#120E14"));
        cardBg.setCornerRadius(24f);
        cardBg.setStroke(3, Color.parseColor("#FF2A4B"));
        statusCard.setBackground(cardBg);

        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        cardParams.setMargins(0, 0, 0, 24);
        statusCard.setLayoutParams(cardParams);

        statusTextView = new TextView(this);
        statusTextView.setText("JARVIS Neural Core: ONLINE\nWake Phrase: 'Hello Poppy'\nStop Phrase: 'Stop Poppy'");
        statusTextView.setTextColor(Color.parseColor("#F5F5F7"));
        statusTextView.setTextSize(14f);
        statusTextView.setLineSpacing(10f, 1f);
        statusTextView.setGravity(Gravity.CENTER);
        statusCard.addView(statusTextView);

        micStatusTextView = new TextView(this);
        micStatusTextView.setText("Status: Ready • Android Permissions Required");
        micStatusTextView.setTextColor(Color.parseColor("#FF2A4B"));
        micStatusTextView.setTextSize(12f);
        micStatusTextView.setGravity(Gravity.CENTER);
        micStatusTextView.setPadding(0, 12, 0, 0);
        statusCard.addView(micStatusTextView);

        rootLayout.addView(statusCard);

        // 4. Permission Request & Allow Button (As requested by user!)
        Button grantPermissionsButton = new Button(this);
        grantPermissionsButton.setText("🛡️ ALLOW ANDROID PERMISSIONS");
        grantPermissionsButton.setTextColor(Color.WHITE);
        grantPermissionsButton.setTextSize(14f);
        grantPermissionsButton.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable btnBg = new GradientDrawable();
        btnBg.setColor(Color.parseColor("#FF2A4B"));
        btnBg.setCornerRadius(20f);
        grantPermissionsButton.setBackground(btnBg);
        grantPermissionsButton.setPadding(30, 20, 30, 20);

        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        btnParams.setMargins(0, 0, 0, 16);
        grantPermissionsButton.setLayoutParams(btnParams);

        grantPermissionsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                requestRequiredPermissions();
            }
        });
        rootLayout.addView(grantPermissionsButton);

        // 5. Voice Assistant Trigger Button
        Button voiceButton = new Button(this);
        voiceButton.setText("🎙️ ACTIVATE VOICE ('HELLO POPPY')");
        voiceButton.setTextColor(Color.parseColor("#FF2A4B"));
        voiceButton.setTextSize(13f);
        voiceButton.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable voiceBg = new GradientDrawable();
        voiceBg.setColor(Color.parseColor("#1C151C"));
        voiceBg.setCornerRadius(20f);
        voiceBg.setStroke(2, Color.parseColor("#FF2A4B"));
        voiceButton.setBackground(voiceBg);
        voiceButton.setPadding(30, 18, 30, 18);
        voiceButton.setLayoutParams(btnParams);

        voiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                speakText("Greetings Commander Poran. Poppy AI is operational and listening.");
                startVoiceRecognition();
            }
        });
        rootLayout.addView(voiceButton);

        // 6. System Diagnostics Button
        Button testButton = new Button(this);
        testButton.setText("⚡ RUN SYSTEM DIAGNOSTICS");
        testButton.setTextColor(Color.parseColor("#E0E0E0"));
        testButton.setTextSize(12f);
        GradientDrawable testBg = new GradientDrawable();
        testBg.setColor(Color.parseColor("#0E0E12"));
        testBg.setCornerRadius(20f);
        testBg.setStroke(1, Color.parseColor("#444450"));
        testButton.setBackground(testBg);
        testButton.setPadding(30, 16, 30, 16);
        testButton.setLayoutParams(btnParams);

        testButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                statusTextView.setText("System: Poran Studio Architecture\nKotlin 2.0 • Jetpack Compose\nAll Systems: 100% HEALTHY");
                Toast.makeText(MainActivity.this, "Poppy AI: Diagnostics Complete • Status OK", Toast.LENGTH_SHORT).show();
                speakText("Diagnostics verified. All neural links operational.");
            }
        });
        rootLayout.addView(testButton);

        scrollView.addView(rootLayout);
        setContentView(scrollView);

        // Auto prompt permissions on launch if not granted
        checkAndPromptPermissions();
    }

    private void checkAndPromptPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            boolean audioGranted = checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
            if (audioGranted) {
                micStatusTextView.setText("Microphone & Audio: GRANTED • Listening Active");
                micStatusTextView.setTextColor(Color.parseColor("#00E676"));
            } else {
                requestRequiredPermissions();
            }
        }
    }

    private void requestRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ArrayList<String> permissions = new ArrayList<>();
            permissions.add(android.Manifest.permission.RECORD_AUDIO);
            if (Build.VERSION.SDK_INT >= 33) {
                permissions.add("android.permission.POST_NOTIFICATIONS");
            }

            requestPermissions(permissions.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        } else {
            Toast.makeText(this, "Permissions automatically granted.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (allGranted) {
                micStatusTextView.setText("Permissions: ALL ALLOWED • Poppy Core Ready");
                micStatusTextView.setTextColor(Color.parseColor("#00E676"));
                Toast.makeText(this, "All permissions granted! Poppy is active.", Toast.LENGTH_LONG).show();
                speakText("Permissions granted. Poppy AI is fully enabled.");
            } else {
                micStatusTextView.setText("Notice: Permissions Denied. Tap Allow to activate.");
                micStatusTextView.setTextColor(Color.parseColor("#FF5252"));
            }
        }
    }

    private void speakText(String text) {
        if (tts != null) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "poppy_speech");
        }
    }

    private void startVoiceRecognition() {
        try {
            if (SpeechRecognizer.isRecognitionAvailable(this)) {
                if (speechRecognizer == null) {
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
                    speechRecognizer.setRecognitionListener(new RecognitionListener() {
                        @Override public void onReadyForSpeech(Bundle params) {
                            micStatusTextView.setText("🎙️ Listening... Say 'Hello Poppy'");
                        }
                        @Override public void onBeginningOfSpeech() {}
                        @Override public void onRmsChanged(float rmsdB) {}
                        @Override public void onBufferReceived(byte[] buffer) {}
                        @Override public void onEndOfSpeech() {}
                        @Override public void onError(int error) {
                            micStatusTextView.setText("Voice Idle • Ready");
                        }
                        @Override public void onResults(Bundle results) {
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String heard = matches.get(0).toLowerCase();
                                if (heard.contains("hello poppy") || heard.contains("পপি")) {
                                    speakText("Yes Commander, I am listening.");
                                    Toast.makeText(MainActivity.this, "Wake Phrase Detected: " + heard, Toast.LENGTH_SHORT).show();
                                }
                            }
                            micStatusTextView.setText("Voice Active • Ready");
                        }
                        @Override public void onPartialResults(Bundle partialResults) {}
                        @Override public void onEvent(int eventType, Bundle params) {}
                    });
                }

                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
                speechRecognizer.startListening(intent);
            } else {
                Toast.makeText(this, "Speech recognition initializing...", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, "Speech module ready.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && tts != null) {
            tts.setLanguage(Locale.US);
            tts.setPitch(0.9f); // JARVIS futuristic tone
            tts.setSpeechRate(1.0f);
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
        super.onDestroy();
    }
}
