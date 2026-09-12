@file:OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3ExpressiveApi::class)

package com.vastsea.hilal.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.ui.theme.HilalMotion
import com.vastsea.hilal.ui.theme.ShapeCache
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private enum class ToolbarButtonId {
    BACK, FORWARD, NEW_TAB, TABS, OPTIONS
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
    var activePressedButton by remember { mutableStateOf<ToolbarButtonId?>(null) }
    val haptic = LocalHapticFeedback.current
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current
    val dragThresholdPx = with(density) { HilalMotion.OverviewDragThreshold.toPx() }
    var totalDragY by remember { mutableFloatStateOf(0f) }

    fun triggerButton(buttonId: ToolbarButtonId, action: () -> Unit) {
        activePressedButton = buttonId
        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        action()
        scope.launch {
            delay(180)
            activePressedButton = null
        }
    }

    fun computeWeight(buttonId: ToolbarButtonId): Float {
        return when (activePressedButton) {
            buttonId -> HilalMotion.ExpansionWeight
            null -> HilalMotion.BaseWeight
            else -> HilalMotion.CompressionWeight
        }
    }

    val backWeight by animateFloatAsState(
        targetValue = computeWeight(ToolbarButtonId.BACK),
        animationSpec = HilalMotion.SpringBouncy,
        label = "backWeight"
    )
    val forwardWeight by animateFloatAsState(
        targetValue = computeWeight(ToolbarButtonId.FORWARD),
        animationSpec = HilalMotion.SpringBouncy,
        label = "forwardWeight"
    )
    val newTabWeight by animateFloatAsState(
        targetValue = computeWeight(ToolbarButtonId.NEW_TAB),
        animationSpec = HilalMotion.SpringBouncy,
        label = "newTabWeight"
    )
    val tabsWeight by animateFloatAsState(
        targetValue = computeWeight(ToolbarButtonId.TABS),
        animationSpec = HilalMotion.SpringBouncy,
        label = "tabsWeight"
    )
    val optionsWeight by animateFloatAsState(
        targetValue = computeWeight(ToolbarButtonId.OPTIONS),
        animationSpec = HilalMotion.SpringBouncy,
        label = "optionsWeight"
    )

    val dragGestureModifier = Modifier.pointerInput(Unit) {
        detectVerticalDragGestures(
            onDragStart = { totalDragY = 0f },
            onVerticalDrag = { _, dragAmount ->
                totalDragY += dragAmount
                if (totalDragY <= -dragThresholdPx) {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    onOpenTabsTray()
                    totalDragY = 0f
                }
            },
            onDragEnd = { totalDragY = 0f },
            onDragCancel = { totalDragY = 0f }
        )
    }

    if (!isDocked) {
        // Floating Mode — Squircle Pill with soft elevation
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
                    .padding(horizontal = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // 1. Back Button
                Box(
                    modifier = Modifier
                        .weight(backWeight)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    IconButton(
                        onClick = { triggerButton(ToolbarButtonId.BACK, onGoBack) },
                        enabled = canGoBack
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.back),
                            tint = if (canGoBack) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                        )
                    }
                }

                // 2. Forward Button
                Box(
                    modifier = Modifier
                        .weight(forwardWeight)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    IconButton(
                        onClick = { triggerButton(ToolbarButtonId.FORWARD, onGoForward) },
                        enabled = canGoForward
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = stringResource(R.string.forward),
                            tint = if (canGoForward) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                        )
                    }
                }

                // 3. New Tab Pill Button with Long-press for Workspace
                Box(
                    modifier = Modifier
                        .weight(newTabWeight)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(width = 54.dp, height = 40.dp)
                            .clip(ShapeCache.smooth16)
                            .background(MaterialTheme.colorScheme.primary)
                            .combinedClickable(
                                onClick = { triggerButton(ToolbarButtonId.NEW_TAB, onNewTab) },
                                onLongClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                    onNewWorkspaceLongPress()
                                }
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

                // 4. Tabs Tray with Badge
                Box(
                    modifier = Modifier
                        .weight(tabsWeight)
                        .fillMaxHeight(),
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
                        IconButton(onClick = { triggerButton(ToolbarButtonId.TABS, onOpenTabsTray) }) {
                            Icon(
                                imageVector = Icons.Default.Tab,
                                contentDescription = stringResource(R.string.tabs),
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // 5. Options Menu Button
                Box(
                    modifier = Modifier
                        .weight(optionsWeight)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    IconButton(onClick = { triggerButton(ToolbarButtonId.OPTIONS, onOpenOptions) }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = stringResource(R.string.options),
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    } else {
        // Docked Mode — Edge-to-edge bar with continuous top squircle
        Surface(
            color = MaterialTheme.colorScheme.surfaceContainer,
            shape = ShapeCache.groupedTop(20.dp),
            tonalElevation = 2.dp,
            modifier = modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .then(dragGestureModifier)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(horizontal = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // 1. Back
                Box(modifier = Modifier.weight(backWeight), contentAlignment = Alignment.Center) {
                    IconButton(
                        onClick = { triggerButton(ToolbarButtonId.BACK, onGoBack) },
                        enabled = canGoBack
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.back),
                            tint = if (canGoBack) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                        )
                    }
                }

                // 2. Forward
                Box(modifier = Modifier.weight(forwardWeight), contentAlignment = Alignment.Center) {
                    IconButton(
                        onClick = { triggerButton(ToolbarButtonId.FORWARD, onGoForward) },
                        enabled = canGoForward
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = stringResource(R.string.forward),
                            tint = if (canGoForward) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                        )
                    }
                }

                // 3. New Tab
                Box(modifier = Modifier.weight(newTabWeight), contentAlignment = Alignment.Center) {
                    Box(
                        modifier = Modifier
                            .size(width = 50.dp, height = 36.dp)
                            .clip(ShapeCache.smooth14)
                            .background(MaterialTheme.colorScheme.primary)
                            .combinedClickable(
                                onClick = { triggerButton(ToolbarButtonId.NEW_TAB, onNewTab) },
                                onLongClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                    onNewWorkspaceLongPress()
                                }
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

                // 4. Tabs
                Box(modifier = Modifier.weight(tabsWeight), contentAlignment = Alignment.Center) {
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
                        IconButton(onClick = { triggerButton(ToolbarButtonId.TABS, onOpenTabsTray) }) {
                            Icon(
                                imageVector = Icons.Default.Tab,
                                contentDescription = stringResource(R.string.tabs),
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // 5. Options
                Box(modifier = Modifier.weight(optionsWeight), contentAlignment = Alignment.Center) {
                    IconButton(onClick = { triggerButton(ToolbarButtonId.OPTIONS, onOpenOptions) }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = stringResource(R.string.options),
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
