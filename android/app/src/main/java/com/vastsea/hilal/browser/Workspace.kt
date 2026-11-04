package com.vastsea.hilal.browser

import androidx.compose.runtime.Immutable
import java.util.UUID

/** Accent colors, named like the desktop workspaces so a shared list maps one to one. */
enum class WorkspaceColor(val argb: Long) {
    Blue(0xFF4C8DF6),
    Turquoise(0xFF26B5B0),
    Green(0xFF4CAF50),
    Yellow(0xFFE0B000),
    Orange(0xFFF57C00),
    Red(0xFFE5484D),
    Pink(0xFFE0569B),
    Purple(0xFF8E6CEF),
}

enum class WorkspaceIcon { Circle, Home, Work, School, Shopping, Code, Travel, Games, Heart, Star }

/**
 * A named group of normal tabs. An isolated workspace gets its own Gecko session context,
 * so its cookies, logins and site storage are separate from every other workspace, like the
 * per-workspace containers on desktop. Private tabs never belong to a workspace.
 */
@Immutable
data class Workspace(
    val id: String,
    val name: String,
    val icon: WorkspaceIcon = WorkspaceIcon.Circle,
    val color: WorkspaceColor = WorkspaceColor.Blue,
    val isolated: Boolean = false,
) {
    /** Gecko session context id, or null to share the default cookie jar. */
    val contextId: String? get() = if (isolated && id != DEFAULT_ID) "hilal-ws-$id" else null

    companion object {
        const val DEFAULT_ID = "default"

        fun default(name: String) = Workspace(DEFAULT_ID, name, WorkspaceIcon.Home, WorkspaceColor.Purple)

        fun create(name: String, icon: WorkspaceIcon, color: WorkspaceColor, isolated: Boolean) =
            Workspace(UUID.randomUUID().toString(), name.trim(), icon, color, isolated)
    }
}
