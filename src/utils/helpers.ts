// Clamps a value between a minimum and maximum value.
export function clamp(target: number, min: number, max: number) {
    return Math.max(min, Math.min(target, max))
}