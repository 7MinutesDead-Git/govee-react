// in pixels
export const swatchSize = 60
const swatchCloseOffset = 0

export const cardStyles = {
    controlSurface: {
        padding: "1.5rem 0"
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
    },
    fetchFailure: {
        animation: "failure 2s ease-in-out infinite",
    },
    fetchNewSync: {
        animation: "newSync 4s ease-in-out infinite",
    },
    fetchReset: {
        animation: "",
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
}