import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'

function renderAt(path = '/') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('navigation', () => {
  it.each([
    ['/', 'Dashboard'],
    ['/portfolio', 'Portfolio'],
    ['/transactions', 'Transactions'],
    ['/scenario-book', 'Scenario Book'],
    ['/orders', 'Orders'],
    ['/scanner', 'Scanner'],
    ['/settings', 'Settings'],
  ])('shows the screen for %s and marks it as current', async (path, title) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const current = within(nav).getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page')
    expect(current.map((link) => link.textContent)).toEqual([title])
  })

  it('opens a screen from the sidebar', async () => {
    renderAt()
    await userEvent.click(screen.getByRole('link', { name: 'Orders' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument()
  })

  it('offers a way back from an unknown address', async () => {
    renderAt('/unknown')
    expect(await screen.findByText('This page does not exist.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Go to the Dashboard' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
  })

  it('shows the disclaimer on every screen', async () => {
    renderAt('/orders')
    expect(
      await screen.findByText('InferenceOS is a planning and tracking tool, not investment advice.'),
    ).toBeInTheDocument()
  })
})

describe('top bar', () => {
  it('switches the display currency', async () => {
    renderAt()
    const usd = screen.getByRole('button', { name: 'USD' })
    const ils = screen.getByRole('button', { name: 'ILS' })
    expect(usd).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(ils)
    expect(ils).toHaveAttribute('aria-pressed', 'true')
    expect(usd).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps the selected portfolio when the screen changes', async () => {
    renderAt()
    await userEvent.selectOptions(screen.getByLabelText('Portfolio'), 'Long-term')
    await userEvent.click(screen.getByRole('link', { name: 'Scanner' }))
    await screen.findByRole('heading', { level: 1, name: 'Scanner' })
    expect(screen.getByLabelText('Portfolio')).toHaveDisplayValue('Long-term')
  })
})

describe('Scenario Book scope', () => {
  it('asks for one portfolio in the Total view and opens after choosing', async () => {
    renderAt('/scenario-book')
    expect(await screen.findByText('Scenario Book works on one portfolio at a time.')).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Choose a portfolio'), 'Retirement')
    expect(screen.getByText('No buy ladders yet.')).toBeInTheDocument()
    expect(screen.getByLabelText('Portfolio')).toHaveDisplayValue('Retirement')
  })
})
