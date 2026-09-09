package com.vastsea.hilal.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

/**
 * Material 3 Expressive Arc & Morphing Loading Indicator.
 * Smoothly morphs sweep angle and rotates continuously with expressive spring easing.
 * Transparent and background-agnostic.
 */
@Composable
fun MorphingLoadingIndicator(
    modifier: Modifier = Modifier,
    size: Int = 36
) {
    val infiniteTransition = rememberInfiniteTransition(label = "m3e_loader")

    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1100, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    val sweepAngle by infiniteTransition.animateFloat(
        initialValue = 60f,
        targetValue = 280f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "sweep_angle"
    )

    val primaryColor = MaterialTheme.colorScheme.primary

    Box(
        modifier = modifier.size(size.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(3.dp)) {
            drawArc(
                color = primaryColor,
                startAngle = rotation,
                sweepAngle = sweepAngle,
                useCenter = false,
                style = Stroke(width = 3.5.dp.toPx(), cap = StrokeCap.Round)
            )
        }
    }
}

/**
 * Material 3 Expressive Linear Page Progress Bar with smooth spring animation
 */
@Composable
fun PageProgressBar(
    progress: Int,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    val animatedProgress by animateFloatAsState(
        targetValue = (progress.coerceIn(0, 100)) / 100f,
        animationSpec = spring(stiffness = Spring.StiffnessLow),
        label = "page_progress"
    )

    AnimatedVisibility(
        visible = isLoading && progress in 1..99,
        enter = fadeIn(animationSpec = tween(150)),
        exit = fadeOut(animationSpec = tween(250))
    ) {
        LinearProgressIndicator(
            progress = { animatedProgress },
            modifier = modifier
                .fillMaxWidth()
                .height(3.dp),
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceContainerHighest,
            strokeCap = StrokeCap.Round
        )
    }
}
