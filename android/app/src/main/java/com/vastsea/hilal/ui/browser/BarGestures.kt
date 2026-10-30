package com.vastsea.hilal.ui.browser

import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.PointerInputChange
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.input.pointer.util.VelocityTracker
import kotlin.math.abs

/** Callbacks for the gestures the address bar understands. Deltas and velocities are in px. */
interface BarGestureHandler {
    fun onTap()
    fun onLongPress()
    fun onHorizontalDrag(delta: Float)
    fun onHorizontalEnd(velocity: Float)
    fun onVerticalDrag(delta: Float)
    fun onVerticalEnd(velocity: Float)
}

/**
 * One gesture detector for tap, long press and the two drag axes, so they never compete:
 * the axis is chosen once, when the finger leaves the touch slop, and stays fixed until release.
 * Drags are detected in the Initial pass so a drag that starts on a child button still works.
 */
fun Modifier.barGestures(handler: BarGestureHandler): Modifier = pointerInput(handler) {
    awaitEachGesture {
        val down = awaitFirstDown(requireUnconsumed = false, pass = PointerEventPass.Initial)
        val tracker = VelocityTracker().apply { addPosition(down.uptimeMillis, down.position) }
        var travelled = Offset.Zero
        var horizontal: Boolean? = null

        val phase = withTimeoutOrNull(viewConfiguration.longPressTimeoutMillis) {
            while (true) {
                val change = awaitPointerEvent(PointerEventPass.Initial).changes
                    .firstOrNull { it.id == down.id } ?: return@withTimeoutOrNull Phase.Cancelled
                tracker.addPosition(change.uptimeMillis, change.position)
                if (!change.pressed) return@withTimeoutOrNull Phase.Released
                travelled += change.positionChange()
                if (travelled.getDistance() > viewConfiguration.touchSlop) {
                    horizontal = abs(travelled.x) > abs(travelled.y)
                    change.consume()
                    return@withTimeoutOrNull Phase.Dragging
                }
            }
            @Suppress("UNREACHABLE_CODE")
            Phase.Cancelled
        }

        when (phase) {
            null -> {
                handler.onLongPress()
                // Swallow the rest of the gesture so the press does not also become a tap.
                do {
                    val event = awaitPointerEvent(PointerEventPass.Initial)
                    event.changes.forEach(PointerInputChange::consume)
                } while (event.changes.any { it.pressed })
            }
            Phase.Released -> handler.onTap()
            Phase.Cancelled -> Unit
            Phase.Dragging -> {
                val isHorizontal = horizontal == true
                if (isHorizontal) handler.onHorizontalDrag(travelled.x) else handler.onVerticalDrag(travelled.y)
                while (true) {
                    val change = awaitPointerEvent(PointerEventPass.Initial).changes
                        .firstOrNull { it.id == down.id } ?: break
                    tracker.addPosition(change.uptimeMillis, change.position)
                    if (!change.pressed) break
                    val delta = change.positionChange()
                    change.consume()
                    if (isHorizontal) handler.onHorizontalDrag(delta.x) else handler.onVerticalDrag(delta.y)
                }
                val velocity = tracker.calculateVelocity()
                if (isHorizontal) handler.onHorizontalEnd(velocity.x) else handler.onVerticalEnd(velocity.y)
            }
        }
    }
}

private enum class Phase { Released, Cancelled, Dragging }
