// Test Turso connection
import { createClient } from '@libsql/client';

const dbUrl = "libsql://quickrep-rakeshselvaraj0108.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJNVFY3Ry1vLUVmQ216Z0tPX1lnazFRIn0.EV2J4EeNuHnopXqYKWHoR1ZkEJo4z7HCewzo58PYE1rx2sH6a4QK6N9LyrTePKYwnZm0xG62-gSzUBrPPnl_Aw";

async function testConnection() {
  try {
    console.log('🔌 Connecting to Turso...');
    console.log('URL:', dbUrl);
    console.log('Token:', authToken.substring(0, 30) + '...');

    const client = createClient({
      url: dbUrl,
      authToken: authToken,
    });

    console.log('✅ Client created');

    // Try to create a simple table
    console.log('📋 Creating users table...');
    const result = await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        resetToken TEXT,
        resetTokenExpiry TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
    
    console.log('✅ Table created successfully!');
    console.log('Result:', result);

    // Create index
    await client.execute('CREATE INDEX IF NOT EXISTS idx_email ON users(email)');
    console.log('✅ Index created!');

    // Create user_stats table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        success INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    console.log('✅ User stats table created!');

    await client.execute('CREATE INDEX IF NOT EXISTS idx_stats_user_id ON user_stats(user_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_stats_created_at ON user_stats(created_at)');
    console.log('✅ All indexes created!');

    console.log('\n🎉 Database initialization complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    console.error('Full error:', error);
  }
}

testConnection();
