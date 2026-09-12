package com.vastsea.hilal.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = HilalLightPrimary,
    onPrimary = HilalLightOnPrimary,
    primaryContainer = HilalLightPrimaryContainer,
    onPrimaryContainer = HilalLightOnPrimaryContainer,
    surface = HilalLightSurface,
    onSurface = HilalLightOnSurface,
    onSurfaceVariant = HilalLightOnSurfaceVariant,
    surfaceContainerLowest = HilalLightSurfaceContainerLowest,
    surfaceContainerLow = HilalLightSurfaceContainerLow,
    surfaceContainer = HilalLightSurfaceContainer,
    surfaceContainerHigh = HilalLightSurfaceContainerHigh,
    surfaceContainerHighest = HilalLightSurfaceContainerHighest,
    outline = HilalLightOutline,
    outlineVariant = HilalLightOutlineVariant,
)

private val DarkColorScheme = darkColorScheme(
    primary = HilalDarkPrimary,
    onPrimary = HilalDarkOnPrimary,
    primaryContainer = HilalDarkPrimaryContainer,
    onPrimaryContainer = HilalDarkOnPrimaryContainer,
    surface = HilalDarkSurface,
    onSurface = HilalDarkOnSurface,
    onSurfaceVariant = HilalDarkOnSurfaceVariant,
    surfaceContainerLowest = HilalDarkSurfaceContainerLowest,
    surfaceContainerLow = HilalDarkSurfaceContainerLow,
    surfaceContainer = HilalDarkSurfaceContainer,
    surfaceContainerHigh = HilalDarkSurfaceContainerHigh,
    surfaceContainerHighest = HilalDarkSurfaceContainerHighest,
    outline = HilalDarkOutline,
    outlineVariant = HilalDarkOutlineVariant,
)

@Composable
fun HilalTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Default false to enforce official Hilal Blue (#0b57d0) brand identity
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            val insetsController = WindowCompat.getInsetsController(window, view)
            insetsController.isAppearanceLightStatusBars = !darkTheme
            insetsController.isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = androidx.compose.material3.Shapes(
            extraSmall = ShapeCache.smooth8,
            small = ShapeCache.smooth12,
            medium = ShapeCache.smooth16,
            large = ShapeCache.smooth24,
            extraLarge = ShapeCache.smooth32
        ),
        content = content
    )
}
