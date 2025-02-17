import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [userFullName, setUserFullName] = useState('Guest');  // Add this state

    useEffect(() => {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            setToken(session.access_token);  // Set token to context state

            const { user: userData } = session;
            setUser(userData);

            // Fetch additional user data (like name)
            if (userData?.id) {
                const fetchUserData = async () => {
                    const { data, error } = await supabase
                        .from('client_users')
                        .select('name')
                        .eq('id', userData.id)
                        .single();

                    if (error) {
                        console.error('Error fetching user data:', error);
                    } else {
                        setUserFullName(data?.name || 'Guest');
                    }
                };

                fetchUserData();
            }
        }
    }, []);

    return (
        <UserContext.Provider value={{ token, setToken, user, setUser, userFullName, setUserFullName }}>
            {children}
        </UserContext.Provider>
    );
};
