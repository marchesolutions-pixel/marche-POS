import { type HTMLAttributes } from 'react'

export function Separator({ className = '', ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={`border-border my-4 ${className}`} {...props} />
}
