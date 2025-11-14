"use client"

import { IconButton, Tooltip } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useColorMode } from '@/providers/theme'

export const ThemeToggle = () => {
  const { mode, toggleMode } = useColorMode()

  return (
    <Tooltip
      title={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      <IconButton
        color="primary"
        onClick={toggleMode}
        className="bg-white/70 text-slate-900 shadow-lg backdrop-blur dark:bg-slate-800/90 dark:text-slate-100"
        aria-label="Alternar tema"
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  )
}
