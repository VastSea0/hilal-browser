@file:OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3ExpressiveApi::class)

package com.vastsea.hilal.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.vastsea.hilal.R
import com.vastsea.hilal.extensions.AddonManager
import com.vastsea.hilal.extensions.InstalledAddon
import com.vastsea.hilal.ui.theme.*
import org.mozilla.geckoview.GeckoRuntime

@Composable
fun AddonsScreen(
    geckoRuntime: GeckoRuntime?,
    onNavigateBack: () -> Unit,
    onOpenUrl: (String) -> Unit
) {
    val context = LocalContext.current
    val haptics = rememberHilalHaptics()
    var showInstallUrlDialog by remember { mutableStateOf(false) }
    var customXpiUrl by remember { mutableStateOf("") }
    var isInstallingCustom by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        geckoRuntime?.let { AddonManager.refreshInstalled(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        stringResource(R.string.addons_manager),
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.back)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.surfaceContainerLowest
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Info Banner
            Surface(
                shape = ShapeCache.smooth20,
                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.6f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Extension,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = stringResource(R.string.addons_manager),
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = stringResource(R.string.ublock_installed_default),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.85f)
                        )
                    }
                }
            }

            // Section 1: Installed Add-ons
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "${stringResource(R.string.installed_addons)} (${AddonManager.installedAddons.size})",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 8.dp, bottom = 6.dp)
                )

                if (AddonManager.installedAddons.isEmpty()) {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainerLow,
                        shape = ShapeCache.smooth20,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = stringResource(R.string.no_addons_installed),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                } else {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainerLow,
                        shape = ShapeCache.smooth24,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            AddonManager.installedAddons.forEach { addon ->
                                Surface(
                                    shape = ShapeCache.smooth16,
                                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Extension,
                                            contentDescription = null,
                                            tint = if (addon.isEnabled) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(24.dp)
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text(
                                                    text = addon.name,
                                                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                                                    color = MaterialTheme.colorScheme.onSurface
                                                )
                                                if (addon.id == "uBlock0@raymondhill.net") {
                                                    Spacer(modifier = Modifier.width(6.dp))
                                                    Surface(
                                                        shape = ShapeCache.smoothPill,
                                                        color = MaterialTheme.colorScheme.primary
                                                    ) {
                                                        Text(
                                                            text = stringResource(R.string.default_badge),
                                                            style = MaterialTheme.typography.labelSmall,
                                                            color = MaterialTheme.colorScheme.onPrimary,
                                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                        )
                                                    }
                                                }
                                            }
                                            if (addon.description.isNotBlank()) {
                                                Text(
                                                    text = addon.description,
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    maxLines = 2,
                                                    overflow = TextOverflow.Ellipsis
                                                )
                                            }
                                            if (addon.version.isNotBlank()) {
                                                Text(
                                                    text = "v${addon.version}",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = MaterialTheme.colorScheme.outline
                                                )
                                            }
                                        }

                                        // Toggle Enable/Disable
                                        Switch(
                                            checked = addon.isEnabled,
                                            onCheckedChange = { checked ->
                                                haptics.perform(if (checked) HilalHapticType.Confirm else HilalHapticType.Reject)
                                                geckoRuntime?.let { rt ->
                                                    AddonManager.toggleExtension(rt, addon, checked)
                                                }
                                            }
                                        )

                                        if (!addon.isBuiltIn && addon.id != "uBlock0@raymondhill.net") {
                                            Spacer(modifier = Modifier.width(4.dp))
                                            IconButton(
                                                onClick = {
                                                    haptics.perform(HilalHapticType.Reject)
                                                    geckoRuntime?.let { rt ->
                                                        AddonManager.uninstallExtension(rt, addon) {}
                                                    }
                                                },
                                                modifier = Modifier.size(32.dp)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Delete,
                                                    contentDescription = stringResource(R.string.uninstall),
                                                    tint = MaterialTheme.colorScheme.error,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Section 2: Recommended Add-ons
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = stringResource(R.string.featured_addons),
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 8.dp, bottom = 6.dp)
                )

                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainerLow,
                    shape = ShapeCache.smooth24,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AddonManager.featuredAddons.forEach { feat ->
                            val isAlreadyInstalled = AddonManager.installedAddons.any { it.id == feat.id }
                            var isInstallingThis by remember { mutableStateOf(false) }

                            Surface(
                                shape = ShapeCache.smooth16,
                                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Extension,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.secondary,
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = feat.name,
                                            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        Text(
                                            text = feat.description,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            maxLines = 2,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }

                                    if (isAlreadyInstalled) {
                                        Surface(
                                            shape = ShapeCache.smoothPill,
                                            color = MaterialTheme.colorScheme.primaryContainer
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Icon(
                                                    Icons.Default.Check,
                                                    contentDescription = null,
                                                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(
                                                    text = stringResource(R.string.installed),
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                                )
                                            }
                                        }
                                    } else {
                                        Button(
                                            onClick = {
                                                if (!isInstallingThis && geckoRuntime != null) {
                                                    isInstallingThis = true
                                                    haptics.perform(HilalHapticType.Confirm)
                                                    AddonManager.installFromUrl(geckoRuntime, feat.xpiUrl) { success ->
                                                        isInstallingThis = false
                                                        Toast.makeText(
                                                            context,
                                                            if (success) "${feat.name} yüklendi." else "Yükleme başarısız.",
                                                            Toast.LENGTH_SHORT
                                                        ).show()
                                                    }
                                                }
                                            },
                                            shape = ShapeCache.smoothPill,
                                            enabled = !isInstallingThis,
                                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = if (isInstallingThis) stringResource(R.string.installing) else stringResource(R.string.install_addon),
                                                style = MaterialTheme.typography.labelMedium
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Section 3: Actions (Browse AMO / Install from URL)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        onOpenUrl("https://addons.mozilla.org/android/")
                    },
                    shape = ShapeCache.smoothPill,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.AutoMirrored.Filled.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(stringResource(R.string.open_amo), maxLines = 1, overflow = TextOverflow.Ellipsis)
                }

                Button(
                    onClick = { showInstallUrlDialog = true },
                    shape = ShapeCache.smoothPill,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(stringResource(R.string.install_from_url), maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }

    // Dialog for custom XPI URL installation
    if (showInstallUrlDialog) {
        AlertDialog(
            onDismissRequest = { showInstallUrlDialog = false },
            title = {
                Text(
                    stringResource(R.string.install_from_url),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = customXpiUrl,
                        onValueChange = { customXpiUrl = it },
                        label = { Text(stringResource(R.string.enter_xpi_url)) },
                        placeholder = { Text("https://example.com/addon.xpi") },
                        singleLine = true,
                        shape = ShapeCache.smooth14,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (customXpiUrl.isNotBlank() && geckoRuntime != null) {
                            isInstallingCustom = true
                            AddonManager.installFromUrl(geckoRuntime, customXpiUrl.trim()) { success ->
                                isInstallingCustom = false
                                showInstallUrlDialog = false
                                Toast.makeText(
                                    context,
                                    if (success) "Eklenti yüklendi." else "Yükleme başarısız.",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        }
                    },
                    shape = ShapeCache.smoothPill,
                    enabled = customXpiUrl.isNotBlank() && !isInstallingCustom
                ) {
                    Text(if (isInstallingCustom) stringResource(R.string.installing) else stringResource(R.string.install_addon))
                }
            },
            dismissButton = {
                TextButton(onClick = { showInstallUrlDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            },
            shape = ShapeCache.smooth28,
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
        )
    }
}
