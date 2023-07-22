import { websocketURL } from "../../config"
import { v4 as uuid } from "uuid"
import { multiplayerBroadcast } from "../../interfaces/interfaces";

export const multiplayer = {
    // We use a unique ID per client so that a client won't respond to messages originating from itself
    // (eg, updating the UI). This should eliminate flickering, particularly when interacting with the
    // UI with higher latency to the server.
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
    // https://stackoverflow.com/a/24515576
    function sendPing() {
        try {
            if (multiplayer.client.readyState !== multiplayer.client.OPEN) {
                multiplayer.client.close()
                multiplayer.reconnect()
            }
            multiplayer.client.send("ping")
        }
        catch (error) {
            console.warn("There was an error sending a ping to the server: ", error)
            console.log("Closing the websocket and attempting to reconnect...")
            multiplayer.client.close()
            multiplayer.reconnect()
        }
    }
    setInterval(sendPing, 5000)
}
multiplayer.client.onclose = () => {
    console.log("Websocket closed. Reconnecting...")
    setTimeout(() => {
        multiplayer.reconnect()
    }, 500)
}
multiplayer.client.onerror = (error) => {
    console.error("There was a websocket error for the multiplayer connection: ", error)
    multiplayer.client.close()
    setTimeout(() => {
        console.log("Attempting to reconnect..")
        multiplayer.reconnect()
    }, 500)
}
