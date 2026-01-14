
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkGames() {
    const { data, error } = await supabase.from('games').select('*');
    if (error) {
        console.error('Error fetching games:', error);
        return;
    }
    console.log(`Found ${data.length} games.`);
    if (data.length > 0) {
        console.log('Sample game visibility:', data[0].visibility);
        console.log('Games with null visibility:', data.filter(g => !g.visibility).length);
    } else {
        console.log('No games found.');
    }
}

checkGames();
