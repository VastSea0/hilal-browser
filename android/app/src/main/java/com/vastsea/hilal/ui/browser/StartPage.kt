package com.vastsea.hilal.ui.browser

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialShapes
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.toShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.AppContainer
import com.vastsea.hilal.R
import com.vastsea.hilal.search.InputResolver

private data class Site(val url: String, val title: String)

/** Shown for empty tabs: the most visited sites and recent bookmarks, nothing remote. */
@Composable
fun StartPage(
    container: AppContainer,
    isPrivate: Boolean,
    bottomPadding: Dp,
    onOpen: (String) -> Unit,
) {
    val frequent by remember { container.database.history().topSites() }.collectAsState(emptyList())
    val bookmarks by remember { container.database.bookmarks().all() }.collectAsState(emptyList())
    val sites = remember(frequent) { frequent.map { Site(it.url, it.title) } }
    val marks = remember(bookmarks) { bookmarks.take(8).map { Site(it.url, it.title) } }

    Surface(color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxSize()) {
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 84.dp),
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 48.dp, bottom = bottomPadding + 24.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                if (isPrivate) PrivateHeader() else Header()
            }
            if (!isPrivate && sites.isNotEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) { SectionTitle(stringResource(R.string.start_frequent)) }
                items(sites, key = { "f" + it.url }) { site -> SiteTile(site, onOpen) }
            }
            if (!isPrivate && marks.isNotEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) { SectionTitle(stringResource(R.string.start_bookmarks)) }
                items(marks, key = { "b" + it.url }) { site -> SiteTile(site, onOpen) }
            }
        }
    }
}

@Composable
private fun Header() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth().padding(top = 32.dp, bottom = 24.dp),
    ) {
        Surface(
            shape = MaterialShapes.Cookie9Sided.toShape(),
            color = MaterialTheme.colorScheme.primaryContainer,
            modifier = Modifier.size(88.dp),
        ) {
            Box(contentAlignment = Alignment.Center) {
                Image(
                    painterResource(R.drawable.ic_hilal_logo),
                    contentDescription = null,
                    modifier = Modifier.size(56.dp),
                )
            }
        }
        Spacer(Modifier.height(20.dp))
        Text(
            stringResource(R.string.start_greeting),
            style = MaterialTheme.typography.headlineMediumEmphasized,
            color = MaterialTheme.colorScheme.onSurface,
        )
    }
}

@Composable
private fun PrivateHeader() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth().padding(top = 32.dp, bottom = 24.dp, start = 8.dp, end = 8.dp),
    ) {
        Surface(
            shape = MaterialShapes.Ghostish.toShape(),
            color = MaterialTheme.colorScheme.tertiaryContainer,
            modifier = Modifier.size(88.dp),
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    Icons.Outlined.VisibilityOff,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onTertiaryContainer,
                    modifier = Modifier.size(40.dp),
                )
            }
        }
        Spacer(Modifier.height(20.dp))
        Text(
            stringResource(R.string.start_private_title),
            style = MaterialTheme.typography.headlineMediumEmphasized,
        )
        Spacer(Modifier.height(12.dp))
        Text(
            stringResource(R.string.start_private_body),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.titleSmall,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(start = 4.dp, top = 8.dp),
    )
}

@Composable
private fun SiteTile(site: Site, onOpen: (String) -> Unit) {
    val host = InputResolver.host(site.url)
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .clickable { onOpen(site.url) }
            .padding(vertical = 8.dp),
    ) {
        Monogram(host, Modifier.size(56.dp))
        Spacer(Modifier.height(8.dp))
        Text(
            site.title.ifBlank { host },
            style = MaterialTheme.typography.labelMedium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.width(76.dp),
            textAlign = TextAlign.Center,
        )
    }
}

/** A letter on a tinted shape, stable per host, so sites are recognizable without fetching icons. */
@Composable
fun Monogram(host: String, modifier: Modifier = Modifier) {
    val shapes = listOf(
        MaterialShapes.Cookie6Sided, MaterialShapes.Clover4Leaf, MaterialShapes.Sunny,
        MaterialShapes.Pill, MaterialShapes.Cookie4Sided, MaterialShapes.Arch,
    )
    val palette = listOf(
        MaterialTheme.colorScheme.primaryContainer to MaterialTheme.colorScheme.onPrimaryContainer,
        MaterialTheme.colorScheme.secondaryContainer to MaterialTheme.colorScheme.onSecondaryContainer,
        MaterialTheme.colorScheme.tertiaryContainer to MaterialTheme.colorScheme.onTertiaryContainer,
    )
    val hash = host.hashCode().let { if (it < 0) -it else it }
    val (bg, fg) = palette[hash % palette.size]
    Surface(shape = shapes[hash % shapes.size].toShape(), color = bg, modifier = modifier) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                host.firstOrNull { it.isLetterOrDigit() }?.uppercase() ?: "•",
                style = MaterialTheme.typography.titleLarge,
                color = fg,
            )
        }
    }
}
