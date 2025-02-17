import React, { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';
import Image from 'next/image';

const AppDownload = ({ mode }) => {
    const [userId, setUserId] = useState(null);
    const [downloadStatus, setDownloadStatus] = useState({
        Android: false,
        Apple: false,
    });

    useEffect(() => {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            setUserId(session.user?.id);
            console.log("Logged in User ID:", session.user?.id); // Log the user ID
        }
    }, []);

    useEffect(() => {
        const checkUserDownloadStatus = async () => {
            if (!userId) return;

            const { data, error } = await supabase
                .from('user_activities')
                .select('*')
                .eq('user_id', userId)
                .ilike('activity_type', 'Downloaded the Mobile App%');

            if (data && data.length > 0) {
                const status = {
                    Android: data.some(item => item.activity_type.includes('Android')),
                    Apple: data.some(item => item.activity_type.includes('Apple'))
                };
                setDownloadStatus(status);
            }
        };

        checkUserDownloadStatus();
    }, [userId]);

    const handleDownloadApp = async (platform, url) => {
        if (!userId) {
            toast.error('User ID is not defined. Please log in again.');
            return;
        }

        const waitToastId = toast.loading('Please wait while we check your download status...');
        const { data, error } = await supabase
            .from('user_activities')
            .select('activity_id')
            .eq('user_id', userId)
            .ilike('activity_type', `Downloaded the Mobile App (${platform})`);

        toast.dismiss(waitToastId);

        if (data && data.length > 0) {
            toast.info(`You have already downloaded the ${platform} app.`);
            setDownloadStatus(prev => ({ ...prev, [platform]: true }));
            return;
        }

        const { data: user, error: getUserError } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single();

        const pointsToUpdate = user.points + 15;

        const { error: updateUserError } = await supabase
            .from('users')
            .update({ points: pointsToUpdate })
            .eq('id', userId);

        if (updateUserError) {
            toast.error('Failed to update user. Please try again.');
            return;
        }

        const { error: logError } = await supabase
            .from('user_activities')
            .insert({
                user_id: userId,
                activity_type: `Downloaded the Mobile App (${platform})`,
                points: 15,
            });

        if (logError) {
            toast.error('Failed to log activity. Please try again.');
            return;
        }

        setDownloadStatus(prev => ({ ...prev, [platform]: true }));

        toast.success(`${platform} App Downloaded. You have earned 15 points.`);
        window.location.href = url;
    };

    return (

    );
};

export default AppDownload;
