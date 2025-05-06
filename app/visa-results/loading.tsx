export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="omantel-loading">
        <div className="omantel-loading-spinner"></div>
      </div>
      <p className="mt-4 text-gray-600">Loading visa information...</p>
    </div>
  )
}
