import { type ButtonHTMLAttributes, type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  asChild?: boolean
  children: ReactNode
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-slate-800 text-white hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-primary/50',
  secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:ring-2 focus-visible:ring-primary/50',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-destructive/50',
  outline: 'border border-border bg-transparent text-foreground hover:bg-slate-950/10 focus-visible:ring-2 focus-visible:ring-primary/50',
  ghost: 'bg-transparent text-foreground hover:bg-slate-950/10 focus-visible:ring-2 focus-visible:ring-primary/50',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
  icon: 'p-2',
}

export function Button({ className = '', variant = 'default', size = 'md', asChild = false, children, disabled, ...props }: ButtonProps) {
  const classes = `${variantClasses[variant]} ${sizeClasses[size]} inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${className}`

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; disabled?: boolean }>
    return cloneElement(child, {
      className: `${classes} ${child.props.className ?? ''}`,
      disabled: disabled || child.props.disabled,
      ...props,
    } as any)
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
