/**
 * Utility functions for Go board coordinates
 */

/**
 * Converts a letter to its coordinate index, skipping 'I' as per Go tradition
 * A=0, B=1, ..., H=7, I=8, J=8, K=9, etc.
 * Note: 'I' is used, but J and beyond are shifted back by 1
 */
export function letterToIndex(letter: string): number {
    const upperLetter = letter.toUpperCase();
    let index = upperLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    // Skip 'I' in Go notation - letters J and beyond are shifted back by 1
    if (index >= 9) { // J is char code 74, which is 9 after subtracting 'A' (65)
        index -= 1;
    }
    
    return index;
}

/**
 * Converts a coordinate index to its letter, skipping 'I' as per Go tradition
 * 0=A, 1=B, ..., 7=H, 8=J, 9=K, etc.
 */
export function indexToLetter(index: number): string {
    if (index < 8) {
        return String.fromCharCode('A'.charCodeAt(0) + index);
    } else {
        return String.fromCharCode('A'.charCodeAt(0) + index + 1);
    }
}

/**
 * Parses a coordinate string like "A1" to {x, y} coordinates
 * Returns null if the format is invalid
 */
export function parseCoordinate(coord: string): { x: number; y: number } | null {
    const match = coord.match(/^([A-Z])(\d+)$/i);
    if (!match) return null;
    
    const letter = match[1].toUpperCase();
    const number = parseInt(match[2], 10);
    
    const x = letterToIndex(letter);
    const y = number - 1;
    
    return { x, y };
}
