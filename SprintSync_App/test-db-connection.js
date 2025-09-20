const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sprintsync',
  user: process.env.DB_USER || 'sprintsync_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  let client;
  try {
    console.log('🔄 Attempting to connect to database...');
    client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Test basic query
    console.log('🔍 Testing basic query...');
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    // Check if tables exist
    console.log('🔍 Checking database schema...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`📋 Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
      // Test sample data
      console.log('🔍 Testing sample data...');
      try {
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        const projectCount = await client.query('SELECT COUNT(*) as count FROM projects');
        const departmentCount = await client.query('SELECT COUNT(*) as count FROM departments');
        
        console.log('📊 Data Summary:');
        console.log(`   - Users: ${userCount.rows[0].count}`);
        console.log(`   - Projects: ${projectCount.rows[0].count}`);
        console.log(`   - Departments: ${departmentCount.rows[0].count}`);
        
        if (userCount.rows[0].count > 0) {
          console.log('✅ Sample data is loaded!');
        } else {
          console.log('⚠️  No sample data found. Run sample-data.sql to populate the database.');
        }
      } catch (dataErr) {
        console.log('⚠️  Tables exist but may not have data yet. This is normal for a fresh installation.');
      }
    } else {
      console.log('⚠️  No tables found. Run the migration script first:');
      console.log('   psql -U sprintsync_user -d sprintsync -f SprintSync_App/src/database/migrations/001_initial_schema.sql');
    }
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error('Error details:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('💡 Troubleshooting tips:');
      console.error('   1. Make sure PostgreSQL is installed and running');
      console.error('   2. Check if the database exists: CREATE DATABASE sprintsync;');
      console.error('   3. Verify your connection settings in .env file');
    } else if (err.code === '28P01') {
      console.error('💡 Authentication failed:');
      console.error('   1. Check your username and password in .env file');
      console.error('   2. Make sure the user exists and has proper permissions');
    } else if (err.code === '3D000') {
      console.error('💡 Database does not exist:');
      console.error('   1. Create the database: CREATE DATABASE sprintsync;');
      console.error('   2. Grant permissions to your user');
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await pool.end();
  process.exit(0);
});

testConnection();
