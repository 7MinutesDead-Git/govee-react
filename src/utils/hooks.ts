import { useState, useEffect } from "react"

// useState by setting and getting from localStorage.
export function useLocalStorageState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const [state, setState] = useState(() => {
        const valueInLocalStorage = localStorage.getItem(key)
        if (valueInLocalStorage) {
            return JSON.parse(valueInLocalStorage)
        }
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state))
    }, [key, state])

    return [state, setState]
}

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