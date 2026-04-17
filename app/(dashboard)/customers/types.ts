export interface CustomerFilterOption {
    id: string;
    label: string;
    bgColor: string;
    textColor: string;
    activeBgColor: string;
    activeTextColor: string;
}

export interface ImportFeedback {
    success: number;
    failed: number;
    errors: string[];
}
