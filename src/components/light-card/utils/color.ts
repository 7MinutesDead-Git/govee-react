import { lerpColorHex } from "../../../utils/colorFunctions"
import { NetworkConfig } from "../../../config"
import { MutableRefObject, Dispatch } from "react"
import { temperatures } from "../controls/TemperatureSlider"


interface updateGrabberTextArgs {
    debounceTimer: MutableRefObject<NodeJS.Timeout>
    inputColor: string
    setGrabberColor: Dispatch<string>
}

interface lerpNetworkColorArgs {
    targetColor:  MutableRefObject<string>
    lerpedColor: MutableRefObject<string>
    setColor: Dispatch<string>
}

/**
 * Updates the color picker's currently displayed color text in a debounced fashion to keep the client-side performant,
 * e.g. reducing excessive re-renders.
 * @param {updateGrabberTextArgs} config The configuration object for the function.
 * @param {MutableRefObject<NodeJS.Timeout>} config.debounceTimer The reference object for the debounce timer.
 * @param {string} config.inputColor The input color to be displayed.
 * @param {Dispatch<string>} config.setGrabberColor The dispatch function for setting the grabber color.
 */
export function updateGrabberColorText(config: updateGrabberTextArgs) {
    const { debounceTimer, inputColor, setGrabberColor } = config
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
        setGrabberColor(inputColor)
    }, 100)
}

/**
 * Lerps between the current color displayed in the UI and the target color received from a broadcast.
 * This helps smooth out the color change when multiple users are changing the color,
 * and with higher latency to the server. It also allows for using a lower socket update rate
 * while maintaining smooth UI movement.
 * @param {lerpNetworkColorArgs} config The configuration object for the function.
 * @param {MutableRefObject<string>} config.targetColor The reference object for the target color.
 * @param {MutableRefObject<string>} config.lerpedColor The reference object for the lerped color.
 * @param {Dispatch<string>} config.setColor The dispatch function for setting the color.
 */
export function lerpNetworkColorChange(config: lerpNetworkColorArgs) {
    const { targetColor, lerpedColor, setColor } = config
    if (targetColor.current !== lerpedColor.current) {
        lerpedColor.current = lerpColorHex(lerpedColor.current, targetColor.current, NetworkConfig.lerpScale)
        setColor(lerpedColor.current)
    }
}

export function inColorTemperatureRange(value: number): boolean {
    return value >= temperatures.min && value <= temperatures.max
}