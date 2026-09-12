package com.vastsea.hilal.ui.theme

import android.os.Build
import android.view.HapticFeedbackConstants
import android.view.View
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalView
import androidx.core.view.HapticFeedbackConstantsCompat
import androidx.core.view.ViewCompat

enum class HilalHapticType {
    LightTick,
    Tap,
    Confirm,
    Reject,
    GestureStart,
    GestureEnd,
    HeavyClick
}

interface HilalHaptics {
    fun perform(type: HilalHapticType)
}

class ViewHilalHaptics(private val view: View) : HilalHaptics {
    override fun perform(type: HilalHapticType) {
        val constant = when (type) {
            HilalHapticType.LightTick -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                    HapticFeedbackConstants.SEGMENT_TICK
                } else {
                    HapticFeedbackConstants.CLOCK_TICK
                }
            }
            HilalHapticType.Tap -> {
                HapticFeedbackConstants.VIRTUAL_KEY
            }
            HilalHapticType.Confirm -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    HapticFeedbackConstants.CONFIRM
                } else {
                    HapticFeedbackConstants.VIRTUAL_KEY
                }
            }
            HilalHapticType.Reject -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    HapticFeedbackConstants.REJECT
                } else {
                    HapticFeedbackConstants.LONG_PRESS
                }
            }
            HilalHapticType.GestureStart -> {
                HapticFeedbackConstantsCompat.GESTURE_START
            }
            HilalHapticType.GestureEnd -> {
                HapticFeedbackConstantsCompat.GESTURE_END
            }
            HilalHapticType.HeavyClick -> {
                HapticFeedbackConstants.LONG_PRESS
            }
        }
        ViewCompat.performHapticFeedback(view, constant)
    }
}

val LocalHilalHaptics = staticCompositionLocalOf<HilalHaptics> {
    object : HilalHaptics {
        override fun perform(type: HilalHapticType) {}
    }
}

@Composable
fun rememberHilalHaptics(): HilalHaptics {
    val view = LocalView.current
    return remember(view) { ViewHilalHaptics(view) }
}
