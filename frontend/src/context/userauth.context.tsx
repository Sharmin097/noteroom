import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AppDataProvider from "./appdata.context";
import FeedNotesProvider from "./feed.context";
import WebSocketProvider from "./websocket.context";

export type AuthValue = {
    loading: boolean,
    userAuth: {
        studentID: string,
        username: string
    },
    setUserAuth: any,
}

const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
const UserAuthContext = createContext<AuthValue | null>(null)
export default function UserAuthProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [userAuth, setUserAuth] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const value: AuthValue = {
        loading,
        userAuth,
        setUserAuth,
    }

    useEffect(() => {
        async function getUserAuth() {
            try {
                const response = await fetch(`${API_SERVER_URL}/api/auth/session`, {
                    method: 'get',
                    credentials: 'include'
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data && data.ok) {
                        setUserAuth(data.userAuth)
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        getUserAuth()
    }, [])

    return (
        <UserAuthContext.Provider value={value}>
            {userAuth ? <AuthenticatedProviders>{children}</AuthenticatedProviders> : children}
        </UserAuthContext.Provider>
    )
}

function AuthenticatedProviders({ children }: { children: ReactNode | ReactNode[] }) {
    return (
        <AppDataProvider>
            <FeedNotesProvider>
                <WebSocketProvider>
                    {children}
                </WebSocketProvider>
            </FeedNotesProvider>
        </AppDataProvider>
    )
}

export function useUserAuth() {
    return useContext(UserAuthContext)
}