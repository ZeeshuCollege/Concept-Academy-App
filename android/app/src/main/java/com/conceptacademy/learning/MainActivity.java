package com.conceptacademy.learning;

import android.os.Bundle;
import android.os.Build;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.core.graphics.Insets;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity {

    private int cachedTopDp = 0;
    private int cachedBottomDp = 0;
    private String cachedNavMode = "gesture";
    private boolean cachedIsGesture = true;
    private int cachedImeDp = 0;
    private boolean cachedKeyboardOpen = false;

    public int getCachedTopDp() { return cachedTopDp; }
    public int getCachedBottomDp() { return cachedBottomDp; }
    public String getCachedNavMode() { return cachedNavMode; }
    public boolean getCachedIsGesture() { return cachedIsGesture; }
    public int getCachedImeDp() { return cachedImeDp; }
    public boolean getCachedKeyboardOpen() { return cachedKeyboardOpen; }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Enforce strict Light Mode so Android system dark mode NEVER renders white-on-white text in select dropdowns/dialogs
        androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO);

        registerPlugin(AppPermissionsPlugin.class);
        registerPlugin(SystemNavigationPlugin.class);
        super.onCreate(savedInstanceState);

        try {
            Window window = getWindow();

            // Enable true edge-to-edge layout across the entire window
            WindowCompat.setDecorFitsSystemWindows(window, false);

            // Transparent system bars so content extends behind status bar and navigation bar
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);

            try {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().getSettings().setTextZoom(100);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        getBridge().getWebView().getSettings().setForceDark(android.webkit.WebSettings.FORCE_DARK_OFF);
                    }
                }
            } catch (Exception ignored) {}

            // Dark icons for status bar and navigation bar on light/white surfaces
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
            if (controller != null) {
                controller.setAppearanceLightStatusBars(true);
                controller.setAppearanceLightNavigationBars(true);
            }

            View decorView = window.getDecorView();
            decorView.setBackgroundColor(Color.WHITE);

            // Clear any hardcoded padding on content view so WebView extends to true screen edges
            View contentView = findViewById(android.R.id.content);
            if (contentView != null) {
                contentView.setBackgroundColor(Color.WHITE);
                contentView.setPadding(0, 0, 0, 0);
            }

            ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, insets) -> {
                int statusBarPx = Math.max(
                    insets.getInsets(WindowInsetsCompat.Type.statusBars()).top,
                    insets.getInsets(WindowInsetsCompat.Type.displayCutout()).top
                );

                Insets navInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
                Insets gestureInsets = insets.getInsets(WindowInsetsCompat.Type.systemGestures());
                Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());

                float density = getResources().getDisplayMetrics().density;
                if (density <= 0f) density = 1.0f;

                int statusBarDp = Math.round(statusBarPx / density);
                int navBarBottomDp = Math.round(navInsets.bottom / density);
                int imeBottomDp = Math.round(imeInsets.bottom / density);
                int gestureLeftDp = Math.round(gestureInsets.left / density);
                int gestureRightDp = Math.round(gestureInsets.right / density);

                // Detect 3-Button Navigation vs Gesture Navigation (iOS type gesture):
                // - Gesture nav has side back swipe zones (gestureInsets left/right > 0)
                //   or a small navbar pill (navBarBottomDp <= 28)
                // - 3-button nav has gestureInsets left/right == 0 and navBarBottomDp >= 36
                boolean isGestureNav = (gestureLeftDp > 0 || gestureRightDp > 0) || (navBarBottomDp > 0 && navBarBottomDp <= 28);
                String navMode;
                if (isGestureNav) {
                    navMode = "gesture";
                } else if (navBarBottomDp >= 36) {
                    navMode = "buttons";
                } else {
                    navMode = "gesture";
                }

                boolean isKeyboardOpen = imeBottomDp > 100;

                cachedTopDp = statusBarDp;
                cachedBottomDp = navBarBottomDp;
                cachedNavMode = navMode;
                cachedIsGesture = isGestureNav;
                cachedImeDp = imeBottomDp;
                cachedKeyboardOpen = isKeyboardOpen;

                sendInsetsToWebView();

                return insets;
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendInsetsToWebView() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        getBridge().getWebView().post(() -> {
            try {
                String js = String.format(Locale.US,
                    "(function() {" +
                    "  var info = { top: %d, bottom: %d, navMode: '%s', isGesture: %b, ime: %d, keyboardOpen: %b };" +
                    "  window.__SYSTEM_NAV__ = info;" +
                    "  document.documentElement.style.setProperty('--safe-area-top', '%dpx');" +
                    "  document.documentElement.style.setProperty('--safe-area-bottom', '%dpx');" +
                    "  document.documentElement.style.setProperty('--keyboard-inset', '%dpx');" +
                    "  document.documentElement.setAttribute('data-nav-mode', '%s');" +
                    "  document.documentElement.setAttribute('data-keyboard-open', '%b');" +
                    "  if (window.__onSystemNavChange) window.__onSystemNavChange(info);" +
                    "  window.dispatchEvent(new CustomEvent('systemNavChange', { detail: info }));" +
                    "})();",
                    cachedTopDp, cachedBottomDp, cachedNavMode, cachedIsGesture, cachedImeDp, cachedKeyboardOpen,
                    cachedTopDp, cachedBottomDp, cachedImeDp, cachedNavMode, cachedKeyboardOpen
                );
                getBridge().getWebView().evaluateJavascript(js, null);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        sendInsetsToWebView();
    }
}
