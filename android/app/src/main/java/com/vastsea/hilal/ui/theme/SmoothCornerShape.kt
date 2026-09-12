package com.vastsea.hilal.ui.theme

import androidx.compose.foundation.shape.CornerBasedShape
import androidx.compose.foundation.shape.CornerSize
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Outline
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import kotlin.math.min

class SmoothCornerShape(
    topStart: CornerSize,
    topEnd: CornerSize,
    bottomEnd: CornerSize,
    bottomStart: CornerSize,
    val smoothnessPercent: Int = 60
) : CornerBasedShape(topStart, topEnd, bottomEnd, bottomStart) {

    constructor(
        topStart: Dp = 0.dp,
        topEnd: Dp = 0.dp,
        bottomEnd: Dp = 0.dp,
        bottomStart: Dp = 0.dp,
        smoothnessPercent: Int = 60
    ) : this(
        CornerSize(topStart),
        CornerSize(topEnd),
        CornerSize(bottomEnd),
        CornerSize(bottomStart),
        smoothnessPercent
    )

    constructor(radius: Dp, smoothnessPercent: Int = 60) : this(
        CornerSize(radius),
        CornerSize(radius),
        CornerSize(radius),
        CornerSize(radius),
        smoothnessPercent
    )

    override fun copy(
        topStart: CornerSize,
        topEnd: CornerSize,
        bottomEnd: CornerSize,
        bottomStart: CornerSize
    ): CornerBasedShape = SmoothCornerShape(topStart, topEnd, bottomEnd, bottomStart, smoothnessPercent)

    override fun createOutline(
        size: Size,
        topStart: Float,
        topEnd: Float,
        bottomEnd: Float,
        bottomStart: Float,
        layoutDirection: LayoutDirection
    ): Outline {
        val w = size.width
        val h = size.height
        val maxRadius = min(w, h) / 2f

        val tsPx = topStart.coerceIn(0f, maxRadius)
        val tePx = topEnd.coerceIn(0f, maxRadius)
        val bePx = bottomEnd.coerceIn(0f, maxRadius)
        val bsPx = bottomStart.coerceIn(0f, maxRadius)

        if (tsPx == 0f && tePx == 0f && bePx == 0f && bsPx == 0f) {
            return Outline.Rectangle(Rect(0f, 0f, w, h))
        }

        // Cubic Bézier control factor for continuous curvature (squircle)
        val k = 0.55228475f * (1f + (smoothnessPercent.coerceIn(0, 100) / 100f) * 0.18f)

        val path = Path().apply {
            moveTo(tsPx, 0f)
            lineTo(w - tePx, 0f)
            if (tePx > 0f) {
                cubicTo(w - tePx + tePx * k, 0f, w, tePx - tePx * k, w, tePx)
            }
            lineTo(w, h - bePx)
            if (bePx > 0f) {
                cubicTo(w, h - bePx + bePx * k, w - bePx + bePx * k, h, w - bePx, h)
            }
            lineTo(bsPx, h)
            if (bsPx > 0f) {
                cubicTo(bsPx - bsPx * k, h, 0f, h - bsPx + bsPx * k, 0f, h - bsPx)
            }
            lineTo(0f, tsPx)
            if (tsPx > 0f) {
                cubicTo(0f, tsPx - tsPx * k, tsPx - tsPx * k, 0f, tsPx, 0f)
            }
            close()
        }
        return Outline.Generic(path)
    }
}
