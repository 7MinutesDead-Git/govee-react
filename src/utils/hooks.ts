import { useState, useEffect } from "react"

// useState by setting and getting from localStorage.
export function useLocalStorageState(key: string, defaultValue: any) {
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