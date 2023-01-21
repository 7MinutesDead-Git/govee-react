import { useState, useEffect } from "react"

export function useWebsocket(url: string, callback: (event: MessageEvent) => void) {
    const [ws, setWs] = useState<WebSocket | null>(null)

    useEffect(() => {
        const ws = new WebSocket(url)
        setWs(ws)

        ws.onmessage = callback
        ws.onclose = () => {
            ws.close()
        }

        return () => {
            ws.close()
        }
    }, [url, callback])

    return ws
}