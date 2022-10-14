import { Toaster } from "react-hot-toast"
import { intervals } from "../config"

const toastStyles = {
    default: {
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        },
        duration: intervals.fiveSeconds,
    },
    error: {
        style: {
            backgroundColor: "#e11d6d",
            color: "#fff",
        }
    }
}
export const Toasty = () => {
    return (
        <Toaster position="top-center" toastOptions={toastStyles.default}/>
    )
}