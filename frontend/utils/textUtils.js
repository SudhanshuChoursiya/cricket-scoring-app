export const ellipsize = (text, maxLength) => {
    if (!text || !maxLength) return text;

    return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
};
