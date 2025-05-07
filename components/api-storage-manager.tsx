"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database, Trash2, Copy, Download } from "lucide-react"

// Define the structure of stored API responses
interface StoredApiResponse {
  id: string
  timestamp: string
  url: string
  method: string
  status: number
  requestBody?: any
  responseBody: any
}

export default function ApiStorageManager() {
  const [storedResponses, setStoredResponses] = useState<StoredApiResponse[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Load stored responses when component mounts or dialog opens
  useEffect(() => {
    if (open) {
      loadStoredResponses()
    }
  }, [open])

  // Load all stored API responses from localStorage
  const loadStoredResponses = () => {
    try {
      // Get all keys from localStorage that start with 'api_response_'
      const apiResponseKeys = Object.keys(localStorage).filter((key) => key.startsWith("api_response_"))

      // Map keys to stored responses
      const responses: StoredApiResponse[] = apiResponseKeys
        .map((key) => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "")
            return data
          } catch (e) {
            console.error(`Failed to parse stored API response for key ${key}:`, e)
            return null
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setStoredResponses(responses)
    } catch (e) {
      console.error("Failed to load stored API responses:", e)
      setStoredResponses([])
    }
  }

  // Get unique endpoints from stored responses
  const endpoints = Array.from(
    new Set(
      storedResponses.map((r) => {
        try {
          const url = new URL(r.url)
          return url.pathname
        } catch (e) {
          return r.url
        }
      }),
    ),
  )

  // Get responses for the selected endpoint
  const filteredResponses = selectedEndpoint
    ? storedResponses.filter((r) => {
        try {
          const url = new URL(r.url)
          return url.pathname === selectedEndpoint
        } catch (e) {
          return r.url.includes(selectedEndpoint)
        }
      })
    : storedResponses

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

  // Clear all stored responses
  const clearAllResponses = () => {
    if (confirm("Are you sure you want to clear all stored API responses?")) {
      // Get all keys from localStorage that start with 'api_response_'
      const apiResponseKeys = Object.keys(localStorage).filter((key) => key.startsWith("api_response_"))

      // Remove each key
      apiResponseKeys.forEach((key) => {
        localStorage.removeItem(key)
      })

      setStoredResponses([])
    }
  }

  // Clear responses for a specific endpoint
  const clearEndpointResponses = (endpoint: string) => {
    if (confirm(`Are you sure you want to clear all stored responses for ${endpoint}?`)) {
      // Get all keys from localStorage that start with 'api_response_'
      const apiResponseKeys = Object.keys(localStorage).filter((key) => key.startsWith("api_response_"))

      // Filter keys for the selected endpoint and remove them
      apiResponseKeys.forEach((key) => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "")
          const url = new URL(data.url)
          if (url.pathname === endpoint) {
            localStorage.removeItem(key)
          }
        } catch (e) {
          // Skip if we can't parse the data
        }
      })

      loadStoredResponses()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed opacity-0 pointer-events-none"
          style={{ position: "absolute", left: "-9999px", bottom: "-9999px" }}
          aria-hidden="true"
        >
          <Database className="h-4 w-4 mr-2" />
          Stored API Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col shadow-z2">
        <DialogHeader>
          <DialogTitle>Stored API Responses</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden mt-4">
          {/* Sidebar with endpoints */}
          <div className="w-1/4 border-r pr-4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Endpoints</h3>
              <Button variant="ghost" size="sm" onClick={clearAllResponses} className="h-8 text-xs text-red-500">
                <Trash2 className="h-3 w-3 mr-1" /> Clear All
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                <Button
                  variant={selectedEndpoint === null ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedEndpoint(null)}
                >
                  All Endpoints ({storedResponses.length})
                </Button>
                {endpoints.map((endpoint) => (
                  <div key={endpoint} className="flex items-center">
                    <Button
                      variant={selectedEndpoint === endpoint ? "secondary" : "ghost"}
                      size="sm"
                      className="flex-1 justify-start text-xs truncate"
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      {endpoint}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearEndpointResponses(endpoint)}
                      className="h-6 w-6 p-0 text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main content */}
          <div className="flex-1 pl-4 overflow-hidden flex flex-col">
            {filteredResponses.length > 0 ? (
              <Tabs defaultValue="list" className="flex-1 flex flex-col overflow-hidden">
                <TabsList>
                  <TabsTrigger value="list">Response List</TabsTrigger>
                  <TabsTrigger value="latest">Latest Response</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {filteredResponses.map((response) => (
                        <div key={response.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-sm font-medium">
                                {response.method} {new URL(response.url).pathname}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(response.timestamp).toLocaleString()} • Status: {response.status}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(formatJson(response.responseBody))}
                                className="h-7 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" /> Copy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadAsJson(response, `api-response-${response.id}.json`)}
                                className="h-7 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" /> Download
                              </Button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-md">
                            <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
                              {formatJson(response.responseBody)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="latest" className="flex-1 overflow-hidden">
                  {filteredResponses.length > 0 && (
                    <div className="h-full flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="text-sm font-medium">
                            {filteredResponses[0].method} {new URL(filteredResponses[0].url).pathname}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(filteredResponses[0].timestamp).toLocaleString()} • Status:{" "}
                            {filteredResponses[0].status}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(formatJson(filteredResponses[0].responseBody))}
                            className="h-7 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              downloadAsJson(filteredResponses[0], `api-response-${filteredResponses[0].id}.json`)
                            }
                            className="h-7 text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="flex-1">
                        <pre className="text-xs font-mono whitespace-pre-wrap p-4 bg-gray-50 rounded-md">
                          {formatJson(filteredResponses[0].responseBody)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">No stored API responses found</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
