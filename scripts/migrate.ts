
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

        const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files.`);

        for (const file of files) {
            console.log(`\n📜 Running migration: ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✅ Success: ${file}`);
            } catch (err: any) {
                if (err.code === '42P07') { // duplicate_table
                    console.log(`⚠️  Notice: Table already exists (skipping part of ${file})`);
                } else if (err.message.includes('already exists')) {
                    console.log(`⚠️  Notice: Relation already exists (skipping part of ${file})`);
                } else {
                    console.error(`❌ Error in ${file}:`, err.message);
                    // Decide if we stop or continue. For manual script, maybe throwing is safer.
                    throw err;
                }
            }
        }

        console.log('\n✅ All migrations processed.');

    } catch (err) {
        console.error('❌ Migration process failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
