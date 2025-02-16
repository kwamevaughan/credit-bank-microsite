import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import countriesData from '../../public/assets/misc/countries.json';

const useUserData = (token) => {
    const [userData, setUserData] = useState({
        imageUrl: '',
        userName: '',
        profileImage: '',
        userEmail: '',
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
                .select('id, name, points, country, actions_completed, profile_image, email')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
                return;
            }

            const foundCountry = countriesData.find(item => item.name === data.country);
            const countryCode = foundCountry ? foundCountry.code : 'XX';

            setUserData({
                imageUrl: data.profile_image,
                userName: data.name,
                userEmail: data.email,
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

                setUserData(prevData => ({
                    ...prevData,
                    imageUrl: payload.new.profile_image,
                    userPoints: payload.new.points,
                    actionsCompleted: payload.new.actions_completed,
                    countryCode,
                    userName: payload.new.name,
                    userEmail: payload.new.email,
                    rankImage: prevData.rankImage
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
