import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { CsvTicketRow, UploadResult } from '../types'
import { mapRowToTicket, requiredColumns } from './mockData'

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .replace(/^\uFEFF/, '')
    .trim()

const isBlankRow = (row: Record<string, unknown>) =>
  requiredColumns.every((column) => String(row[column] ?? '').trim() === '')

const validateHeaders = (headers: string[]) => {
  const normalizedHeaders = headers.map(normalizeHeader)
  const expected = [...requiredColumns]
  const hasSameLength = normalizedHeaders.length === expected.length
  const hasSameOrder = expected.every(
    (column, index) => normalizedHeaders[index] === column,
  )

  if (!hasSameLength || !hasSameOrder) {
    throw new Error(
      `Arquivo inválido. As colunas devem seguir estritamente A-N: ${expected.join(
        ' | ',
      )}.`,
    )
  }
}

const toTicketRows = (rows: Record<string, unknown>[]): CsvTicketRow[] =>
  rows
    .filter((row) => !isBlankRow(row))
    .map((row) =>
      requiredColumns.reduce((ticketRow, column) => {
        return {
          ...ticketRow,
          [column]: row[column] ?? '',
        }
      }, {} as CsvTicketRow),
    )

const parseCsv = (file: File) =>
  new Promise<UploadResult>((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (result) => {
        try {
          validateHeaders(result.meta.fields ?? [])

          resolve({
            fileName: file.name,
            rows: toTicketRows(result.data).map(mapRowToTicket),
          })
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => reject(error),
    })
  })

const parseWorkbook = async (file: File): Promise<UploadResult> => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    defval: '',
  })

  const [headerRow = [], ...bodyRows] = matrix
  validateHeaders(headerRow.map(normalizeHeader))

  const data = bodyRows.map((row) =>
    requiredColumns.reduce<Record<string, unknown>>((record, column, index) => {
      record[column] = row[index] ?? ''
      return record
    }, {}),
  )

  return {
    fileName: file.name,
    rows: toTicketRows(data).map(mapRowToTicket),
  }
}

export const parseTicketsFile = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'csv') {
    return parseCsv(file)
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return parseWorkbook(file)
  }

  return Promise.reject(
    new Error('Formato não suportado. Envie um arquivo CSV, XLS ou XLSX.'),
  )
}
