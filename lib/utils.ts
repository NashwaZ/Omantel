import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shadow utility functions
 */
export const shadowTokens = {
  z1: "0 7px 8px 0 rgba(0,0,0,0.06), 0 5px 22px 4px rgba(0,0,0,0.04), 0 12px 17px 2px rgba(0,0,0,0.04)",
  z2: "0 1.620370388031006px 4.953703880310059px 0 rgba(0,0,0,0.02), 0 6.962963104248047px 12.29629611968994px 0 rgba(0,0,0,0.02), 0 16.75px 22.75px 0 rgba(0,0,0,0.02), 0 31.70370292663574px 37.03703689575195px 0 rgba(0,0,0,0.04), 0 52.54629516601562px 55.87963104248047px 0 rgba(0,0,0,0.06), 0 80px 80px 0 rgba(0,0,0,0.08)",
  bottom: "0 7px 8px 0 rgba(0,0,0,0.06), 0 0 22px 4px rgba(0,0,0,0.16), 0 12px 17px 2px rgba(0,0,0,0.04)",
  element: "0 2px 2px 0 rgba(0,0,0,0.08), 0 0 2px 0 rgba(0,0,0,0.12), 0 0 2px 0 rgba(0,0,0,0.04)",
}

/**
 * Get shadow style based on element hierarchy
 * @param level - The hierarchy level of the element (1-3)
 * @returns The appropriate shadow style
 */
export function getShadowByLevel(level: 1 | 2 | 3): string {
  switch (level) {
    case 1:
      return shadowTokens.element
    case 2:
      return shadowTokens.z1
    case 3:
      return shadowTokens.z2
    default:
      return shadowTokens.z1
  }
}
