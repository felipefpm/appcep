import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { addressSchema } from '@/lib/addressSchema'
import { ZodError } from 'zod'

const dataDir = path.join(process.cwd(), 'data')
const dataFile = path.join(dataDir, 'saved-addresses.json')

const ensureDataFile = async () => {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(dataFile)
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf-8')
  }
}

const readAddresses = async () => {
  await ensureDataFile()
  const fileContent = await fs.readFile(dataFile, 'utf-8')
  return JSON.parse(fileContent) as Array<Record<string, unknown>>
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = addressSchema.parse(payload)
    const addresses = await readAddresses()
    const entry = { ...parsed, savedAt: new Date().toISOString() }
    addresses.push(entry)
    await fs.writeFile(dataFile, JSON.stringify(addresses, null, 2), 'utf-8')
    return NextResponse.json({ message: 'Endereço salvo com sucesso.' })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }
    console.error('Erro ao salvar endereço', error)
    return NextResponse.json(
      { message: 'Erro ao salvar o endereço.' },
      { status: 500 },
    )
  }
}
