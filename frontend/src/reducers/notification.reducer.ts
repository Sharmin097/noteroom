import { NotificationType } from "../../../types/notification.types"

export enum NotificationEvent {
    NOTIF_COMMENT = 'notification-comment',
    NOTIF_REQUEST = 'notification-request',
    NOTIF_REQUEST_ACCEPT = 'notification-request-accept',
    NOTIF_REQUEST_DECLINE = 'notification-request-decline'
}
export enum NotificationActions { ADD, READ, DELETE_ALL }
export default function notificationReducer(notifications: NotificationType[], actions: { type: NotificationActions, payload?: any }) {
    switch(actions.type) {
        case NotificationActions.ADD:
            return [...notifications, ...actions.payload.notifications]
        case NotificationActions.READ:
            return notifications.map(notification => {
                if (notification.notiID === actions.payload.notiID) {
                    return { ...notification, isRead: true }
                }
                return notification
            })
        case NotificationActions.DELETE_ALL:
            return []
    }
}
