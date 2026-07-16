import { requestApi } from './apiClient';

export const uploadService = {
  uploadNftImage: async (params: {
    fileName: string;
    contentType: string;
    base64Data: string;
  }) => {
    return requestApi<{ image_url: string; path: string }>('/upload/nft-image', {
      method: 'POST',
      auth: true,
      body: params,
    });
  },
};

