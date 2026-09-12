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

    const val BaseWeight = 1f
    const val ExpansionWeight = 1.18f
    const val CompressionWeight = 0.68f

    val OverviewDragThreshold = 56.dp
}
