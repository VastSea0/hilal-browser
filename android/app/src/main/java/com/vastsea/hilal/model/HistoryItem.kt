package com.vastsea.hilal.model

import java.util.UUID

data class HistoryItem(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val url: String,
    val timestamp: Long = System.currentTimeMillis()
)
