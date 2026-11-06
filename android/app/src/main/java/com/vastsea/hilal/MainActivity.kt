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
    // Queue of Gecko permission requests waiting for the system dialog.
    // A single slot loses requests made while another dialog is pending.
    private data class PermissionRequest(
        val permissions: List<String>,
        val callback: (Boolean) -> Unit,
    )

    private var permissionQueue: MutableList<PermissionRequest> = mutableListOf()

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
            val current = permissionQueue.removeFirstOrNull()
            current?.let {
                it.callback(result.filterKeys { k -> it.permissions.contains(k) }.values.all { it })
            }
            launchNextPermissionRequest()
        }

    private fun launchNextPermissionRequest() {
        if (permissionQueue.isNotEmpty()) {
            val request = permissionQueue[0]
            permissionLauncher.launch(request.permissions.toTypedArray())
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        var ready = false
        splash.setKeepOnScreenCondition { !ready }

        AndroidPermissions.attach { permissions, callback ->
            permissionQueue.add(PermissionRequest(permissions, callback))
            if (permissionQueue.size == 1) launchNextPermissionRequest()
        }

        lifecycleScope.launch {
            container.downloads.failInterrupted()
            container.tabs.restore()
            container.addons.start()
            container.liveApplier.start()
            handleIntent(intent)
            ready = true
            container.telemetry.pingIfAllowed(
                container.settings.current,
                tabCount = container.tabs.tabs.value.size,
                ublockEnabled = true,
            )
        }

        // Live updates follow their switch in settings; turning it off drops the bundle.
        lifecycleScope.launch {
            container.settings.settings.collect { settings ->
                if (settings.liveUpdates) container.live.start { container.settings.current.liveUpdates }
                else container.live.disable()
            }
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
            HilalApp(container = container, onFullscreenChange = ::applyImmersive)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    override fun onStart() {
        super.onStart()
        container.live.checkIfStale(container.settings.current.liveUpdates)
    }

    override fun onStop() {
        super.onStop()
        container.tabs.persistNow()
    }

    override fun onDestroy() {
        AndroidPermissions.detach()
        // Gecko never gets an answer for requests the system dialog was about;
        // reject them so the waiting pages do not hang forever.
        val pending = permissionQueue
        permissionQueue = mutableListOf()
        pending.forEach { it.callback(false) }
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

    private fun applyImmersive(enabled: Boolean) {
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        if (enabled) {
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            controller.hide(WindowInsetsCompat.Type.systemBars())
        } else {
            controller.show(WindowInsetsCompat.Type.systemBars())
        }
    }
}
