import WS from "jest-websocket-mock"
import { render, cleanup } from "@testing-library/react"
import { useWebsocket } from "./useWebsocket"

describe("useWebsocket", () => {
    afterEach(() => {
        WS.clean()
        cleanup()
    })

    it("should instantiate a websocket connection", async () => {
        const callback = jest.fn()
        const url = "ws://localhost:1234"
        const server = new WS(url)

        const TestComponent = () => {
            const ws = useWebsocket(url, callback)
            return null
        }

        render(<TestComponent />)

        await server.connected

        server.send("hello")

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ data: "hello" })
        )
    })
})