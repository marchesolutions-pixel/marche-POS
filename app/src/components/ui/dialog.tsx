import { type HTMLAttributes, type ReactNode, useEffect } from 'react'

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, className = '', children, ...props }: DialogProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange?.(false)
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-8 bg-black/50 ${className}`} {...props}>
      <div className="absolute inset-0" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-y-auto">{children}</div>
    </div>
  )
}

export function DialogContent({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-3xl border border-border bg-card text-card-foreground shadow-xl p-6 ${className}`} {...props} />
  )
}

export function DialogHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-2 p-6 ${className}`} {...props} />
}

export function DialogTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-xl font-semibold ${className}`} {...props} />
}

export function DialogFooter({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center justify-end gap-3 p-6 ${className}`} {...props} />
}
