export enum NotificationType {
    All = 'All',
    Read = 'Read',
    Unread = 'Unread',
}

export type NotificationDataType = [type: NotificationType];

export const NotificationTypeArray: NotificationDataType[] = Object.values(
    NotificationType,
).map(value => [value] as NotificationDataType);
