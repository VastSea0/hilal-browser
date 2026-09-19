package com.vastsea.hilal.ui.theme

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

fun Modifier.bouncyClickable(
    enabled: Boolean = true,
    pressedScale: Float = 0.92f,
    hapticType: HilalHapticType = HilalHapticType.Tap,
    onLongClick: (() -> Unit)? = null,
    onClick: () -> Unit
): Modifier = composed {
    val haptics = rememberHilalHaptics()
    val scale = remember { Animatable(1f) }

    val pressSpec = spring<Float>(
        dampingRatio = 0.52f,
        stiffness = Spring.StiffnessMediumLow
    )
    val releaseSpec = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )

    this
        .graphicsLayer {
            scaleX = scale.value
            scaleY = scale.value
        }
        .pointerInput(enabled, onLongClick, onClick) {
            if (!enabled) return@pointerInput
            detectTapGestures(
                onPress = {
                    coroutineScope {
                        launch { scale.animateTo(pressedScale, pressSpec) }
                        haptics.perform(hapticType)
                        tryAwaitRelease()
                        launch { scale.animateTo(1f, releaseSpec) }
                    }
                },
                onLongPress = if (onLongClick != null) {
                    {
                        haptics.perform(HilalHapticType.HeavyClick)
                        onLongClick()
                    }
                } else null,
                onTap = {
                    onClick()
                }
            )
        }
}

@Composable
fun rememberBouncyScale(
    isPressed: Boolean,
    pressedScale: Float = 0.92f
): Float {
    val scale = remember { Animatable(1f) }
    val pressSpec = spring<Float>(dampingRatio = 0.52f, stiffness = Spring.StiffnessMediumLow)
    val releaseSpec = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )
    val targetValue = if (isPressed) pressedScale else 1f
    androidx.compose.runtime.LaunchedEffect(isPressed) {
        scale.animateTo(targetValue, if (isPressed) pressSpec else releaseSpec)
    }
    return scale.value
}
