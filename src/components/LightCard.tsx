import { multiplayer } from "../api/websocket-utilities"
import { websocketURL } from "../config"
import { Card, Text, Group, Slider, ColorPicker } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { BadgeNetworkStatus, BadgeIlluminationStatus } from "./Badges"
import { NetworkConfig, devicesURL } from "../config"
import { LightsRowProps, newBroadcast } from "../interfaces/interfaces"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'
import { hexToRGB, lerpColorHex, rgbToHex } from "../utils/helpers"

const cardStyles = {
    controlSurface: {
        padding: "1.5rem 0"
    },
    fetchSuccess: {
        animation: "success 0.5s ease-in-out",
    },
    fetchFailure: {
        animation: "failure 2s ease-in-out infinite",
    },
    fetchNewSync: {
        animation: "newSync 4s ease-in-out infinite",
    },
    fetchReset: {
        animation: "",
    },
    card: {
        transition: "all 1s ease-in-out",
        backgroundColor: "#25262b",
        "&:hover": {
            transition: "all 0.1s ease-in-out",
            backgroundColor: "#6a0dff",
            color: "white",
        }
    },
}

let lerpColorInterval = setInterval(() => {}, 16.7)

export const LightCard = (props: LightsRowProps) => {
    const queryClient = useQueryClient()
    const { light } = props
    const [ rateLimited, setRateLimited ] = useState(false)

    // Color hooks
    // TODO: Change color state hooks to useMutation.
    const [ color, setColor ] = useState(rgbToHex(light.status.color))
    // The color we are aiming for, when lerping to smooth out network latency.
    const targetColor = useRef(color)
    // The currently lerped color between targetColor and previously lerped color.
    const lerpedColor = useRef(color)
    // Ensures we don't send a fetch request until we have stopped moving the color picker for some time.
    const colorChangeDebounceTimer = useRef(setTimeout(() => {}, 0))

    // Brightness hooks
    // When the brightness is set to 0, the external API will instead reflect that as powerState "off".
    // The brightness reported by the API then defaults to 100 when powerState is off, for whatever reason.
    // That causes our slider to show max brightness when in fact the light is off at 0, so we'll do this:
    const isIlluminating = light.status.powerState === "on" &&
        light.status.brightness > 0 &&
        light.status.color !== {r: 0, g: 0, b: 0}
    const initialBrightness = isIlluminating ? light.status.brightness : 0
    const [ illuminating, setIlluminating ] = useState(isIlluminating)

    const brightnessSliderChanging = useRef(false)
    const [ brightnessSliderValue, setBrightnessSliderValue] = useState(initialBrightness)
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

    function flashCardOnSuccess() {
        setCardFetchStyle(cardStyles.fetchSuccess)
        setTimeout(() => {
            setCardFetchStyle(cardStyles.fetchReset)
        }, 1000)
    }
    function flashCardOnFailure() {
        setCardFetchStyle(cardStyles.fetchFailure)
    }

    function updateIllumination(brightness: number) {
        brightness > 0 ? setIlluminating(true) : setIlluminating(false)
    }

    async function changeBrightness(inputBrightness: number) {
        multiplayer.broadcastBrightnessChange(light.id, inputBrightness)
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
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(commandBody)
            })
            if (response.status === 200) {
                updateIllumination(inputBrightness)
                flashCardOnSuccess()
                setRateLimited(false)
            }
            else if (response.status === 429) {
                updateIllumination(inputBrightness)
                flashCardOnFailure()
                setRateLimited(true)
                throw new Error("Rate limited")
            }
            else {
                console.log("Hmm, something went wrong.", response)
                throw new Error("Something went wrong")
            }
        }
        await toast.promise(brightnessFetch(), {
            loading: `Sending ${inputBrightness}% brightness to ${light.details.deviceName}`,
            success: `${light.details.deviceName} brightness now at ${inputBrightness}%!`,
            error: "Brightness change failed!"
        })
    }

    // Sends a debounced request to the server to change the color of the light.
    // This is necessary since the color picker doesn't have an onChangeEnd() event like the slider does.
    async function changeColor(inputColor: string) {
        multiplayer.broadcastColorChange(light.id, inputColor)
        clearTimeout(colorChangeDebounceTimer.current)

        colorChangeDebounceTimer.current = setTimeout(async () => {
            await toast.promise(sendColorChange(), {
                loading: `Sending color to ${light.details.deviceName}`,
                success: `${light.details.deviceName} color set to ${inputColor}!`,
                error: "Color change failed!"
            })
        }, 500)

        async function sendColorChange() {
            multiplayer.broadcastColorChange(light.id, inputColor)
            if (!await onlineCheck()) {
                throw new Error("Device offline")
            }
            const commandBody = {
                "device": light.id,
                "model": light.details.model,
                "cmd": {
                    "name": "color",
                    "value": hexToRGB(inputColor)
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
                inputColor === "#000000" ?
                    updateIllumination(0) :
                    updateIllumination(light.status.brightness)
                flashCardOnSuccess()
                setRateLimited(false)
            }
            else if (response.status === 429) {
                setColor(color)
                flashCardOnFailure()
                setRateLimited(true)
                throw new Error("Rate limit exceeded.")
            }
            else {
                throw new Error("Something went wrong when setting color.")
            }
        }
    }

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
        multiplayer.broadcastBrightnessChange(light.id, sliderValue)
        brightnessSliderChanging.current = true
        setBrightnessSliderValue(sliderValue)
    }

    // Lerp between current color displayed in the UI, and target color received from broadcast.
    // This helps smooth out the color change when multiple users are changing the color,
    // and with higher latency to the server, and also allows for using a lower socket update rate
    // while maintaining smooth UI movement.
    function lerpNetworkColorChange() {
        if (targetColor.current !== lerpedColor.current) {
            lerpedColor.current = lerpColorHex(
                lerpedColor.current,
                targetColor.current,
                NetworkConfig.lerpScale
            )
            setColor(lerpedColor.current)
        }
    }

    // TODO: This may not need to be an effect since the only dependencies are props,
    //  and this is not syncing state with an external system.
    useEffect(() => {
        // This can happen when setting the lights to a bulb color and brightness, rather than an RGB one.
        if (light.status.colorTem) {
            setColor("#ffffff")
        }
        else if (light.status.color) {
            setColor(rgbToHex(light.status.color))
        }
    },[light.status.color, light.status.colorTem])


    // Effect for managing UI sync with websocket updates from other users.
    // Throttles the updates according to the NetworkConfig.socketUpdateRate.
    // https://stackoverflow.com/a/66616016/13627106
    useEffect(() => {
        const ws = new WebSocket(websocketURL!)
        const commandBuffer: Set<newBroadcast> = new Set()
        let styleTimer = setTimeout(() => {}, 0)
        // Function for rate limiting the UI updates by building up commands in a buffer before processing.
        function flush() {
            if (commandBuffer.size === 0) {
                return
            }
            for (const update of commandBuffer) {
                if (update.clientID === multiplayer.id) {
                    continue
                }
                if (update.device === light.id) {
                    // Helps give a hint that another user is interacting with the light.
                    if (cardFetchStyle !== cardStyles.fetchNewSync) {
                        clearTimeout(styleTimer)
                        setCardFetchStyle(cardStyles.fetchNewSync)
                        styleTimer = setTimeout(() => setCardFetchStyle(cardStyles.fetchReset), 4000)
                    }
                    if (update.type === "brightness") {
                        const num = Number(update.value)
                        setBrightnessSliderValue(num)
                        updateIllumination(num)
                    }
                    // Receiving color input changes will be lerped to smooth out transitions despite latency.
                    else if (update.type === "color") {
                        targetColor.current = update.value
                        if (targetColor.current !== lerpedColor.current) {
                            clearInterval(lerpColorInterval)
                            lerpColorInterval = setInterval(lerpNetworkColorChange, NetworkConfig.lerpUpdateRate)
                        }
                    }
                }
            }
            commandBuffer.clear()
        }
        const timer = setInterval(flush, NetworkConfig.socketUpdateRate)

        ws.onmessage = (event) => {
            // Keepalive pings don't need to be processed as commands, so don't add them to our data set.
            if (event.data === "ping") {
                return
            }
            const command: newBroadcast = JSON.parse(event.data)
            commandBuffer.add(command)
        }
        ws.onclose = () => {
            ws.close()
        }

        return () => {
            clearInterval(timer)
            // In development, since effects will mount then remount, this will cause a WebSocket warning
            // saying "WebSocket is closed before the connection is established.". This goes away in prod.
            ws.close()
            flush()
        }
    }, [cardFetchStyle, light.id])


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
                onChange={(inputColor) => changeColor(inputColor)}
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