// Clamps a value between a minimum and maximum value.
export function clamp(target: number, min: number, max: number) {
    return Math.max(min, Math.min(target, max))
}

// Linearly interpolate between two values based on a distance between the two.
export function lerp(start: number, end: number, distance: number): number {
    const q = 1 - distance
    return Math.round(start * q + end * distance)
}
