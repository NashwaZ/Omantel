"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  success?: boolean
  icon?: React.ReactNode
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, type, error, success, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [isTouched, setIsTouched] = React.useState(false)

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-md border border-thin border-hayyak-dark-grey bg-hayyak-white px-l py-m text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            // Increase touch target size on mobile
            "min-h-[44px] text-base sm:text-sm",
            // Hover state - orange border
            "hover:border-[#ff7800]",
            // Focus state - orange border with left accent
            isFocused && "border-[#ea6e00] border-l-thick pl-[calc(0.75rem-1px)]",
            // Success state - green border
            success && "border-green-500",
            // Error state - red border
            error && "border-red-500",
            "font-sans text-base",
            className,
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            setIsTouched(true)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {/* Error message */}
        {error && <p className="mt-xs text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)
CustomInput.displayName = "CustomInput"

export { CustomInput }
