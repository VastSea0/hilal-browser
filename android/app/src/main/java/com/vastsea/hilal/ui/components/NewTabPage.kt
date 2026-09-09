package com.vastsea.hilal.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import android.content.res.Configuration
import androidx.compose.ui.tooling.preview.Preview
import com.vastsea.hilal.ui.theme.HilalTheme
import com.vastsea.hilal.R

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
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (isPrivate) {
            AssistChip(
                onClick = {},
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.VisibilityOff,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                },
                label = { Text(stringResource(R.string.private_mode), style = MaterialTheme.typography.labelMedium) },
                shape = CircleShape,
                colors = AssistChipDefaults.assistChipColors(
                    containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                    labelColor = MaterialTheme.colorScheme.onTertiaryContainer,
                    leadingIconContentColor = MaterialTheme.colorScheme.onTertiaryContainer
                )
            )
        } else {
            // Workspace Badge with Emoji
            AssistChip(
                onClick = {},
                leadingIcon = {
                    Text(workspaceEmoji, fontSize = 14.sp)
                },
                label = { Text(workspaceName, style = MaterialTheme.typography.labelMedium) },
                shape = CircleShape,
                colors = AssistChipDefaults.assistChipColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
                )
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Official Hilal Logo
        Image(
            painter = painterResource(id = R.drawable.ic_hilal_logo),
            contentDescription = stringResource(R.string.app_name),
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(R.string.app_name),
            style = MaterialTheme.typography.headlineMedium.copy(
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.5).sp
            ),
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Large M3 Expressive Pill Search Bar
        Surface(
            color = MaterialTheme.colorScheme.surfaceContainerHigh,
            shape = CircleShape,
            shadowElevation = 2.dp,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .clickable { onFocusSearch() }
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
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = stringResource(R.string.search_or_enter_url),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        if (isPrivate) {
            Spacer(modifier = Modifier.height(16.dp))
            Surface(
                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.tertiary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = stringResource(R.string.private_mode_desc),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Quick Shortcuts Grid
        Text(
            text = stringResource(R.string.shortcuts),
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.align(Alignment.Start)
        )

        Spacer(modifier = Modifier.height(12.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(DefaultShortcuts) { shortcut ->
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainerLow,
                    shape = RoundedCornerShape(18.dp),
                    modifier = Modifier
                        .height(76.dp)
                        .clickable { onOpenUrl(shortcut.url) }
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(8.dp)
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceContainerHighest,
                            shape = CircleShape,
                            modifier = Modifier.size(34.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                SubcomposeAsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data("https://www.google.com/s2/favicons?domain=${shortcut.domain}&sz=128")
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = shortcut.name,
                                    modifier = Modifier
                                        .size(22.dp)
                                        .clip(CircleShape),
                                    error = {
                                        Icon(
                                            imageVector = shortcut.fallbackIcon,
                                            contentDescription = shortcut.name,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    },
                                    loading = {
                                        Icon(
                                            imageVector = shortcut.fallbackIcon,
                                            contentDescription = shortcut.name,
                                            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = shortcut.name,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true, name = "New Tab Light")
@Preview(showBackground = true, uiMode = Configuration.UI_MODE_NIGHT_YES, name = "New Tab Dark")
@Composable
private fun NewTabPagePreview() {
    HilalTheme {
        NewTabPage(
            workspaceName = "Genel",
            workspaceEmoji = "🌐",
            onOpenUrl = {},
            onFocusSearch = {}
        )
    }
}
