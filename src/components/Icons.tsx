// https://tabler-icons-react.vercel.app/
import { Bulb, BluetoothConnected, Refresh } from 'tabler-icons-react'

export function BulbIcon() {
    return <Bulb
        size={60}
        strokeWidth={1}
        color={'white'}
    />
}

export function BlueToothIcon() {
    return <BluetoothConnected
        size={60}
        strokeWidth={0.5}
        color={'white'}
    />
}

export function RefreshIcon() {
    return <Refresh
        size={20}
        strokeWidth={1}
        color={'white'}
    />;
}