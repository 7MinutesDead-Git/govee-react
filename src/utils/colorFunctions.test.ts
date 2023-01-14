import {hexToRGB, lerpColorRGB, rgbToHex} from './colorFunctions'

const whiteRGB = { r: 255, g: 255, b: 255 }
const blackRGB = { r: 0, g: 0, b: 0 }
const blueRGB = { r: 0, g: 0, b: 255 }

test('converts a hex string to an RGB object', () => {
    expect(hexToRGB('#0000FF')).toEqual(blueRGB)
    expect(hexToRGB('#0000ff')).toEqual(blueRGB)
    expect(hexToRGB('#FFFFFF')).toEqual(whiteRGB)
    expect(hexToRGB('#000000')).toEqual(blackRGB)
    expect(hexToRGB("#123456")).toEqual({ r: 18, g: 52, b: 86 })
    expect(hexToRGB("#123")).toEqual({ r: 17, g: 34, b: 51 })
    expect(hexToRGB("111")).toEqual({ r: 17, g: 17, b: 17 })
});