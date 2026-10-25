import { CloudUpload } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Dropzone({
  accept,
  hint,
  fileName,
  hover,
  error,
  onFile,
  onHover,
}: {
  accept: string
  hint: string
  fileName: string
  hover: boolean
  error: string
  onFile: (file: File) => void
  onHover: (v: boolean) => void
}) {
  return (
    <label
      className={cn(
        'block cursor-pointer rounded-[10px] border border-dashed px-5 py-8 text-center transition-colors',
        hover ? 'border-primaria bg-destaque' : 'border-borda-forte bg-superficie-2',
        error && 'border-erro',
      )}
      onDragEnter={(e) => { e.preventDefault(); onHover(true) }}
      onDragOver={(e) => { e.preventDefault(); onHover(true) }}
      onDragLeave={(e) => { e.preventDefault(); onHover(false) }}
      onDrop={(e) => {
        e.preventDefault()
        onHover(false)
        const file = e.dataTransfer.files[0]
        if (file) onFile(file)
      }}
    >
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-borda-forte bg-superficie text-primaria">
        <CloudUpload size={18} />
      </span>
      <p className="text-[14px] font-semibold">{fileName || 'Arraste o arquivo ou clique para escolher'}</p>
      <p className="t-apoio mt-1 text-texto-secundario">{hint}</p>
      <input
        type="file"
        className="sr-only"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
      {error ? <p className="t-body mt-3 text-erro">{error}</p> : null}
    </label>
  )
}
