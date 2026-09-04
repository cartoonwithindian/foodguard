package app.foodguard.scanner

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.Gravity
import android.view.Window
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.io.File
import java.io.FileOutputStream

/**
 * In-app visual search — a clean, Lens-style flow that does NOT use screen
 * capture, so there is no "share your screen" dialog, no recording indicator,
 * and no MediaProjection involvement.
 *
 * The user either points the camera at a product or picks an existing image,
 * then circles the product and searches it. This is an alternative to the
 * floating-dot-over-apps capture ([VisualSelectionActivity]).
 *
 *  1. Choose source (camera / gallery).
 *  2. Obtain a [Bitmap].
 *  3. Show [CircleSelectionView] to circle the product.
 *  4. Crop + hand to [MainActivity] so the web app can analyze it.
 */
class InAppScanActivity : Activity() {

    private lateinit var circleView: CircleSelectionView
    private var pendingBitmap: Bitmap? = null

    private var cameraUri: Uri? = null
    private var cameraBitmap: Bitmap? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // This screen uses a DARK background (source chooser + selection scrim),
        // so keep the bars transparent over it and request LIGHT icons so the
        // time/battery/Wi-Fi/network indicators stay visible.
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = true    // LIGHT status-bar icons on dark surface
            isAppearanceLightNavigationBars = true // LIGHT nav-bar icons on dark surface
        }

        showSourceChooser()
    }

    private fun showSourceChooser() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(0xFF121212.toInt())
            setPadding(40, 40, 40, 40)
        }

        root.addView(TextView(this).apply {
            text = getString(R.string.visual_search_title)
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 22f
            gravity = Gravity.CENTER
        })

        root.addView(TextView(this).apply {
            text = getString(R.string.visual_search_subtitle)
            setTextColor(0xCCFFFFFF.toInt())
            textSize = 14f
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 40)
        })

        root.addView(makeButton(getString(R.string.visual_search_camera)) {
            openCamera()
        })

        root.addView(makeButton(getString(R.string.visual_search_gallery)) {
            openGallery()
        })

        root.addView(makeButton(getString(R.string.visual_search_cancel), isCancel = true) {
            finish()
        })

        setContentView(root)
    }

    private fun makeButton(
        label: String,
        isCancel: Boolean = false,
        onClick: () -> Unit
    ): TextView {
        val density = resources.displayMetrics.density
        return TextView(this).apply {
            text = label
            textSize = 17f
            gravity = Gravity.CENTER
            setTextColor(if (isCancel) 0x66FFFFFF.toInt() else 0xFFFFFFFF.toInt())
            setBackgroundColor(if (isCancel) 0x22000000.toInt() else 0xFF2E7D32.toInt())
            setPadding(24, (16 * density).toInt(), 24, (16 * density).toInt())
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = (10 * density).toInt() }
            layoutParams = lp
            setOnClickListener { onClick() }
        }
    }

    private fun openCamera() {
        val takePicture = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        val photoFile = File(cacheDir, "visual_search_${System.currentTimeMillis()}.jpg")
        cameraUri = androidx.core.content.FileProvider
            .getUriForFile(this, "${packageName}.fileprovider", photoFile)
        takePicture.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri)
        try {
            startActivityForResult(takePicture, REQ_CAMERA)
        } catch (e: Exception) {
            Log.w(TAG, "Camera not available", e)
            showError(getString(R.string.visual_search_camera_error))
        }
    }

    private fun openGallery() {
        val pick = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
            type = "image/*"
        }
        startActivityForResult(pick, REQ_GALLERY)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        when (requestCode) {
            REQ_CAMERA -> {
                if (resultCode == RESULT_OK) {
                    val uri = cameraUri
                    if (uri != null) {
                        val bmp = decodeSampled(uri)
                        if (bmp != null) {
                            showCircleOn(bmp)
                        } else {
                            showError(getString(R.string.visual_search_error))
                        }
                    }
                }
            }

            REQ_GALLERY -> {
                if (resultCode == RESULT_OK && data?.data != null) {
                    val bmp = decodeSampled(data.data!!)
                    if (bmp != null) {
                        showCircleOn(bmp)
                    } else {
                        showError(getString(R.string.visual_search_error))
                    }
                }
            }
        }
    }

    private fun decodeSampled(uri: Uri): Bitmap? = runCatching {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        contentResolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, bounds)
        }

        val targetDim = 1080
        var sample = 1
        while (bounds.outWidth / sample > targetDim || bounds.outHeight / sample > targetDim) {
            sample *= 2
        }

        val opts = BitmapFactory.Options().apply { inSampleSize = sample }
        contentResolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, opts)
        }
    }.getOrNull()

    private fun showCircleOn(bitmap: Bitmap) {
        pendingBitmap = bitmap

        val bottomBar = FrameLayout(this).apply {
            setPadding(24, 16, 24, 40)
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
        cancelBtn.setOnClickListener { showSourceChooser() }
        bottomBar.addView(cancelBtn)

        val findBtn = TextView(this).apply {
            text = getString(R.string.selection_find)
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 16f
            setBackgroundColor(0xFF2E7D32.toInt())
            setPadding(32, 14, 32, 14)
            isEnabled = false
        }
        val findLp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply { gravity = Gravity.END or Gravity.CENTER_VERTICAL }
        findBtn.layoutParams = findLp
        findBtn.setOnClickListener { cropAndSend() }
        bottomBar.addView(findBtn)

        circleView = CircleSelectionView(this).apply {
            setBackgroundBitmap(bitmap)
            onSelectionComplete = { _, _, _, _ ->
                findBtn.isEnabled = true
            }
        }

        val root = FrameLayout(this).apply {
            addView(circleView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
            addView(bottomBar, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM
            ))
        }

        setContentView(root)
    }

    private fun cropAndSend() {
        val bmp = pendingBitmap ?: run { showSourceChooser(); return }
        val bounds = circleView.selectionBounds() ?: run { showSourceChooser(); return }

        val crop = ImageCropProcessor.cropRect(bmp, bounds, circularMask = true)
            ?: run {
                showError(getString(R.string.search_error_no_image))
                return
            }

        val file = File(cacheDir, "visual_search_crop_${System.currentTimeMillis()}.png")
        val path = ImageCropProcessor.savePng(crop, cacheDir, file.name)
        if (path == null) {
            showError(getString(R.string.search_error_failed))
            return
        }

        val intent = Intent(this, MainActivity::class.java).apply {
            putExtra(MainActivity.EXTRA_IMAGE_PATH, path)
            putExtra(MainActivity.EXTRA_BASE_URL, MainActivity.DEFAULT_URL + "/scan")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        startActivity(intent)
        finish()
    }

    private fun showError(message: String) {
        if (isFinishing || isDestroyed) return
        runOnUiThread {
            runCatching {
                AlertDialog.Builder(this)
                    .setTitle(getString(R.string.search_error_title))
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok) { _, _ -> showSourceChooser() }
                    .show()
            }
        }
    }

    companion object {
        private const val TAG = "FoodGuardInAppScan"
        private const val REQ_CAMERA = 2001
        private const val REQ_GALLERY = 2002
    }
}
