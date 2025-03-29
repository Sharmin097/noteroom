import { createContext, ReactNode, useContext, useEffect, useReducer, useState } from "react";
import { IONotification, RequestObject, SavedNoteObject } from "../types/types";
import { useUserAuth } from "./UserAuthContext";
import notificationReducer, { NotificationActions } from "../reducers/notificationReducer";
import requestReducer, { RequestsActions } from "../reducers/requestReducer";

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
const AppDataContext = createContext<any>(null)
export default function AppDataProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [notifs, dispatch] = useReducer(notificationReducer, [])
    const [savedNotes, setSavedNotes] = useState<SavedNoteObject[]>([])
    const [profile, setProfile] = useState<any>({})
    const [requests, dispatchRequest] = useReducer(requestReducer, [])
    const { userAuth } = useUserAuth()!
    const currentUsername = userAuth?.username

    useEffect(() => {
        async function getNotifs() {
            try {
                let response = await fetch(`${API_SERVER_URL}/api/notifications`, { credentials: 'include' })
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.notifications.length !== 0) {
                        dispatch({ type: NotificationActions.ADD, payload: { notifications: data.notifications } })
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
        getNotifs()
        async function getSavedNotes() {
            try {
                let response = await fetch(`${API_SERVER_URL}/api/posts/saved`, { credentials: 'include' })
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.posts.length !== 0) {
                        setSavedNotes([
                            ...savedNotes,
                            ...data.posts.map((note: SavedNoteObject) => {
                                if (note.noteTitle.length > 30) {
                                    return { ...note, noteTitle: note.noteTitle.slice(0, 30) + "..." }
                                }
                                return note
                            })
                        ])
                    } else {
                        setSavedNotes([])
                    }
                } else {
                    setSavedNotes([])
                }
            } catch (error) {
                setSavedNotes([])
                console.error(error)
            }
        }
        getSavedNotes()


        async function getProfile() {
            try {
                let response = await fetch(`${API_SERVER_URL}/api/users/${currentUsername}`, { credentials: 'include' })
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.profile) {
                        setProfile(data.profile)
                    } else {
                        setProfile({})
                    }
                } else {
                    setProfile({})
                }
            } catch (error) {
                console.log(error)
                setProfile({})
            }
        }

        getProfile()

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