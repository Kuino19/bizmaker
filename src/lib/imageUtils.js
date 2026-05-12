/**
 * Optimizes an image file/blob by resizing it to a maximum width
 * and converting it to a compressed JPEG.
 * 
 * @param {File|Blob|string} imageSource - The source image
 * @param {Object} options - Optimization options
 * @returns {Promise<Blob>} - The optimized image blob
 */
export const optimizeImage = async (imageSource, { maxWidth = 400, quality = 0.8 } = {}) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas to Blob conversion failed'));
                }
            }, 'image/jpeg', quality);
        };

        img.onerror = (err) => reject(err);

        // Handle source type
        if (imageSource instanceof File || imageSource instanceof Blob) {
            img.src = URL.createObjectURL(imageSource);
        } else if (typeof imageSource === 'string') {
            img.src = imageSource;
        } else {
            reject(new Error('Invalid image source type'));
        }
    });
};

/**
 * Converts a Blob or File to a Base64 string (useful for previews)
 */
export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
