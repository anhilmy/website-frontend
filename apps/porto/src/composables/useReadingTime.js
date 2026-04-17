// src/composables/useReadingTime.js
export function useReadingTime() {
    function calculate(htmlContent) {
        if (!htmlContent) return 0
        const text = htmlContent.replace(/<[^>]+>/g, ' ')
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length
        return Math.ceil(wordCount / 200)
    }

    return { calculate }
}
