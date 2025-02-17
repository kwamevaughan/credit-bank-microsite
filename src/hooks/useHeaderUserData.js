import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';

const useHeaderUserData = (userId) => {
    const [profileImage, setProfileImage] = useState(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                const { data, error } = await supabase
                    .from('client_users')
                    .select('profile_image, name')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Error fetching user data:', error);
                    return;
                }

                setProfileImage(data.profile_image);
                setUserName(data.name);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, [userId]);

    return { profileImage, userName };
};

export default useHeaderUserData;
