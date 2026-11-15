package com.vastsea.hilal.ui.browser

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.LockOpen
import androidx.compose.material.icons.outlined.MoreVert
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.LinearWavyProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.WavyProgressIndicatorDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.onLongClick
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.browser.Security
import com.vastsea.hilal.browser.TabState
import com.vastsea.hilal.search.InputResolver
import com.vastsea.hilal.ui.glass.GlassIconButton
import com.vastsea.hilal.ui.glass.GlassSpring
import com.vastsea.hilal.ui.glass.SQUASH
import com.vastsea.hilal.ui.glass.STRETCH
import com.vastsea.hilal.ui.glass.glassContentColor
import com.vastsea.hilal.ui.glass.isLiquidGlassActive
import com.vastsea.hilal.ui.glass.liquidGlass
import kotlin.math.abs

val BarHeight = 56.dp
val BarSidePadding = 12.dp
val BarVerticalPadding = 8.dp

/**
 * The bottom bar: a pill showing the site, which carries the gestures (tap to edit, swipe
 * sideways to change tab, swipe up for the tab overview, long press for quick actions), and two
 * buttons for the tab overview and the page menu.
 */
@Composable
fun AddressBar(
    tab: TabState?,
    tabCount: Int,
    gestures: BarGestureHandler,
    onTabsClick: () -> Unit,
    onMenuClick: () -> Unit,
    modifier: Modifier = Modifier,
    isPressed: Boolean = false,
    swipeOffset: () -> Float = { 0f },
    swipeWidth: () -> Float = { 1f },
    pullProgress: () -> Float = { 0f },
) {
    if (isLiquidGlassActive()) {
        GlassAddressBar(
            tab = tab,
            tabCount = tabCount,
            gestures = gestures,
            onTabsClick = onTabsClick,
            onMenuClick = onMenuClick,
            isPressed = isPressed,
            swipeOffset = swipeOffset,
            swipeWidth = swipeWidth,
            pullProgress = pullProgress,
            modifier = modifier,
        )
    } else {
        MaterialAddressBar(
            tab = tab,
            tabCount = tabCount,
            gestures = gestures,
            onTabsClick = onTabsClick,
            onMenuClick = onMenuClick,
            modifier = modifier,
        )
    }
}

@Composable
private fun MaterialAddressBar(
    tab: TabState?,
    tabCount: Int,
    gestures: BarGestureHandler,
    onTabsClick: () -> Unit,
    onMenuClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val editLabel = stringResource(R.string.address_edit)
    val quickActionsLabel = stringResource(R.string.address_quick_actions)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = BarSidePadding, vertical = BarVerticalPadding)
            .height(BarHeight),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Surface(
            shape = CircleShape,
            color = if (tab?.isPrivate == true) MaterialTheme.colorScheme.tertiaryContainer
            else MaterialTheme.colorScheme.surfaceContainerHigh,
            shadowElevation = 3.dp,
            modifier = Modifier
                .weight(1f)
                .height(BarHeight)
                .clip(CircleShape)
                .semantics {
                    role = Role.Button
                    contentDescription = editLabel
                    onClick(editLabel) { gestures.onTap(); true }
                    onLongClick(quickActionsLabel) { gestures.onLongPress(); true }
                }
                .barGestures(gestures),
        ) {
            Box {
                SiteLabel(tab, useGlassColors = false)
                LoadingWave(
                    tab = tab,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(horizontal = 28.dp, vertical = 5.dp),
                )
            }
        }
        TabCountButton(count = tabCount, isPrivate = tab?.isPrivate == true, useGlass = false, onClick = onTabsClick)
        FilledTonalIconButton(
            onClick = onMenuClick,
            shapes = IconButtonDefaults.shapes(),
            modifier = Modifier.size(48.dp),
        ) {
            Icon(Icons.Outlined.MoreVert, contentDescription = stringResource(R.string.menu))
        }
    }
}

@Composable
private fun GlassAddressBar(
    tab: TabState?,
    tabCount: Int,
    gestures: BarGestureHandler,
    onTabsClick: () -> Unit,
    onMenuClick: () -> Unit,
    isPressed: Boolean,
    swipeOffset: () -> Float,
    swipeWidth: () -> Float,
    pullProgress: () -> Float,
    modifier: Modifier = Modifier,
) {
    val editLabel = stringResource(R.string.address_edit)
    val quickActionsLabel = stringResource(R.string.address_quick_actions)
    val pressFraction by animateFloatAsState(
        targetValue = if (isPressed) 1f else 0f,
        animationSpec = GlassSpring,
        label = "glassBarPress",
    )
    val privateTint = if (tab?.isPrivate == true) {
        MaterialTheme.colorScheme.tertiary.copy(alpha = 0.22f)
    } else {
        null
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = BarSidePadding, vertical = BarVerticalPadding)
            .height(BarHeight),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Box(
            modifier = Modifier
                .weight(1f)
                .height(BarHeight)
                .graphicsLayer {
                    val w = swipeWidth().coerceAtLeast(1f)
                    val hDrag = (swipeOffset() / w).coerceIn(-0.45f, 0.45f)
                    val vPull = pullProgress().coerceIn(0f, 1f)
                    val pressBoost = 1f + 0.025f * pressFraction
                    scaleX = pressBoost + abs(hDrag) * STRETCH - vPull * (STRETCH * SQUASH)
                    scaleY = pressBoost - abs(hDrag) * (STRETCH * SQUASH) + vPull * STRETCH
                    translationX = swipeOffset() * 0.06f
                }
                .liquidGlass(shape = CircleShape, surfaceTint = privateTint)
                .semantics {
                    role = Role.Button
                    contentDescription = editLabel
                    onClick(editLabel) { gestures.onTap(); true }
                    onLongClick(quickActionsLabel) { gestures.onLongPress(); true }
                }
                .barGestures(gestures),
        ) {
            Box(Modifier.fillMaxSize()) {
                SiteLabel(tab, useGlassColors = true)
                LoadingWave(
                    tab = tab,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(horizontal = 28.dp, vertical = 5.dp),
                )
            }
        }
        TabCountButton(count = tabCount, isPrivate = tab?.isPrivate == true, useGlass = true, onClick = onTabsClick)
        GlassIconButton(onClick = onMenuClick, size = 48.dp) {
            Icon(
                Icons.Outlined.MoreVert,
                contentDescription = stringResource(R.string.menu),
                tint = glassContentColor(),
            )
        }
    }
}

@Composable
private fun LoadingWave(tab: TabState?, modifier: Modifier) {
    AnimatedVisibility(
        visible = tab?.isLoading == true,
        enter = fadeIn(MaterialTheme.motionScheme.fastEffectsSpec()),
        exit = fadeOut(MaterialTheme.motionScheme.slowEffectsSpec()),
        modifier = modifier,
    ) {
        LinearWavyProgressIndicator(
            progress = { (tab?.progress ?: 0) / 100f },
            modifier = Modifier.fillMaxWidth().height(6.dp),
            stroke = WavyProgressIndicatorDefaults.linearIndicatorStroke,
            trackStroke = WavyProgressIndicatorDefaults.linearTrackStroke,
        )
    }
}

@Composable
private fun SiteLabel(tab: TabState?, useGlassColors: Boolean) {
    val isBlank = tab == null || tab.isBlank
    val primaryColor = if (useGlassColors) glassContentColor() else MaterialTheme.colorScheme.onSurface
    val secondaryColor = if (useGlassColors) {
        glassContentColor().copy(alpha = 0.72f)
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier
            .fillMaxWidth()
            .height(BarHeight)
            .padding(horizontal = 20.dp),
    ) {
        val icon: ImageVector = when {
            isBlank -> Icons.Outlined.Search
            tab?.security == Security.Secure -> Icons.Outlined.Lock
            tab?.security == Security.Insecure -> Icons.Outlined.LockOpen
            else -> Icons.Outlined.Info
        }
        Icon(
            icon,
            contentDescription = null,
            modifier = Modifier.size(18.dp),
            tint = if (tab?.security == Security.Insecure) MaterialTheme.colorScheme.error else secondaryColor,
        )
        Spacer(Modifier.width(8.dp))
        val motion = MaterialTheme.motionScheme
        AnimatedContent(
            targetState = if (isBlank) "" else InputResolver.host(tab?.url.orEmpty()),
            transitionSpec = {
                fadeIn(motion.defaultEffectsSpec()) togetherWith fadeOut(motion.fastEffectsSpec())
            },
            label = "host",
        ) { host ->
            Text(
                text = host.ifEmpty { stringResource(R.string.address_placeholder) },
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = if (host.isEmpty()) FontWeight.Normal else FontWeight.Medium,
                color = if (host.isEmpty()) secondaryColor else primaryColor,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun TabCountButton(count: Int, isPrivate: Boolean, useGlass: Boolean, onClick: () -> Unit) {
    val label = stringResource(R.string.tabs_count, count)
    if (useGlass) {
        val tint = if (isPrivate) MaterialTheme.colorScheme.tertiary else glassContentColor()
        GlassIconButton(
            onClick = onClick,
            size = 48.dp,
            modifier = Modifier.semantics { contentDescription = label },
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(22.dp)
                    .border(
                        width = 2.dp,
                        color = tint,
                        shape = RoundedCornerShape(7.dp),
                    ),
            ) {
                Text(
                    text = if (count > 99) ":D" else count.toString(),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = tint,
                )
            }
        }
    } else {
        FilledTonalIconButton(
            onClick = onClick,
            shapes = IconButtonDefaults.shapes(),
            modifier = Modifier
                .size(48.dp)
                .semantics { contentDescription = label },
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(22.dp)
                    .border(
                        width = 2.dp,
                        color = if (isPrivate) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.onSecondaryContainer,
                        shape = RoundedCornerShape(7.dp),
                    ),
            ) {
                Text(
                    text = if (count > 99) ":D" else count.toString(),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                )
            }
        }
    }
}
