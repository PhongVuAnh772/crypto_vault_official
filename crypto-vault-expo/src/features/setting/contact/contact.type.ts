export type ContactParams = {
    name: string;
    email: string;
    inquiry: string;
    context?: string;
};
export type ContactResponse = {
    name: string;
    email: string;
    inquiry: string;
    status?: false;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
};
export type ErrorContact = {
    message?: string;
    statusCode?: number;
    stackTrace?: string;
};
export type ContactSlice = {
    loading: boolean;
};
