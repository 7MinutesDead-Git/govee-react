// TODO: Begin splitting out this behemoth of a component into smaller components
//  and extract the state away from the rendering.
import { multiplayer } from "../../utils/api/websocket-utilities"
import { websocketURL } from "../../config"
import { Card, ColorPicker } from '@mantine/core'
import { useContext, useEffect, useRef, useState } from 'react'
import { LoggedIn } from "../../providers/session"
import { NetworkConfig } from "../../config"
import { LightCardProps, multiplayerBroadcast } from "../../interfaces/interfaces"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'
import { rgbToHex } from "../../utils/colorFunctions"
import { cardStyles } from "./LightCardStyles"
import { LoginOverlay } from "../LoginOverlay"
import { SwatchesDisplay } from "./controls/Swatches"
import { LightCardStatusHeader } from "./LightCardStatusHeader"
import { BrightnessSlider } from "./controls/BrightnessSlider"
import { getIlluminationStatus, updateIllumination } from "./utils/illumination"
import {onlineCheck, sendLightCommand} from "./utils/commands"
import { durations, statusCodes, clocks, intervals, messages } from "../../utils/constants"
import { temperatures, TemperatureSlider } from "./controls/TemperatureSlider"
import { throwUnknownFetchError } from "../../utils/api/fetch-utilities"
import { flashCardOnSuccess, flashCardOnFailure } from "./utils/animation"
import { lerpNetworkColorChange, updateGrabberColorText } from "./utils/color"


export const LightCard = (props: LightCardProps) => {
    const loggedIn = useContext(LoggedIn)
    const queryClient = useQueryClient()
    const { light } = props
    const [ rateLimited, setRateLimited ] = useState(false)

    // Color hooks
    // Receiving a color temperature means the light bulb isn't following the typical RGB color model.
    const initialColor = light.status.colorTem ? "#ffffff" : rgbToHex(light.status.color)
    const [ color, setColor ] = useState(initialColor)
    const [ grabberColor, setGrabberColor ] = useState(rgbToHex(light.status.color))
    // The color we are aiming for, when lerping to smooth out network latency.
    const targetColor = useRef(color)
    // The currently lerped color between targetColor and previously lerped color.
    const lerpedColor = useRef(color)
    const clickedSwatch = useRef(false)
    // Ensures we don't send a fetch request until we have stopped moving the color picker for some time.
    const debounceTimer = useRef(setTimeout(() => null, 0))
    // TODO: Currently only used for swatches, as it makes color picker movements laggy for some reason.. debugging.
    const colorMutation = useMutation((color: string) => changeColor(color), {
        onSuccess: () => {
            queryClient.invalidateQueries(["lights", light.id])
        }
    })

    // Brightness hooks
    const isIlluminating = getIlluminationStatus(light)
    const initialBrightness = isIlluminating ? light.status.brightness : 0
    const [ illuminating, setIlluminating ] = useState(isIlluminating)
    const brightnessSliderChanging = useRef(false)
    const [ brightnessSliderValue, setBrightnessSliderValue] = useState(initialBrightness)
    const lastBrightnessSliderValue = useRef(light.status.brightness)
    const brightnessMutation = useMutation((value: number) => changeBrightness(value), {
        onSuccess: () => {
            // TODO: Break up "lights" query into individual queries with ids
            //  so we can be more atomic here.
            queryClient.invalidateQueries(["lights", light.id])
        }
    })

    // Temperature hooks
    const [ colorTemperature, setColorTemperature ] = useState(light.status.colorTem ?? temperatures.middle)
    const temperatureSliderChanging = useRef(false)
    const temperatureMutation = useMutation((value: number) => changeTemperature(value), {
        onSuccess: () => {
            queryClient.invalidateQueries(["lights", light.id])
        }
    })

    // Flashes background of row to indicate various state updates.
    const [ cardFetchStyle, setCardFetchStyle ] = useState(cardStyles.fetchReset)

    function updateColorState(inputColor: string) {
        setRateLimited(false)
        setColorTemperature(temperatures.middle)
        // Ensure setColor is called last to avoid weird jittering in the color picker.
        setColor(inputColor)
    }

    async function changeBrightness(inputBrightness: number) {
        toast.dismiss()
        if (!loggedIn) {
            toast.error(messages.notLoggedIn("brightness"))
            setBrightnessSliderValue(props.light.status.brightness)
            return
        }
        multiplayer.broadcastBrightnessChange(light.id, inputBrightness)
        // Ensure we don't send a request to set an identical brightness.
        if (inputBrightness === lastBrightnessSliderValue.current) {
            return
        }
        lastBrightnessSliderValue.current = inputBrightness
        brightnessSliderChanging.current = false

        async function brightnessFetch() {
            if (!await onlineCheck(light, queryClient)) {
                throw new Error(messages.deviceOffline)
            }
            const response = await sendLightCommand(light, inputBrightness)
            if (response.status === statusCodes.success) {
                updateIllumination(setIlluminating, inputBrightness)
                flashCardOnSuccess(setCardFetchStyle)
                setRateLimited(false)
            }
            else if (response.status === statusCodes.rateLimited) {
                updateIllumination(setIlluminating, inputBrightness)
                flashCardOnFailure(setCardFetchStyle)
                setRateLimited(true)
                throw new Error(messages.rateLimited)
            }
            else {
                throwUnknownFetchError("brightness", response)
            }
        }

        await toast.promise(brightnessFetch(), {
            loading: `Sending ${inputBrightness}% brightness to ${light.details.deviceName}`,
            success: `${light.details.deviceName} brightness now at ${inputBrightness}%!`,
            error: messages.failed("brightness")
        })
    }

    async function changeTemperature(inputTemperature: number) {
        toast.dismiss()
        if (!loggedIn) {
            toast.error(messages.notLoggedIn("temperature"))
            setColorTemperature(props.light.status.colorTem ?? temperatures.middle)
            return
        }
        multiplayer.broadcastTemperatureChange(light.id, inputTemperature)
        await toast.promise(temperatureFetch(), {
            loading: `Changing temperature to ${inputTemperature}K for ${light.details.deviceName}`,
            success: `${light.details.deviceName} temperature now at ${inputTemperature}K`,
            error: messages.failed("temperature")
        })

        async function temperatureFetch() {
            if (!await onlineCheck(light, queryClient)) {
                throw new Error(messages.deviceOffline)
            }
            const response = await sendLightCommand(light, inputTemperature)
            if (response.status === statusCodes.success) {
                setColor("#fff")
                flashCardOnSuccess(setCardFetchStyle)
                setRateLimited(false)
            }
            else if (response.status === statusCodes.rateLimited) {
                flashCardOnFailure(setCardFetchStyle)
                setRateLimited(true)
                throw new Error(messages.rateLimited)
            }
            else {
                throwUnknownFetchError("temperature", response)
            }
        }

    }

    // Sends a debounced request to the server to change the color of the light.
    // This is necessary since the color picker doesn't have an onChangeEnd() event like the slider does.
    async function changeColor(inputColor: string) {
        if (loggedIn) {
            multiplayer.broadcastColorChange(light.id, inputColor)
        }
        clearTimeout(debounceTimer.current)
        const debounceWait = clickedSwatch.current ? 0 : durations.colorChangeDebounceDelay

        debounceTimer.current = setTimeout(async () => {
            toast.dismiss()
            if (!loggedIn) {
                toast.error("You must be logged in to change color.")
                setColor(rgbToHex(light.status.color))
                clickedSwatch.current = false
                return
            }
            await toast.promise(sendColorChange(), {
                loading: `Sending color to ${light.details.deviceName}`,
                success: `${light.details.deviceName} color set to ${inputColor}!`,
                error: "Color change failed!"
            })
        }, debounceWait)

        async function sendColorChange() {
            clickedSwatch.current = false
            updateGrabberColorText({ debounceTimer, inputColor, setGrabberColor })
            if (!await onlineCheck(light, queryClient)) {
                throw new Error(messages.deviceOffline)
            }
            // When selecting pure white as a color, the intention is often to make the light look like a normal white light bulb.
            // Color temperature commands make a much better "white" light than sending a white color command, where the
            // bulb ends up looking more of a dimmer blue-ish white. So in this case, we'll send a temperature command instead.
            if (inputColor === "#ffffff") {
                temperatureMutation.mutate(temperatures.middle)
                return
            }
            const response = await sendLightCommand(light, inputColor)
            if (response.status === statusCodes.success) {
                // Sending black as a color request to their API turns the light off lol.
                inputColor === "#000000" ?
                    updateIllumination(setIlluminating, 0) :
                    updateIllumination(setIlluminating, light.status.brightness)
                flashCardOnSuccess(setCardFetchStyle)
                updateColorState(inputColor)
            }
            else if (response.status === statusCodes.rateLimited) {
                setColor(color)
                flashCardOnFailure(setCardFetchStyle)
                setRateLimited(true)
                throw new Error(messages.rateLimited)
            }
            else {
                setColor(color)
                throwUnknownFetchError("color", response)
            }
        }
    }

    // The problem here is we get light fetch updates from props, but we set the brightness value
    // based on useState.
    // This will synchronize brightness useState whenever light brightness props changes.
    // This is a "temporary" solution since really we should not need to useEffect for
    // synchronizing state with props. It's all internal.
    // Then again, *technically* the updated state is coming from an external API update..
    // TODO: Maybe something similar can be achieved with useMemo?
    //   Probably the real solution is to rethink how we're managing state within react-query.
    //   and handle light state at the global level, that way all we need to reference is props.
    useEffect(() => {
        setBrightnessSliderValue(props.light.status.brightness)

    }, [props.light.status.brightness])

    // Effect for managing UI sync with websocket updates from other users.
    // Throttles the updates according to the NetworkConfig.socketUpdateRate.
    // https://stackoverflow.com/a/66616016/13627106
    useEffect(() => {
        // TODO: It would be really nice to extract functions like this out of the component.
        function handleSocketUpdate(update: multiplayerBroadcast) {
            // Helps give a hint that another user is interacting with the light.
            if (cardFetchStyle !== cardStyles.fetchNewSync) {
                setCardFetchStyle(cardStyles.fetchNewSync)
                setTimeout(() => setCardFetchStyle(cardStyles.fetchReset), intervals.twoSeconds)
            }
            switch (update.type) {
                case "brightness":
                    const num = Number(update.value)
                    setBrightnessSliderValue(num)
                    updateIllumination(setIlluminating, num)
                    break

                case "color":
                    updateGrabberColorText({ debounceTimer, inputColor: update.value, setGrabberColor })
                    setColorTemperature(temperatures.middle)
                    // Receiving color input changes will be lerped to smooth out transitions despite latency.
                    targetColor.current = update.value
                    if (targetColor.current !== lerpedColor.current) {
                        clearInterval(clocks.lerpColorInterval)
                        clearInterval(clocks.lerpColorClear)
                        // How quickly/often we recalculate the lerped color determines how smooth the movement looks.
                        clocks.lerpColorInterval = setInterval(
                            () => lerpNetworkColorChange({ targetColor, lerpedColor, setColor }),
                            NetworkConfig.lerpUpdateRate
                        )
                        // Since our lerp function is called by interval and not by percentage, and thus we'll never
                        // fully reach the target color, we'll need to stop the interval once we're close enough.
                        // TODO: Setup proper lerping with a percentage-based function.
                        // https://medium.com/swlh/youre-using-lerp-wrong-73579052a3c3
                        clocks.lerpColorClear = setTimeout(() => {
                            clearInterval(clocks.lerpColorInterval)
                        }, durations.lerpClear)
                    }
                    break

                case "temperature":
                    setColorTemperature(Number(update.value))
                    break

                default:
                    console.error(messages.unknownSocketMessageType(update.type))
            }
        }

        const ws = new WebSocket(websocketURL!)
        const commandBuffer: Set<multiplayerBroadcast> = new Set()
        // Function for rate limiting the UI updates by building up commands in a buffer before processing.
        function flush() {
            if (commandBuffer.size === 0) return
            for (const update of commandBuffer) {
                // We don't need to process messages originating from ourselves.
                if (update.clientID === multiplayer.id) continue
                // Only worry about messages for the current light.
                if (update.device === light.id) {
                    handleSocketUpdate(update)
                }
            }
            commandBuffer.clear()
        }

        const flushInterval = setInterval(flush, NetworkConfig.socketUpdateRate)
        ws.onmessage = (event) => {
            // Keepalive pings don't need to be processed as commands, so don't add them to our data set.
            if (event.data === "pong") return
            if (event.data === "ping") {
                ws.send("pong")
                return
            }
            const command: multiplayerBroadcast = JSON.parse(event.data)
            commandBuffer.add(command)
        }
        ws.onclose = () => ws.close()
        return () => {
            clearInterval(flushInterval)
            // In development, since effects will mount then remount, this will cause a WebSocket warning
            // saying "WebSocket is closed before the connection is established.". This goes away in prod.
            ws.close()
            flush()
        }
    }, [cardFetchStyle, light.id])


    return (
        <Card shadow="sm" padding={"lg"} radius="xs" withBorder component="section" style={{...cardFetchStyle, ...cardStyles.card}}>
            <LightCardStatusHeader
                grabberColor={grabberColor}
                isLoading={brightnessMutation.isLoading || colorMutation.isLoading || temperatureMutation.isLoading}
                light={light}
                illuminating={illuminating}
                rateLimited={rateLimited}/>
            <SwatchesDisplay
                light={light}
                brightnessSliderValue={brightnessSliderValue}
                changeBrightness={async (presetBrightness) => brightnessMutation.mutate(presetBrightness)}
                changeColor={async (presetColor) => colorMutation.mutate(presetColor)}
                changeTemperature={async (presetTemperature) => temperatureMutation.mutate(presetTemperature)}
                color={color}
                setBrightnessSliderValue={(presetBrightness: number) => setBrightnessSliderValue(presetBrightness)}/>
            <ColorPicker
                fullWidth={true}
                value={color}
                size="sm"
                onChange={(inputColor) => changeColor(inputColor)}
                style={cardStyles.controlSurface}
                styles={cardStyles.colorPicker}/>
            <BrightnessSlider
                light={light}
                brightnessSliderChanging={brightnessSliderChanging}
                brightnessSliderValue={brightnessSliderValue}
                setBrightnessSliderValue={(newValue: number) => setBrightnessSliderValue(newValue)}
                brightnessMutation={brightnessMutation}/>
            <TemperatureSlider
                light={light}
                setSliderValue={(newValue:number) => setColorTemperature(newValue)}
                sliderValue={colorTemperature}
                sliderChanging={temperatureSliderChanging}
                mutation={temperatureMutation}/>
            {props.children}
            <LoginOverlay/>
        </Card>
    )
}
