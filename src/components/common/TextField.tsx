type Props = {
  label: string
  type?: string
} & React.InputHTMLAttributes<HTMLInputElement>

import React from 'react'

// named export
export function TextField({ label, type = 'text', ...rest }: Props) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        className="mt-1 block w-full px-3 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
        {...rest}
      />
    </label>
  )
}