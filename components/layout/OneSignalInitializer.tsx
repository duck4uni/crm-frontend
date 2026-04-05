"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import {
    getCurrentUserSession,
    setCurrentUserSession,
} from "@/lib/auth-session";
import { emitNotificationsRefresh } from "@/lib/notifications-realtime";
import { usersService } from "@/services/users";

const ONE_SIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

type OneSignalForegroundEvent = {
    notification?: {
        title?: string;
        body?: string;
        display?: () => void;
    };
    preventDefault?: () => void;
    getNotification?: () => {
        display?: () => void;
        title?: string;
        body?: string;
    };
};

type OneSignalSDK = {
    init: (options: Record<string, unknown>) => Promise<void>;
    login: (externalId: string) => Promise<void>;
    Notifications: {
        addEventListener: (eventName: string, callback: (event: unknown) => void) => void;
    };
};

type WindowWithOneSignal = Window & {
    OneSignalDeferred?: Array<(sdk: OneSignalSDK) => void | Promise<void>>;
};

function getWindowWithOneSignal(): WindowWithOneSignal {
    return window as WindowWithOneSignal;
}

export function OneSignalInitializer() {
    const toast = useToast();
    const isInitializedRef = useRef(false);
    const hasBoundListenersRef = useRef(false);
    const linkedUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !ONE_SIGNAL_APP_ID) {
            return;
        }

        let isDisposed = false;

        const ensureLinkedUser = async (): Promise<string | null> => {
            const cachedUser = getCurrentUserSession();

            if (cachedUser?.id) {
                return cachedUser.id;
            }

            try {
                const response = await usersService.getMyInfo();
                if (!response.responseData?.id) {
                    return null;
                }

                setCurrentUserSession(response.responseData);
                return response.responseData.id;
            } catch (error) {
                console.error("Load user for OneSignal failed:", error);
                return null;
            }
        };

        const setupOneSignal = async () => {
            const userId = await ensureLinkedUser();

            const windowWithOneSignal = getWindowWithOneSignal();
            windowWithOneSignal.OneSignalDeferred = windowWithOneSignal.OneSignalDeferred || [];

            windowWithOneSignal.OneSignalDeferred.push(async (oneSignal) => {
                if (isDisposed) {
                    return;
                }

                if (!isInitializedRef.current) {
                    await oneSignal.init({
                        appId: ONE_SIGNAL_APP_ID,
                        allowLocalhostAsSecureOrigin: true,
                        serviceWorkerPath: "/OneSignalSDKWorker.js",
                        serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
                        notifyButton: { enable: false },
                    });
                    isInitializedRef.current = true;
                }

                if (!hasBoundListenersRef.current) {
                    hasBoundListenersRef.current = true;

                    oneSignal.Notifications.addEventListener(
                        "foregroundWillDisplay",
                        (event) => {
                            const foregroundEvent = event as OneSignalForegroundEvent;
                            foregroundEvent.preventDefault?.();

                            const directNotification = foregroundEvent.notification;
                            const wrappedNotification = foregroundEvent.getNotification?.();
                            const title =
                                directNotification?.title || wrappedNotification?.title || "Thông báo mới";
                            const body =
                                directNotification?.body || wrappedNotification?.body || "Bạn có thông báo mới.";

                            const display =
                                directNotification?.display || wrappedNotification?.display;
                            display?.();

                            toast.info(title, body);
                            emitNotificationsRefresh({ source: "onesignal-foreground" });
                        },
                    );

                    oneSignal.Notifications.addEventListener("click", () => {
                        emitNotificationsRefresh({ source: "onesignal-click" });
                    });
                }

                if (userId && linkedUserIdRef.current !== userId) {
                    await oneSignal.login(userId);
                    linkedUserIdRef.current = userId;
                }
            });
        };

        void setupOneSignal();

        return () => {
            isDisposed = true;
        };
    }, [toast]);

    return null;
}
