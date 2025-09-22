type PolicyType = {
    _id: string;
    name: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
};
type AboutUsType = {
    policyContent?: PolicyType[];
    loading: boolean;
};
type ErrorAboutUs = {
    message?: string;
    statusCode?: number;
    stackTrace?: string;
};
export type {AboutUsType, PolicyType, ErrorAboutUs};
