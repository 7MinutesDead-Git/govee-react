import { websocketURL } from "../config"

export const multiplayer = {
    client: new WebSocket(websocketURL!),
    reconnect() {
        this.client = new WebSocket(websocketURL!)
    },
    broadcastBrightnessChange(id: string, sliderValue: number): void {
        const message = JSON.stringify({
            device: id,
            type: "brightness",
            value: sliderValue,
        })
        this.client.send(message)
    },

    broadcastColorChange(id: string, colorValue: string): void {
        const message = JSON.stringify({
            device: id,
            type: "color",
            value: colorValue,
        })
        this.client.send(message)
    },
}