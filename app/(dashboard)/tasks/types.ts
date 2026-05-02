export type SubJobStatus = "todo" | "in_progress" | "done" | "blocked";

export interface SubJob {
    id: string;
    name: string;
    due_date?: string;
    owner_ids: string[];
    status: SubJobStatus;
}

export interface JobFormData {
    job_name: string;
    content: string;
    note: string;
    job_time: { start?: string; end?: string };
    performer_uuid: string;
    customer_uuid: string;
    status_id: string;
    sub_jobs: SubJob[];
}

export const emptyFormData: JobFormData = {
    job_name: "",
    content: "",
    note: "",
    job_time: {},
    performer_uuid: "",
    customer_uuid: "",
    status_id: "",
    sub_jobs: [],
};
