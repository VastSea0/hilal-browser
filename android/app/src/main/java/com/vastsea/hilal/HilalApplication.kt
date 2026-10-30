package com.vastsea.hilal

import android.app.Application
import com.vastsea.hilal.addons.AddonController
import com.vastsea.hilal.browser.TabStore
import com.vastsea.hilal.data.HilalDatabase
import com.vastsea.hilal.data.SettingsRepository
import com.vastsea.hilal.downloads.DownloadController
import com.vastsea.hilal.gecko.GeckoProvider
import com.vastsea.hilal.search.SuggestionProvider
import com.vastsea.hilal.telemetry.Telemetry
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.mozilla.geckoview.GeckoRuntime

class HilalApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}

/** Process-wide singletons. Gecko allows exactly one runtime per process. */
class AppContainer(val app: Application) {
    val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    val settings = SettingsRepository(app)
    val database = HilalDatabase.create(app)
    val runtime: GeckoRuntime by lazy { GeckoProvider.create(app) }
    val downloads by lazy { DownloadController(app, database.downloads()) }
    val tabs: TabStore by lazy {
        TabStore(app, runtime, appScope, database.history(), downloads) { url ->
            appScope.launch { addons.install(url) }
        }
    }
    val addons: AddonController by lazy {
        AddonController(app, runtime, appScope).also { controller ->
            controller.openTab = { url, select -> tabs.adoptSession(url, isPrivate = false, parentId = null, select = select) }
        }
    }
    val suggestions by lazy { SuggestionProvider(database.history(), database.bookmarks()) }
    val telemetry by lazy { Telemetry(app) }
}

val android.content.Context.container: AppContainer
    get() = (applicationContext as HilalApplication).container
