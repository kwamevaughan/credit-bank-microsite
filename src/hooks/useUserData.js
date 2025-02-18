import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import countriesData from '../../public/assets/misc/countries.json';

const useUserData = (token) => {
    const [userData, setUserData] = useState({
        imageUrl: '',
        userName: '',
        profileImage: '',
        userEmail: '',
        userPhone: '',
        userCountry: '',
        referralCode: '',
        userPoints: 0,
        actionsCompleted: 0,
        countryCode: '',
        userId: '',
        baseId: '',
        rankImage: '/assets/images/position-default.png',
        countriesData: [],
        profile_image_id: null, // Add this line
    });

    useEffect(() => {
        let subscription;

        const fetchData = async () => {
            if (!token) return;

            try {
                console.log('Fetching user data for token:', token);

                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, email, phone_number, points, country, actions_completed, profile_image, profile_image_id, referral_code') // Add profile_image_id here
                    .eq('id', token)
                    .single();

                if (error) throw error;

                console.log('Fetched data:', data);

                const foundCountry = countriesData.find(item => item.name === data.country);
                const countryCode = foundCountry ? foundCountry.code : 'XX';

                setUserData({
                    imageUrl: data.profile_image,
                    userName: data.name,
                    userEmail: data.email,
                    userPhone: data.phone_number,
                    userCountry: data.country,
                    referralCode: data.referral_code,
                    userPoints: data.points,
                    actionsCompleted: data.actions_completed,
                    countryCode,
                    userId: `CB${data.id}${countryCode}`,
                    baseId: data.id,
                    rankImage: '/assets/images/position-default.png',
                    countriesData: countriesData,
                    profile_image_id: data.profile_image_id, // Add this line
                });

                subscription = supabase
                    .channel('users')
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'users',
                        filter: `id=eq.${token}`,
                    }, (payload) => {
                        console.log('Real-time update payload:', payload);

                        const foundCountry = countriesData.find(item => item.name === payload.new.country);
                        const countryCode = foundCountry ? foundCountry.code : 'XX';

                        setUserData(prevData => ({
                            ...prevData,
                            imageUrl: payload.new.profile_image,
                            userPoints: payload.new.points,
                            actionsCompleted: payload.new.actions_completed,
                            userPhone: payload.new.phone_number,
                            userCountry: payload.new.country,
                            countryCode,
                            userName: payload.new.name,
                            userEmail: payload.new.email,
                            userId: `CB${payload.new.id}${countryCode}`,
                            baseId: payload.new.id,
                            rankImage: prevData.rankImage,
                            profile_image_id: payload.new.profile_image_id, // Add this line
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