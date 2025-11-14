"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { PaletteMode } from '@mui/material'

type ColorModeContextValue = {
  mode: PaletteMode
  toggleMode: () => void
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined,
)

export const useColorMode = () => {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode deve ser usado dentro de AppThemeProvider')
  }
  return context
}

type Props = {
  children: ReactNode
}

const storageKey = 'appcep-theme'

export const AppThemeProvider = ({ children }: Props) => {
  const [mode, setMode] = useState<PaletteMode>('light')

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as PaletteMode | null
    if (stored === 'dark' || stored === 'light') {
      setMode(stored)
      document.documentElement.classList.toggle('dark', stored === 'dark')
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setMode(prefersDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      window.localStorage.setItem(storageKey, next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }, [])

  const colorContext = useMemo(
    () => ({
      mode,
      toggleMode,
    }),
    [mode, toggleMode],
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#2563eb' : '#93c5fd',
          },
          secondary: {
            main: '#f97316',
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#020617',
            paper: mode === 'light' ? '#ffffff' : '#0f172a',
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: 'var(--font-geist-sans), "Inter", system-ui, sans-serif',
        },
      }),
    [mode],
  )

  return (
    <ColorModeContext.Provider value={colorContext}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
