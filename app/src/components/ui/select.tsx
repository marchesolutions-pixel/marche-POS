import { createContext, useContext, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'

type SelectContextValue = {
  value: string
  open: boolean
  setOpen: (open: boolean) => void
  onValueChange: (value: string) => void
  disabled?: boolean
}

const SelectContext = createContext<SelectContextValue | null>(null)

interface SelectProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  disabled?: boolean
}

export function Select({ value, onValueChange, children, className = '', disabled = false, ...props }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`} {...props}>
      <SelectContext.Provider
        value={{ value, open, setOpen, onValueChange, disabled }}
      >
        {children}
      </SelectContext.Provider>
    </div>
  )
}

interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function SelectTrigger({ className = '', children, ...props }: SelectTriggerProps) {
  const context = useContext(SelectContext)
  if (!context) return null

  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded-xl border border-border bg-input px-3 py-2 text-left text-sm text-foreground shadow-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${className}`}
      onClick={() => !context.disabled && context.setOpen(!context.open)}
      disabled={context.disabled}
      {...props}
    >
      {children}
    </button>
  )
}

interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
  children?: ReactNode
}

export function SelectValue({ className = '', placeholder, children, ...props }: SelectValueProps) {
  const context = useContext(SelectContext)
  if (!context) return null

  return (
    <span className={`truncate ${className}`} {...props}>
      {context.value || placeholder || children}
    </span>
  )
}

interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function SelectContent({ className = '', children, ...props }: SelectContentProps) {
  const context = useContext(SelectContext)
  if (!context || !context.open) return null

  return (
    <div className={`absolute z-40 mt-1 min-w-full overflow-hidden rounded-3xl border border-border bg-card shadow-lg ${className}`} {...props}>
      {children}
    </div>
  )
}

interface SelectItemProps extends HTMLAttributes<HTMLButtonElement> {
  value: string
  children: ReactNode
}

export function SelectItem({ className = '', value, children, ...props }: SelectItemProps) {
  const context = useContext(SelectContext)
  if (!context) return null

  return (
    <button
      type="button"
      className={`w-full text-left px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent ${className}`}
      onClick={() => {
        context.onValueChange(value)
        context.setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}
