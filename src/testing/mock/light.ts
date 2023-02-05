import {goveeDeviceDetails, goveeDeviceWithState} from "../../interfaces/interfaces";

export const dummyLight: goveeDeviceWithState = {
    details: {
        "device": "0c:90:7c:a6:b0:3a:18:83",
        "model": "H6003",
        "deviceName": "Corner Lamp",
        "controllable": true,
        "retrievable": true,
        "supportCmds": [
            "turn",
            "brightness",
            "color",
            "colorTem"
        ],
        "properties": {
            "colorTem": {
                "range": {
                    "min": 2000,
                    "max": 9000
                }
            }
        }
    } as goveeDeviceDetails,
    id: "0c:90:7c:a6:b0:3a:18:83",
    status: {
        "online": true,
        "powerState": "on",
        "brightness": 50,
        "color": {
            "r": 255,
            "b": 0,
            "g": 42
        }
    }
}