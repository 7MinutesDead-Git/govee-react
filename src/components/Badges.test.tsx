import { render } from '@testing-library/react'
import { BadgeNetworkStatus } from './Badges'

test('Network badge component shows online text when online', () => {
    const { getByText } = render(<BadgeNetworkStatus online={true}/>)
    const badgeElement = getByText("Online")
    expect(badgeElement).toBeInTheDocument()
})

test('Network badge component shows offline text when offline', () => {
    const { getByText } = render(<BadgeNetworkStatus online={false}/>)
    const badgeElement = getByText("Offline")
    expect(badgeElement).toBeInTheDocument()
})