package com.vastsea.hilal.ui.browser

import android.graphics.Bitmap
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.vastsea.hilal.addons.await
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoView

/** Holds the one GeckoView of the browser screen so other components can capture and drive it. */
@Stable
class GeckoHostState {
    internal var view: GeckoView? by mutableStateOf(null)

    /** A downscaled screenshot of what the view shows, or null if Gecko has not painted yet. */
    suspend fun capture(scale: Float = 0.4f): Bitmap? {
        val v = view ?: return null
        if (v.session == null || v.width == 0) return null
        val full = runCatching { v.capturePixels().await() }.getOrNull() ?: return null
        val w = (full.width * scale).toInt().coerceAtLeast(1)
        val h = (full.height * scale).toInt().coerceAtLeast(1)
        return Bitmap.createScaledBitmap(full, w, h, true).also { if (it !== full) full.recycle() }
    }
}

@Composable
fun rememberGeckoHostState() = remember { GeckoHostState() }

/**
 * Shows [session] in a GeckoView. The bottom bar floats over the page, so Gecko is told how
 * tall it is ([toolbarMaxHeightPx]) and how much of it currently covers the page
 * ([toolbarVisibleHeightPx]); fixed-position page elements then stay above the bar.
 */
@Composable
fun GeckoHost(
    state: GeckoHostState,
    session: GeckoSession?,
    toolbarMaxHeightPx: Int,
    toolbarVisibleHeightPx: () -> Int,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val view = remember {
        GeckoView(context).apply {
            // A GeckoView never draws anything until a session paints into it, so start
            // with the window background rather than a black surface.
            coverUntilFirstPaint(android.graphics.Color.TRANSPARENT)
        }
    }
    DisposableEffect(view) {
        state.view = view
        onDispose {
            view.releaseSession()
            state.view = null
        }
    }
    AndroidView(
        factory = { view },
        modifier = modifier,
        update = { v ->
            v.setTag(R_TAG_WANTED, session)
            attachWhenOpen(v, session)
            v.setDynamicToolbarMaxHeight(toolbarMaxHeightPx)
            v.setVerticalClipping(-toolbarVisibleHeightPx())
        },
    )
}

private val R_TAG_WANTED = com.vastsea.hilal.R.id.gecko_wanted_session

/**
 * GeckoView.setSession() opens an unopened session on a *new default runtime*, which would
 * crash next to ours. Sessions handed out through onNewSession are opened by Gecko a moment
 * later, so wait for that instead of attaching early.
 */
private fun attachWhenOpen(view: GeckoView, session: GeckoSession?) {
    if (view.getTag(R_TAG_WANTED) !== session || view.session === session) return
    if (session == null) {
        view.releaseSession()
        return
    }
    if (!session.isOpen) {
        view.postOnAnimation { attachWhenOpen(view, session) }
        return
    }
    if (view.session != null) view.releaseSession()
    view.setSession(session)
}
