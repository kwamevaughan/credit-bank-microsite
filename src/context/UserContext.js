import { createContext, useContext, useState, useEffect } from 'react';

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

    useEffect(() => {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            setToken(session.access_token);  // Set token to context state
        }
    }, []);

    return (
        <UserContext.Provider value={{ token, setToken }}>
            {children}
        </UserContext.Provider>
    );
};
