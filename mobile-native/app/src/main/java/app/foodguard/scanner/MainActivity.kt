package app.foodguard.scanner

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Bundle
import android.util.Base64
import android.view.KeyEvent
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.io.ByteArrayOutputStream
import java.io.File

class MainActivity : Activity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var pendingImageDataUrl: String? = null

    private val baseUrl: String
        get() = intent.getStringExtra(EXTRA_BASE_URL) ?: DEFAULT_URL

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // On Android 15+/16 (API 35/36, targetSdk 36) edge-to-edge is enforced:
        // setDecorFitsSystemWindows(true) is ignored and the WebView draws under
        // the system bars. Declare edge-to-edge explicitly so the WebView
        // receives the real system-bar insets, which we then apply as padding
        // (below) so content starts BELOW the status bar and clears the gesture pill.
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)

        // The app uses a LIGHT background, so request DARK icons so the time,
        // battery, Wi-Fi and network indicators are clearly visible. On older
        // Android versions (where edge-to-edge is not enforced) also paint the
        // bars a solid LIGHT color so the dark icons sit on a readable surface.
        window.statusBarColor = Color.WHITE
        window.navigationBarColor = Color.WHITE
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = true    // DARK status-bar icons (time/battery/Wi-Fi/net)
            isAppearanceLightNavigationBars = true // DARK nav-bar icons
        }

        intent.getStringExtra(EXTRA_IMAGE_PATH)?.let { path ->
            pendingImageDataUrl = fileToBase64DataUrl(File(path))
        }

        progressBar = ProgressBar(this).apply {
            visibility = View.GONE
        }

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                setSupportMultipleWindows(false)
                mediaPlaybackRequiresUserGesture = false
            }

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    if (newProgress < 100) {
                        progressBar.visibility = View.VISIBLE
                        progressBar.progress = newProgress
                    } else {
                        progressBar.visibility = View.GONE
                    }
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean = false

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    injectVolumeKeyBridge(view)
                    injectPendingImage(view)
                }
            }

            addJavascriptInterface(VolumeKeyBridge(), "FoodGuardBridge")
            addJavascriptInterface(NativeActions(), "FoodGuardNative")
            loadUrl(baseUrl)
        }

        setContentView(webView)

        // Edge-to-edge is in effect (enforced on API 35/36), so the WebView
        // draws under the system bars. Pad it by the real system-bar insets plus
        // a small gap so the app header/content start BELOW the status bar (never
        // underneath it) and the bottom clears the gesture/nav bar. Values come
        // from WindowInsets, so they adapt to any screen, notch, or orientation.
        val gapPx = (8 * resources.displayMetrics.density).toInt()
        ViewCompat.setOnApplyWindowInsetsListener(webView) { v, insets ->
            val bars: Insets = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(0, bars.top + gapPx, 0, bars.bottom + gapPx)
            insets
        }
        ViewCompat.requestApplyInsets(webView)

        val progressParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply { gravity = Gravity.TOP }
        addContentView(progressBar, progressParams)
    }

    /**
     * singleTask deep link: the foodguard app may already be running when a visual
     * search result row is tapped. Reload the WebView to the requested product URL
     * (e.g. /products?search=...) instead of keeping the old page.
     */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        intent.getStringExtra(EXTRA_IMAGE_PATH)?.let { path ->
            pendingImageDataUrl = fileToBase64DataUrl(File(path))
        }
        if (::webView.isInitialized) {
            webView.loadUrl(baseUrl)
            injectPendingImage(webView)
        }
    }

    private fun injectVolumeKeyBridge(target: WebView?) {
        val js = """
            (function() {
                if (window._foodguardVolumeBridge) return;
                window._foodguardVolumeBridge = true;
                window.FoodGuardBridge = {
                    onVolumeUp: function() {
                        window.dispatchEvent(new CustomEvent('foodguard:volumeup'));
                    },
                    onVolumeDown: function() {
                        window.dispatchEvent(new CustomEvent('foodguard:volumedown'));
                    },
                    onVolumeMute: function() {
                        window.dispatchEvent(new CustomEvent('foodguard:volumemute'));
                    },
                    openVisualScanner: function() {
                        if (window.FoodGuardNative && window.FoodGuardNative.openVisualScanner) {
                            window.FoodGuardNative.openVisualScanner();
                        }
                    }
                };
            })();
        """.trimIndent()
        target?.evaluateJavascript(js, null)
    }

    private fun injectPendingImage(target: WebView?) {
        val dataUrl = pendingImageDataUrl ?: return
        pendingImageDataUrl = null
        // Base64 data URLs contain only [A-Za-z0-9+/=] and "data:image/jpeg;base64," —
        // safe to embed directly in a JS string literal.
        val js = """
            (function() {
                var dataUrl = "$dataUrl";
                window.dispatchEvent(new CustomEvent('foodguard:capturedImage', {
                    detail: { dataUrl: dataUrl }
                }));
            })();
        """.trimIndent()
        target?.evaluateJavascript(js, null)
    }

    private fun fileToBase64DataUrl(file: File): String? {
        if (!file.exists()) return null
        val bitmap = BitmapFactory.decodeFile(file.absolutePath) ?: return null
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
        val bytes = stream.toByteArray()
        return "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        when (keyCode) {
            KeyEvent.KEYCODE_VOLUME_UP -> {
                webView.evaluateJavascript(
                    "window.FoodGuardBridge && window.FoodGuardBridge.onVolumeUp()", null
                )
                return true
            }
            KeyEvent.KEYCODE_VOLUME_DOWN -> {
                webView.evaluateJavascript(
                    "window.FoodGuardBridge && window.FoodGuardBridge.onVolumeDown()", null
                )
                return true
            }
            KeyEvent.KEYCODE_VOLUME_MUTE -> {
                webView.evaluateJavascript(
                    "window.FoodGuardBridge && window.FoodGuardBridge.onVolumeMute()", null
                )
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    inner class VolumeKeyBridge {
        @JavascriptInterface
        fun triggerScan() {
            runOnUiThread {
                webView.evaluateJavascript(
                    "window.dispatchEvent(new CustomEvent('foodguard:triggerScan'))", null
                )
            }
        }

        @JavascriptInterface
        fun openVisualScanner() {
            runOnUiThread {
                startActivity(
                    Intent(this@MainActivity, InAppScanActivity::class.java)
                )
            }
        }

        @JavascriptInterface
        fun vibrate(durationMs: Int) {
            @Suppress("DEPRECATION")
            val vibrator = getSystemService(VIBRATOR_SERVICE) as? android.os.Vibrator
            vibrator?.vibrate(
                android.os.VibrationEffect.createOneShot(
                    durationMs.toLong(),
                    android.os.VibrationEffect.DEFAULT_AMPLITUDE
                )
            )
        }
    }

    inner class NativeActions {
        @JavascriptInterface
        fun openVisualScanner() {
            runOnUiThread {
                startActivity(
                    Intent(this@MainActivity, InAppScanActivity::class.java)
                )
            }
        }
    }

    companion object {
        const val EXTRA_BASE_URL = "extra_base_url"
        const val EXTRA_IMAGE_PATH = "extra_image_path"
        // Live deployed frontend (Vercel) — see DEPLOYMENT.md §2. The old
        // "foodgaurd.onrender.com" backend URL is dead (404) and no longer hosts the app.
        const val DEFAULT_URL = "https://frontend-taupe-two-93.vercel.app"
    }
}
