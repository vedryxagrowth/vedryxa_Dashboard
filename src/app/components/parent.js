// // parent.ja
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const TokenContext = createContext();

export const useTokenContext = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
    const { data: session } = useSession();
    const [userdetails, setuserdetails] = useState(null);

    // useEffect(() => {
    //     if (session) {
    //         setToken(session);
    //     }
    // }, [session]);

    return (
        <TokenContext.Provider value={{ userdetails, setuserdetails }}>
            {children}
        </TokenContext.Provider>
    );
};

