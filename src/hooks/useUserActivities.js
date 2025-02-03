import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';

const useUserActivities = (userId) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const fetchUserActivities = async () => {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('user_activities')
                .select('activity_id, points, created_at, activity_type')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                setError('Error fetching activities');
                console.error(fetchError);
            } else {
                setActivities(data);
            }
            setLoading(false);
        };

        fetchUserActivities();

        // Updated real-time subscription using `channel` and `postgres_changes`
        const subscription = supabase
            .channel('user_activities_channel') // Can name your channel as needed
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'user_activities',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setActivities(prevActivities => [payload.new, ...prevActivities]);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'user_activities',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setActivities(prevActivities =>
                    prevActivities.filter(activity => activity.activity_id !== payload.old.activity_id)
                );
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'user_activities',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setActivities(prevActivities => {
                    const updatedActivities = prevActivities.map(activity =>
                        activity.activity_id === payload.new.activity_id ? payload.new : activity
                    );
                    return updatedActivities;
                });
            })
            .subscribe();

        // Cleanup function
        return () => {
            subscription.unsubscribe(); // Unsubscribe on cleanup
        };
    }, [userId]);

    return { activities, loading, error };
};

export default useUserActivities;
