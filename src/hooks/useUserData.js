import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import countriesData from '../../public/assets/misc/countries.json';

const useUserData = (token) => {
    const [userData, setUserData] = useState({
        imageUrl: '',
        userName: '',
        profileImage: '',
        userEmail: '',
        referralCode: '',
        userPoints: 0,
        actionsCompleted: 0,
        countryCode: '',
        userId: '',
        rankImage: '/assets/images/position-default.png',
    });

    useEffect(() => {
        let subscription;

        const fetchData = async () => {
            if (!token) return;

            try {
                console.log('Fetching user data for token:', token); // Log the token being used for the fetch

                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, email, points, country, actions_completed, profile_image, referral_code')
                    .eq('id', token)
                    .single();

                if (error) throw error;

                console.log('Fetched data:', data); // Log the fetched data

                const foundCountry = countriesData.find(item => item.name === data.country);
                const countryCode = foundCountry ? foundCountry.code : 'XX';

                setUserData({
                    imageUrl: data.profile_image,
                    userName: data.name,
                    userEmail: data.email,
                    referralCode: data.referral_code,
                    userPoints: data.points,
                    actionsCompleted: data.actions_completed,
                    countryCode,
                    userId: `CB${data.id}${countryCode}`,
                    rankImage: '/assets/images/position-default.png',
                });

                // Set up real-time subscription
                subscription = supabase
                    .channel('users')
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'users',
                        filter: `id=eq.${token}`,
                    }, (payload) => {
                        console.log('Real-time update payload:', payload); // Log real-time updates

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

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();

        return () => {
            if (subscription) {
                supabase.removeChannel(subscription);
            }
        };
    }, [token]);

    return userData;
};

export default useUserData;
