"use client";

import { useZaloOaPage } from "../../hooks/useZaloOaPage";
import { ZaloAutoConfigPanel } from "./ZaloAutoConfigPanel";
import { ZaloConfigFormDrawer } from "./ZaloConfigFormDrawer";
import { ZaloInteractionPanel } from "./ZaloInteractionPanel";
import { ZaloSettingsDrawer } from "./ZaloSettingsDrawer";
import { ZaloSidebar } from "./ZaloSidebar";

export function ZaloOaView() {
    const {
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
    } = useZaloOaPage();

    return (
        <div className="flex h-full overflow-hidden bg-white">
            <ZaloSidebar
                selectedOaFilter={selectedOaFilter}
                onSelectedOaFilterChange={setSelectedOaFilter}
                connections={connections}
                settingsOpen={settingsOpen}
                onOpenSettings={openSettings}
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                filteredConversations={filteredConversations}
                selectedConvId={selectedConvId}
                onSelectConversation={(conversationId) => {
                    setSelectedConvId(conversationId);
                    setActiveTab("tuong-tac");
                }}
            />

            <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50 min-w-0">
                {activeTab === "tuong-tac" ? (
                    <ZaloInteractionPanel
                        selectedConversation={selectedConversation}
                        selectedOaName={selectedOaName}
                        selectedMessages={selectedMessages}
                        chatComposerValue={chatComposerValue}
                        onChatComposerValueChange={setChatComposerValue}
                        onSendMessage={handleSendMockMessage}
                    />
                ) : (
                    <ZaloAutoConfigPanel
                        autoConfigs={autoConfigs}
                        onOpenConfigForm={openConfigForm}
                        onDeleteConfig={(configId) => {
                            setAutoConfigs((prev) => prev.filter((item) => item.id !== configId));
                        }}
                    />
                )}

                <ZaloSettingsDrawer
                    settingsOpen={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    connections={connections}
                    onAddConnection={handleAddConnection}
                />

                <ZaloConfigFormDrawer
                    configFormOpen={configFormOpen}
                    onClose={() => setConfigFormOpen(false)}
                    onAddConfig={handleAddConfig}
                    configForm={configForm}
                    onConfigFormChange={setConfigForm}
                    connections={connections}
                />
            </div>
        </div>
    );
}
