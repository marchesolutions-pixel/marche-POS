import { type HTMLAttributes } from 'react'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-800 text-white border-transparent',
  secondary: 'bg-slate-700 text-slate-100 border-transparent',
  destructive: 'bg-red-500 text-white border-transparent',
  outline: 'bg-transparent text-foreground border border-border',
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
