import { goveeDeviceWithState } from "../../../interfaces/interfaces"
import { Dispatch } from "react"

export function getIlluminationStatus(light: goveeDeviceWithState) {
    // Color may not always exist on the API response, so we'll use optional chaining to check
    // and set default values we can work with.
    // TODO: The only time we'll not receive color property is if the command is a temperature change.
    //  Should we then set default values to white? E.g. { r = 255, g = 255, b = 255 }
    //  Related to: https://github.com/7MinutesDead-Git/govee-react/issues/15
    const { r = 0, g = 0, b = 0 } = light.status.color ?? {}
    // When the brightness is set to 0, the external API will instead reflect that as powerState "off".
    // The brightness reported by the API then defaults to 100 when powerState is off, for whatever reason.
    // That causes our slider to show max brightness when in fact the light is off at 0, so we'll do this:
    return light.status.powerState === "on" &&
        light.status.brightness > 0 &&
        [r, g, b].some(value => value !== 0)
}

// TODO: Need to be removed? The above function should be able to handle this.
// Change illumination status based on brightness.
export function updateIllumination(setIlluminating: Dispatch<boolean>, brightness: number) {
    brightness > 0 ? setIlluminating(true) : setIlluminating(false)
}
