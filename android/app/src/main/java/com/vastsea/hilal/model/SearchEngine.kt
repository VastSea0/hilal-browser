package com.vastsea.hilal.model

data class SearchEngine(
    val id: String,
    val name: String,
    val queryUrl: String,
    val isCustom: Boolean = false
)
