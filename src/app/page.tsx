'use client'

import { Container, Stack, Typography, Chip, Box } from '@mui/material'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CepForm } from '@/components/CepForm'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl dark:bg-blue-500/20" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-500/20" />
      </div>

      <Container maxWidth="md" className="relative z-10 py-16">
        <Stack spacing={4}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={3}
          >
            <Box>
              <Chip
                label="Consulta instantânea de CEP"
                color="primary"
                variant="outlined"
                className="mb-4"
              />
              <Typography
                variant="h3"
                component="h1"
                fontWeight={700}
                gutterBottom
                className="text-slate-900 dark:text-slate-100"
              >
                AppCEP
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={540}>
                Busque endereços automaticamente pela API do ViaCEP e salve tudo localmente em um clique.
                Com um visual moderno e suporte a temas claro e escuro.
              </Typography>
            </Box>
            <ThemeToggle />
          </Stack>

          <CepForm />
        </Stack>
      </Container>
    </main>
  )
}
