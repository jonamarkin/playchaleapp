
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Error: DATABASE_URL is missing or contains placeholder [YOUR-PASSWORD] in .env.local');
    process.exit(1);
}

async function runMigration() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase connection
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected.');

        // Read the migration file
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240114000000_initial_schema.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📜 Running migration (20240114000000_initial_schema.sql)...');

        // Split by semicolons to run statements roughly one by one (optional, but helps debug) 
        // or just run the whole block. Running whole block is safer for transactions but 'pg' can handle it.
        await client.query(sql);

        console.log('✅ Migration successful! Tables created.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
