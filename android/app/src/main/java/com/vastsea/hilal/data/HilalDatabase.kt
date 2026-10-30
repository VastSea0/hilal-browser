package com.vastsea.hilal.data

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Index
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "history", indices = [Index(value = ["url"], unique = true), Index("lastVisited")])
data class HistoryEntry(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val url: String,
    val title: String,
    val visitCount: Int,
    val lastVisited: Long,
)

@Entity(tableName = "bookmarks", indices = [Index(value = ["url"], unique = true)])
data class Bookmark(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val url: String,
    val title: String,
    val created: Long = System.currentTimeMillis(),
)

@Entity(tableName = "downloads")
data class DownloadEntry(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fileName: String,
    val url: String,
    val contentUri: String?,
    val mimeType: String?,
    val sizeBytes: Long,
    val status: Int,
    val created: Long = System.currentTimeMillis(),
) {
    companion object {
        const val STATUS_RUNNING = 0
        const val STATUS_DONE = 1
        const val STATUS_FAILED = 2
    }
}

@Dao
interface HistoryDao {
    @Query("SELECT * FROM history ORDER BY lastVisited DESC LIMIT :limit")
    fun recent(limit: Int = 500): Flow<List<HistoryEntry>>

    @Query("SELECT * FROM history WHERE url = :url LIMIT 1")
    suspend fun find(url: String): HistoryEntry?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entry: HistoryEntry)

    @Query("UPDATE history SET title = :title WHERE url = :url")
    suspend fun updateTitle(url: String, title: String)

    @Transaction
    suspend fun recordVisit(url: String, title: String) {
        val existing = find(url)
        upsert(
            HistoryEntry(
                id = existing?.id ?: 0,
                url = url,
                title = title.ifBlank { existing?.title.orEmpty() },
                visitCount = (existing?.visitCount ?: 0) + 1,
                lastVisited = System.currentTimeMillis(),
            )
        )
    }

    @Query("SELECT url FROM history WHERE url IN (:urls)")
    suspend fun visitedAmong(urls: List<String>): List<String>

    /** Frecency-ish ranking: visit count weighted by recency, matching url or title. */
    @Query(
        """
        SELECT * FROM history
        WHERE url LIKE '%' || :query || '%' OR title LIKE '%' || :query || '%'
        ORDER BY visitCount * 1.0 / (1 + (:now - lastVisited) / 86400000.0) DESC
        LIMIT :limit
        """
    )
    suspend fun search(query: String, now: Long = System.currentTimeMillis(), limit: Int = 6): List<HistoryEntry>

    @Query("SELECT * FROM history ORDER BY visitCount * 1.0 / (1 + (:now - lastVisited) / 86400000.0) DESC LIMIT :limit")
    fun topSites(now: Long = System.currentTimeMillis(), limit: Int = 8): Flow<List<HistoryEntry>>

    @Query("DELETE FROM history WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("DELETE FROM history WHERE lastVisited >= :since")
    suspend fun deleteSince(since: Long)
}

@Dao
interface BookmarkDao {
    @Query("SELECT * FROM bookmarks ORDER BY created DESC")
    fun all(): Flow<List<Bookmark>>

    @Query("SELECT EXISTS(SELECT 1 FROM bookmarks WHERE url = :url)")
    fun isBookmarked(url: String): Flow<Boolean>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(bookmark: Bookmark)

    @Query("DELETE FROM bookmarks WHERE url = :url")
    suspend fun deleteUrl(url: String)

    @Query("UPDATE bookmarks SET title = :title, url = :url WHERE id = :id")
    suspend fun update(id: Long, title: String, url: String)

    @Query("SELECT * FROM bookmarks WHERE url LIKE '%' || :query || '%' OR title LIKE '%' || :query || '%' LIMIT :limit")
    suspend fun search(query: String, limit: Int = 4): List<Bookmark>
}

@Dao
interface DownloadDao {
    @Query("SELECT * FROM downloads ORDER BY created DESC")
    fun all(): Flow<List<DownloadEntry>>

    @Insert
    suspend fun insert(entry: DownloadEntry): Long

    @Query("UPDATE downloads SET status = :status, sizeBytes = :size, contentUri = :contentUri WHERE id = :id")
    suspend fun finish(id: Long, status: Int, size: Long, contentUri: String?)

    @Query("DELETE FROM downloads WHERE id = :id")
    suspend fun delete(id: Long)

    /** Downloads still marked running when the app starts were cut off by the process dying. */
    @Query("UPDATE downloads SET status = 2 WHERE status = 0")
    suspend fun failInterrupted()
}

@Database(entities = [HistoryEntry::class, Bookmark::class, DownloadEntry::class], version = 1)
abstract class HilalDatabase : RoomDatabase() {
    abstract fun history(): HistoryDao
    abstract fun bookmarks(): BookmarkDao
    abstract fun downloads(): DownloadDao

    companion object {
        fun create(context: Context): HilalDatabase =
            Room.databaseBuilder(context, HilalDatabase::class.java, "hilal.db").build()
    }
}
