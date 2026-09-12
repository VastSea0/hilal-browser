package com.vastsea.hilal.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import com.vastsea.hilal.R
import com.vastsea.hilal.ui.theme.*

data class ShortcutItem(
    val name: String,
    val url: String,
    val domain: String,
    val fallbackIcon: ImageVector
)

val DefaultShortcuts = listOf(
    ShortcutItem("Google", "https://www.google.com", "google.com", Icons.Default.Search),
    ShortcutItem("YouTube", "https://www.youtube.com", "youtube.com", Icons.Default.PlayArrow),
    ShortcutItem("GitHub", "https://github.com", "github.com", Icons.Default.Code),
    ShortcutItem("Wikipedia", "https://wikipedia.org", "wikipedia.org", Icons.Default.Book),
    ShortcutItem("DuckDuckGo", "https://duckduckgo.com", "duckduckgo.com", Icons.Default.Security),
    ShortcutItem("Reddit", "https://www.reddit.com", "reddit.com", Icons.Default.Forum)
)

@Composable
fun NewTabPage(
    workspaceName: String,
    workspaceEmoji: String = "🌐",
    isPrivate: Boolean = false,
    onOpenUrl: (String) -> Unit,
    onFocusSearch: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (isPrivate) {
            Surface(
                shape = ShapeCache.smoothPill,
                color = MaterialTheme.colorScheme.tertiaryContainer
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.VisibilityOff,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onTertiaryContainer,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = stringResource(R.string.private_mode),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onTertiaryContainer
                    )
                }
            }
        } else {
            Surface(
                shape = ShapeCache.smoothPill,
                color = MaterialTheme.colorScheme.surfaceContainerHigh
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = workspaceEmoji, fontSize = 14.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = workspaceName,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Brand Wordmark
        Text(
            text = stringResource(R.string.app_name),
            style = MaterialTheme.typography.displayLarge,
            fontWeight = FontWeight.ExtraBold,
            color = if (isPrivate) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.primary,
            letterSpacing = (-0.5).sp
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Expressive Search Hero Bar
        Surface(
            color = MaterialTheme.colorScheme.surfaceContainerHigh,
            shape = ShapeCache.smoothPill,
            shadowElevation = 2.dp,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .bouncyClickable(
                    pressedScale = 0.96f,
                    hapticType = HilalHapticType.Tap,
                    onClick = onFocusSearch
                )
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = stringResource(R.string.search),
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(22.dp)
                )
                Spacer(modifier = Modifier.width(14.dp))
                Text(
                    text = stringResource(R.string.search_or_enter_url),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Shortcuts Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(DefaultShortcuts) { shortcut ->
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainerLow,
                    shape = ShapeCache.smooth16,
                    shadowElevation = 1.dp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .bouncyClickable(
                            pressedScale = 0.90f,
                            hapticType = HilalHapticType.Confirm,
                            onClick = { onOpenUrl(shortcut.url) }
                        )
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(8.dp)
                    ) {
                        Surface(
                            shape = ShapeCache.smooth12,
                            color = MaterialTheme.colorScheme.surfaceContainerHighest,
                            modifier = Modifier.size(42.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                SubcomposeAsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data("https://www.google.com/s2/favicons?domain=${shortcut.domain}&sz=128")
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = shortcut.name,
                                    modifier = Modifier.size(24.dp),
                                    loading = {
                                        Icon(
                                            imageVector = shortcut.fallbackIcon,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    },
                                    error = {
                                        Icon(
                                            imageVector = shortcut.fallbackIcon,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = shortcut.name,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Privacy Status / Explainer Card
        Surface(
            color = if (isPrivate) MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.45f) else MaterialTheme.colorScheme.surfaceContainerLow,
            shape = ShapeCache.smooth20,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(16.dp)
            ) {
                Icon(
                    imageVector = if (isPrivate) Icons.Default.VisibilityOff else Icons.Default.Shield,
                    contentDescription = null,
                    tint = if (isPrivate) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text(
                        text = if (isPrivate) stringResource(R.string.private_mode) else stringResource(R.string.privacy_level),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = if (isPrivate) stringResource(R.string.private_mode_desc) else stringResource(R.string.privacy_strict_desc),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
