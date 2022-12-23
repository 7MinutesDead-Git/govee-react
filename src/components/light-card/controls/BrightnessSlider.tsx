import { Slider } from "@mantine/core"
import { cardStyles } from "../LightCardStyles"
import { multiplayer } from "../../../api/websocket-utilities"
import { goveeDeviceWithState } from "../../../interfaces/interfaces"
import { MutableRefObject, useRef } from "react"
import { UseMutationResult } from "@tanstack/react-query"


interface BrightnessSliderProps {
    light: goveeDeviceWithState
    setBrightnessSliderValue: (value: number) => void
    brightnessSliderValue: number
    brightnessSliderChanging: MutableRefObject<boolean>
    brightnessMutation: UseMutationResult<void, unknown, number, unknown>
}


export const BrightnessSlider = (props: BrightnessSliderProps) => {
    const {
        light,
        setBrightnessSliderValue,
        brightnessSliderChanging,
        brightnessSliderValue,
        brightnessMutation } = props

    const lastBrightnessFetched = useRef(light.status.brightness)

    // Setting the value of the slider to the light.status.brightness props would lock the slider animation in place
    // since the props wouldn't change until the next sync. That meant the value would reset as you dragged the slider,
    // since dragging the slider triggers a re-render.
    // So, this function allows the slider value to update freely based on the value being returned from onChange()
    // within the slider component, and will also update the brightness value when the parent refetching finds updated data
    // and causes a re-render.
    function handleBrightnessSliderValue() {
        if (brightnessSliderChanging.current) {
            return brightnessSliderValue
        }
        else if (lastBrightnessFetched.current !== light.status.brightness) {
            lastBrightnessFetched.current = light.status.brightness
            return light.status.brightness
        }
        else {
            return brightnessSliderValue
        }
    }

    // Set our display brightness value to the slider value returned from the onChange() function,
    // and sets a reference boolean flag to indicate the value is currently changing.
    function handleBrightnessSliderChange(sliderValue: number) {
        // TODO: For some reason, since changing the brightness slider causes a re-render,
        //  our loggedIn context is returning false, even though it's true.
        //  Everyone else's loggedIn context is returning true, so I'm not sure what's going on.
        // if (loggedIn) {
        multiplayer.broadcastBrightnessChange(light.id, sliderValue)
        // }
        brightnessSliderChanging.current = true
        setBrightnessSliderValue(sliderValue)
    }


    return (
        <Slider
            size="xl"
            thumbSize={25}
            step={10}
            color="dark"
            precision={0}
            value={handleBrightnessSliderValue()}
            defaultValue={light.status.powerState === "on" ? light.status.brightness : 0}
            style={cardStyles.controlSurface}
            onChange={(currentValue) => handleBrightnessSliderChange(currentValue)}
            onChangeEnd={(chosenValue) => brightnessMutation.mutate(chosenValue)}
            marks={[
                { value: 10, label: "Dim" },
                { value: 50, label: "Moody" },
                { value: 90, label: "Bright" },
            ]}/>
    )
}