"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, RefreshCw, Settings, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import ApiResponseSimulator from "./api-response-simulator"

interface ApiLog {
  timestamp: string
  type: "request" | "response" | "error"
  data: any
  url?: string
  status?: number
}

export default function GlobalDebugPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({})
  const [showSimulator, setShowSimulator] = useState(false)
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [isVisible, setIsVisible] = useState(true)

  // Initialize by capturing existing console methods
  useEffect(() => {
    // Store original console methods
    const originalConsoleLog = console.log
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalFetch = window.fetch

    // Override console.log
    console.log = (...args) => {
      originalConsoleLog(...args)

      // Only log API-related messages
      const message = args.join(" ")
      if (
        message.includes("API") ||
        message.includes("api") ||
        message.includes("fetch") ||
        message.includes("http") ||
        message.includes("response")
      ) {
        addLog("response", { message: args })
      }
    }

    // Override console.error
    console.error = (...args) => {
      originalConsoleError(...args)
      addLog("error", { message: args })
    }

    // Override console.warn
    console.warn = (...args) => {
      originalConsoleWarn(...args)
      addLog("error", { message: args, level: "warn" })
    }

    // Override fetch to monitor API calls
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url

      // Log the request
      addLog("request", {
        url,
        method: init?.method || "GET",
        headers: init?.headers,
        body: init?.body,
      })

      try {
        const response = await originalFetch(input, init)

        // Clone the response to read it without consuming it
        const clonedResponse = response.clone()

        // Try to parse the response as JSON
        let responseData
        try {
          responseData = await clonedResponse.json()

          // Log the response
          addLog("response", {
            url,
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          })
        } catch (e) {
          // If it's not JSON, log the status
          addLog("response", {
            url,
            status: response.status,
            statusText: response.statusText,
            data: "Non-JSON response",
          })
        }

        return response
      } catch (error) {
        // Log fetch errors
        addLog("error", {
          url,
          error: error instanceof Error ? error.message : "Unknown error",
        })
        throw error
      }
    }

    // Cleanup function to restore original methods
    return () => {
      console.log = originalConsoleLog
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      window.fetch = originalFetch
    }
  }, [])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll) {
      const logContainer = document.getElementById("global-debug-log-container")
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight
      }
    }
  }, [logs, autoScroll])

  const addLog = (type: "request" | "response" | "error", data: any) => {
    const timestamp = new Date().toISOString()
    setLogs((prev) => [...prev, { timestamp, type, data }])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const toggleExpand = (index: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString()
    } catch (e) {
      return timestamp
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case "request":
        return "text-blue-600"
      case "response":
        return "text-green-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatData = (data: any) => {
    try {
      if (typeof data === "string") {
        return data
      }
      return JSON.stringify(data, null, 2)
    } catch (e) {
      return "Unable to format data"
    }
  }

  const handleSaveResponse = (endpoint: string, response: any) => {
    addLog("response", {
      endpoint,
      action: "Mock response saved",
      response,
      isMock: true,
    })
  }

  if (!isVisible) {
    return (
      <Button className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg" onClick={() => setIsVisible(true)}>
        <Bug className="h-4 w-4 mr-1" />
        Show Debug
      </Button>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg flex items-center space-x-2">
        <Bug className="h-4 w-4" />
        <span className="text-xs font-mono">{logs.length} logs</span>
        <Button variant="ghost" size="icon" onClick={() => setIsMinimized(false)} className="h-6 w-6 p-0 text-white">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (isCollapsed) {
    return (
      <div
        className="fixed right-0 bottom-0 bg-gray-800 text-white p-2 rounded-l-md cursor-pointer z-50 shadow-lg"
        onClick={() => setIsCollapsed(false)}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="text-xs font-mono rotate-90 block mt-2">Debug ({logs.length})</span>
      </div>
    )
  }

  return (
    <>
      <div className="fixed right-0 bottom-0 bg-white border-l border-t border-gray-200 shadow-lg w-96 z-50 flex flex-col h-[400px]">
        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center">
            <Bug className="h-4 w-4 mr-1 text-blue-600" />
            <h3 className="font-semibold text-sm">API Debug Panel</h3>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{logs.length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSimulator(true)}
              className="h-6 w-6"
              title="API Simulator"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6"
              title="Minimize"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-6 w-6"
              title="Collapse"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearLogs} className="h-6 w-6" title="Clear logs">
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-6 w-6" title="Close">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div id="global-debug-log-container" className="flex-1 overflow-y-auto p-2 text-xs font-mono bg-gray-50">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">No API logs yet</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded border ${
                  log.type === "error"
                    ? "border-red-200 bg-red-50"
                    : log.type === "request"
                      ? "border-blue-200 bg-blue-50"
                      : "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(index)}>
                  <div className={`font-medium ${getLogColor(log.type)}`}>{log.type.toUpperCase()}</div>
                  <div className="text-gray-500">{formatTime(log.timestamp)}</div>
                </div>

                {expandedLogs[index] ? (
                  <pre className="mt-2 whitespace-pre-wrap break-words bg-white p-2 rounded border border-gray-200 max-h-60 overflow-y-auto">
                    {formatData(log.data)}
                  </pre>
                ) : (
                  <div className="mt-1 text-gray-600 truncate">
                    {log.data.url ? `${log.data.url}: ` : log.data.endpoint ? `${log.data.endpoint}: ` : ""}
                    {log.data.action || log.data.error || JSON.stringify(log.data).substring(0, 50) + "..."}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-2 border-t border-gray-200 flex justify-between items-center bg-gray-100">
          <label className="flex items-center text-xs">
            <input type="checkbox" checked={autoScroll} onChange={() => setAutoScroll(!autoScroll)} className="mr-1" />
            Auto-scroll
          </label>
          <Button variant="outline" size="sm" onClick={clearLogs} className="text-xs h-6">
            Clear logs
          </Button>
        </div>
      </div>

      {showSimulator && (
        <ApiResponseSimulator onClose={() => setShowSimulator(false)} onSaveResponse={handleSaveResponse} />
      )}
    </>
  )
}
