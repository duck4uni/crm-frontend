import { useEffect, useMemo, useState } from "react";
import {
    initialConnections,
    mockConversations,
    mockConversationMessages,
    mockAutoConfigs,
} from "@/mock-data/zalo-oa";
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

export function useZaloOaPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("tuong-tac");
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [configFormOpen, setConfigFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [chatComposerValue, setChatComposerValue] = useState("");
    const [conversations, setConversations] = useState<ZaloConversation[]>(mockConversations);
    const [messagesByConversation, setMessagesByConversation] =
        useState<Record<string, ZaloChatMessage[]>>(mockConversationMessages);
    const [connections, setConnections] = useState<OaConnection[]>(initialConnections);
    const [autoConfigs, setAutoConfigs] = useState<AutoConfig[]>(mockAutoConfigs);
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
