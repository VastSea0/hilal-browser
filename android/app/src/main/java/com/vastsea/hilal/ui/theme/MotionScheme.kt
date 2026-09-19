package com.vastsea.hilal.ui.theme

import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

object HilalMotion {
    val EaseOutQuart = CubicBezierEasing(0.25f, 1f, 0.5f, 1f)
    val EaseInQuart = CubicBezierEasing(0.5f, 0f, 0.75f, 0f)

    val SpringBouncy = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )

    val SpringBouncyDp = spring<Dp>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )

    val SpringGentle = spring<Float>(
        dampingRatio = Spring.DampingRatioNoBouncy,
        stiffness = Spring.StiffnessMediumLow
    )

    val FastFadeSpec = tween<Float>(
        durationMillis = 150,
        easing = EaseOutQuart
    )

    val FastColorSpec = tween<androidx.compose.ui.graphics.Color>(
        durationMillis = 150,
        easing = EaseOutQuart
    )

    // Bar hide-on-scroll: fast to hide, low-bouncy spring to reveal
    val BarHideDp = tween<Dp>(durationMillis = 200, easing = EaseInQuart)
    val BarRevealDp = spring<Dp>(
        dampingRatio = Spring.DampingRatioLowBouncy,
        stiffness = Spring.StiffnessMedium
    )

    // Button press: tight spring with noticeable overshoot
    val PressSpring = spring<Float>(
        dampingRatio = 0.52f,
        stiffness = Spring.StiffnessMediumLow
    )

    // Item stagger delay base (ms per index)
    const val ItemStaggerMs = 30

    const val BaseWeight = 1f
    const val ExpansionWeight = 1.18f
    const val CompressionWeight = 0.68f

    val OverviewDragThreshold = 56.dp
}
