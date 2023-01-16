import {hexToRGB, isRGBColor, lerpColorRGB, rgbToHex} from './colorFunctions'

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
})

test('Throws an error if the hex string is invalid', () => {
    expect(() => hexToRGB("#1234567")).toThrowError()
    expect(() => hexToRGB("#12345")).toThrowError()
    expect(() => hexToRGB("#1234")).toThrowError()
    expect(() => hexToRGB("#12")).toThrowError()
    expect(() => hexToRGB("0")).toThrowError()
})

test('converts an RGB object to a hex string', () => {
    expect(rgbToHex(blueRGB)).toEqual('#0000ff')
    expect(rgbToHex(whiteRGB)).toEqual('#ffffff')
    expect(rgbToHex(blackRGB)).toEqual('#000000')
    expect(rgbToHex({ r: 18, g: 52, b: 86 })).toEqual('#123456')
    expect(rgbToHex({ r: 17, g: 34, b: 51 })).toEqual('#112233')
    expect(rgbToHex({ r: 17, g: 17, b: 17 })).toEqual('#111111')
})

test('linearly interpolates between two RGB colors', () => {

    expect(lerpColorRGB(blackRGB, whiteRGB, 0.5)).toEqual(
        { r: 128, g: 128, b: 128 }
    )
    expect(lerpColorRGB(blackRGB, whiteRGB, 1)).toEqual(
        { r: 255, g: 255, b: 255 }
    )
    expect(lerpColorRGB(blackRGB, whiteRGB, 0)).toEqual(
        { r: 0, g: 0, b: 0 }
    )

    // https://meyerweb.com/eric/tools/color-blend/#123456:DDEA0F:1:hex
    const deepBlue = hexToRGB('#123456')
    const boogerYellow = hexToRGB('#DDEA0F')
    expect(lerpColorRGB(deepBlue, boogerYellow, 0.5)).toEqual(hexToRGB("#788f33"))
})

test('linearly interpolates between two hex colors', () => {
    expect(rgbToHex(lerpColorRGB(blackRGB, whiteRGB, 0.5))).toEqual('#808080')
    expect(rgbToHex(lerpColorRGB(blackRGB, whiteRGB, 1))).toEqual('#ffffff')
    expect(rgbToHex(lerpColorRGB(blackRGB, whiteRGB, 0))).toEqual('#000000')

    // https://meyerweb.com/eric/tools/color-blend/#123456:DDEA0F:1:hex
    const deepBlue = hexToRGB('#123456')
    const boogerYellow = hexToRGB('#DDEA0F')
    expect(rgbToHex(lerpColorRGB(deepBlue, boogerYellow, 0.5))).toEqual('#788f33')
})

test('Check if a input is an rgbColor object', () => {
    expect(isRGBColor(blueRGB)).toBe(true)
    expect(isRGBColor("#123456")).toBe(false)
})