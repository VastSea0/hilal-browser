package com.vastsea.hilal

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import com.vastsea.hilal.browser.AndroidPermissions
import com.vastsea.hilal.data.ThemeMode
import com.vastsea.hilal.ui.HilalApp
import kotlinx.coroutines.launch
import org.mozilla.geckoview.GeckoRuntimeSettings

class MainActivity : ComponentActivity() {
    private var permissionCallback: ((Boolean) -> Unit)? = null
    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
            permissionCallback?.invoke(result.values.all { it })
            permissionCallback = null
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        var ready = false
        splash.setKeepOnScreenCondition { !ready }

        AndroidPermissions.attach { permissions, callback ->
            permissionCallback = callback
            permissionLauncher.launch(permissions.toTypedArray())
        }

        lifecycleScope.launch {
            container.downloads.failInterrupted()
            container.tabs.restore()
            container.addons.start()
            handleIntent(intent)
            ready = true
            container.telemetry.pingIfAllowed(
                container.settings.current,
                tabCount = container.tabs.tabs.value.size,
                ublockEnabled = true,
            )
        }

        // Pages follow the app theme unless the user asked for dark websites everywhere.
        lifecycleScope.launch {
            container.settings.settings.collect { settings ->
                container.runtime.settings.setPreferredColorScheme(
                    when {
                        settings.darkWebsites || settings.themeMode == ThemeMode.Dark -> GeckoRuntimeSettings.COLOR_SCHEME_DARK
                        settings.themeMode == ThemeMode.Light -> GeckoRuntimeSettings.COLOR_SCHEME_LIGHT
                        else -> GeckoRuntimeSettings.COLOR_SCHEME_SYSTEM
                    }
                )
            }
        }

        setContent {
            HilalApp(container = container, onFullscreenChange = ::setImmersive)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    override fun onStop() {
        super.onStop()
        container.tabs.persistNow()
    }

    override fun onDestroy() {
        AndroidPermissions.detach()
        super.onDestroy()
    }

    private fun handleIntent(intent: Intent?) {
        val url = when (intent?.action) {
            Intent.ACTION_VIEW -> intent.dataString
            Intent.ACTION_SEND -> intent.getStringExtra(Intent.EXTRA_TEXT)?.trim()
                ?.let { text -> Regex("https?://\\S+").find(text)?.value }
            else -> null
        } ?: return
        container.tabs.newTab(url)
        setIntent(Intent())
    }

    private fun setImmersive(enabled: Boolean) {
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        if (enabled) {
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            controller.hide(WindowInsetsCompat.Type.systemBars())
        } else {
            controller.show(WindowInsetsCompat.Type.systemBars())
        }
    }
}
