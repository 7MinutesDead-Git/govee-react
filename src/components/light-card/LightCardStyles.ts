// in pixels
export const swatchSize = 60
const swatchCloseOffset = 0

export const cardStyles = {
    controlSurface: {
        padding: "1.5rem 0"
    },
    grippy: {
        height: "10rem",
        width: "10rem",
        background: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjNDAzYzNmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2U9IiMxZTI5MmQiPjwvcGF0aD4KPC9zdmc+")`
    },
    // https://mantine.dev/core/color-picker/?t=styles-api
    colorPicker: {
        swatchRoot: {
            root: {
                transition: "all 0.5s ease-in-out",
                "&:hover": {
                    zIndex: 1,
                    cursor: "pointer",
                    transition: "all 0.05s ease-in-out",
                    transform: "scale(1.1)",
                    filter: "brightness(1.5)",
                },
            }
        },
        swatches: {
            position: "relative" as "relative",
            top: "5px",
            padding: "0.1rem",
        },
        swatchesGrid: {
            padding: "0.2rem 0.5rem 0 0.5rem"
        },
        closeButton: {
            position: "relative" as "relative",
            top: `-${swatchSize + swatchCloseOffset}px`,
            zIndex: 1,
            textShadow: "0 0 1px #000",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
                transition: "all 0.05s ease-in-out",
                transform: "scale(1.1)",
            }
        },
        swatchBrightness: {
            color: "#fff",
            textShadow: "0 0 1px #000",
            fontSize: "0.8rem",
            fontWeight: "bold" as "bold",
        }
    },
    fetchSuccess: {
        animation: "success 0.5s ease-in-out",
        border: "1px solid #53ffb4",
    },
    fetchFailure: {
        animation: "failure 2s ease-in-out infinite",
        border: "1px solid #ff0000",
    },
    fetchNewSync: {
        animation: "",
        border: "1px solid #0091ff",
    },
    fetchReset: {
        animation: "",
        border: "1px solid #373a40",
    },
    card: {
        transition: "all 1s ease-in-out",
        backgroundColor: "#25262b",
        "&:hover": {
            transition: "all 0.1s ease-in-out",
            backgroundColor: "#6a0dff",
            color: "white",
        }
    },
    hexColorText: {
        padding: "0 0.25rem 0 0",
    },
    hexColorButton: {
        root: {
            filter: "brightness(1.45)",
        }
    }
}
