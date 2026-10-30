package com.vastsea.hilal.ui.browser

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.vastsea.hilal.ui.theme.Haptics
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.sign

/**
 * Horizontal swipe on the address bar: the page follows the finger and the neighbouring tab
 * slides in. Past [commitFraction] of the width, or with a fling, releasing switches tabs.
 * Swiping left shows the next tab, swiping right the previous one.
 */
@Stable
class TabSwipe(
    private val scope: CoroutineScope,
    private val haptics: () -> Haptics,
    private val spatialSpec: () -> AnimationSpec<Float>,
    private val neighbours: () -> Pair<String?, String?>,
    private val onCommit: (tabId: String) -> Unit,
) {
    val offset = Animatable(0f)
    var width by mutableStateOf(1f)
    var gap by mutableStateOf(0f)

    /** The tab being revealed, so the preview can draw it. Null when idle. */
    var revealing by mutableStateOf<String?>(null)
        private set

    private var armed = false

    fun drag(delta: Float) {
        val (previous, next) = neighbours()
        val proposed = offset.value + delta
        val target = when {
            proposed < 0 && next == null -> rubberBand(proposed)
            proposed > 0 && previous == null -> rubberBand(proposed)
            else -> proposed
        }
        revealing = when {
            target < 0 -> next
            target > 0 -> previous
            else -> null
        }
        val pastThreshold = revealing != null && abs(target) >= width * COMMIT_FRACTION
        if (pastThreshold && !armed) haptics().threshold()
        armed = pastThreshold
        scope.launch { offset.snapTo(target) }
    }

    fun end(velocity: Float) {
        val target = revealing
        val value = offset.value
        val flung = abs(velocity) > FLING_VELOCITY && sign(velocity) == sign(value)
        armed = false
        if (target != null && (abs(value) >= width * COMMIT_FRACTION || flung)) {
            scope.launch {
                offset.animateTo(sign(value) * (width + gap), spatialSpec(), initialVelocity = velocity)
                onCommit(target)
                offset.snapTo(0f)
                revealing = null
            }
        } else {
            scope.launch {
                offset.animateTo(0f, spatialSpec(), initialVelocity = velocity)
                revealing = null
            }
        }
    }

    private fun rubberBand(value: Float): Float {
        val limit = width * 0.12f
        val x = abs(value) / limit
        return sign(value) * limit * (1f - 1f / (x * 0.55f + 1f))
    }

    private companion object {
        const val COMMIT_FRACTION = 0.3f
        const val FLING_VELOCITY = 1800f
    }
}

/**
 * Vertical swipe up on the address bar: the page shrinks slightly as a preview of the tab
 * overview, which opens once the drag passes [distance] or is flung upward.
 */
@Stable
class OverviewPull(
    private val scope: CoroutineScope,
    private val haptics: () -> Haptics,
    private val spatialSpec: () -> AnimationSpec<Float>,
    private val onOpen: () -> Unit,
) {
    val offset = Animatable(0f)
    var distance by mutableStateOf(1f)
    private var armed = false

    val progress: Float get() = (-offset.value / distance).coerceIn(0f, 1.2f)

    fun drag(delta: Float) {
        val proposed = offset.value + delta
        val target = if (proposed > 0) proposed * 0.2f else proposed
        val past = -target >= distance
        if (past && !armed) haptics().threshold()
        armed = past
        scope.launch { offset.snapTo(target) }
    }

    fun end(velocity: Float) {
        val open = armed || velocity < -FLING_VELOCITY
        armed = false
        if (open) onOpen()
        scope.launch { offset.animateTo(0f, spatialSpec(), initialVelocity = velocity) }
    }

    private companion object {
        const val FLING_VELOCITY = 1500f
    }
}
