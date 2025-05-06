"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save, Copy, Code } from "lucide-react"

interface ApiResponseSimulatorProps {
  onClose: () => void
  onSaveResponse: (endpoint: string, response: any) => void
}

export default function ApiResponseSimulator({ onClose, onSaveResponse }: ApiResponseSimulatorProps) {
  const [endpoint, setEndpoint] = useState("iframe_order_visa_omantel")
  const [responseType, setResponseType] = useState("success")
  const [responseJson, setResponseJson] = useState(
    JSON.stringify(
      {
        message: "success",
        result: {
          order_id: "MOCK-" + Date.now(),
          iframe_deeplink_url: "https://omantel.sandbox-simplevisa.net/iframe/mock-order",
        },
      },
      null,
      2,
    ),
  )
  const [error, setError] = useState("")

  const predefinedResponses = {
    success: {
      iframe_order_visa_omantel: {
        message: "success",
        result: {
          order_id: "MOCK-" + Date.now(),
          iframe_deeplink_url: "https://omantel.sandbox-simplevisa.net/iframe/mock-order",
        },
      },
      create_traveller_omantel: {
        message: "success",
        result: [
          {
            id: "MOCK-TRAVELLER-" + Date.now(),
            access_token: "mock-access-token-" + Math.random().toString(36).substring(2, 15),
            email: "test@example.com",
          },
        ],
      },
    },
    error: {
      iframe_order_visa_omantel: {
        message: "error",
        error: "Failed to create visa order",
      },
      create_traveller_omantel: {
        message: "error",
        error: "Email already exists",
      },
    },
  }

  const handleEndpointChange = (value: string) => {
    setEndpoint(value)
    // Update the response JSON based on the selected endpoint and response type
    if (responseType === "success") {
      setResponseJson(
        JSON.stringify(predefinedResponses.success[value as keyof typeof predefinedResponses.success], null, 2),
      )
    } else {
      setResponseJson(
        JSON.stringify(predefinedResponses.error[value as keyof typeof predefinedResponses.error], null, 2),
      )
    }
  }

  const handleResponseTypeChange = (value: string) => {
    setResponseType(value)
    // Update the response JSON based on the selected endpoint and response type
    if (value === "success") {
      setResponseJson(
        JSON.stringify(predefinedResponses.success[endpoint as keyof typeof predefinedResponses.success], null, 2),
      )
    } else {
      setResponseJson(
        JSON.stringify(predefinedResponses.error[endpoint as keyof typeof predefinedResponses.error], null, 2),
      )
    }
  }

  const handleSaveResponse = () => {
    try {
      const parsedResponse = JSON.parse(responseJson)
      onSaveResponse(endpoint, parsedResponse)
      setError("")
    } catch (err) {
      setError("Invalid JSON format")
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(responseJson)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="bg-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Code className="mr-2 h-5 w-5" />
            API Response Simulator
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Select value={endpoint} onValueChange={handleEndpointChange}>
                  <SelectTrigger id="endpoint">
                    <SelectValue placeholder="Select endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iframe_order_visa_omantel">iframe_order_visa_omantel</SelectItem>
                    <SelectItem value="create_traveller_omantel">create_traveller_omantel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="response-type">Response Type</Label>
                <Select value={responseType} onValueChange={handleResponseTypeChange}>
                  <SelectTrigger id="response-type">
                    <SelectValue placeholder="Select response type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="response-json">Response JSON</Label>
                <Button variant="ghost" size="sm" onClick={handleCopyToClipboard} className="h-7">
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                id="response-json"
                value={responseJson}
                onChange={(e) => setResponseJson(e.target.value)}
                className="font-mono h-80"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveResponse} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Response
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
