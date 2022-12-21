// Clamps a value between a minimum and maximum value.
import { rgbColor } from "../interfaces/interfaces";

export function clamp(target: number, min: number, max: number) {
    return Math.max(min, Math.min(target, max))
}

// Type guard to check if a value is an rgbColor object.
export function isRgbColor(value: string | rgbColor | number): value is rgbColor {
    return (value as rgbColor).r !== undefined
}