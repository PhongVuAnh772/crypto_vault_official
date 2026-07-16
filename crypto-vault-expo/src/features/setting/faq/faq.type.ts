type FAQData = {
    _id: string;
    question: string;
    answer: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v?: 0;
};
type ErrorFAQ = {
    message?: string;
    statusCode?: number;
    stackTrace?: string;
};
type FAQSlice = {
    faqData?: FAQData[];
    loading: boolean;
};
type ResFAQ = {
    headers: Headers;
    items: FAQData[];
};

export type { ErrorFAQ, FAQData, FAQSlice, ResFAQ };
