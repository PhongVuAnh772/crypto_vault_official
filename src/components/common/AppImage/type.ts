type ImageInfo = {
    uri: string;
    loading: boolean;
};

export type LoadingImage = {
    [id: string]: ImageInfo;
};
export type NameImageType = {
    showName?: boolean;
    name?: string;
    isLoading?: boolean;
    numberOfLines?: number;
};
