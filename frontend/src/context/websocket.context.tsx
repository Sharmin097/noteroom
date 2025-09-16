import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useUserAuth } from "./userauth.context"
import { useAppData } from "./appdata.context"
import { NotificationActions, NotificationEvent } from "../reducers/notification.reducer"
import { RequestObject } from "../types/types"
import { RequestsActions } from "../reducers/request.reducer"

const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
const WebSocketContext = createContext<any>(null)
export default function WebSocketProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [socket, setSocket] = useState<any>(null)
    const { notification: [, dispatch] } = useAppData()!
    const { requests: [, dispatchRequest] } = useAppData()!
    const { userAuth } = useUserAuth()!


    useEffect(() => {
        const socket = io(`${API_SERVER_URL}/`, { query: { studentID: userAuth.studentID } })
        setSocket(socket)

        socket?.on(NotificationEvent.NOTIF_COMMENT, (notification: any) => {
            dispatch({ type: NotificationActions.ADD, payload: { notifications: [notification] } })
        })
        socket?.on(NotificationEvent.NOTIF_REQUEST, (notification: any) => {
            dispatch({ type: NotificationActions.ADD, payload: { notifications: [notification] } })
        })
        socket?.on(NotificationEvent.NOTIF_REQUEST_ACCEPT, (notification: any) => {
            dispatch({ type: NotificationActions.ADD, payload: { notifications: [notification] } })
        })
        socket?.on(NotificationEvent.NOTIF_REQUEST_DECLINE, (notification: any) => {
            dispatch({ type: NotificationActions.ADD, payload: { notifications: [notification] } })
        })
        socket?.on('request-object', (request: RequestObject) => {
            dispatchRequest({ type: RequestsActions.ADD, payload: { requests: [request] } })
        })

        return () => {
            socket.disconnect()
            socket.off(NotificationEvent.NOTIF_COMMENT)
            socket.off(NotificationEvent.NOTIF_REQUEST)
            socket.off(NotificationEvent.NOTIF_REQUEST_ACCEPT)
            socket.off(NotificationEvent.NOTIF_REQUEST_DECLINE)
            socket.off('request-object')
        }
    }, [userAuth?.studentID])

    return (
        <WebSocketContext.Provider value={[socket]}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(WebSocketContext)
}
