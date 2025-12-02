// Script to check activity logs for specific task IDs
const { Pool } = require('pg');

// Database configuration - adjust these values based on your setup
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sprintsync_db', // Adjust database name
  user: 'postgres', // Adjust username
  password: 'postgres', // Adjust password
});

// Task IDs from the console logs
const taskIds = [
  'TASK30cfcb33fef64bada9e667ed17d6bc40',
  'TASKc034ab0f6a2a4fedb32d5e9c7e1dc8a8',
  'TASKd91c7822181c41bdbc3c9d964d996408',
  'TASK98f841d5c95d466a8ee498b1a97374cc',
  'TASK433c557a92fe4854940de584db504ec3',
  'TASK40a3ab4bc87c4755a7fdae098f424121',
  'TASKbb6991fff604439393ff04f175629f16',
  'TASK990e8400e29b41d4a716446655440002' // The one we've been testing
];

async function checkActivityLogs() {
  try {
    console.log('Checking activity logs for task IDs...\n');
    
    // Check all activity logs for these tasks
    for (const taskId of taskIds) {
      const query = `
        SELECT 
          id,
          user_id,
          entity_type,
          entity_id,
          action,
          description,
          created_at
        FROM activity_logs
        WHERE entity_type = 'task' AND entity_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      const result = await pool.query(query, [taskId]);
      
      console.log(`Task: ${taskId}`);
      console.log(`  Found ${result.rows.length} activity logs`);
      
      if (result.rows.length > 0) {
        result.rows.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.action} - ${log.description || 'No description'} (${log.created_at})`);
        });
      } else {
        console.log('  No activity logs found');
      }
      console.log('');
    }
    
    // Also check total count of activity logs
    const totalQuery = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT entity_id) as unique_entities,
        entity_type,
        COUNT(*) FILTER (WHERE entity_type = 'task') as task_logs
      FROM activity_logs
      GROUP BY entity_type
      ORDER BY total_logs DESC
    `;
    
    const totalResult = await pool.query(totalQuery);
    console.log('Summary by entity type:');
    totalResult.rows.forEach(row => {
      console.log(`  ${row.entity_type}: ${row.total_logs} logs`);
    });
    
    // Check recent activity logs
    const recentQuery = `
      SELECT 
        entity_type,
        entity_id,
        action,
        description,
        created_at
      FROM activity_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    const recentResult = await pool.query(recentQuery);
    console.log(`\nRecent activity logs (last 30 days): ${recentResult.rows.length} logs`);
    recentResult.rows.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.entity_type}] ${log.entity_id} - ${log.action} (${log.created_at})`);
    });
    
  } catch (error) {
    console.error('Error checking activity logs:', error);
  } finally {
    await pool.end();
  }
}

checkActivityLogs();

