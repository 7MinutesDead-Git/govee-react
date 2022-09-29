enum h6003SupportedCommands {
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

export interface goveeCommandResponse {
    code: number,
    message: string,
    data: {}
}

export interface goveeDevicesResponse {
    code: number,
    message: string,
    data: {
        devices: goveeDevice[]
    }
}

export interface goveeDevice {
    device: string,
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