"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight, RefreshCw, Copy, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ApiCall {
  id: string
  timestamp: Date
  url: string
  method: string
  requestHeaders?: Record<string, string>
  requestBody?: any
  status?: number
  responseHeaders?: Record<string, string>
  responseBody?: any
  duration?: number
  error?: string
}

export default function ApiDebugPanel() {
  const [isVisible, setIsVisible] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [selectedCall, setSelectedCall] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("response")
  const originalFetchRef = useRef<typeof window.fetch | null>(null)

  // Initialize by capturing the fetch method
  useEffect(() => {
    if (!originalFetchRef.current) {
      originalFetchRef.current = window.fetch

      // Override fetch to monitor API calls
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
        const method = init?.method || "GET"

        // Create a unique ID for this API call
        const id = `fetch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        // Record the start time
        const startTime = Date.now()

        // Create initial API call record
        const apiCall: ApiCall = {
          id,
          timestamp: new Date(),
          url,
          method,
          requestHeaders: init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {},
          requestBody: init?.body ? parseBody(init.body) : undefined,
        }

        // Add to state
        setApiCalls((prev) => [apiCall, ...prev])
        setSelectedCall(id)

        try {
          // Make the actual fetch call
          const response = await originalFetchRef.current!(input, init)

          // Calculate duration
          const duration = Date.now() - startTime

          // Clone the response to read it without consuming it
          const clonedResponse = response.clone()

          // Get response headers
          const responseHeaders = Object.fromEntries(clonedResponse.headers.entries())

          // Try to parse the response body
          let responseBody
          try {
            if (clonedResponse.headers.get("content-type")?.includes("application/json")) {
              responseBody = await clonedResponse.json()
            } else {
              responseBody = await clonedResponse.text()
            }
          } catch (e) {
            responseBody = "Could not parse response body"
          }

          // Update the API call record
          setApiCalls((prev) =>
            prev.map((call) =>
              call.id === id
                ? {
                    ...call,
                    status: response.status,
                    responseHeaders,
                    responseBody,
                    duration,
                  }
                : call,
            ),
          )

          // Store the API response in localStorage if it's successful
          if (response.status >= 200 && response.status < 300) {
            try {
              // Store the API response with a key based on the URL and timestamp
              const storageKey = `api_response_${id}`
              localStorage.setItem(
                storageKey,
                JSON.stringify({
                  id,
                  timestamp: new Date().toISOString(),
                  url,
                  method,
                  status: response.status,
                  requestBody: apiCall.requestBody,
                  responseBody,
                }),
              )

              // Special handling for specific endpoints
              if (url.includes("/create_organization")) {
                // Store vendor key separately for easy access
                if (responseBody?.result?.[0]?.vendor_key) {
                  localStorage.setItem("vendor_key", responseBody.result[0].vendor_key)
                  console.log("Vendor key stored:", responseBody.result[0].vendor_key)
                }
              }

              if (url.includes("/create_traveller_omantel")) {
                // Store traveller data separately for easy access
                localStorage.setItem("traveller_data", JSON.stringify(responseBody))
                console.log("Traveller data stored:", responseBody)

                // Store access token separately if available
                if (responseBody?.result?.[0]?.access_token) {
                  localStorage.setItem("traveller_access_token", responseBody.result[0].access_token)
                  console.log("Traveller access token stored:", responseBody.result[0].access_token)
                }
              }

              if (url.includes("/get_visa_programs_omantel")) {
                // Store program data for easy access
                localStorage.setItem("visa_programs_data", JSON.stringify(responseBody))
                console.log("Visa programs data stored:", responseBody)

                // Store program ID if available - check all possible paths
                if (responseBody?.result?.programs?.[0]?.id) {
                  localStorage.setItem("program_id", responseBody.result.programs[0].id)
                  console.log("Program ID stored:", responseBody.result.programs[0].id)
                } else if (responseBody?.programs?.[0]?.id) {
                  localStorage.setItem("program_id", responseBody.programs[0].id)
                  console.log("Program ID stored (alt path):", responseBody.programs[0].id)
                } else if (Array.isArray(responseBody?.result) && responseBody.result[0]?.id) {
                  localStorage.setItem("program_id", responseBody.result[0].id)
                  console.log("Program ID stored (result array):", responseBody.result[0].id)
                }
              }
            } catch (e) {
              console.error("Failed to store API response:", e)
            }
          }

          return response
        } catch (error) {
          // Update the API call record with the error
          setApiCalls((prev) =>
            prev.map((call) =>
              call.id === id
                ? {
                    ...call,
                    error: error instanceof Error ? error.message : "Unknown error",
                    duration: Date.now() - startTime,
                  }
                : call,
            ),
          )

          throw error
        }
      }
    }

    // Cleanup function to restore original fetch
    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current
      }
    }
  }, [])

  // Helper function to parse request body
  const parseBody = (body: any): any => {
    if (body instanceof FormData) {
      const obj: Record<string, any> = {}
      body.forEach((value, key) => {
        obj[key] = value
      })
      return obj
    }

    if (typeof body === "string") {
      try {
        return JSON.parse(body)
      } catch {
        return body
      }
    }

    return body
  }

  // Clear all API calls
  const clearApiCalls = () => {
    setApiCalls([])
    setSelectedCall(null)
  }

  // Format JSON for display
  const formatJson = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2)
    } catch (e) {
      return String(data)
    }
  }

  // Copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Download content as JSON file
  const downloadAsJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Get the selected API call
  const selectedApiCall = apiCalls.find((call) => call.id === selectedCall)

  // If the panel is not visible, show a button to open it
  if (!isVisible) {
    return (
      <Button className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700" onClick={() => setIsVisible(true)}>
        Show API Debug Panel
      </Button>
    )
  }

  // If the panel is collapsed, show a minimal version
  if (isCollapsed) {
    return (
      <div
        className="fixed right-0 bottom-20 bg-blue-600 text-white p-2 rounded-l-md cursor-pointer z-50 shadow-lg"
        onClick={() => setIsCollapsed(false)}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="text-xs font-mono rotate-90 block mt-2">API ({apiCalls.length})</span>
      </div>
    )
  }

  return (
    <div className="fixed right-0 bottom-0 bg-white border-l border-t border-gray-200 shadow-lg w-full md:w-2/3 lg:w-1/2 z-50 flex flex-col h-[500px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-blue-600 text-white">
        <div className="flex items-center">
          <h3 className="font-semibold text-sm">API Debug Panel</h3>
          <Badge variant="outline" className="ml-2 text-xs bg-blue-700 text-white border-blue-400">
            {apiCalls.length} Calls
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(true)}
                  className="h-6 w-6 text-white hover:bg-blue-700"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Collapse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearApiCalls}
                  className="h-6 w-6 text-white hover:bg-blue-700"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Clear All</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 text-white hover:bg-blue-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* API calls list */}
        <div className="w-1/3 border-r border-gray-200 overflow-hidden flex flex-col">
          <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs font-medium">API Calls</div>
          <ScrollArea className="flex-1">
            {apiCalls.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No API calls captured yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {apiCalls.map((call) => (
                  <div
                    key={call.id}
                    className={`p-2 cursor-pointer hover:bg-gray-50 ${
                      selectedCall === call.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedCall(call.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge
                          variant={
                            call.status && call.status >= 200 && call.status < 300
                              ? "success"
                              : call.status && call.status >= 400
                                ? "destructive"
                                : call.error
                                  ? "destructive"
                                  : "outline"
                          }
                          className="mr-2 text-xs"
                        >
                          {call.method}
                        </Badge>
                        <span className="text-xs font-medium truncate max-w-[150px]">{new URL(call.url).pathname}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {call.status ? `${call.status}` : call.error ? "Error" : "Pending"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{call.timestamp.toLocaleTimeString()}</span>
                      {call.duration && <span className="text-xs text-gray-500">{call.duration}ms</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* API call details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedApiCall ? (
            <>
              <div className="p-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="text-xs font-medium truncate">
                  <span className="font-bold">{selectedApiCall.method}</span> {selectedApiCall.url}
                </div>
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => window.open(selectedApiCall.url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open URL</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => downloadAsJson(selectedApiCall, `api-call-${Date.now()}.json`)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download as JSON</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="px-2 pt-2 bg-white border-b border-gray-200 justify-start">
                  <TabsTrigger value="response" className="text-xs">
                    Response
                  </TabsTrigger>
                  <TabsTrigger value="request" className="text-xs">
                    Request
                  </TabsTrigger>
                  <TabsTrigger value="headers" className="text-xs">
                    Headers
                  </TabsTrigger>
                  <TabsTrigger value="info" className="text-xs">
                    Info
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="response" className="flex-1 overflow-hidden p-0 m-0">
                  <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
                    <div className="text-xs font-medium">
                      Response Body
                      {selectedApiCall.status && (
                        <Badge
                          variant={
                            selectedApiCall.status >= 200 && selectedApiCall.status < 300 ? "success" : "destructive"
                          }
                          className="ml-2"
                        >
                          {selectedApiCall.status}
                        </Badge>
                      )}
                    </div>
                    {selectedApiCall.responseBody && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => copyToClipboard(formatJson(selectedApiCall.responseBody))}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="flex-1 p-2">
                    {selectedApiCall.error ? (
                      <div className="p-2 bg-red-50 text-red-600 rounded border border-red-200 text-xs">
                        <strong>Error:</strong> {selectedApiCall.error}
                      </div>
                    ) : selectedApiCall.responseBody ? (
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {formatJson(selectedApiCall.responseBody)}
                      </pre>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">Waiting for response...</div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="request" className="flex-1 overflow-hidden p-0 m-0">
                  <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
                    <div className="text-xs font-medium">Request Body</div>
                    {selectedApiCall.requestBody && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => copyToClipboard(formatJson(selectedApiCall.requestBody))}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="flex-1 p-2">
                    {selectedApiCall.requestBody ? (
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {formatJson(selectedApiCall.requestBody)}
                      </pre>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">No request body</div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="headers" className="flex-1 overflow-hidden p-0 m-0">
                  <div className="flex flex-col h-full">
                    <div className="p-2 bg-gray-50 border-b border-gray-200">
                      <div className="text-xs font-medium">Request Headers</div>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                      {selectedApiCall.requestHeaders && Object.keys(selectedApiCall.requestHeaders).length > 0 ? (
                        <div className="text-xs font-mono">
                          {Object.entries(selectedApiCall.requestHeaders).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="font-semibold">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">No request headers</div>
                      )}
                    </ScrollArea>

                    <div className="p-2 bg-gray-50 border-t border-b border-gray-200">
                      <div className="text-xs font-medium">Response Headers</div>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                      {selectedApiCall.responseHeaders && Object.keys(selectedApiCall.responseHeaders).length > 0 ? (
                        <div className="text-xs font-mono">
                          {Object.entries(selectedApiCall.responseHeaders).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="font-semibold">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">No response headers</div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="info" className="flex-1 overflow-hidden p-0 m-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">General Information</h4>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="font-medium">URL:</div>
                            <div className="font-mono break-all">{selectedApiCall.url}</div>

                            <div className="font-medium">Method:</div>
                            <div>{selectedApiCall.method}</div>

                            <div className="font-medium">Status:</div>
                            <div>{selectedApiCall.status || "Pending"}</div>

                            <div className="font-medium">Time:</div>
                            <div>{selectedApiCall.timestamp.toLocaleString()}</div>

                            <div className="font-medium">Duration:</div>
                            <div>{selectedApiCall.duration ? `${selectedApiCall.duration}ms` : "Pending"}</div>
                          </div>
                        </div>
                      </div>

                      {selectedApiCall.error && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Error</h4>
                          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600 text-xs">
                            {selectedApiCall.error}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-gray-500">
              Select an API call to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
