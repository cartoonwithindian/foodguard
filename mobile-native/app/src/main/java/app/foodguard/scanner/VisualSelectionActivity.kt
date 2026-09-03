package app.foodguard.scanner

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.view.Window
import android.widget.FrameLayout
import android.widget.TextView
import android.util.Log
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File

/**
 * Circle-to-search capture flow.
 *
 * Screen capture is provided by [FoodGuardAccessibilityService] using
 * AccessibilityService.takeScreenshot(). Unlike the old MediaProjection flow,
 * this shows no "share your screen" consent dialog and no persistent
 * screen-sharing notification/timer on Android 14+.
 *
 *  1. If the accessibility capture service is enabled, grab the current frame.
 *  2. Otherwise prompt the user to enable it in system Accessibility settings,
 *     then retry when they return.
 *  3. Display the frame behind a [CircleSelectionView] for the user to draw an
 *     oval.
 *  4. On confirm, crop the selection and hand it to the visual search backend.
 */
class VisualSelectionActivity : Activity() {

    private var capturedBitmap: Bitmap? = null
    private lateinit var selectionView: CircleSelectionView

    private var rootLayout: FrameLayout? = null
    private var resultsSheet: VisualSearchResultsSheet? = null

    private var capturedThisLaunch = false
    private var bottomInset = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        requestWindowFeature(Window.FEATURE_NO_TITLE)
        // IMPORTANT: do NOT use FLAG_FULLSCREEN / immersive mode here. That would
        // hide the Android status bar (battery, time, Wi-Fi/network icons). Keep
        // the system bars visible so FoodGuard behaves like a normal app.

        if (ScreenshotShare.isReady) {
            Log.d(TAG, "Accessibility capture service ready — capturing frame")
            captureAndSelect()
        } else {
            Log.d(TAG, "Accessibility capture service not enabled — prompting to enable")
            promptEnableAccessibility()
        }
    }

    /**
     * When the user returns from Accessibility settings after enabling the
     * service, grab the frame. Guarded by [capturedThisLaunch] so Android's
     * initial onResume after onCreate does not double-capture, and subsequent
     * resumes (e.g. after the results sheet round-trips) do not re-capture.
     */
    override fun onResume() {
        super.onResume()
        if (!capturedThisLaunch && ScreenshotShare.isReady) {
            Log.d(TAG, "onResume — accessibility service now ready, capturing")
            captureAndSelect()
        }
    }

    private fun promptEnableAccessibility() {
        val dialog = AlertDialog.Builder(this)
            .setTitle(getString(R.string.accessibility_enable_title))
            .setMessage(getString(R.string.accessibility_enable_message))
            .setPositiveButton(getString(R.string.accessibility_enable_action)) { _, _ ->
                startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            }
            .setNegativeButton(android.R.string.cancel) { _, _ -> finish() }
            .setOnDismissListener { if (isFinishing) finish() }
            .create()
        dialog.setOnShowListener {
            // Allow the user to back out gracefully instead of being trapped.
        }
        dialog.setCancelable(true)
        dialog.show()
    }

    /**
     * Captures the current frame and shows the selection surface. Asynchronous:
     * [ScreenshotShare.capture] delivers the bitmap later on the main thread.
     */
    private fun captureAndSelect() {
        if (isFinishing || capturedThisLaunch) return
        // Set immediately (not inside the callback) so a concurrent request —
        // e.g. onResume firing before the async screenshot returns — cannot
        // trigger a second takeScreenshot(), which Android rejects with
        // ERROR_TAKE_SCREENSHOT_INTERVAL_TIME (causing a false "couldn't search").
        capturedThisLaunch = true
        Log.d(TAG, "Requesting screen capture from accessibility service")
        ScreenshotShare.capture { bitmap ->
            if (isFinishing) return@capture
            if (bitmap == null) {
                showError(getString(R.string.search_error_no_image))
            } else if (isProtectedFrame(bitmap)) {
                showError(getString(R.string.search_protected_screen))
            } else {
                showSelectionSurface(bitmap)
            }
        }
    }

    private fun showSelectionSurface(bitmap: Bitmap) {
        capturedBitmap = bitmap

        // Bottom system-bar (gesture/nav) inset so the action bar clears the
        // gesture pill and isn't clipped on devices with gesture navigation.
        val bottomBar = FrameLayout(this).apply {
            setPadding(24, 16, 24, 40 + bottomInset)
        }

        val cancelBtn = TextView(this).apply {
            text = getString(R.string.selection_cancel)
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 16f
            setBackgroundColor(0x66000000.toInt())
            setPadding(32, 14, 32, 14)
        }
        val cancelLp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply { gravity = Gravity.START or Gravity.CENTER_VERTICAL }
        cancelBtn.layoutParams = cancelLp
        cancelBtn.setOnClickListener { finish() }
        bottomBar.addView(cancelBtn)

        val confirmBtn = TextView(this).apply {
            text = getString(R.string.selection_find)
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 16f
            setBackgroundColor(0xFF2E7D32.toInt())
            setPadding(32, 14, 32, 14)
            isEnabled = false
        }
        val confirmLp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply { gravity = Gravity.END or Gravity.CENTER_VERTICAL }
        confirmBtn.layoutParams = confirmLp
        confirmBtn.setOnClickListener { cropAndSend() }
        bottomBar.addView(confirmBtn)

        selectionView = CircleSelectionView(this).apply {
            setBackgroundBitmap(bitmap)
            onSelectionComplete = { _, _, _, _ ->
                confirmBtn.isEnabled = true
            }
        }

        val root = FrameLayout(this).apply {
            addView(selectionView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
            addView(bottomBar, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM
            ))
            // Capture the gesture/nav bar inset so the bottomBar and results sheet
            // can clear it (not draw its buttons under the gesture pill).
            ViewCompat.setOnApplyWindowInsetsListener(this) { v, insets ->
                val bars: Insets = insets.getInsets(WindowInsetsCompat.Type.systemBars())
                bottomInset = bars.bottom
                bottomBar.setPadding(24, 16, 24, 40 + bottomInset)
                insets
            }
        }
        ViewCompat.requestApplyInsets(root)

        rootLayout = root
        setContentView(root)
    }

    private fun cropAndSend() {
        val bmp = capturedBitmap ?: run { finish(); return }
        val bounds = selectionView.selectionBounds() ?: run { finish(); return }

        val crop = ImageCropProcessor.cropRect(bmp, bounds, circularMask = true)
            ?: run {
                showError(getString(R.string.search_error_no_image))
                return
            }

        val file = File(cacheDir, "circle_search_crop_${System.currentTimeMillis()}.png")
        val path = ImageCropProcessor.savePng(crop, cacheDir, file.name)
        if (path == null) {
            showError(getString(R.string.search_error_failed))
            return
        }

        val root = rootLayout
        if (root == null) {
            finish()
            return
        }

        // Show the results in a native dismissible bottom sheet over the frozen
        // screenshot. The activity stays alive so the user can dismiss the sheet
        // and draw another circle (back to the frozen capture), or close the app.
        resultsSheet = VisualSearchResultsSheet(
            this,
            root,
            apiBaseUrl(),
            MainActivity.DEFAULT_URL,
            File(path),
            bottomInset,
        )
    }

    private fun apiBaseUrl(): String =
        "https://foodguard-visual-search.onrender.com"

    private fun showError(message: String) {
        if (isFinishing || isDestroyed) return
        runOnUiThread {
            runCatching {
                AlertDialog.Builder(this)
                    .setTitle(getString(R.string.search_error_title))
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok) { _, _ -> finish() }
                    .setCancelable(false)
                    .show()
            }
        }
    }

    /**
     * Detects screens that MediaProjection refuses to render (secure/DRM
     * windows such as banking, payment, or protected content). Those frames come
     * back uniformly black/empty, so we show a privacy message instead.
     */
    private fun isProtectedFrame(bitmap: Bitmap): Boolean {
        if (bitmap.width < 2 || bitmap.height < 2) return true
        val sx = bitmap.width - 1
        val sy = bitmap.height - 1
        val samples = intArrayOf(
            bitmap.getPixel(0, 0),
            bitmap.getPixel(sx, 0),
            bitmap.getPixel(0, sy),
            bitmap.getPixel(sx, sy),
            bitmap.getPixel(sx / 2, sy / 2),
            bitmap.getPixel(sx / 4, sy / 3),
            bitmap.getPixel((3 * sx) / 4, (2 * sy) / 3)
        )
        var anyBright = false
        for (p in samples) {
            val r = (p shr 16) and 0xFF
            val g = (p shr 8) and 0xFF
            val b = p and 0xFF
            val lum = (0.299 * r + 0.587 * g + 0.114 * b).toInt()
            if (lum > 24) {
                anyBright = true
                break
            }
        }
        return !anyBright
    }

    override fun onDestroy() {
        // Nothing to tear down here: the accessibility screenshot service is not
        // owned by this activity, so the next circle re-captures cleanly without
        // any consent dialog.
        super.onDestroy()
    }

    companion object {
        private const val TAG = "FoodGuardCapture"
    }
}
