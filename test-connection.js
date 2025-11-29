import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key Length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        // Try to get the session or something simple
        const { data, error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });

        if (error) {
            console.log('FULL ERROR:', JSON.stringify(error, null, 2));
            if (error.code === 'PGRST301' || error.message.includes('does not exist')) {
                console.log('Connection successful, but table missing.');
            }
        } else {
            console.log('Connection successful!');
        }
    } catch (err) {
        console.log('EXCEPTION:', err);
    }
}

testConnection();
