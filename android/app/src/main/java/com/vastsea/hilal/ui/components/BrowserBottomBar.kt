@file:OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3ExpressiveApi::class)

package com.vastsea.hilal.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Tab
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.ui.theme.*
import kotlinx.coroutines.launch

private enum class ToolbarButtonId {
    BACK, FORWARD, NEW_TAB, TABS, OPTIONS
}

// Animatable weight for each button: springs to ExpansionWeight on press, then bounces back
@Composable
private fun rememberButtonWeight(buttonId: ToolbarButtonId): Pair<Animatable<Float, *>, suspend (ToolbarButtonId?) -> Unit> {
    val weight = remember { Animatable(HilalMotion.BaseWeight) }
    val expandSpec = spring<Float>(dampingRatio = 0.40f, stiffness = Spring.StiffnessMediumLow)
    val returnSpec = spring<Float>(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)

    suspend fun animateFor(active: ToolbarButtonId?) {
        val target = when (active) {
            buttonId -> HilalMotion.ExpansionWeight
            null -> HilalMotion.BaseWeight
            else -> HilalMotion.CompressionWeight
        }
        val spec = if (active == null) returnSpec else expandSpec
        weight.animateTo(target, spec)
    }

    return Pair(weight, ::animateFor)
}

@Composable
fun BrowserBottomBar(
    canGoBack: Boolean,
    canGoForward: Boolean,
    tabCount: Int,
    isDocked: Boolean,
    onGoBack: () -> Unit,
    onGoForward: () -> Unit,
    onNewTab: () -> Unit,
    onNewWorkspaceLongPress: () -> Unit,
    onOpenTabsTray: () -> Unit,
    onOpenOptions: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptics = rememberHilalHaptics()
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current
    val dragThresholdPx = with(density) { HilalMotion.OverviewDragThreshold.toPx() }
    var totalDragY by remember { mutableFloatStateOf(0f) }
    var thresholdTriggered by remember { mutableStateOf(false) }

    // Per-button Animatable weights — react independently and concurrently
    val backWeight = remember { Animatable(HilalMotion.BaseWeight) }
    val forwardWeight = remember { Animatable(HilalMotion.BaseWeight) }
    val newTabWeight = remember { Animatable(HilalMotion.BaseWeight) }
    val tabsWeight = remember { Animatable(HilalMotion.BaseWeight) }
    val optionsWeight = remember { Animatable(HilalMotion.BaseWeight) }

    val allWeights = listOf(backWeight, forwardWeight, newTabWeight, tabsWeight, optionsWeight)
    val expandSpec = spring<Float>(dampingRatio = 0.42f, stiffness = Spring.StiffnessMediumLow)
    val returnSpec = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )

    fun triggerButton(pressedWeight: Animatable<Float, *>, action: () -> Unit) {
        action()
        scope.launch {
            // Compress siblings, expand pressed
            for (w in allWeights) {
                if (w !== pressedWeight) launch { w.animateTo(HilalMotion.CompressionWeight, expandSpec) }
            }
            pressedWeight.animateTo(HilalMotion.ExpansionWeight, expandSpec)
            // Spring everything back
            for (w in allWeights) {
                launch { w.animateTo(HilalMotion.BaseWeight, returnSpec) }
            }
        }
    }

    val dragGestureModifier = Modifier.pointerInput(Unit) {
        detectVerticalDragGestures(
            onDragStart = {
                totalDragY = 0f
                thresholdTriggered = false
                haptics.perform(HilalHapticType.GestureStart)
            },
            onVerticalDrag = { _, dragAmount ->
                totalDragY += dragAmount
                if (!thresholdTriggered && totalDragY <= -dragThresholdPx) {
                    thresholdTriggered = true
                    haptics.perform(HilalHapticType.Confirm)
                    onOpenTabsTray()
                }
            },
            onDragEnd = {
                haptics.perform(HilalHapticType.GestureEnd)
                totalDragY = 0f
                thresholdTriggered = false
            },
            onDragCancel = {
                totalDragY = 0f
                thresholdTriggered = false
            }
        )
    }

    if (!isDocked) {
        Surface(
            color = MaterialTheme.colorScheme.surfaceContainerHigh,
            shape = ShapeCache.smoothPill,
            shadowElevation = 8.dp,
            tonalElevation = 4.dp,
            modifier = modifier
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 12.dp)
                .height(64.dp)
                .fillMaxWidth()
                .then(dragGestureModifier)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Box(
                    modifier = Modifier
                        .weight(backWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            enabled = canGoBack,
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(backWeight, onGoBack) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = stringResource(R.string.back),
                        tint = if (canGoBack) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
                        modifier = Modifier.size(24.dp)
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(forwardWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            enabled = canGoForward,
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(forwardWeight, onGoForward) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = stringResource(R.string.forward),
                        tint = if (canGoForward) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
                        modifier = Modifier.size(24.dp)
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(newTabWeight.value)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 54.dp, height = 40.dp)
                            .clip(ShapeCache.smooth16)
                            .background(MaterialTheme.colorScheme.primary)
                            .bouncyClickable(
                                pressedScale = 0.88f,
                                onLongClick = onNewWorkspaceLongPress,
                                onClick = { triggerButton(newTabWeight, onNewTab) }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = stringResource(R.string.new_tab),
                            tint = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .weight(tabsWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(tabsWeight, onOpenTabsTray) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    BadgedBox(
                        badge = {
                            Badge(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            ) {
                                Text(tabCount.toString())
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Tab,
                            contentDescription = stringResource(R.string.tabs),
                            tint = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .weight(optionsWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(optionsWeight, onOpenOptions) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = stringResource(R.string.options),
                        tint = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    } else {
        Surface(
            color = MaterialTheme.colorScheme.surfaceContainer,
            shape = ShapeCache.groupedTop(20.dp),
            tonalElevation = 2.dp,
            modifier = modifier
                .fillMaxWidth()
                .then(dragGestureModifier)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
            ) {
                HorizontalDivider(
                    thickness = 0.5.dp,
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.30f)
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .padding(horizontal = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                Box(
                    modifier = Modifier
                        .weight(backWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            enabled = canGoBack,
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(backWeight, onGoBack) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = stringResource(R.string.back),
                        tint = if (canGoBack) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
                        modifier = Modifier.size(22.dp)
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(forwardWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            enabled = canGoForward,
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(forwardWeight, onGoForward) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = stringResource(R.string.forward),
                        tint = if (canGoForward) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
                        modifier = Modifier.size(22.dp)
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(newTabWeight.value)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 50.dp, height = 36.dp)
                            .clip(ShapeCache.smooth14)
                            .background(MaterialTheme.colorScheme.primary)
                            .bouncyClickable(
                                pressedScale = 0.88f,
                                onLongClick = onNewWorkspaceLongPress,
                                onClick = { triggerButton(newTabWeight, onNewTab) }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = stringResource(R.string.new_tab),
                            tint = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .weight(tabsWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(tabsWeight, onOpenTabsTray) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    BadgedBox(
                        badge = {
                            Badge(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            ) {
                                Text(tabCount.toString())
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Tab,
                            contentDescription = stringResource(R.string.tabs),
                            tint = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .weight(optionsWeight.value)
                        .fillMaxHeight()
                        .clip(ShapeCache.smooth14)
                        .bouncyClickable(
                            pressedScale = 0.88f,
                            hapticType = HilalHapticType.Tap,
                            onClick = { triggerButton(optionsWeight, onOpenOptions) }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = stringResource(R.string.options),
                        tint = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }
    }
}
}
