import { CheckCircle2, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import type { SupportTicket } from '../types'
import { parseTicketsFile } from '../utils/csvParser'
import { requiredColumns } from '../utils/mockData'

type UploadProps = {
  onUpload: (tickets: SupportTicket[], fileName: string) => void
  lastImportedFile?: string
}

export function Upload({ onUpload, lastImportedFile }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    setIsParsing(true)
    setError(null)

    try {
      const result = await parseTicketsFile(file)
      onUpload(result.rows, result.fileName)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Não foi possível processar o arquivo.',
      )
    } finally {
      setIsParsing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          Importação de base
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Upload CSV ou Excel
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          O arquivo deve conter estritamente as colunas A até N definidas para os
          atendimentos. Após a leitura, o motor simula os scores dos 7 pilares.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article
          className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center shadow-soft"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            void handleFiles(event.dataTransfer.files)
          }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-primary">
            <UploadCloud size={30} />
          </div>
          <h3 className="mt-5 text-xl font-bold text-slate-950">
            Arraste o arquivo ou selecione manualmente
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Formatos aceitos: .csv e .xlsx. A validação impede colunas fora
            da ordem esperada.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isParsing}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-100 transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
          >
            <FileSpreadsheet size={18} />
            {isParsing ? 'Processando...' : 'Selecionar arquivo'}
          </button>

          {lastImportedFile && !error && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={16} />
              Último arquivo: {lastImportedFile}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-950">
            Estrutura obrigatória de colunas
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            O parser compara a ordem do cabeçalho antes de gerar as avaliações.
          </p>
          <div className="mt-5 grid gap-2">
            {requiredColumns.map((column, index) => (
              <div
                key={column}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-primary shadow-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-slate-700">{column}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
