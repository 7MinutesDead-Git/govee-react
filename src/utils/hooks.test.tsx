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

describe("useLocalStorageState", () => {
    it("should retrieve the value from localStorage if it exists", () => {
        // Arrange
        localStorage.setItem("key", JSON.stringify("stored value"))
        // Act
        const { getByTestId } = render(<LocalStorageTestComponent />)
        // Assert
        expect(getByTestId("value").textContent).toBe("stored value")
    })
    it("should set the default value if the value does not exist in localStorage", () => {
        localStorage.removeItem("key")
        const { getByTestId } = render(<LocalStorageTestComponent />)
        expect(getByTestId("value").textContent).toBe("default value")
    })
})
