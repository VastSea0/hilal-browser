package com.vastsea.hilal.ui.theme

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

object ShapeCache {
    val smooth8 = SmoothCornerShape(8.dp)
    val smooth10 = SmoothCornerShape(10.dp)
    val smooth12 = SmoothCornerShape(12.dp)
    val smooth14 = SmoothCornerShape(14.dp)
    val smooth16 = SmoothCornerShape(16.dp)
    val smooth20 = SmoothCornerShape(20.dp)
    val smooth24 = SmoothCornerShape(24.dp)
    val smooth28 = SmoothCornerShape(28.dp)
    val smooth32 = SmoothCornerShape(32.dp)
    val smoothPill = SmoothCornerShape(50.dp)

    fun groupedTop(radius: Dp = 16.dp) = SmoothCornerShape(
        topStart = radius,
        topEnd = radius,
        bottomStart = 0.dp,
        bottomEnd = 0.dp
    )

    fun groupedBottom(radius: Dp = 16.dp) = SmoothCornerShape(
        topStart = 0.dp,
        topEnd = 0.dp,
        bottomStart = radius,
        bottomEnd = radius
    )

    fun groupedMiddle() = SmoothCornerShape(0.dp)

    fun groupedSingle(radius: Dp = 16.dp) = SmoothCornerShape(radius)
}
