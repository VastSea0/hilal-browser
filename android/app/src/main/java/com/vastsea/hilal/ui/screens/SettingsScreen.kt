package com.vastsea.hilal.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vastsea.hilal.BuildConfig
import com.vastsea.hilal.R
import android.content.res.Configuration
import androidx.compose.ui.tooling.preview.Preview
import com.vastsea.hilal.ui.theme.HilalTheme
import com.vastsea.hilal.ui.theme.ShapeCache

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    currentLanguage: Int = 0, // 0: System, 1: Turkish, 2: English
    onLanguageChange: (Int) -> Unit = {},
    themeMode: Int = 0, // 0: System, 1: Light, 2: Dark
    onThemeChange: (Int) -> Unit = {},
    urlBarStyle: Int = 0, // 0: Floating, 1: Docked
    onUrlBarStyleChange: (Int) -> Unit = {},
    toolbarStyle: Int = 0, // 0: Floating, 1: Docked
    onToolbarStyleChange: (Int) -> Unit = {},
    hideOnScroll: Boolean = true,
    onHideOnScrollChange: (Boolean) -> Unit = {},
    darkWebsites: Boolean = false,
    onDarkWebsitesChange: (Boolean) -> Unit = {},
    privacyLevel: Int = 1, // 0: Standard, 1: Strict, 2: Hilal Ultra
    onPrivacyLevelChange: (Int) -> Unit = {},
    defaultSearchEngine: String = "DuckDuckGo",
    onDefaultSearchEngineChange: (String) -> Unit = {},
    onOpenBangs: () -> Unit = {},
    onOpenHistory: () -> Unit = {},
    onOpenBookmarks: () -> Unit = {},
    onNavigateBack: () -> Unit,
    onClearData: () -> Unit,
    onOpenUrl: (String) -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    var showClearedSnackbar by remember { mutableStateOf(false) }
    var showLicensesDialog by remember { mutableStateOf(false) }

    // Dialog pickers
    var showLanguageDialog by remember { mutableStateOf(false) }
    var showThemeDialog by remember { mutableStateOf(false) }
    var showUrlBarDialog by remember { mutableStateOf(false) }
    var showToolbarDialog by remember { mutableStateOf(false) }
    var showSearchEngineDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }

    val privacyLabels = listOf(
        stringResource(R.string.privacy_standard),
        stringResource(R.string.privacy_strict),
        stringResource(R.string.privacy_custom)
    )
    val privacyDescs = listOf(
        stringResource(R.string.privacy_standard_desc),
        stringResource(R.string.privacy_strict_desc),
        stringResource(R.string.privacy_custom_desc)
    )
    val themeLabels = listOf(
        stringResource(R.string.theme_system),
        stringResource(R.string.theme_light),
        stringResource(R.string.theme_dark)
    )
    val languageLabels = listOf(
        stringResource(R.string.language_system),
        stringResource(R.string.language_tr),
        stringResource(R.string.language_en)
    )
    val barStyleLabels = listOf(
        stringResource(R.string.style_floating),
        stringResource(R.string.style_docked)
    )
    val searchEngines = listOf("DuckDuckGo", "Google", "Bing")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        stringResource(R.string.settings),
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
        snackbarHost = {
            if (showClearedSnackbar) {
                Snackbar(
                    modifier = Modifier.padding(16.dp),
                    action = {
                        TextButton(onClick = { showClearedSnackbar = false }) {
                            Text(stringResource(R.string.ok))
                        }
                    }
                ) {
                    Text(stringResource(R.string.data_cleared_msg))
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.surfaceContainerLowest
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text(stringResource(R.string.search_settings_hint)) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Search,
                        contentDescription = stringResource(R.string.search),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(
                                imageVector = Icons.Outlined.Clear,
                                contentDescription = stringResource(R.string.clear)
                            )
                        }
                    }
                },
                shape = ShapeCache.smoothPill,
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = Color.Transparent
                )
            )

            // Header Profile Card
            if (searchQuery.isBlank()) {
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainerLow,
                    shape = ShapeCache.smooth24,
                    modifier = Modifier.fillMaxWidth(),
                    tonalElevation = 1.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_hilal_logo),
                            contentDescription = null,
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Hilal Browser",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = stringResource(R.string.brand_tagline),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Surface(
                                color = MaterialTheme.colorScheme.primaryContainer,
                                shape = CircleShape
                            ) {
                                Text(
                                    text = "v${BuildConfig.VERSION_NAME} (Build ${BuildConfig.VERSION_CODE})",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Category 1: Appearance & Layout (Görünüm ve Düzen)
            SettingsGroupCard(
                categoryTitle = stringResource(R.string.category_appearance)
            ) {
                // Dil (Language)
                SettingsNavRow(
                    icon = Icons.Outlined.Translate,
                    iconBgColor = MaterialTheme.colorScheme.primaryContainer,
                    iconTint = MaterialTheme.colorScheme.onPrimaryContainer,
                    title = stringResource(R.string.language),
                    subtitle = languageLabels[currentLanguage.coerceIn(0, 2)],
                    onClick = { showLanguageDialog = true }
                )

                SettingsDivider()

                // Tema (Theme)
                SettingsNavRow(
                    icon = Icons.Outlined.Palette,
                    iconBgColor = MaterialTheme.colorScheme.secondaryContainer,
                    iconTint = MaterialTheme.colorScheme.onSecondaryContainer,
                    title = stringResource(R.string.theme),
                    subtitle = themeLabels[themeMode.coerceIn(0, 2)],
                    onClick = { showThemeDialog = true }
                )

                SettingsDivider()

                // Web Sitelerinde Koyu Mod (Dark Mode for Websites) Switch
                SettingsSwitchRow(
                    icon = Icons.Outlined.DarkMode,
                    iconBgColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    iconTint = MaterialTheme.colorScheme.onSurface,
                    title = stringResource(R.string.dark_websites),
                    subtitle = stringResource(R.string.dark_websites_desc),
                    checked = darkWebsites,
                    onCheckedChange = onDarkWebsitesChange
                )

                SettingsDivider()

                // Kaydırınca Çubukları Gizle (Hide Bars on Scroll) Switch
                SettingsSwitchRow(
                    icon = Icons.Outlined.SwipeDown,
                    iconBgColor = MaterialTheme.colorScheme.tertiaryContainer,
                    iconTint = MaterialTheme.colorScheme.onTertiaryContainer,
                    title = stringResource(R.string.hide_on_scroll),
                    subtitle = stringResource(R.string.hide_on_scroll_desc),
                    checked = hideOnScroll,
                    onCheckedChange = onHideOnScrollChange
                )

                SettingsDivider()

                // URL Bar Style
                SettingsNavRow(
                    icon = Icons.Outlined.ViewStream,
                    iconBgColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    iconTint = MaterialTheme.colorScheme.onSurface,
                    title = stringResource(R.string.url_bar_style),
                    subtitle = barStyleLabels[urlBarStyle.coerceIn(0, 1)],
                    onClick = { showUrlBarDialog = true }
                )

                SettingsDivider()

                // Toolbar Style
                SettingsNavRow(
                    icon = Icons.Outlined.WebAsset,
                    iconBgColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    iconTint = MaterialTheme.colorScheme.onSurface,
                    title = stringResource(R.string.toolbar_style),
                    subtitle = barStyleLabels[toolbarStyle.coerceIn(0, 1)],
                    onClick = { showToolbarDialog = true }
                )
            }

            // Category 2: Search & Shortcuts (Arama ve Kısayollar)
            SettingsGroupCard(
                categoryTitle = stringResource(R.string.category_search)
            ) {
                // Default Search Engine
                SettingsNavRow(
                    icon = Icons.Outlined.Search,
                    iconBgColor = MaterialTheme.colorScheme.primaryContainer,
                    iconTint = MaterialTheme.colorScheme.onPrimaryContainer,
                    title = stringResource(R.string.default_search_engine),
                    subtitle = defaultSearchEngine,
                    onClick = { showSearchEngineDialog = true }
                )

                SettingsDivider()

                // Hilal Bangs Screen Navigation
                SettingsNavRow(
                    icon = Icons.Outlined.Bolt,
                    iconBgColor = MaterialTheme.colorScheme.secondaryContainer,
                    iconTint = MaterialTheme.colorScheme.onSecondaryContainer,
                    title = stringResource(R.string.bangs_manager),
                    subtitle = stringResource(R.string.bangs_manager_desc),
                    onClick = onOpenBangs
                )
            }

            // Category 3: Privacy & Security (Gizlilik ve Güvenlik)
            SettingsGroupCard(
                categoryTitle = stringResource(R.string.category_privacy)
            ) {
                // Hilal Privacy Level
                SettingsNavRow(
                    icon = Icons.Outlined.Shield,
                    iconBgColor = MaterialTheme.colorScheme.primaryContainer,
                    iconTint = MaterialTheme.colorScheme.onPrimaryContainer,
                    title = stringResource(R.string.privacy_level),
                    subtitle = privacyLabels[privacyLevel.coerceIn(0, 2)],
                    onClick = { showPrivacyDialog = true }
                )

                SettingsDivider()

                // Clear Browsing Data
                SettingsActionRow(
                    icon = Icons.Outlined.DeleteSweep,
                    iconBgColor = MaterialTheme.colorScheme.errorContainer,
                    iconTint = MaterialTheme.colorScheme.onErrorContainer,
                    title = stringResource(R.string.clear_browsing_data),
                    subtitle = stringResource(R.string.privacy_and_cleanup),
                    actionText = stringResource(R.string.clear),
                    onAction = {
                        onClearData()
                        showClearedSnackbar = true
                    }
                )
            }

            // Category 4: Data & Pages (Veriler ve Sayfalar)
            SettingsGroupCard(
                categoryTitle = stringResource(R.string.category_data)
            ) {
                // Bookmarks
                SettingsNavRow(
                    icon = Icons.Outlined.Bookmarks,
                    iconBgColor = MaterialTheme.colorScheme.primaryContainer,
                    iconTint = MaterialTheme.colorScheme.onPrimaryContainer,
                    title = stringResource(R.string.bookmarks),
                    subtitle = stringResource(R.string.swipe_to_delete),
                    onClick = onOpenBookmarks
                )

                SettingsDivider()

                // History
                SettingsNavRow(
                    icon = Icons.Outlined.History,
                    iconBgColor = MaterialTheme.colorScheme.secondaryContainer,
                    iconTint = MaterialTheme.colorScheme.onSecondaryContainer,
                    title = stringResource(R.string.history),
                    subtitle = stringResource(R.string.swipe_to_delete),
                    onClick = onOpenHistory
                )
            }

            // Category 5: About (Hakkında)
            SettingsGroupCard(
                categoryTitle = stringResource(R.string.category_about)
            ) {
                // Website link
                SettingsExternalRow(
                    icon = Icons.Outlined.Language,
                    iconBgColor = MaterialTheme.colorScheme.primaryContainer,
                    iconTint = MaterialTheme.colorScheme.onPrimaryContainer,
                    title = stringResource(R.string.website),
                    subtitle = "hilal-browser.vercel.app",
                    onClick = { onOpenUrl("https://hilal-browser.vercel.app") }
                )

                SettingsDivider()

                // GitHub Repository
                SettingsExternalRow(
                    icon = Icons.Outlined.Code,
                    iconBgColor = MaterialTheme.colorScheme.secondaryContainer,
                    iconTint = MaterialTheme.colorScheme.onSecondaryContainer,
                    title = stringResource(R.string.source_code),
                    subtitle = "github.com/VastSea0/hilal-browser",
                    onClick = { onOpenUrl("https://github.com/VastSea0/hilal-browser") }
                )

                SettingsDivider()

                // Creator Attribution
                SettingsExternalRow(
                    icon = Icons.Outlined.Person,
                    iconBgColor = MaterialTheme.colorScheme.tertiaryContainer,
                    iconTint = MaterialTheme.colorScheme.onTertiaryContainer,
                    title = stringResource(R.string.developer),
                    subtitle = stringResource(R.string.developer_credit),
                    onClick = { onOpenUrl("https://egehankahraman.vercel.app") }
                )

                SettingsDivider()

                // More apps by Egehan (Google Play)
                SettingsExternalRow(
                    icon = Icons.Outlined.Shop,
                    iconBgColor = MaterialTheme.colorScheme.primaryContainer,
                    iconTint = MaterialTheme.colorScheme.onPrimaryContainer,
                    title = stringResource(R.string.more_apps_by_developer),
                    subtitle = stringResource(R.string.google_play_store),
                    onClick = { onOpenUrl("https://play.google.com/store/apps/dev?id=6056059908674965746") }
                )

                SettingsDivider()

                // Open Source Libraries
                SettingsNavRow(
                    icon = Icons.Outlined.Description,
                    iconBgColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    iconTint = MaterialTheme.colorScheme.onSurface,
                    title = stringResource(R.string.open_source_libraries),
                    subtitle = "GeckoView, Compose, Coil, KotlinX...",
                    onClick = { showLicensesDialog = true }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Dialog Pickers
    if (showLanguageDialog) {
        RadioChoiceDialog(
            title = stringResource(R.string.language),
            options = languageLabels,
            selectedIndex = currentLanguage,
            onSelect = {
                onLanguageChange(it)
                showLanguageDialog = false
            },
            onDismiss = { showLanguageDialog = false }
        )
    }

    if (showThemeDialog) {
        RadioChoiceDialog(
            title = stringResource(R.string.theme),
            options = themeLabels,
            selectedIndex = themeMode,
            onSelect = {
                onThemeChange(it)
                showThemeDialog = false
            },
            onDismiss = { showThemeDialog = false }
        )
    }

    if (showUrlBarDialog) {
        RadioChoiceDialog(
            title = stringResource(R.string.url_bar_style),
            options = barStyleLabels,
            selectedIndex = urlBarStyle,
            onSelect = {
                onUrlBarStyleChange(it)
                showUrlBarDialog = false
            },
            onDismiss = { showUrlBarDialog = false }
        )
    }

    if (showToolbarDialog) {
        RadioChoiceDialog(
            title = stringResource(R.string.toolbar_style),
            options = barStyleLabels,
            selectedIndex = toolbarStyle,
            onSelect = {
                onToolbarStyleChange(it)
                showToolbarDialog = false
            },
            onDismiss = { showToolbarDialog = false }
        )
    }

    if (showSearchEngineDialog) {
        RadioChoiceDialog(
            title = stringResource(R.string.default_search_engine),
            options = searchEngines,
            selectedIndex = searchEngines.indexOf(defaultSearchEngine).coerceAtLeast(0),
            onSelect = {
                onDefaultSearchEngineChange(searchEngines[it])
                showSearchEngineDialog = false
            },
            onDismiss = { showSearchEngineDialog = false }
        )
    }

    if (showPrivacyDialog) {
        AlertDialog(
            onDismissRequest = { showPrivacyDialog = false },
            title = {
                Text(
                    stringResource(R.string.privacy_level),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    privacyLabels.forEachIndexed { index, label ->
                        Surface(
                            shape = ShapeCache.smooth14,
                            color = if (index == privacyLevel) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f) else MaterialTheme.colorScheme.surfaceContainerHigh,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onPrivacyLevelChange(index)
                                    showPrivacyDialog = false
                                }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = index == privacyLevel,
                                    onClick = {
                                        onPrivacyLevelChange(index)
                                        showPrivacyDialog = false
                                    }
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = label,
                                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = privacyDescs[index],
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showPrivacyDialog = false }) {
                    Text(stringResource(R.string.close))
                }
            },
            shape = ShapeCache.smooth28,
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
        )
    }

    if (showLicensesDialog) {
        AlertDialog(
            onDismissRequest = { showLicensesDialog = false },
            title = {
                Text(
                    text = stringResource(R.string.open_source_libraries),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    LibraryItem(
                        name = "Mozilla GeckoView Omni",
                        version = "135.0.20250130195129",
                        license = "Mozilla Public License 2.0 (MPL-2.0)",
                        url = "https://geckoview.dev"
                    )
                    LibraryItem(
                        name = "Jetpack Compose & Material 3 Expressive",
                        version = "1.4.0-alpha10",
                        license = "Apache License 2.0",
                        url = "https://developer.android.com/jetpack/compose"
                    )
                    LibraryItem(
                        name = "Coil Image Loader",
                        version = "2.7.0",
                        license = "Apache License 2.0",
                        url = "https://coil-kt.github.io/coil"
                    )
                    LibraryItem(
                        name = "KotlinX Coroutines & Serialization",
                        version = "2.1.0",
                        license = "Apache License 2.0",
                        url = "https://github.com/Kotlin/kotlinx.coroutines"
                    )
                    LibraryItem(
                        name = "AndroidX (Core, Lifecycle, Activity)",
                        version = "1.15.0 / 2.8.7",
                        license = "Apache License 2.0",
                        url = "https://source.android.com"
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showLicensesDialog = false }) {
                    Text(stringResource(R.string.close))
                }
            },
            shape = ShapeCache.smooth28,
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
        )
    }
}

@Composable
private fun SettingsGroupCard(
    categoryTitle: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = categoryTitle,
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(start = 12.dp, bottom = 6.dp)
        )
        Surface(
            color = MaterialTheme.colorScheme.surfaceContainerLow,
            shape = ShapeCache.smooth24,
            modifier = Modifier.fillMaxWidth(),
            tonalElevation = 1.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                content()
            }
        }
    }
}

@Composable
private fun SettingsNavRow(
    icon: ImageVector,
    iconBgColor: Color,
    iconTint: Color,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(ShapeCache.smooth14)
            .clickable { onClick() }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            color = iconBgColor,
            shape = CircleShape,
            modifier = Modifier.size(42.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(1.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
        )
    }
}

@Composable
private fun SettingsSwitchRow(
    icon: ImageVector,
    iconBgColor: Color,
    iconTint: Color,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(ShapeCache.smooth14)
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            color = iconBgColor,
            shape = CircleShape,
            modifier = Modifier.size(42.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(1.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
private fun SettingsActionRow(
    icon: ImageVector,
    iconBgColor: Color,
    iconTint: Color,
    title: String,
    subtitle: String,
    actionText: String,
    onAction: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(ShapeCache.smooth14)
            .clickable { onAction() }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            color = iconBgColor,
            shape = CircleShape,
            modifier = Modifier.size(42.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(1.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        FilledTonalButton(
            onClick = onAction,
            shape = CircleShape,
            colors = ButtonDefaults.filledTonalButtonColors(
                containerColor = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.onErrorContainer
            ),
            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Text(actionText, style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
        }
    }
}

@Composable
private fun SettingsExternalRow(
    icon: ImageVector,
    iconBgColor: Color,
    iconTint: Color,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(ShapeCache.smooth14)
            .clickable { onClick() }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            color = iconBgColor,
            shape = CircleShape,
            modifier = Modifier.size(42.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(1.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
        Icon(
            imageVector = Icons.AutoMirrored.Filled.OpenInNew,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
            modifier = Modifier.size(18.dp)
        )
    }
}

@Composable
private fun SettingsDivider() {
    HorizontalDivider(
        modifier = Modifier.padding(vertical = 10.dp),
        color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.25f)
    )
}

@Composable
private fun RadioChoiceDialog(
    title: String,
    options: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                title,
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                options.forEachIndexed { index, option ->
                    Surface(
                        shape = ShapeCache.smooth14,
                        color = if (index == selectedIndex) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f) else Color.Transparent,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelect(index) }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 8.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = index == selectedIndex,
                                onClick = { onSelect(index) }
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = option,
                                style = MaterialTheme.typography.bodyLarge.copy(
                                    fontWeight = if (index == selectedIndex) FontWeight.Bold else FontWeight.Normal
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.close))
            }
        },
        shape = ShapeCache.smooth28,
        containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
    )
}

@Composable
private fun LibraryItem(
    name: String,
    version: String,
    license: String,
    url: String
) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceContainerLow,
        shape = ShapeCache.smooth12,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = name,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = stringResource(R.string.version_prefix, version),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = stringResource(R.string.license_prefix, license),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = url,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Preview(showBackground = true, name = "Settings Light")
@Preview(showBackground = true, uiMode = Configuration.UI_MODE_NIGHT_YES, name = "Settings Dark")
@Composable
private fun SettingsScreenPreview() {
    HilalTheme {
        SettingsScreen(
            onNavigateBack = {},
            onClearData = {}
        )
    }
}
