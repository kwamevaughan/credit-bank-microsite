import { useEffect } from 'react';
import { supabase } from '/lib/supabase';

const useRealtimeUpdates = (setAllCustomers) => {
    useEffect(() => {
        console.log('Setting up realtime subscription...');

        // Set up realtime subscription
        const channel = supabase
            .channel('account-opening-channel')
            .on('postgres_changes', {
                event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                schema: 'public',
                table: 'account_opening',
            }, (payload) => {
                console.log('Realtime event received:', payload.eventType, payload);

                if (payload.eventType === 'INSERT') {
                    setAllCustomers(prev => [...prev, payload.new]);
                }
                else if (payload.eventType === 'UPDATE') {
                    setAllCustomers(prev => {
                        // Create a new array to make sure React detects the state change
                        const newList = [...prev];
                        const index = newList.findIndex(item => item.id === payload.new.id);

                        if (index >= 0) {
                            // Replace the item if it exists
                            newList[index] = payload.new;
                        } else {
                            // Add the item if it doesn't exist yet
                            newList.push(payload.new);
                        }

                        return newList;
                    });
                }
                else if (payload.eventType === 'DELETE') {
                    setAllCustomers(prev =>
                        prev.filter(customer => customer.id !== payload.old.id)
                    );
                }
            })
            .subscribe((status) => {
                console.log('Subscription status:', status);
                if (status !== 'SUBSCRIBED') {
                    console.error('Failed to subscribe to real-time updates:', status);
                }
            });

        // Cleanup subscription on unmount
        return () => {
            console.log('Cleaning up realtime subscription...');
            supabase.removeChannel(channel);
        };
    }, [setAllCustomers]); // Dependency array includes setAllCustomers
};

export default useRealtimeUpdates;
