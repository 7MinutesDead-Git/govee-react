import { Slider } from "@mantine/core"
import { cardStyles } from "../LightCardStyles"
import { multiplayer } from "../../../utils/api/websocket-utilities"
import { goveeDeviceWithState } from "../../../interfaces/interfaces"
import { MutableRefObject, useRef } from "react"
import { UseMutationResult } from "@tanstack/react-query"


interface ColorTemperatureProps {
    light: goveeDeviceWithState
    setSliderValue: (value: number) => void
    sliderValue: number
    sliderChanging: MutableRefObject<boolean>
    mutation: UseMutationResult<void, unknown, number, unknown>
}

export enum temperatures {
    min = 2000,
    max = 8900,
    warm = 3000,
    middle = 5450,
    cool= 7900
}

const stepSize = 500


export const TemperatureSlider = (props: ColorTemperatureProps) => {
    const { light, setSliderValue, sliderChanging, sliderValue, mutation } = props
    const lastTemperatureFetched = useRef(light.status.colorTem)

    function handleSliderValue() {
        if (sliderChanging.current) {
            return sliderValue
        }
        else if (lastTemperatureFetched.current !== light.status.colorTem) {
            lastTemperatureFetched.current = light.status.colorTem
            return light.status.colorTem
        }
        else {
            return sliderValue
        }
    }

    // Set our display brightness value to the slider value returned from the onChange() function,
    // and sets a reference boolean flag to indicate the value is currently changing.
    function handleSliderChange(sliderValue: number) {
        multiplayer.broadcastTemperatureChange(light.id, sliderValue)
        sliderChanging.current = true
        setSliderValue(sliderValue)
    }


    return (
        <Slider
            size="xl"
            thumbSize={25}
            min={temperatures.min}
            max={temperatures.max}
            step={stepSize}
            color="dark"
            precision={0}
            value={handleSliderValue()}
            defaultValue={light.status.powerState === "on" ? light.status.colorTem : temperatures.middle}
            style={cardStyles.controlSurface}
            onChange={(currentValue) => handleSliderChange(currentValue)}
            onChangeEnd={(chosenValue) => mutation.mutate(chosenValue)}
            marks={[
                { value: temperatures.warm, label: "Warm" },
                { value: temperatures.middle, label: "Neutral" },
                { value: temperatures.cool, label: "Cool" },
            ]}
        />
    )
}