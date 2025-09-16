import { createContext, ReactNode, useContext, useEffect, useReducer, useState } from "react";
import { useUserAuth } from "./userauth.context";
import notificationReducer, { NotificationActions } from "../reducers/notification.reducer";
import requestReducer, { RequestsActions } from "../reducers/request.reducer";
import { UserProfilePost } from "../../../types/post.types";
import { useQuery } from "@apollo/client";
import { getSavedPostsByUsername, getUserByUsername } from "../../../backend/graphql/queries/users.query";
import { getNotificationsUsingStudentID } from "../../../backend/graphql/queries/notification.query";
import { UserProfileType } from "../../../types/user.types";
import { NotificationType } from "../../../types/notification.types";

export type AppDataContextType = {
    notification: [NotificationType[], React.ActionDispatch<[actions: { type: NotificationActions; payload?: any; }]>],
    savedNotes: [UserProfilePost[], React.Dispatch<React.SetStateAction<UserProfilePost[]>>],
    userProfile: [UserProfileType | null, React.Dispatch<React.SetStateAction<null | UserProfileType>>, string],
    requests: [any[], React.ActionDispatch<[actions: {
        type: RequestsActions;
        payload?: any;
    }]>]
}

const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
const AppDataContext = createContext<AppDataContextType | null>(null)
export default function AppDataProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [notifs, dispatch] = useReducer(notificationReducer, [])
    const [savedNotes, setSavedNotes] = useState<UserProfilePost[]>([])
    const [profile, setProfile] = useState<UserProfileType | null>(null)
    const [requests, dispatchRequest] = useReducer(requestReducer, [])
    const { userAuth } = useUserAuth()!
    const currentUsername = userAuth?.username

    useQuery(getSavedPostsByUsername, {
        variables: { username: currentUsername },
        onCompleted: (data) => {
            if (data && data.user && data.user.saved_posts) {
                const { saved_posts } = data.user
                setSavedNotes(saved_posts)
            }
        },
        onError: (error) => {
            setSavedNotes([])
        }
    })

    useQuery(getUserByUsername, {
        variables: { username: currentUsername },
        onCompleted: (data) => {
            if (data && data.user) {
                setProfile(data.user)
            }
        },
        onError: (error) => {
            setProfile(null)
        }
    })

    useQuery(getNotificationsUsingStudentID, {
        onCompleted: (data) => {
            if (data && data.notifications) {
                dispatch({ type: NotificationActions.ADD, payload: { notifications: data.notifications } })
            }
        }
    })

    useEffect(() => {
        async function getRequests() {
            try {
                let response = await fetch(`${API_SERVER_URL}/api/requests`, { credentials: 'include' })
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.requests.length !== 0) {
                        dispatchRequest({ type: RequestsActions.ADD, payload: { requests: data.requests } })
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }

        getRequests()
    }, [])

    return (
        <AppDataContext.Provider value={
            {
                notification: [notifs, dispatch],
                savedNotes: [savedNotes, setSavedNotes],
                userProfile: [profile, setProfile, currentUsername],
                requests: [requests, dispatchRequest]
            }
        }>
            {children}
        </AppDataContext.Provider>
    )
}

export function useAppData() {
    return useContext(AppDataContext)
}