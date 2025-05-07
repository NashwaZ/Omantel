import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SpacingExamples() {
  return (
    <div className="p-4xl">
      <h2 className="text-heading-2xl-700 mb-2xl">Spacing Token Examples</h2>

      <Card className="mb-4xl">
        <CardHeader>
          <CardTitle>Margin Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-xl">
            <div className="bg-hayyak-light p-m">
              <div className="bg-hayyak text-white p-m mb-none">margin-bottom: none (0px)</div>
            </div>

            <div className="bg-hayyak-light p-m">
              <div className="bg-hayyak text-white p-m mb-xs">margin-bottom: xs (4px)</div>
            </div>

            <div className="bg-hayyak-light p-m">
              <div className="bg-hayyak text-white p-m mb-m">margin-bottom: m (8px)</div>
            </div>

            <div className="bg-hayyak-light p-m">
              <div className="bg-hayyak text-white p-m mb-xl">margin-bottom: xl (16px)</div>
            </div>

            <div className="bg-hayyak-light p-m">
              <div className="bg-hayyak text-white p-m mb-3xl">margin-bottom: 3xl (24px)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4xl">
        <CardHeader>
          <CardTitle>Padding Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-xl">
            <div className="bg-hayyak-light border border-dashed border-hayyak">
              <div className="bg-hayyak text-white p-none">padding: none (0px)</div>
            </div>

            <div className="bg-hayyak-light border border-dashed border-hayyak">
              <div className="bg-hayyak text-white p-s">padding: s (6px)</div>
            </div>

            <div className="bg-hayyak-light border border-dashed border-hayyak">
              <div className="bg-hayyak text-white p-l">padding: l (12px)</div>
            </div>

            <div className="bg-hayyak-light border border-dashed border-hayyak">
              <div className="bg-hayyak text-white p-2xl">padding: 2xl (20px)</div>
            </div>

            <div className="bg-hayyak-light border border-dashed border-hayyak">
              <div className="bg-hayyak text-white p-4xl">padding: 4xl (32px)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gap Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2xl">
            <div>
              <p className="mb-m">gap: xs (4px)</p>
              <div className="flex flex-wrap gap-xs">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-hayyak flex items-center justify-center text-white">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-m">gap: m (8px)</p>
              <div className="flex flex-wrap gap-m">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-hayyak flex items-center justify-center text-white">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-m">gap: xl (16px)</p>
              <div className="flex flex-wrap gap-xl">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-hayyak flex items-center justify-center text-white">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-m">gap: 3xl (24px)</p>
              <div className="flex flex-wrap gap-3xl">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-hayyak flex items-center justify-center text-white">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
