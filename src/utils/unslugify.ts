/**
 * Converts a slugged string (e.g., "my-slug-text")
 * into a title-cased string (e.g., "My Slug Text").
 * * @param slug - The slug string to convert
 * @returns The unslugged, title-cased string
 */
export const unslugify = (slug: string): string => {
    if (!slug) return "";

    return slug
        .replaceAll("-", " ") // Replace all hyphens with spaces
        .split(" ")           // Split into an array of words
        .map((word) => {
            if (word.length === 0) return ""; // Handle double hyphens "--"

            return (
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
            );
        })
        .join(" ");           // Join back into a single string
};