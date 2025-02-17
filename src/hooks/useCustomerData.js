import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';

const useCustomerData = (notify) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial data on mount
    useEffect(() => {
        fetchData();
    }, [notify]); // Dependency on notify for error handling

    const fetchData = async () => {
        setLoading(true);
        setError(null); // Reset error on each fetch
        try {
            const { data, error: supabaseError } = await supabase
                .from('account_opening')
                .select('id, name, account_type, referral_code, points, status, redeemed, request_date');

            if (supabaseError) {
                console.error('Error fetching data: ', supabaseError.message);
                notify("Error fetching data.", "error");
                setError(supabaseError);
            } else {
                setCustomers(data);
            }
        } catch (genericError) {
            console.error('An unexpected error occurred:', genericError);
            notify("An unexpected error occurred while fetching data.", "error");
            setError(genericError);
        } finally {
            setLoading(false);
        }
    };

    // Return customers, loading, error, setCustomers, and refetchCustomers function
    return { customers, loading, error, setCustomers, refetchCustomers: fetchData };
};

export default useCustomerData;
