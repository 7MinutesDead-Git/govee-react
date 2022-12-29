import { websocketURL } from "../../config"
import { v4 as uuid } from "uuid"
import { multiplayerBroadcast } from "../../interfaces/interfaces";

export const multiplayer = {
    // We use a unique ID per client so that a client won't respond to messages originating from itself (eg, updating the UI).
    // This should eliminate flickering, particularly when interacting with the UI with higher latency to the server.
    id: uuid(),
    client: new WebSocket(websocketURL!),
    commandBuffer: new Set<multiplayerBroadcast>(),

    reconnect() {
        this.client = new WebSocket(websocketURL!)
    },

    broadcastBrightnessChange(id: string, sliderValue: number): void {
        const message = JSON.stringify({
            device: id,
            type: "brightness",
            value: sliderValue,
            clientID: this.id
        })
        this.client.send(message)
    },

    broadcastColorChange(id: string, colorValue: string): void {
        const message = JSON.stringify({
            device: id,
            type: "color",
            value: colorValue,
            clientID: this.id
        })
        this.client.send(message)
    },

    broadcastTemperatureChange(id: string, sliderValue: number): void {
        const message = JSON.stringify({
            device: id,
            type: "temperature",
            value: sliderValue,
            clientID: this.id
        })
        this.client.send(message)
    }
}

multiplayer.client.onopen = () => {
    console.log("Socket established.")
    try {
        setInterval(() => {
            if (multiplayer.client.readyState !== multiplayer.client.OPEN) {
                multiplayer.client.close()
                multiplayer.reconnect()
            }
            multiplayer.client.send("ping")
        }, 5000)
    }
    catch (error) {
        console.error("There was an error sending a ping to the server: ", error)
        multiplayer.client.close()
        multiplayer.reconnect()
    }
}
multiplayer.client.onclose = () => {
    console.log("Websocket closed. Reconnecting...")
    setTimeout(() => {
        multiplayer.reconnect()
    }, 1000)
}
multiplayer.client.onerror = (error) => {
    console.error("There was a websocket error for the multiplayer connection: ", error)
    multiplayer.client.close()
    setTimeout(() => {
        console.log("Attempting to reconnect..")
        multiplayer.reconnect()
    }, 1000)
}