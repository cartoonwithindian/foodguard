package app.foodguard.scanner

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView

/**
 * A single floating, draggable search dot (Google "Circle to Search" style).
 *
 *  - Tap (small movement + release): launch [VisualSelectionActivity].
 *  - Drag anywhere: move the dot; the last position is remembered.
 *  - Drag over the bottom "remove" target and release: disable the overlay
 *    entirely (stops this service and switches the Quick Settings tile OFF).
 *
 * The dot is shown whenever the user enables the Quick Settings tile, and kept
 * on top of every app via TYPE_APPLICATION_OVERLAY.
 */
class FoodGuardOverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var prefs: SharedPreferences

    private var dotView: View? = null
    private var dotParams: WindowManager.LayoutParams? = null

    // Remove-target overlay shown only while the dot is being dragged.
    private var removeTargetView: View? = null
    private var removeTargetParams: WindowManager.LayoutParams? = null

    private var startX = 0
    private var startY = 0
    private var touchStartRawX = 0f
    private var touchStartRawY = 0f
    private var dragging = false
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        createNotificationChannel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // This is a foreground service so the floating dot survives while the
        // app is in the background (required on Android 12+ to start from a
        // Quick Settings tile or notification).
        startForeground(NOTIFICATION_ID, buildNotification())
        if (dotView == null) {
            createDot()
        }
        FoodGuardSelectionReceiver.setOverlayEnabled(this, true)
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.overlay_notification_title),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.overlay_notification_text)
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val stopIntent = Intent(this, FoodGuardSelectionReceiver::class.java).apply {
            action = FoodGuardSelectionReceiver.ACTION_STOP_SELECTION
        }
        val pendingStop = PendingIntent.getBroadcast(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.overlay_notification_title))
                .setContentText(getString(R.string.overlay_notification_text))
                .setSmallIcon(R.drawable.ic_baseline_center_focus)
                .addAction(
                    Notification.Action.Builder(
                        android.graphics.drawable.Icon.createWithResource(
                            this, R.drawable.ic_close
                        ),
                        getString(R.string.overlay_action_disable), pendingStop
                    ).build()
                )
                .setOngoing(true)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle(getString(R.string.overlay_notification_title))
                .setContentText(getString(R.string.overlay_notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_view)
                .setOngoing(true)
                .build()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun createDot() {
        val density = resources.displayMetrics.density
        val dotSize = (58 * density).toInt()

        val dot = FrameLayout(this).apply {
            setBackgroundResource(R.drawable.overlay_dot_background)
            elevation = (10 * density)
            setOnTouchListener { _, event -> handleDotTouch(event) }
        }

        dot.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_baseline_center_focus)
            val icon = (28 * density).toInt()
            layoutParams = FrameLayout.LayoutParams(icon, icon, Gravity.CENTER)
        })

        val wmParams = WindowManager.LayoutParams(
            dotSize,
            dotSize,
            overlayType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            // Restore the dot's last known position, adapted to the current
            // device size. The stored position is a relative fraction (0..1) of
            // the SAFE area so it scales across phone sizes and doesn't land
            // under the status bar or off-screen. A legacy absolute-pixel value
            // (KEY_DOT_X/Y) is clamped into the safe bounds as a fallback.
            val rect = safeRect(dotSize)
            val fx = prefs.getFloat(KEY_DOT_PX, -1f)
            val fy = prefs.getFloat(KEY_DOT_PY, -1f)
            x = if (fx in 0f..1f) {
                rect.left + Math.round(fx * (rect.width() - dotSize))
            } else {
                val legacyX = prefs.getInt(KEY_DOT_X, -1)
                if (legacyX >= 0) legacyX else rect.right - dotSize - (16 * density).toInt()
            }
            y = if (fy in 0f..1f) {
                rect.top + Math.round(fy * (rect.height() - dotSize))
            } else {
                val legacyY = prefs.getInt(KEY_DOT_Y, -1)
                if (legacyY >= 0) legacyY else rect.centerY() - dotSize / 2
            }
            x = clamp(x, rect.left, rect.right - dotSize)
            y = clamp(y, rect.top, rect.bottom - dotSize)
        }

        dotView = dot
        dotParams = wmParams
        val added = runCatching { windowManager.addView(dot, wmParams) }.isSuccess
        if (!added) {
            // Overlay permission missing/revoked — stop cleanly instead of
            // leaving a foreground notification with no visible dot.
            dotView = null
            dotParams = null
            stopSelf()
        }
    }

    private fun handleDotTouch(event: MotionEvent): Boolean {
        val params = dotParams ?: return false
        val view = dotView ?: return false
        return when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                startX = params.x
                startY = params.y
                touchStartRawX = event.rawX
                touchStartRawY = event.rawY
                dragging = false
                true
            }
            MotionEvent.ACTION_MOVE -> {
                val dx = event.rawX - touchStartRawX
                val dy = event.rawY - touchStartRawY
                if (!dragging && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) {
                    dragging = true
                    showRemoveTarget()
                }
                if (dragging) {
                    val rect = safeRect(view.width)
                    params.x = clamp(startX + dx.toInt(), rect.left, rect.right - view.width)
                    params.y = clamp(startY + dy.toInt(), rect.top, rect.bottom - view.height)
                    runCatching { windowManager.updateViewLayout(view, params) }
                    updateRemoveTargetHighlight()
                }
                true
            }
            MotionEvent.ACTION_UP -> {
                if (dragging) {
                    val droppedOnRemove = isInsideRemoveTarget(event.rawX, event.rawY)
                    hideRemoveTarget()
                    dragging = false
                    if (droppedOnRemove) {
                        stopSelf()
                    } else {
                        persistPosition(params.x, params.y)
                    }
                } else {
                    // A clean tap → start circle-to-search.
                    launchCircleToSearch()
                }
                true
            }
            MotionEvent.ACTION_CANCEL -> {
                hideRemoveTarget()
                dragging = false
                true
            }
            else -> false
        }
    }

    private fun showRemoveTarget() {
        if (removeTargetView != null) return
        val density = resources.displayMetrics.density
        val size = (96 * density).toInt()

        val target = ImageView(this).apply {
            setImageResource(R.drawable.overlay_remove_target)
        }
        val params = WindowManager.LayoutParams(
            size,
            size,
            overlayType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            y = (40 * density).toInt()
            alpha = 0.6f
        }

        removeTargetView = target
        removeTargetParams = params
        mainHandler.post {
            runCatching { windowManager.addView(target, params) }
        }

        // Auto-expire the target if the user holds still without dragging far.
        mainHandler.removeCallbacks(hideTargetRunnable)
        mainHandler.postDelayed(hideTargetRunnable, 3000)
    }

    private fun hideRemoveTarget() {
        mainHandler.removeCallbacks(hideTargetRunnable)
        removeTargetView?.let { view ->
            mainHandler.post { runCatching { windowManager.removeView(view) } }
        }
        removeTargetView = null
        removeTargetParams = null
    }

    private val hideTargetRunnable = Runnable { hideRemoveTarget() }

    private fun updateRemoveTargetHighlight() {
        val params = removeTargetParams ?: return
        val inside = isInsideRemoveTargetForParams()
        removeTargetView?.alpha = if (inside) 1.0f else 0.6f
        val density = resources.displayMetrics.density
        removeTargetView?.scaleX = if (inside) 1.2f else 1.0f
        removeTargetView?.scaleY = if (inside) 1.2f else 1.0f
    }

    private fun isInsideRemoveTarget(rawX: Float, rawY: Float): Boolean {
        val params = removeTargetParams ?: return false
        // Convert the target's bottom-anchored window coords into raw screen coords.
        val wm = windowManager.currentWindowMetrics.bounds
        val size = params.width
        val left = ((wm.width() / 2) - (size / 2)).toFloat()
        val top = (wm.height() - params.y - size).toFloat()
        val hit = rect(left, top, left + size, top + size)
        return hit.contains(rawX, rawY)
    }

    private fun isInsideRemoveTargetForParams(): Boolean {
        val params = removeTargetParams ?: return false
        val dot = dotParams ?: return false
        val wm = windowManager.currentWindowMetrics.bounds
        val size = params.width
        val left = ((wm.width() / 2) - (size / 2)).toFloat()
        val top = (wm.height() - params.y - size).toFloat()
        val targetRect = rect(left, top, left + size, top + size)
        // Dot center in raw coords.
        val dotCenterX = dot.x + dot.width / 2f
        val dotCenterY = dot.y + dot.height / 2f
        return targetRect.contains(dotCenterX, dotCenterY)
    }

    private fun rect(l: Float, t: Float, r: Float, b: Float) =
        android.graphics.RectF(l, t, r, b)

    private fun clamp(v: Int, min: Int, max: Int): Int =
        Math.max(min, Math.min(v, max))

    /**
     * Rectangle (in dot window coordinates) the dot may occupy without covering
     * the status bar, navigation bar, or display cutout. Derived dynamically
     * from the current window metrics plus the framework's system-bar heights,
     * so no screen size or position is hardcoded.
     */
    private fun safeRect(dotSize: Int): android.graphics.Rect {
        val wm = windowManager.currentWindowMetrics.bounds
        val topInset = getSystemDimen("status_bar_height")
        val bottomInset = getSystemDimen("navigation_bar_height")
        return android.graphics.Rect(
            0,
            topInset,
            wm.width(),
            (wm.height() - bottomInset).coerceAtLeast(topInset + dotSize)
        )
    }

    private fun getSystemDimen(dim: String): Int = runCatching {
        val id = resources.getIdentifier(dim, "dimen", "android")
        if (id == 0) 0 else resources.getDimensionPixelSize(id)
    }.getOrDefault(0)

    private fun persistPosition(x: Int, y: Int) {
        val dot = dotParams ?: return
        // Store the position as a relative fraction (0..1) of the safe area so
        // the dot adapts to any screen size instead of a fixed pixel location.
        val rect = safeRect(dot.width)
        val spanX = (rect.width() - dot.width).coerceAtLeast(1)
        val spanY = (rect.height() - dot.height).coerceAtLeast(1)
        val fx = (x - rect.left).toFloat() / spanX
        val fy = (y - rect.top).toFloat() / spanY
        prefs.edit()
            .putFloat(KEY_DOT_PX, fx.coerceIn(0f, 1f))
            .putFloat(KEY_DOT_PY, fy.coerceIn(0f, 1f))
            .apply()
    }

    private fun launchCircleToSearch() {
        val intent = Intent(this, VisualSelectionActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
    }

    override fun onDestroy() {
        dotView?.let { view -> runCatching { windowManager.removeView(view) } }
        dotView = null
        hideRemoveTarget()
        FoodGuardSelectionReceiver.setOverlayEnabled(this, false)
        super.onDestroy()
    }

    private fun overlayType(): Int =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE

    companion object {
        const val PREFS_NAME = "foodguard_overlay_prefs"
        // Legacy absolute-pixel keys (read as a fallback for older installs).
        const val KEY_DOT_X = "dot_x"
        const val KEY_DOT_Y = "dot_y"
        // Relative (0..1 of the safe area) position — the current storage.
        const val KEY_DOT_PX = "dot_px"
        const val KEY_DOT_PY = "dot_py"

        const val CHANNEL_ID = "foodguard_overlay"
        const val NOTIFICATION_ID = 2001

        /** Start the floating-dot overlay (as a foreground service). */
        fun start(context: Context) {
            val intent = Intent(context, FoodGuardOverlayService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, FoodGuardOverlayService::class.java))
        }
    }
}
