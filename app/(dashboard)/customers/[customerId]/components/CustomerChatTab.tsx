type ChatMessage = {
    id: string;
    senderName: string;
    sentAt: string;
    content: string;
    isMine: boolean;
};

type CustomerConversation = {
    messages: ChatMessage[];
} | null;

type CustomerChatTabProps = {
    conversation: CustomerConversation;
};

export function CustomerChatTab({ conversation }: CustomerChatTabProps) {
    return (
        <div className="space-y-3">
            {conversation ? (
                conversation.messages.map((message) => (
                    <div
                        key={message.id}
                        className={`rounded-lg border p-3 ${message.isMine ? "bg-primary-50 border-primary-100" : "bg-white border-gray-200"
                            }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">{message.senderName}</p>
                            <p className="text-xs text-gray-500">{message.sentAt}</p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                    </div>
                ))
            ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                    Chưa có dữ liệu chat cho khách hàng này.
                </div>
            )}
        </div>
    );
}
