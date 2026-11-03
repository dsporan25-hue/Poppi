package com.poran.poppy;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.graphics.Color;
import android.graphics.Typeface;

/**
 * POPPY AI - Native Android Main Activity
 * Engineered by Md Saiful Islam Poran (Poran Studio)
 * Aesthetic: Black + Red Neon Cybernetic Protocol
 */
public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.parseColor("#08080C"));
        layout.setGravity(Gravity.CENTER);
        layout.setPadding(40, 40, 40, 40);

        TextView titleView = new TextView(this);
        titleView.setText("POPPY AI");
        titleView.setTextColor(Color.parseColor("#FF2A4B"));
        titleView.setTextSize(32f);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setGravity(Gravity.CENTER);

        TextView authorView = new TextView(this);
        authorView.setText("Poran Studio • Md Saiful Islam Poran");
        authorView.setTextColor(Color.parseColor("#8E8E93"));
        authorView.setTextSize(14f);
        authorView.setGravity(Gravity.CENTER);
        authorView.setPadding(0, 10, 0, 40);

        TextView statusView = new TextView(this);
        statusView.setText("JARVIS Neural Core: ONLINE\nAndroid Target SDK: 35\nWake Phrase: 'Hello Poppy'\nStop Phrase: 'Stop Poppy'");
        statusView.setTextColor(Color.parseColor("#F5F5F7"));
        statusView.setTextSize(15f);
        statusView.setGravity(Gravity.CENTER);
        statusView.setPadding(20, 20, 20, 20);

        layout.addView(titleView);
        layout.addView(authorView);
        layout.addView(statusView);

        setContentView(layout);
    }
}
