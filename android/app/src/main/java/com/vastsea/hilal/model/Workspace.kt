package com.vastsea.hilal.model

data class Workspace(
    val id: String,
    val name: String,
    val emoji: String = "🌐",
    val iconName: String = "folder"
)
