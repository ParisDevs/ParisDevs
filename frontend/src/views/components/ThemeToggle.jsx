import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

export function ThemeToggle({ className, variant = 'icon' }) {
  const { config, saveConfig } = useAppViewModel()
  const dark = config.theme === 'dark'

  function setTheme(theme) {
    saveConfig({ theme })
  }

  if (variant === 'segment') {
    return (
      <div className={cn('grid grid-cols-2 gap-1 rounded-[10px] border border-borda-forte bg-superficie-2 p-1', className)}>
        <button
          type="button"
          className={cn(
            't-button inline-flex h-9 items-center justify-center gap-2 rounded-[8px] px-3',
            !dark ? 'bg-superficie text-texto shadow-card' : 'text-texto-secundario hover:text-texto',
          )}
          onClick={() => setTheme('light')}
          aria-pressed={!dark}
        >
          <Sun size={14} />
          Claro
        </button>
        <button
          type="button"
          className={cn(
            't-button inline-flex h-9 items-center justify-center gap-2 rounded-[8px] px-3',
            dark ? 'bg-superficie text-texto shadow-card' : 'text-texto-secundario hover:text-texto',
          )}
          onClick={() => setTheme('dark')}
          aria-pressed={dark}
        >
          <Moon size={14} />
          Escuro
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2',
        className,
      )}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? 'Usar tema claro' : 'Usar tema escuro'}
      aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
