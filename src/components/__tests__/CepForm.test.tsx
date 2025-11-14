import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { CepForm } from '../CepForm'
import { AppThemeProvider } from '@/providers/theme'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

const renderForm = () =>
  render(
    <AppThemeProvider>
      <CepForm />
    </AppThemeProvider>,
  )

beforeEach(() => {
  mockedAxios.get.mockReset()
  mockedAxios.get.mockResolvedValue({ data: {} } as never)
  global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>
  window.localStorage.clear()
})

describe('CepForm', () => {
  it('valida o CEP e limpa os campos', async () => {
    renderForm()
    const cepInput = screen.getByLabelText(/cep/i)
    await userEvent.type(cepInput, '1234')
    await userEvent.tab()

    expect(
      await screen.findByText(/CEP com 8 dígitos/i),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /limpar/i }))
    expect((cepInput as HTMLInputElement).value).toBe('')
  })

  it('preenche automaticamente quando o CEP é encontrado', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        logradouro: 'Praça da Sé',
        complemento: 'Lado ímpar',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
      },
    })
    renderForm()

    const cepInput = screen.getByLabelText(/cep/i)
    await userEvent.type(cepInput, '01001000')
    await userEvent.tab()

    await waitFor(() =>
      expect(
        screen.getByDisplayValue('Praça da Sé'),
      ).toBeInTheDocument(),
    )
    expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('SP')).toBeInTheDocument()
  })

  it('salva os dados com sucesso', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Endereço salvo com sucesso.' }),
    } as Response)

    renderForm()
    await userEvent.type(screen.getByLabelText(/cep/i), '12345678')
    await userEvent.type(screen.getByLabelText(/logradouro/i), 'Rua Teste')
    await userEvent.type(screen.getByLabelText(/número/i), '321')
    await userEvent.type(screen.getByLabelText(/complemento/i), 'Casa')
    await userEvent.type(screen.getByLabelText(/bairro/i), 'Centro')
    await userEvent.type(screen.getByLabelText(/cidade/i), 'TesteCity')
    await userEvent.type(screen.getByLabelText(/estado/i), 'sp')

    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/salvar',
        expect.objectContaining({
          method: 'POST',
        }),
      ),
    )

    expect(
      await screen.findByText(/Endereço salvo com sucesso/i),
    ).toBeInTheDocument()
  })
})
