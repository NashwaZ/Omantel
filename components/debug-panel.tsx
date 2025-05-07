"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, RefreshCw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import ApiResponseSimulator from "./api-response-simulator"

interface ApiLog {
  timestamp: string
  type: "request" | "response" | "error"
  data: any
}

interface DebugPanelProps {
  logs: ApiLog[]
  onClose: () => void
  onClear: () => void
  onSaveResponse?: (endpoint: string, response: any) => void
}

export default function DebugPanel({ logs, onClose, onClear, onSaveResponse }: DebugPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({})
  const [showSimulator, setShowSimulator] = useState(false)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll) {
      const logContainer = document.getElementById("debug-log-container")
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight
      }
    }
  }, [logs, autoScroll])

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

  if (isCollapsed) {
    return (
      <div
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-l-md cursor-pointer z-50"
        onClick={() => setIsCollapsed(false)}
      >
        <ChevronLeft className="h-5 w-5" />
      </div>
    )
  }

  return (
    <>
      <div className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-z2 w-96 z-50 flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center">
            <h3 className="font-semibold">API Debug Panel</h3>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{logs.length} logs</span>
          </div>
          <div className="flex items-center space-x-1">
            {onSaveResponse && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSimulator(true)}
                className="h-7 w-7"
                title="API Simulator"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClear} className="h-7 w-7">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div id="debug-log-container" className="flex-1 overflow-y-auto p-2 text-xs font-mono bg-gray-50">
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
                    {log.data.endpoint ? `${log.data.endpoint}: ` : ""}
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
          <Button variant="outline" size="sm" onClick={onClear} className="text-xs h-7">
            Clear logs
          </Button>
        </div>
      </div>

      {showSimulator && onSaveResponse && (
        <ApiResponseSimulator onClose={() => setShowSimulator(false)} onSaveResponse={onSaveResponse} />
      )}
    </>
  )
}
