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
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Workspaces
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vastsea.hilal.R

data class Shortcut(val name: String, val url: String, val iconText: String)

val DefaultShortcuts = listOf(
    Shortcut("Google", "https://www.google.com", "G"),
    Shortcut("YouTube", "https://www.youtube.com", "YT"),
    Shortcut("GitHub", "https://github.com", "GH"),
    Shortcut("Vikipedi", "https://tr.wikipedia.org", "W"),
    Shortcut("DuckDuckGo", "https://duckduckgo.com", "DDG"),
    Shortcut("Reddit", "https://www.reddit.com", "R")
)

@Composable
fun NewTabPage(
    workspaceName: String,
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
        // Workspace Badge
        AssistChip(
            onClick = {},
            leadingIcon = {
                Icon(
                    Icons.Default.Workspaces,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
            },
            label = { Text(workspaceName, style = MaterialTheme.typography.labelMedium) },
            shape = CircleShape,
            colors = AssistChipDefaults.assistChipColors(
                containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
            )
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Official Hilal Logo
        Image(
            painter = painterResource(id = R.drawable.ic_hilal_logo),
            contentDescription = "Hilal Logo",
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Hilal Browser",
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
                    contentDescription = "Ara",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Arayın veya web adresi yazın...",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Quick Shortcuts Grid
        Text(
            text = "Kısayollar",
            style = MaterialTheme.typography.titleMedium,
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
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .height(72.dp)
                        .clickable { onOpenUrl(shortcut.url) }
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(8.dp)
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.primaryContainer,
                            shape = CircleShape,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = shortcut.iconText,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
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
