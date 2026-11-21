// Phone photos (an iPhone's 48MP shot can be over 10MB) are shrunk in the
// browser before upload: longest side up to MAX_SIDE px, re-encoded as JPEG.
// The server rejects files over 10MB. If anything goes wrong (the browser
// cannot decode the file, no canvas) the original file is sent unchanged.
const MAX_SIDE = 2000;
const QUALITY = 0.85;
// Smaller than this is already fine - keep the original bytes untouched.
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024;

export default async function shrinkImage(file) {
    try {
        if (!file || file.size < SKIP_BELOW_BYTES || typeof createImageBitmap !== 'function') {
            return file;
        }
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        if (bitmap.close) bitmap.close();
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], 'upload.jpg', { type: 'image/jpeg' });
    } catch (e) {
        return file;
    }
}
