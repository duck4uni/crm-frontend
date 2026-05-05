import type { ZbsTemplateMessageRecord } from "@/types/zalo-oa";

const STORAGE_KEY = "crm.zalo.templateMessages.v1";
const MAX_RECORDS = 5000; // tránh localStorage tràn

const readStore = (): ZbsTemplateMessageRecord[] => {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as ZbsTemplateMessageRecord[]) : [];
    } catch {
        return [];
    }
};

const writeStore = (records: ZbsTemplateMessageRecord[]) => {
    if (typeof window === "undefined") return;
    try {
        // Cắt bớt nếu quá lớn — giữ MAX_RECORDS bản ghi mới nhất
        const trimmed =
            records.length > MAX_RECORDS ? records.slice(records.length - MAX_RECORDS) : records;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // ignore quota
    }
};

export const loadTemplateMessages = (): ZbsTemplateMessageRecord[] => readStore();

export const appendTemplateMessage = (record: ZbsTemplateMessageRecord): void => {
    const all = readStore();
    all.push(record);
    writeStore(all);
};

export const updateTemplateMessage = (
    id: string,
    patch: Partial<ZbsTemplateMessageRecord>,
): void => {
    const all = readStore();
    const next = all.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r,
    );
    writeStore(next);
};

export const findTemplateMessageByMsgIdOrTracking = (
    msgId?: string,
    trackingId?: string,
): ZbsTemplateMessageRecord | null => {
    if (!msgId && !trackingId) return null;
    const all = readStore();
    return (
        all.find(
            (r) =>
                (msgId && r.msgId === msgId) ||
                (trackingId && r.trackingId === trackingId),
        ) || null
    );
};

export const clearTemplateMessages = (): void => writeStore([]);
