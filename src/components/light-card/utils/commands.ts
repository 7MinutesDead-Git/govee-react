import { devicesURL } from "../../../config"
import { goveeDeviceWithState, rgbColor } from "../../../interfaces/interfaces"
import { hexToRGB } from "../../../utils/colorFunctions"
import { clamp, isRgbColor } from "../../../utils/helpers"
import { temperatures } from "../controls/TemperatureSlider"


function inColorTemperatureRange(value: number): boolean {
    return value >= temperatures.min && value <= temperatures.max
}

function normalizeValue(value: string | rgbColor | number): string | rgbColor | number {
    // Convert hex color input to rgb.
    if (typeof value === "string" && value.startsWith("#")) {
        value = hexToRGB(value)
    }
    // Explicitly convert number as string input to number type, since we can also accept colors as strings.
    if (!isNaN(Number(value))) {
        value = Number(value)
    }
    // A valid number value means this is either a brightness command or a color temperature command.
    if (typeof value === "number") {
        if (inColorTemperatureRange(value)) {
            return value
        }
        else {
            return clamp(value, 0, 100)
        }
    }
    return value
}

function determineCommandName(value: string | rgbColor | number): string | null {
    if (typeof value === "string" || isRgbColor(value)) {
        return "color"
    }
    // A number value means this is a brightness command, so clamp brightness within acceptable range.
    if (inColorTemperatureRange(value)) {
        return "colorTem"
    }
    return "brightness"
}

// Send the given light command to the server. Color, brightness or temperature can be changed.
// Brightness accepts a number or string value between 0 and 100.
// Color accepts a hex value as string, or an object with r, g, and b properties.
// Temperature accepts a number between temperatures.min and temperatures.max.
export async function sendLightCommand(light: goveeDeviceWithState, value: string | rgbColor | number) {
    value = normalizeValue(value)
    const commandName = determineCommandName(value)

    if (!commandName) {
        throw new Error(`Invalid command value of type ${typeof value} sent to light ${light.details.deviceName}: ${value}`)
    }

    const commandBody = {
        "device": light.id,
        "model": light.details.model,
        "cmd": {
            "name": commandName,
            "value": value
        }
    }
    return await fetch(devicesURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', credentials: 'include' },
        body: JSON.stringify(commandBody)
    })
}