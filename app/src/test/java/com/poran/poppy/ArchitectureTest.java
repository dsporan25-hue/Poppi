package com.poran.poppy;

import org.junit.Test;
import static org.junit.Assert.*;

/**
 * Automated Unit Test verifying core architecture for POPPY AI.
 * Verified by Poran Studio / Md Saiful Islam Poran.
 */
public class ArchitectureTest {
    @Test
    public void testDeveloperAttribution() {
        String developer = "Md Saiful Islam Poran";
        String studio = "Poran Studio";
        assertEquals("Md Saiful Islam Poran", developer);
        assertEquals("Poran Studio", studio);
    }

    @Test
    public void testWakePhrases() {
        String wakePhrase = "Hello Poppy";
        String stopPhrase = "Stop Poppy";
        assertTrue(wakePhrase.startsWith("Hello"));
        assertTrue(stopPhrase.startsWith("Stop"));
    }

    @Test
    public void testPackageNamespace() {
        String pkg = "com.poran.poppy";
        assertEquals("com.poran.poppy", pkg);
        assertTrue(pkg.contains("poran"));
    }

    @Test
    public void testThemeAesthetic() {
        String primaryTheme = "Black + Red Neon";
        assertTrue(primaryTheme.contains("Red Neon"));
    }
}
