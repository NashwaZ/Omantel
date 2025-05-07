import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BorderExamples() {
  return (
    <div className="p-4xl">
      <h2 className="text-heading-2xl-700 mb-2xl">Border Width Examples</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Border None (0px)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-16 bg-hayyak-light-grey border-none rounded-md flex items-center justify-center">
              No Border
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Border Thin (1px)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-16 bg-hayyak-light-grey border-thin border-hayyak rounded-md flex items-center justify-center">
              Thin Border
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Border Thick (1.5px)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-16 bg-hayyak-light-grey border-thick border-hayyak rounded-md flex items-center justify-center">
              Thick Border
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
