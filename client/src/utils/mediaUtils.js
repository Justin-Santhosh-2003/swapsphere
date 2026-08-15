/**
 * Checks if a given media URL or file data is a video
 */
export const isMediaVideo = (url = "") => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
        lower.endsWith(".mp4") ||
        lower.endsWith(".webm") ||
        lower.endsWith(".mov") ||
        lower.endsWith(".m4v") ||
        lower.includes("/video/upload/") ||
        lower.startsWith("data:video/") ||
        lower.includes("video")
    );
};
