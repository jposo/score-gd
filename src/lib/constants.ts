export const AUTH_COOKIE_NAME = "auth-token";
export const LG_COOKIE_NAME = "levelguessr-token";

export const PROGRESS_STATUS_OPTIONS = [
    { value: "in progress", label: "in progress" },
    { value: "completed", label: "completed" },
    { value: "dropped", label: "dropped" },
    { value: "to try", label: "to try" },
] as const;

export const PROGRESS_SCORE_OPTIONS = [
    { value: 1, label: "terrible" },
    { value: 2, label: "horrible" },
    { value: 3, label: "very bad" },
    { value: 4, label: "bad" },
    { value: 5, label: "mediocre" },
    { value: 6, label: "fine" },
    { value: 7, label: "good" },
    { value: 8, label: "very good" },
    { value: 9, label: "excellent" },
    { value: 10, label: "perfect" },
] as const;
