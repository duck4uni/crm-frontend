export interface JobFormData {
    job_name: string;
    content: string;
    note: string;
    job_time: { start?: string; end?: string };
    performer_uuid: string;
    customer_uuid: string;
    status_id: string;
}

export const emptyFormData: JobFormData = {
    job_name: "",
    content: "",
    note: "",
    job_time: {},
    performer_uuid: "",
    customer_uuid: "",
    status_id: "",
};
