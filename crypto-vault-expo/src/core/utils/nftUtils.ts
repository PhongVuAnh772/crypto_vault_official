import {MutableRefObject} from 'react';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';

function convertIpfsUrl(ipfsUrl: string) {
    if (ipfsUrl && ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
}

const convertImageByCanvas = async (
    image: string,
    canvasRef: MutableRefObject<any>,
) => {
    return new Promise<string>(resolve => {
        const canvas = canvasRef.current;

        if (canvas) {
            const ctx = canvas.getContext('2d');
            const img = new CanvasImage(canvas);

            img.src = image;

            img.addEventListener('load', async () => {
                const imgWidth = img.width;
                const imgHeight = img.height;

                const maxCanvasWidth = canvas.width || 300;
                const aspectRatio = imgWidth / imgHeight;
                const canvasHeight = maxCanvasWidth / aspectRatio;

                canvas.width = maxCanvasWidth;
                canvas.height = canvasHeight;

                ctx.drawImage(img, 0, 0, maxCanvasWidth, canvasHeight);

                const data = await canvas.toDataURL('image/png');

                const cleanedBase64 = data?.replace(/^"|"$/g, '');
                resolve(cleanedBase64);
            });

            img.addEventListener('error', () => {
                resolve('');
            });
        } else {
            resolve('');
        }
    });
};
export default {convertIpfsUrl, convertImageByCanvas};
