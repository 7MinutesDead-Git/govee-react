import { Toaster } from "react-hot-toast"

const toastStyles = {
    default: {
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        }
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
        <Toaster position="bottom-center" toastOptions={toastStyles.default}/>
    )
}