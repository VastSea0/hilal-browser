package com.vastsea.hilal.ui.components

import androidx.compose.material3.ContainedLoadingIndicator
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.LoadingIndicatorDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Official Material 3 Expressive Morphing Shapes Loading Indicator.
 * Morphs dynamically between polygons (circle, 4-petal flower, star, etc.) with spring physics.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun MorphingLoadingIndicator(
    modifier: Modifier = Modifier
) {
    ContainedLoadingIndicator(
        modifier = modifier,
        containerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
        indicatorColor = MaterialTheme.colorScheme.primary,
        polygons = LoadingIndicatorDefaults.IndeterminateIndicatorPolygons
    )
}
