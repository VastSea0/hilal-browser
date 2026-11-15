package com.vastsea.hilal.ui.glass

import android.os.Build
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.CornerBasedShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawscope.ContentDrawScope
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.ui.glass.backdrop.Backdrop
import com.vastsea.hilal.ui.glass.backdrop.backdrops.LayerBackdrop
import com.vastsea.hilal.ui.glass.backdrop.backdrops.emptyBackdrop
import com.vastsea.hilal.ui.glass.backdrop.drawBackdrop
import com.vastsea.hilal.ui.glass.backdrop.effects.blur
import com.vastsea.hilal.ui.glass.backdrop.effects.colorControls
import com.vastsea.hilal.ui.glass.backdrop.effects.lens
import com.vastsea.hilal.ui.glass.backdrop.highlight.Highlight
import com.vastsea.hilal.ui.glass.backdrop.highlight.HighlightElement
import com.vastsea.hilal.ui.glass.backdrop.internal.ShapeProvider
import com.vastsea.hilal.ui.glass.backdrop.shadow.Shadow

val LocalLiquidGlassEnabled = staticCompositionLocalOf { false }

val LocalAppBackdrop = staticCompositionLocalOf<Backdrop> { emptyBackdrop() }

internal val LocalGlassExport = compositionLocalOf<LayerBackdrop?> { null }

fun isGlassSupported(sdkInt: Int = Build.VERSION.SDK_INT): Boolean = sdkInt >= Build.VERSION_CODES.S

@Composable
fun isLiquidGlassActive(): Boolean = LocalLiquidGlassEnabled.current && isGlassSupported()

val GlassSpring = spring<Float>(dampingRatio = 0.72f, stiffness = 320f)
const val STRETCH = 0.16f
const val SQUASH = 0.5f

internal val GLASS_EDGE_WIDTH = 0.5.dp
internal val GLASS_EDGE_COLOR = Color.White.copy(alpha = 0.12f)

private const val VIBRANCY = 1f
private const val BLUR_RADIUS_DP = 8f
private const val LENS_HEIGHT = 0.5f
private const val LENS_AMOUNT = 0.5f
private const val LENS_MAX_DP = 48f
private const val SURFACE_OPACITY = 0.4f
private const val GLASS_RESOLUTION_SCALE = 0.33f
private const val DARK_INDICATOR_OPACITY = 0.14f

@Composable
fun glassContentColor(): Color =
    if (MaterialTheme.colorScheme.surface.luminance() > 0.5f) Color.Black else Color.White

@Composable
fun glassIndicatorColor(): Color =
    if (MaterialTheme.colorScheme.surface.luminance() > 0.5f) {
        Color.White.copy(alpha = 0.5f)
    } else {
        Color.White.copy(alpha = DARK_INDICATOR_OPACITY)
    }

@Composable
fun rememberBackdropPainter(
    backgroundColor: Color = MaterialTheme.colorScheme.background,
): ContentDrawScope.() -> Unit = remember(backgroundColor) {
    {
        drawRect(backgroundColor)
        drawContent()
    }
}

@Composable
fun Modifier.lightweightLiquidGlass(
    shape: CornerBasedShape,
    fallbackColor: Color,
): Modifier {
    val useGlass = isLiquidGlassActive()
    val glassTint = if (MaterialTheme.colorScheme.surface.luminance() > 0.5f) {
        Color(0xFFFAFAFA)
    } else {
        Color(0xFF121212)
    }
    val shapeProvider = remember(shape) { ShapeProvider { shape } }

    return clip(shape)
        .background(
            color = if (useGlass) glassTint.copy(alpha = SURFACE_OPACITY) else fallbackColor,
            shape = shape,
        )
        .then(
            if (useGlass) {
                HighlightElement(
                    shapeProvider = shapeProvider,
                    highlight = { Highlight.Default },
                ).border(GLASS_EDGE_WIDTH, GLASS_EDGE_COLOR, shape)
            } else {
                Modifier
            },
        )
}

@Composable
fun Modifier.liquidGlassRim(shape: Shape): Modifier {
    if (!isLiquidGlassActive()) return this
    val shapeProvider = remember(shape) { ShapeProvider { shape } }
    return then(
        HighlightElement(
            shapeProvider = shapeProvider,
            highlight = { Highlight.Default },
        ),
    )
}

@Composable
fun Modifier.liquidGlass(
    shape: CornerBasedShape,
    surfaceTint: Color? = null,
): Modifier {
    if (!isLiquidGlassActive()) return this
    val backdrop = LocalAppBackdrop.current
    val exportedBackdrop = LocalGlassExport.current
    val density = LocalDensity.current
    val blurPx = with(density) { BLUR_RADIUS_DP.dp.toPx() } * GLASS_RESOLUTION_SCALE
    val lensHeightPx = with(density) { (LENS_HEIGHT * LENS_MAX_DP).dp.toPx() } * GLASS_RESOLUTION_SCALE
    val lensAmountPx = with(density) { (LENS_AMOUNT * LENS_MAX_DP).dp.toPx() } * GLASS_RESOLUTION_SCALE
    val themeTint = if (MaterialTheme.colorScheme.surface.luminance() > 0.5f) {
        Color(0xFFFAFAFA)
    } else {
        Color(0xFF121212)
    }
    val surfaceTintColor = surfaceTint ?: themeTint.copy(alpha = SURFACE_OPACITY)

    return drawBackdrop(
        backdrop = backdrop,
        shape = { shape },
        effects = {
            colorControls(saturation = 1f + 0.5f * VIBRANCY)
            blur(blurPx)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                lens(
                    refractionHeight = lensHeightPx,
                    refractionAmount = lensAmountPx,
                    depthEffect = true,
                    chromaticAberration = true,
                )
            }
        },
        highlight = { Highlight.Default },
        shadow = { Shadow.Default },
        onDrawSurface = {
            drawRect(color = surfaceTintColor, size = size)
        },
        exportedBackdrop = exportedBackdrop,
        backdropScale = GLASS_RESOLUTION_SCALE,
    ).border(GLASS_EDGE_WIDTH, GLASS_EDGE_COLOR, shape)
}
