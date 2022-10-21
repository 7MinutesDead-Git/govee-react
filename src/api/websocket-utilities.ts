import { websocketURL } from "../config"
import {v4 as uuid} from "uuid"

export const multiplayer = {
    // generate unique ID per client so that a client doesn't listen for messages originating from itself.
    // This should eliminate flickering when interacting with the UI with higher latency.
    id: uuid(),
    client: new WebSocket(websocketURL!),
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