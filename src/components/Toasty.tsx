import { Toaster, ToastBar, toast } from "react-hot-toast"
import { intervals } from "../config"

const toastStyles = {
    default: {
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            userSelect: 'none' as 'none',
        },
        duration: intervals.twoSeconds,
    },
    error: {
        style: {
            backgroundColor: "#e11d6d",
            color: "#fff",
        }
    }
}
const containerStyle = {
    top: 72,
}
export const Toasty = () => {
    return (
        <Toaster toastOptions={toastStyles.default} containerStyle={containerStyle}>
            {(t) => (
                <div onClick={() => toast.dismiss(t.id)}>
                    <ToastBar toast={t}>
                        {({ icon, message }) => (
                            <>
                                {icon}
                                {message}
                            </>
                        )}
                    </ToastBar>
                </div>
            )}
        </Toaster>
    )
}