export const NOTIFICATIONS_REFRESH_EVENT = "crm:notifications:refresh";

export interface NotificationsRefreshEventDetail {
    source?: "onesignal-foreground" | "onesignal-click" | "manual";
}

export function emitNotificationsRefresh(detail?: NotificationsRefreshEventDetail): void {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent<NotificationsRefreshEventDetail | undefined>(
            NOTIFICATIONS_REFRESH_EVENT,
            { detail },
        ),
    );
}

export function addNotificationsRefreshListener(
    listener: (detail?: NotificationsRefreshEventDetail) => void,
): () => void {
    if (typeof window === "undefined") {
        return () => undefined;
    }

    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<NotificationsRefreshEventDetail | undefined>;
        listener(customEvent.detail);
    };

    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handler as EventListener);

    return () => {
        window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handler as EventListener);
    };
}
