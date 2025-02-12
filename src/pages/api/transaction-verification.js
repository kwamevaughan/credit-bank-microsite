import { supabase } from '/lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, data } = req.body;

    if (!userId || !Array.isArray(data)) {
        return res.status(400).json({
            message: 'Invalid request data'
        });
    }

    try {
        const results = [];
        const errors = [];
        const duplicates = [];

        for (const row of data) {
            try {
                // Check for existing transaction_id
                const { data: existingData, error: checkError } = await supabase
                    .from('transaction_verification')
                    .select('transaction_id')
                    .eq('transaction_id', row.transaction_id)
                    .single();

                if (existingData) {
                    // Transaction ID already exists
                    duplicates.push({
                        transaction_id: row.transaction_id,
                        name: row.name,
                        amount_deposited: row.amount_deposited
                    });
                    continue;
                }

                // Insert new record
                const { data: insertedData, error } = await supabase
                    .from('transaction_verification')
                    .insert([{
                        name: row.name,
                        transaction_id: row.transaction_id,
                        amount_deposited: row.amount_deposited,
                        status: 'Pending',
                        points: 0,
                        created_at: new Date().toISOString()
                    }]);

                if (error) {
                    console.error('Error inserting row:', row, 'Error:', error.message);
                    errors.push({
                        row,
                        error: error.message
                    });
                }
                else {
                    results.push(row);
                }
            } catch (error) {
                errors.push({
                    row,
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            message: 'Upload completed',
            successful: results.length,
            failed: errors.length,
            duplicates: duplicates.length,
            duplicateEntries: duplicates,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}