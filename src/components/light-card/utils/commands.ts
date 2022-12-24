import { devicesURL } from "../../../config"
import { goveeDeviceWithState, rgbColor } from "../../../interfaces/interfaces"
import { hexToRGB } from "../../../utils/colorFunctions"
import { clamp } from "../../../utils/helpers"

// Send the given light command to the server. Color or brightness can be changed.
// Brightness accepts a number or string value between 0 and 100.
// Color accepts a hex value as string, or an object with r, g, and b properties.
export async function sendLightCommand(light: goveeDeviceWithState, value: string | rgbColor | number) {
    let commandName = null

    // Convert hex color input to rgb.
    if (typeof value === "string" && value.startsWith("#")) {
        value = hexToRGB(value)
        commandName = "color"
    }
    // Explicitly convert number as string input to number type, since we can also accept colors as strings.
    if (!isNaN(Number(value))) {
        value = Number(value)
    }
    // A number value means this is a brightness command, so clamp brightness within acceptable range.
    if (typeof value === "number") {
        value = clamp(value, 0, 100)
        commandName = "brightness"
    }

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