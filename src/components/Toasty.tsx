import { Toaster, ToastBar, toast } from "react-hot-toast"
import { intervals } from "../utils/constants"


const toastStyles = {
    default: {
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            userSelect: 'none' as const,
        },
        duration: intervals.twoSeconds,
        success: {
            iconTheme: {
                primary: "#53ffb4",
                secondary: "#4f575a",
            }
        },
        error: {
            style: {
                backgroundColor: "#e11d6d",
                color: "#fff",
            },
            iconTheme: {
                primary: "#fff",
                secondary: "#e11d6d",
            }
        },
    },
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