export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validate?: (value: string) => boolean | string
}

export const validateField = (value: string, rules: ValidationRule, fieldName: string): string | null => {
  if (rules.required && !value) {
    return `${fieldName} is required`
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName} must be less than ${rules.maxLength} characters`
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return `Please enter a valid ${fieldName.toLowerCase()}`
  }

  if (rules.validate) {
    const result = rules.validate(value)
    if (typeof result === "string") {
      return result
    } else if (!result) {
      return `Invalid ${fieldName.toLowerCase()}`
    }
  }

  return null
}
