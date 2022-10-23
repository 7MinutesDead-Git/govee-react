import { websocketURL } from "../config"
import { v4 as uuid } from "uuid"
import { newBroadcast } from "../interfaces/interfaces";

export const multiplayer = {
    // We use a unique ID per client so that a client won't respond to messages originating from itself (eg, updating the UI).
    // This should eliminate flickering, particularly when interacting with the UI with higher latency to the server.
    id: uuid(),
    client: new WebSocket(websocketURL!),
    commandBuffer: new Set<newBroadcast>(),
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
}