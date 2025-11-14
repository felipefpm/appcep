"use client"

import { useCallback, useMemo, useState } from 'react'
import axios from 'axios'
import { z } from 'zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import SaveIcon from '@mui/icons-material/Save'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import { addressSchema, type AddressFormData } from '@/lib/addressSchema'

type FormErrors = Partial<Record<keyof AddressFormData, string>>
type Feedback =
  | {
      type: 'success' | 'error' | 'info'
      text: string
    }
  | null

const getEmptyForm = (): AddressFormData => ({
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
})

const formatCep = (value: string) => {
  if (!value) return ''
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

const mapValidationErrors = (issues: z.ZodIssue[]): FormErrors => {
  const nextErrors: FormErrors = {}
  issues.forEach((issue) => {
    const field = issue.path[0] as keyof AddressFormData
    if (field && !nextErrors[field]) {
      nextErrors[field] = issue.message
    }
  })
  return nextErrors
}

export const CepForm = () => {
  const [formData, setFormData] = useState<AddressFormData>(getEmptyForm())
  const [errors, setErrors] = useState<FormErrors>({})
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const sanitizedEstado = useMemo(
    () => formData.estado.toUpperCase(),
    [formData.estado],
  )

  const handleFieldChange = useCallback(
    (field: keyof AddressFormData, rawValue: string) => {
      let value = rawValue
      if (field === 'cep') {
        value = rawValue.replace(/\D/g, '').slice(0, 8)
      } else if (field === 'estado') {
        value = rawValue.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
      } else if (field === 'numero') {
        value = rawValue.replace(/[^0-9a-zA-Z-]/g, '').slice(0, 6)
      } else {
        value = rawValue.slice(0, 120)
      }

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
      setFeedback(null)
    },
    [],
  )

  const validateField = (field: keyof AddressFormData, value: string) => {
    const schema = addressSchema.shape[field]
    const result = schema.safeParse(value)
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }))
    return result.success
  }

  const handleCepBlur = async () => {
    if (formData.cep.length !== 8) {
      return
    }
    setIsFetchingCep(true)
    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${formData.cep}/json/`,
      )
      if (response.data?.erro) {
        setErrors((prev) => ({
          ...prev,
          cep: 'CEP não encontrado.',
        }))
        setFeedback({
          type: 'error',
          text: 'Não encontramos informações para este CEP.',
        })
        return
      }

      const filledFields: Partial<AddressFormData> = {
        logradouro: response.data?.logradouro ?? '',
        complemento: response.data?.complemento ?? '',
        bairro: response.data?.bairro ?? '',
        cidade: response.data?.localidade ?? '',
        estado: (response.data?.uf ?? '').toUpperCase(),
      }

      setFormData((prev) => ({
        ...prev,
        ...filledFields,
      }))
      setErrors((prev) => ({
        ...prev,
        logradouro: undefined,
        numero: undefined,
        complemento: undefined,
        bairro: undefined,
        cidade: undefined,
        estado: undefined,
      }))
      setFeedback({
        type: 'info',
        text: 'Campos preenchidos automaticamente com os dados do ViaCEP.',
      })
    } catch (error) {
      console.error('Erro ao buscar CEP', error)
      setFeedback({
        type: 'error',
        text: 'Não foi possível buscar o CEP. Tente novamente mais tarde.',
      })
    } finally {
      setIsFetchingCep(false)
    }
  }

  const handleClear = () => {
    setFormData(getEmptyForm())
    setErrors({})
    setFeedback(null)
  }

  const handleSave = async () => {
    setFeedback(null)
    const parsed = addressSchema.safeParse({
      ...formData,
      estado: sanitizedEstado,
    })

    if (!parsed.success) {
      setErrors(mapValidationErrors(parsed.error.issues))
      setFeedback({
        type: 'error',
        text: 'Revise os campos destacados antes de salvar.',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message ?? 'Erro ao salvar os dados.')
      }
      setFeedback({
        type: 'success',
        text: 'Endereço salvo com sucesso!',
      })
    } catch (error) {
      console.error('Erro ao salvar', error)
      setFeedback({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar os dados.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Paper
      elevation={0}
      className="border border-slate-200/70 bg-white/90 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
      sx={{ p: { xs: 3, md: 5 } }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Dados do endereço
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha o formulário abaixo para buscar e salvar as informações do
            endereço.
          </Typography>
        </Box>

        {feedback && (
          <Alert
            severity={feedback.type}
            onClose={() => setFeedback(null)}
            role="status"
          >
            {feedback.text}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CEP"
              placeholder="00000-000"
              value={formatCep(formData.cep)}
              onChange={(event) => handleFieldChange('cep', event.target.value)}
              onBlur={() => {
                validateField('cep', formData.cep)
                void handleCepBlur()
              }}
              error={Boolean(errors.cep)}
              helperText={errors.cep ?? 'Digite somente números'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isFetchingCep ? (
                      <CircularProgress size={20} />
                    ) : (
                      <TravelExploreIcon fontSize="small" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Logradouro"
              value={formData.logradouro}
              onChange={(event) =>
                handleFieldChange('logradouro', event.target.value)
              }
              onBlur={() => validateField('logradouro', formData.logradouro)}
              error={Boolean(errors.logradouro)}
              helperText={errors.logradouro ?? 'Ex: Avenida Paulista'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Número"
              value={formData.numero}
              onChange={(event) =>
                handleFieldChange('numero', event.target.value)
              }
              onBlur={() => validateField('numero', formData.numero)}
              error={Boolean(errors.numero)}
              helperText={errors.numero ?? 'Informe o número do endereço'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Complemento"
              value={formData.complemento}
              onChange={(event) =>
                handleFieldChange('complemento', event.target.value)
              }
              onBlur={() => validateField('complemento', formData.complemento)}
              error={Boolean(errors.complemento)}
              helperText={errors.complemento ?? 'Apartamento, bloco, etc.'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bairro"
              value={formData.bairro}
              onChange={(event) =>
                handleFieldChange('bairro', event.target.value)
              }
              onBlur={() => validateField('bairro', formData.bairro)}
              error={Boolean(errors.bairro)}
              helperText={errors.bairro ?? 'Informe o bairro'}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Cidade"
              value={formData.cidade}
              onChange={(event) =>
                handleFieldChange('cidade', event.target.value)
              }
              onBlur={() => validateField('cidade', formData.cidade)}
              error={Boolean(errors.cidade)}
              helperText={errors.cidade ?? 'Informe a cidade'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Estado"
              placeholder="UF"
              value={sanitizedEstado}
              onChange={(event) =>
                handleFieldChange('estado', event.target.value)
              }
              onBlur={() => validateField('estado', sanitizedEstado)}
              error={Boolean(errors.estado)}
              helperText={errors.estado ?? 'Use a sigla ex: SP'}
              inputProps={{ maxLength: 2 }}
            />
          </Grid>
        </Grid>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="flex-end"
          spacing={2}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClear}
            startIcon={<CleaningServicesIcon />}
          >
            Limpar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
