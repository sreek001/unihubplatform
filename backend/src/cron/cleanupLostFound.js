const pool = require('../modules/lostFound/db');

async function cleanupLostFoundPosts() {
  const deleteQuery = `DELETE FROM lost_found_posts WHERE created_at < NOW() - INTERVAL '14 days';`
  const result = await pool.query(deleteQuery)
  console.log(`[LostFound Cleanup] removed ${result.rowCount} expired postings at ${new Date().toISOString()}`)
  return result.rowCount
}

function scheduleLostFoundCleanup() {
  console.log('[LostFound Interval] scheduling daily cleanup (every 24 hours)')
  // 24 hours in milliseconds
  const intervalMs = 24 * 60 * 60 * 1000
  setInterval(async () => {
    try {
      await cleanupLostFoundPosts()
    } catch (error) {
      console.error('[LostFound Interval] cleanup failed:', error)
    }
  }, intervalMs)
}

module.exports = {
  cleanupLostFoundPosts,
  scheduleLostFoundCleanup,
}
