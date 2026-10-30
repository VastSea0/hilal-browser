package com.vastsea.hilal.ui.browser

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
                SiteLabel(tab)
                AnimatedVisibility(
                    visible = tab?.isLoading == true,
                    enter = fadeIn(MaterialTheme.motionScheme.fastEffectsSpec()),
                    exit = fadeOut(MaterialTheme.motionScheme.slowEffectsSpec()),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(horizontal = 28.dp, vertical = 5.dp),
                ) {
                    LinearWavyProgressIndicator(
                        progress = { (tab?.progress ?: 0) / 100f },
                        modifier = Modifier.fillMaxWidth().height(6.dp),
                        stroke = WavyProgressIndicatorDefaults.linearIndicatorStroke,
                        trackStroke = WavyProgressIndicatorDefaults.linearTrackStroke,
                    )
                }
            }
        }
        TabCountButton(count = tabCount, isPrivate = tab?.isPrivate == true, onClick = onTabsClick)
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
private fun SiteLabel(tab: TabState?) {
    val isBlank = tab == null || tab.isBlank
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
            tint = if (tab?.security == Security.Insecure) MaterialTheme.colorScheme.error
            else MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.width(8.dp))
        AnimatedContent(
            targetState = if (isBlank) "" else InputResolver.host(tab?.url.orEmpty()),
            transitionSpec = {
                fadeIn(MaterialTheme.motionScheme.defaultEffectsSpec()) togetherWith
                    fadeOut(MaterialTheme.motionScheme.fastEffectsSpec())
            },
            label = "host",
        ) { host ->
            Text(
                text = host.ifEmpty { stringResource(R.string.address_placeholder) },
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = if (host.isEmpty()) FontWeight.Normal else FontWeight.Medium,
                color = if (host.isEmpty()) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun TabCountButton(count: Int, isPrivate: Boolean, onClick: () -> Unit) {
    val label = stringResource(R.string.tabs_count, count)
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
