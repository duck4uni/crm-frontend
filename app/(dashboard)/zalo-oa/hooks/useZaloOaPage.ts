import { useEffect, useMemo, useState } from "react";
import { DEV_CAPTURED_OAUTH } from "@/lib/zalo-oa";
import type {
    OaConnection,
    ZaloConversation,
    ZaloChatMessage,
    AutoConfig,
    AutoConfigFormState,
} from "@/types/zalo-oa";

export type ActiveTab = "tuong-tac" | "cau-hinh";

const initialConfigForm: AutoConfigFormState = {
    oaId: "",
    showCrmUsername: false,
    autoCreateOpportunity: false,
};

const CONNECTIONS_STORAGE_KEY = "crm.zaloOa.connections.v1";

const buildDevSeedConnection = (): OaConnection => ({
    id: `oa-${DEV_CAPTURED_OAUTH.oaId}`,
    oaName: DEV_CAPTURED_OAUTH.oaName,
    oaOfficialId: DEV_CAPTURED_OAUTH.oaId,
    owner: "owner",
    followers: 0,
    syncedCustomers: 0,
    isActive: true,
    lastSyncAt: new Date().toLocaleString("vi-VN", { hour12: false }),
    status: "connected",
    tokenExpiredAt: new Date(Date.now() + 90000 * 1000).toISOString(),
});

const loadConnectionsFromStorage = (): OaConnection[] => {
    if (typeof window === "undefined") return [];
    let stored: OaConnection[] | null = null;
    try {
        const raw = window.localStorage.getItem(CONNECTIONS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) stored = parsed as OaConnection[];
        }
    } catch {
        // ignore parse errors
    }

    if (stored && stored.length > 0) return stored;

    // Dev seed: nếu chưa có OA nào ở local (hoặc localStorage rỗng/[]),
    // mồi 1 OA từ captured OAuth để test luồng mà không cần popup Zalo.
    if (process.env.NODE_ENV !== "production") {
        return [buildDevSeedConnection()];
    }
    return [];
};

const saveConnectionsToStorage = (connections: OaConnection[]) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
    } catch {
        // ignore quota
    }
};

export function useZaloOaPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("tuong-tac");
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [configFormOpen, setConfigFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [chatComposerValue, setChatComposerValue] = useState("");
    const [conversations, setConversations] = useState<ZaloConversation[]>([]);
    const [messagesByConversation, setMessagesByConversation] =
        useState<Record<string, ZaloChatMessage[]>>({});
    const [connections, setConnections] = useState<OaConnection[]>([]);
    const [autoConfigs, setAutoConfigs] = useState<AutoConfig[]>([]);

    useEffect(() => {
        setConnections(loadConnectionsFromStorage());
    }, []);

    useEffect(() => {
        saveConnectionsToStorage(connections);
    }, [connections]);
    const [configForm, setConfigForm] = useState<AutoConfigFormState>(initialConfigForm);
    const [selectedOaFilter, setSelectedOaFilter] = useState("all");

    const selectedConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === selectedConvId) || null,
        [conversations, selectedConvId],
    );

    const selectedOaName = useMemo(() => {
        if (!selectedConversation) {
            return "";
        }

        return connections.find((connection) => connection.id === selectedConversation.oaId)?.oaName || "";
    }, [connections, selectedConversation]);

    const selectedMessages = useMemo(() => {
        if (!selectedConvId) {
            return [];
        }

        return messagesByConversation[selectedConvId] || [];
    }, [messagesByConversation, selectedConvId]);

    const filteredConversations = useMemo(
        () =>
            conversations.filter((c) => {
                const matchedByOa = selectedOaFilter === "all" || c.oaId === selectedOaFilter;
                const matchedByName = c.name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchedByOa && matchedByName;
            }),
        [conversations, searchQuery, selectedOaFilter],
    );

    useEffect(() => {
        if (!selectedConvId || selectedOaFilter === "all") {
            return;
        }

        const selected = conversations.find((conversation) => conversation.id === selectedConvId);
        if (selected && selected.oaId !== selectedOaFilter) {
            setSelectedConvId(null);
            setChatComposerValue("");
        }
    }, [conversations, selectedConvId, selectedOaFilter]);

    const handleAddConfig = () => {
        if (!configForm.oaId) {
            return;
        }

        const oa = connections.find((c) => c.id === configForm.oaId);
        if (!oa) {
            return;
        }

        const newConfig: AutoConfig = {
            id: `ac-${Date.now()}`,
            oaName: oa.oaName,
            createdBy: "Admin CRM",
            createdByRole: "Quản trị viên hệ thống",
            createdAt: new Date().toLocaleString("vi-VN", { hour12: false }),
        };
        setAutoConfigs((prev) => [newConfig, ...prev]);
        setConfigForm(initialConfigForm);
        setConfigFormOpen(false);
    };

    const openSettings = () => {
        setConfigFormOpen(false);
        setSettingsOpen(true);
    };

    const handleAddConnection = (connection: OaConnection) => {
        setConnections((prev) => {
            const exists = prev.some((c) => c.oaOfficialId === connection.oaOfficialId);
            if (exists) {
                return prev.map((c) => (c.oaOfficialId === connection.oaOfficialId ? { ...c, ...connection } : c));
            }
            return [connection, ...prev];
        });
    };

    const openConfigForm = () => {
        setSettingsOpen(false);
        setConfigFormOpen(true);
    };

    const handleSendMockMessage = () => {
        if (!selectedConvId || !chatComposerValue.trim()) {
            return;
        }

        const nowTime = new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const newMessage: ZaloChatMessage = {
            id: `${selectedConvId}-local-${Date.now()}`,
            conversationId: selectedConvId,
            sender: "agent",
            content: chatComposerValue.trim(),
            timestamp: nowTime,
        };

        setMessagesByConversation((prev) => ({
            ...prev,
            [selectedConvId]: [...(prev[selectedConvId] || []), newMessage],
        }));
        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.id === selectedConvId
                    ? {
                        ...conversation,
                        lastMessage: newMessage.content,
                        timestamp: nowTime,
                        unreadCount: 0,
                    }
                    : conversation,
            ),
        );
        setChatComposerValue("");
    };

    return {
        activeTab,
        setActiveTab,
        selectedConvId,
        setSelectedConvId,
        settingsOpen,
        setSettingsOpen,
        configFormOpen,
        setConfigFormOpen,
        searchQuery,
        setSearchQuery,
        chatComposerValue,
        setChatComposerValue,
        connections,
        autoConfigs,
        setAutoConfigs,
        configForm,
        setConfigForm,
        selectedOaFilter,
        setSelectedOaFilter,
        selectedConversation,
        selectedOaName,
        selectedMessages,
        filteredConversations,
        handleAddConfig,
        handleAddConnection,
        openSettings,
        openConfigForm,
        handleSendMockMessage,
    };
}
