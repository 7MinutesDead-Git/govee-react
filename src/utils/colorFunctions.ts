import { rgbColor } from "../interfaces/interfaces";
import { lerp } from "./helpers";

export function rgbToHex(color: rgbColor | undefined) {
    if (!color) {
        return "#000000"
    }
    const { r, g, b } = color

    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }).join("")
}

// Parse a hex color string into an RGB object.
export function hexToRGB(hex: string): rgbColor {
    // Add the hex prefix if it's missing.
    if (hex[0] !== '#') {
        hex = '#' + hex
    }
    // Convert shorthand hex to full hex.
    if (hex.length === 4) {
        // We'll duplicate each character, assuming it's not a hash character.
        hex = hex.split('').map(x => x !== '#' ? x + x : x).join('')
    }
    else if (hex.length !== 7) {
        throw new Error(`Invalid hex color: ${hex}`)
    }

    return {
        "r": parseInt(hex.slice(1, 3), 16),
        "g": parseInt(hex.slice(3, 5), 16),
        "b": parseInt(hex.slice(5, 7), 16)
    }
}

// Linearly interpolate between two colors as RGB objects.
export function lerpColorRGB(start: rgbColor, end: rgbColor, distance: number): rgbColor {
    return {
        r: lerp(start.r, end.r, distance),
        g: lerp(start.g, end.g, distance),
        b: lerp(start.b, end.b, distance)
    }
}


// Linearly interpolate between two hex color values.
export function lerpColorHex(start: string, end: string, distance: number) {
    const startRGB = hexToRGB(start)
    const endRGB = hexToRGB(end)
    const lerpRGB = lerpColorRGB(startRGB, endRGB, distance)
    return rgbToHex(lerpRGB)
}

// Type guard to check if a value is an rgbColor object.
export function isRgbColor(value: string | rgbColor | number): value is rgbColor {
    return (value as rgbColor).r !== undefined
}