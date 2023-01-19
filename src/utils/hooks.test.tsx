import { render, act, fireEvent } from "@testing-library/react"
import React from "react"
import { useLocalStorageState } from "./hooks"

function LocalStorageTestComponent() {
    const [value, setValue] = useLocalStorageState("key", "default value")

    return (
        <div>
            <p data-testid="value">{value}</p>
            <button data-testid="button" onClick={() => setValue("new value")}>
                Set value
            </button>
        </div>
    )
}