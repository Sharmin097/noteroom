import { NotificationEvent } from "../frontend/src/reducers/notification.reducer"

export interface NotificationType {
    notiID: string,
    content: string,
    redirectTo: string | null,
    isRead: false,
    createdAt: string,
    isInteraction: boolean,
    notiType: NotificationEvent,
    fromUser: {
        profile_pic: string,
        displayname: any,
        username: any
    },
    additional?: any
}