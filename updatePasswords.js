const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client using the correct environment variables
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,  // Use NEXT_PUBLIC_SUPABASE_PROJECT_URL from .env
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY    // Use NEXT_PUBLIC_SUPABASE_ANON_KEY from .env
);

const hashPassword = async (password) => {
    const saltRounds = 10; // or adjust to a higher number for stronger hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

const updatePasswords = async () => {
    const { data, error } = await supabase
        .from('client_users')
        .select('id, username, password');

    if (error) {
        console.error('Error fetching users:', error.message);
        return;
    }

    for (const user of data) {
        const hashedPassword = await hashPassword(user.password);

        const { error: updateError } = await supabase
            .from('client_users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

        if (updateError) {
            console.error(`Error updating password for ${user.username}:`, updateError.message);
        } else {
            console.log(`Successfully updated password for ${user.username}`);
        }
    }
};

updatePasswords(); // Call the function to start updating passwords
