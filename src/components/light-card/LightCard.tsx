// TODO: Begin splitting out this behemoth of a component into smaller components
//  and extract the state away from the rendering.
import { multiplayer } from "../../api/websocket-utilities"
import { websocketURL } from "../../config"
import { Card, ColorPicker } from '@mantine/core'
import { useContext, useEffect, useRef, useState } from 'react'
import { LoggedIn } from "../../providers/session"
import { NetworkConfig, devicesURL } from "../../config"
import { LightCardProps, MultiplayerMessage, newBroadcast } from "../../interfaces/interfaces"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'
import { hexToRGB, lerpColorHex, rgbToHex } from "../../utils/colorFunctions"
import { cardStyles } from "./LightCardStyles"
import { LoginOverlay } from "../LoginOverlay"
import { SwatchesDisplay } from "./controls/Swatches"
import { LightCardStatusHeader } from "./LightCardStatusHeader"
import { BrightnessSlider } from "./controls/BrightnessSlider"
import { getIlluminationStatus } from "./utils/getIlluminationStatus";


let lerpColorInterval = setInterval(() => {}, 16.7)

export const LightCard = (props: LightCardProps) => {
    const loggedIn = useContext(LoggedIn)
    const queryClient = useQueryClient()
    const { light } = props
    const [ rateLimited, setRateLimited ] = useState(false)

    // Color hooks
    // TODO: Change color state hooks to useMutation.
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
    const debounceTimer = useRef(setTimeout(() => {}, 0))

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
        toast.dismiss()
        if (!loggedIn) {
            toast.error("You must be logged in to change brightness.")
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
                headers: { 'Content-Type': 'application/json', credentials: 'include' },
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
        if (loggedIn) {
            multiplayer.broadcastColorChange(light.id, inputColor)
        }
        clearTimeout(debounceTimer.current)
        const debounceWait = clickedSwatch.current ? 0 : 500

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
            updateGrabberColorText(inputColor)
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
                headers: { 'Content-Type': 'application/json', credentials: 'include' },
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
                setColor(color)
                throw new Error("Something went wrong when setting color.")
            }
        }
    }

    function updateGrabberColorText(inputColor: string) {
        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => {
            setGrabberColor(inputColor)
        }, 100)
    }

    // Lerp between current color displayed in the UI, and target color received from broadcast.
    // This helps smooth out the color change when multiple users are changing the color,
    // and with higher latency to the server, and also allows for using a lower socket update rate
    // while maintaining smooth UI movement.
    function lerpNetworkColorChange() {
        if (targetColor.current !== lerpedColor.current) {
            lerpedColor.current = lerpColorHex(lerpedColor.current, targetColor.current, NetworkConfig.lerpScale)
            setColor(lerpedColor.current)
        }
    }

    // TODO: It would be really nice to extract functions like this out of the component.
    function handleSocketUpdate(styleTimer: NodeJS.Timeout, update: MultiplayerMessage) {
        // Helps give a hint that another user is interacting with the light.
        if (cardFetchStyle !== cardStyles.fetchNewSync) {
            clearTimeout(styleTimer)
            setCardFetchStyle(cardStyles.fetchNewSync)
            setTimeout(() => setCardFetchStyle(cardStyles.fetchReset), 2000)
        }
        if (update.type === "brightness") {
            const num = Number(update.value)
            setBrightnessSliderValue(num)
            updateIllumination(num)
        }
        // Receiving color input changes will be lerped to smooth out transitions despite latency.
        else if (update.type === "color") {
            updateGrabberColorText(update.value)
            targetColor.current = update.value
            if (targetColor.current !== lerpedColor.current) {
                clearInterval(lerpColorInterval)
                lerpColorInterval = setInterval(lerpNetworkColorChange, NetworkConfig.lerpUpdateRate)
            }
        }
    }


    // Effect for managing UI sync with websocket updates from other users.
    // Throttles the updates according to the NetworkConfig.socketUpdateRate.
    // https://stackoverflow.com/a/66616016/13627106
    useEffect(() => {
        const ws = new WebSocket(websocketURL!)
        const commandBuffer: Set<newBroadcast> = new Set()
        let styleTimer = setTimeout(() => {}, 0)
        // Function for rate limiting the UI updates by building up commands in a buffer before processing.
        function flush() {
            if (commandBuffer.size === 0) return
            for (const update of commandBuffer) {
                // We don't need to process messages originating from ourselves.
                if (update.clientID === multiplayer.id) continue
                // Only worry about messages for the current light.
                if (update.device === light.id) {
                    handleSocketUpdate(styleTimer, update)
                }
            }
            commandBuffer.clear()
        }

        const flushInterval = setInterval(flush, NetworkConfig.socketUpdateRate)
        ws.onmessage = (event) => {
            // Keepalive pings don't need to be processed as commands, so don't add them to our data set.
            if (event.data === "pong") {
                return
            }
            if (event.data === "ping") {
                ws.send("pong")
                return
            }
            const command: newBroadcast = JSON.parse(event.data)
            commandBuffer.add(command)
        }
        ws.onclose = () => {
            ws.close()
        }

        return () => {
            clearInterval(flushInterval)
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

            <LightCardStatusHeader
                grabberColor={grabberColor}
                isLoading={brightnessMutation.isLoading}
                light={light}
                illuminating={illuminating}
                rateLimited={rateLimited}
            />

            <ColorPicker
                fullWidth={true}
                value={color}
                size="sm"
                // According to Mantine docs, onChangeEnd is supposed to exist on ColorPicker element but doesn't,
                // so we'll need to debounce in changeColor method.
                onChange={(inputColor) => changeColor(inputColor)}
                style={cardStyles.controlSurface}
                styles={cardStyles.colorPicker}
            />

            <SwatchesDisplay
                light={light}
                brightnessSliderValue={brightnessSliderValue}
                changeBrightness={(presetBrightness) => changeBrightness(presetBrightness)}
                changeColor={(presetColor) => changeColor(presetColor)}
                color={color}
                setBrightnessSliderValue={(presetBrightness: number) => setBrightnessSliderValue(presetBrightness)}
            />

            <BrightnessSlider
                light={light}
                brightnessSliderChanging={brightnessSliderChanging}
                brightnessSliderValue={brightnessSliderValue}
                setBrightnessSliderValue={(newValue: number) => setBrightnessSliderValue(newValue)}
                brightnessMutation={brightnessMutation}
            />

            {props.children}
            <LoginOverlay/>
        </Card>
    );
}