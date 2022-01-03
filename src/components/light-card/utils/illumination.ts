import { goveeDeviceWithState } from "../../../interfaces/interfaces"
import { Dispatch } from "react"

export function getIlluminationStatus(light: goveeDeviceWithState) {
    // When the brightness is set to 0, the external API will instead reflect that as powerState "off".
    // The brightness reported by the API then defaults to 100 when powerState is off, for whatever reason.
    // That causes our slider to show max brightness when in fact the light is off at 0, so we'll do this:
    return light.status.powerState === "on" &&
        light.status.brightness > 0 &&
        light.status.color !== {r: 0, g: 0, b: 0}
}

// Change illumination status based on brightness.
export function updateIllumination(setIlluminating: Dispatch<boolean>, brightness: number) {
    brightness > 0 ? setIlluminating(true) : setIlluminating(false)
}