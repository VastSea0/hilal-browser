package com.vastsea.hilal.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialExpressiveTheme
import androidx.compose.material3.MotionScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import com.vastsea.hilal.data.ThemeMode

// Hilal violet tonal palette, used when the device has no wallpaper colors (before Android 12)
// or the user turned dynamic color off.
private val LightScheme = lightColorScheme(
    primary = Color(0xFF6B4EA2),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFEBDDFF),
    onPrimaryContainer = Color(0xFF522F88),
    secondary = Color(0xFF645A70),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFEBDDF7),
    onSecondaryContainer = Color(0xFF4C4357),
    tertiary = Color(0xFF7F525C),
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFFFFD9E0),
    onTertiaryContainer = Color(0xFF643B45),
    background = Color(0xFFFEF7FF),
    onBackground = Color(0xFF1D1B20),
    surface = Color(0xFFFEF7FF),
    onSurface = Color(0xFF1D1B20),
    surfaceVariant = Color(0xFFE8E0EB),
    onSurfaceVariant = Color(0xFF4A4550),
    outline = Color(0xFF7B7581),
    outlineVariant = Color(0xFFCBC4D1),
    surfaceContainerLowest = Color(0xFFFFFFFF),
    surfaceContainerLow = Color(0xFFF8F1FA),
    surfaceContainer = Color(0xFFF2EBF4),
    surfaceContainerHigh = Color(0xFFECE6EE),
    surfaceContainerHighest = Color(0xFFE6E0E9),
)

private val DarkScheme = darkColorScheme(
    primary = Color(0xFFD4BBFF),
    onPrimary = Color(0xFF3B1870),
    primaryContainer = Color(0xFF522F88),
    onPrimaryContainer = Color(0xFFEBDDFF),
    secondary = Color(0xFFCFC1DA),
    onSecondary = Color(0xFF352D40),
    secondaryContainer = Color(0xFF4C4357),
    onSecondaryContainer = Color(0xFFEBDDF7),
    tertiary = Color(0xFFF1B7C4),
    onTertiary = Color(0xFF4A252F),
    tertiaryContainer = Color(0xFF643B45),
    onTertiaryContainer = Color(0xFFFFD9E0),
    background = Color(0xFF151218),
    onBackground = Color(0xFFE7E0E8),
    surface = Color(0xFF151218),
    onSurface = Color(0xFFE7E0E8),
    surfaceVariant = Color(0xFF4A4550),
    onSurfaceVariant = Color(0xFFCBC4D1),
    outline = Color(0xFF958E9B),
    outlineVariant = Color(0xFF4A4550),
    surfaceContainerLowest = Color(0xFF100D12),
    surfaceContainerLow = Color(0xFF1D1B20),
    surfaceContainer = Color(0xFF221F24),
    surfaceContainerHigh = Color(0xFF2C292F),
    surfaceContainerHighest = Color(0xFF37343A),
)

@Composable
fun isDarkTheme(mode: ThemeMode): Boolean = when (mode) {
    ThemeMode.System -> isSystemInDarkTheme()
    ThemeMode.Light -> false
    ThemeMode.Dark -> true
}

@Composable
fun HilalTheme(
    themeMode: ThemeMode,
    dynamicColor: Boolean,
    content: @Composable () -> Unit,
) {
    val dark = isDarkTheme(themeMode)
    val context = LocalContext.current
    val scheme: ColorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
            if (dark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        dark -> DarkScheme
        else -> LightScheme
    }
    MaterialExpressiveTheme(
        colorScheme = scheme,
        motionScheme = MotionScheme.expressive(),
        content = content,
    )
}
