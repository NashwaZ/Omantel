import { SpacingExamples } from "@/components/spacing-examples"
import { BorderExamples } from "@/components/border-examples"

export default function DesignTokensPage() {
  return (
    <div className="container mx-auto py-6xl">
      <h1 className="text-display-l-800 mb-4xl">Design Tokens</h1>
      <p className="text-paragraph-l-400 mb-6xl">
        This page demonstrates the implementation of design tokens for spacing and border widths across the application.
        These tokens ensure consistent spacing and border widths throughout the UI.
      </p>

      <SpacingExamples />

      <div className="my-6xl"></div>

      <BorderExamples />
    </div>
  )
}
