import { Card, Text, Group, Slider, ColorPicker } from '@mantine/core'
import { useEffect, useRef, useState} from 'react'
import { BadgeNetworkStatus, BadgeIlluminationStatus } from "./Badges"
import { devicesURL } from "../config"
import { LightsRowProps } from "../interfaces/interfaces"
import {useMutation, useQueryClient} from "@tanstack/react-query"
import toast from 'react-hot-toast'
import {rgbToHex} from "../utils/helpers"

const cardStyles = {
    controlSurface: {
        padding: "1.5rem 0"
    },
    fetchSuccess: {
        animation: "success 0.5s ease-in-out",
        animationFillMode: "forwards",
    },
    fetchFailure: {
        animation: "failure 2s ease-in-out infinite",
        animationFillMode: "forwards",
    },
    fetchNewSync: {
        animation: "newSync 0.5s ease-in-out",
        animationFillMode: "forwards",
    },
    fetchReset: {
        animation: "",
        animationFillMode: ""
    },
    card: {
        // width: "350px",
        transition: "all 1s ease-in-out",
        "&:hover": {
            transition: "all 0.1s ease-in-out",
            backgroundColor: "#6a0dff",
            color: "white",
        }
    }
}


export const LightCard = (props: LightsRowProps) => {
    const queryClient = useQueryClient()
    const { light } = props
    const isIlluminating = light.status.powerState === "on" &&
        light.status.brightness > 0 &&
        light.status.color !== {r: 0, g: 0, b: 0}

    const [ rateLimited, setRateLimited ] = useState(false)
    const [ illuminating, setIlluminating ] = useState(isIlluminating)

    // Color hooks
    // TODO: Change color state hooks to useMutation.
    const [ color, setColor ] = useState("")
    const colorChangeDebounceTimer = useRef(setTimeout(() => {}, 0))

    // Brightness hooks
    const brightnessSliderChanging = useRef(false)
    const [ brightnessSliderValue, setBrightnessSliderValue] = useState(light.status.brightness)
    const lastBrightnessSliderValue = useRef(light.status.brightness)
    const lastBrightnessFetched = useRef(light.status.brightness)
    const brightnessMutation = useMutation(
        (value: number) => changeBrightness(value),
        {
            onSuccess: () => {
                // TODO: Break up "lights" query into individual queries with ids
                //  so we can be more atomic here.
                queryClient.invalidateQueries(["lights", light.id])
            }
        }
    )

    // Flashes background of row to indicate various state updates.
    const [ cardFetchStyle, setCardFetchStyle ] = useState(cardStyles.fetchReset)

    async function onlineCheck() {
        if (!light.status.online) {
            toast.error(`${light.details.deviceName} is offline!`)
            await queryClient.invalidateQueries(["lights"])
            return false
        }
        return true
    }

    function flashRowOnSuccess() {
        setCardFetchStyle(cardStyles.fetchSuccess)
        setTimeout(() => {
            setCardFetchStyle(cardStyles.fetchReset)
        }, 1000)
    }
    function flashRowOnFailure() {
        setCardFetchStyle(cardStyles.fetchFailure)
    }

    function updateIllumination(brightness: number) {
        brightness > 0 ? setIlluminating(true) : setIlluminating(false)
    }

    async function changeBrightness(inputBrightness: number) {
        // Ensure we don't send a request to set an identical brightness.
        if (inputBrightness === lastBrightnessSliderValue.current) {
            return
        }
        lastBrightnessSliderValue.current = inputBrightness
        brightnessSliderChanging.current = false

        const commandBody = {
            "device": light.id,
            "model": light.details.model,
            "cmd": {
                "name": "brightness",
                "value": inputBrightness
            }
        }
        async function brightnessFetch() {
            if (!await onlineCheck()) {
                throw new Error("Device offline")
            }
            const response = await fetch(devicesURL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commandBody)
            })
            if (response.status === 200) {
                updateIllumination(inputBrightness)
                flashRowOnSuccess()
                setRateLimited(false)
            }
            else if (response.status === 429) {
                console.log(response)
                updateIllumination(inputBrightness)
                flashRowOnFailure()
                setRateLimited(true)
                throw new Error("Rate limited")
            }
            else {
                console.log("Hmm, something went wrong.", response)
                throw new Error("Something went wrong")
            }
        }
        await toast.promise(
            brightnessFetch(),
            {
                loading: `Sending ${inputBrightness}% brightness to ${light.details.deviceName}`,
                success: `${light.details.deviceName} brightness now at ${inputBrightness}%!`,
                error: "Brightness change failed!"
            }
        )
    }

    // Sends a debounced request to the server to change the color of the light.
    // This is necessary since the color picker doesn't have an onChangeEnd() event like the slider does.
    async function changeColor(device: string, model: string, inputColor: string) {
        clearTimeout(colorChangeDebounceTimer.current)
        colorChangeDebounceTimer.current = setTimeout(async () => {
            await toast.promise(
                sendColorChange(),
                {
                    loading: `Sending color to ${light.details.deviceName}`,
                    success: `${light.details.deviceName} color set to ${inputColor}!`,
                    error: "Color change failed!"
                }
            )
        }, 500)

        async function sendColorChange() {
            if (!await onlineCheck()) {
                throw new Error("Device offline")
            }
            const commandBody = {
                "device": device,
                "model": model,
                "cmd": {
                    "name": "color",
                    "value": {
                        "r": parseInt(inputColor.slice(1, 3), 16),
                        "g": parseInt(inputColor.slice(3, 5), 16),
                        "b": parseInt(inputColor.slice(5, 7), 16)
                    }
                }
            }
            const response = await fetch(devicesURL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commandBody)
            })
            if (response.status === 200) {
                setColor(inputColor)
                // Sending black as a color request to their API turns the light off lol.
                inputColor === "#000000" ? updateIllumination(0) : updateIllumination(light.status.brightness)
                flashRowOnSuccess()
                setRateLimited(false)
            }
            else if (response.status === 429) {
                setColor(color)
                flashRowOnFailure()
                setRateLimited(true)
                throw new Error("Rate limit exceeded.")
            }
            else {
                throw new Error("Something went wrong when setting color.")
            }
        }
    }

    useEffect(() => {
        // This can happen when setting the lights to a bulb color and brightness, rather than an RGB one.
        if (light.status.colorTem) {
            setColor("#ffffff")
        }
        else if (light.status.color) {
            const red = light.status.color.r
            const green = light.status.color.g
            const blue = light.status.color.b
            setColor(rgbToHex(red, green, blue))
        }
    },[light.status.color, light.status.colorTem])


    // Setting the value of the slider to the light.status.brightness props
    // would lock the slider animation in place since the props wouldn't change
    // until the next sync. That meant the value resetting as you dragged the slider,
    // since dragging the slider means a re-render.
    // So, this function allows the slider value to update freely based on the value
    // being returned from onChange() within the slider component,
    // and will also update the brightness value when the parent refetching finds updated data
    // and causes a re-render.
    function handleBrightnessSliderValue() {
        if (brightnessSliderChanging.current) {
            return brightnessSliderValue
        }
        else if (lastBrightnessFetched.current !== light.status.brightness) {
            lastBrightnessFetched.current = light.status.brightness
            return light.status.brightness
        }
    }
    // Set our display brightness value to the slider value returned from the onChange() function,
    // and sets a reference boolean flag to indicate the value is currently changing.
    function handleBrightnessSliderChange(sliderValue: number) {
        brightnessSliderChanging.current = true
        setBrightnessSliderValue(sliderValue)
    }

    return (
        <Card
            shadow="sm"
            p="lg"
            radius="xs"
            withBorder
            component="section"
            style={{...cardFetchStyle, ...cardStyles.card}}>

            <Group position="apart" mt="xs" mb="xs" spacing="xs" align="center">
                <Text weight={800} color="white" size="lg">
                    {light.details.deviceName}
                </Text>
                <BadgeIlluminationStatus
                    online={light.status.online}
                    illuminating={illuminating}
                    rateLimited={rateLimited}/>
            </Group>

            <Group position="apart" mt="xs" mb="xs" spacing="xs" align="center">
                <BadgeNetworkStatus online={light.status.online} updating={brightnessMutation.isLoading}/>
            </Group>

            <ColorPicker
                fullWidth={true}
                value={color}
                size="sm"
                // According to Mantine docs, onChangeEnd is supposed to exist on ColorPicker element but doesn't,
                // so we'll need to debounce in changeColor method.
                onChange={(inputColor) => changeColor(light.id, light.details.model, inputColor)}
                style={cardStyles.controlSurface}/>

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
        </Card>
    );
}