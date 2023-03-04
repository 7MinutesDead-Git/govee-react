import { ReactNode } from "react"

export enum h6003SupportedCommands {
    turn = "turn",
    brightness = "brightness",
    color = "color",
    colorTem = "colorTem"
}

export interface goveeCommandRequest {
    device: string,
    model: string,
    cmd: {
        name: string,
        value: string
    }
}

interface goveeResponse {
    code: number,
    message: string
}

export interface goveeCommandResponse extends goveeResponse {}

export interface goveeDevicesResponse extends goveeResponse {
    data: {
        devices: goveeDevice[]
    }
}

export interface goveeStateResponse extends goveeResponse {
    data: {
        device: string,
        model: string,
        properties: [
            { online: boolean | string },
            { powerState: "on" | "off" },
            { brightness: number },
            { color: { r: number, g: number, b: number } }
        ]
    }
}

export interface goveeStateProperties {
    online: boolean,
    powerState: "on" | "off",
    brightness: number,
    color: {
        r: number,
        g: number,
        b: number
    }
}

interface goveeDeviceID {
    device: string
}

export interface goveeDeviceDetails {
    model: string,
    deviceName: string,
    controllable: boolean,
    retrievable: boolean,
    supportCmds: string[],
    properties: {
        colorTem: {
            range: {
                min: number,
                max: number
            }
        }
    }
}
// Used for initial fetching of details from devices API.
// It was necessary to split out device key (ID) from the rest of the object details,
// so that later the device key (ID) could be used as the primary key for
// this data as well as subsequent state retrieved and stored as goveeDeviceState.
export interface goveeDevice extends goveeDeviceID, goveeDeviceDetails {}

// Used for storing subsequent fetching of device state from the state API,
// once the device ID has been determined.
export interface goveeDeviceWithState {
    id: string,
    details: goveeDeviceDetails,
    status: {
        online: boolean,
        powerState: "on" | "off",
        brightness: number,
        color?: {
            r: number,
            g: number,
            b: number
        },
        colorTem?: number,
        colorTemInKelvin?: number
    }
}

export interface rgbColor {
    r: number,
    g: number,
    b: number
}

export interface goveeDevicesMap {
    [id: string]: goveeDeviceWithState
}

// Useful for sorting lights alphabetically by name.
export interface goveeDeviceNameOnly {
    details: {
        deviceName: string
    }
}

export interface multiplayerBroadcast {
    device: string,
    type: string,
    value: string,
    clientID: string
}

export interface LightCardProps {
    light: goveeDeviceWithState,
    children?: ReactNode
}

export interface LightsGridProps {
    lights: goveeDeviceWithState[] | undefined,
    isLoading: boolean,
}

export interface Preset {
    color: string,
    brightness: number,
}

export interface LoginFormProps {
    loggedIn: boolean,
    setLoggedIn: (loggedIn: boolean) => void
}

export interface LoginFormValues {
    username: string,
    password: string,
}

export interface MultiplayerMessage {
    type: string,
    value: string
}
