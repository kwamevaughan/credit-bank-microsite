// useUserData.js - No changes needed as it already looks good. Just ensure the following changes in consuming components.

import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import countriesData from '../../public/assets/misc/countries.json';

const useUserData = (token) => {
    const [userData, setUserData] = useState({
        imageUrl: '',
        userName: '',
        userPoints: 0,
        actionsCompleted: 0,
        countryCode: '',
        userId: '',
        rankImage: '/assets/images/position-default.png',
    });

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, points, country, actions_completed, profile_image')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
                return;
            }

            const foundCountry = countriesData.find(item => item.name === data.country);
            const countryCode = foundCountry ? foundCountry.code : 'XX';
            setUserData({
                imageUrl: data.profile_image || '/assets/images/placeholder.png',
                userName: data.name,
                userPoints: data.points,
                actionsCompleted: data.actions_completed,
                countryCode,
                userId: `CB${data.id}${countryCode}`,
                rankImage: '/assets/images/position-default.png',
            });
        };

        fetchData();

        const subscription = supabase
            .channel('users')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users',
                filter: `id=eq.${token}`,
            }, (payload) => {
                const foundCountry = countriesData.find(item => item.name === payload.new.country);
                const countryCode = foundCountry ? foundCountry.code : 'XX';

                setUserData(prevUserData => ({
                    ...prevUserData,
                    userPoints: payload.new.points,
                    actionsCompleted: payload.new.actions_completed,
                    countryCode,
                    userName: payload.new.name,
                    imageUrl: payload.new.profile_image || '/assets/images/placeholder.png', // Consider how to handle null image
                }));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [token]);

    return userData;
};

export default useUserData;