"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LoadingIndicatorProps {
  size?: "small" | "medium" | "large"
  className?: string
  text?: string
  center?: boolean
  fullScreen?: boolean
}

export default function LoadingIndicator({
  size = "medium",
  className = "",
  text,
  center = false,
  fullScreen = false,
}: LoadingIndicatorProps) {
  // Animation effect to ensure smooth start
  const [mounted, setMounted] = useState(false);
  const [locale,setLocale]=useState("en");
useEffect(()=>{
 const header_json= localStorage.getItem("sso_header");
 if(header_json){
 const header_parse=JSON.parse(header_json);
   setLocale(header_parse?.language)
 }
},[]);
 

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  }

  const dotSizes = {
    small: "w-1 h-1",
    medium: "w-1.5 h-1.5",
    large: "w-2 h-2",
  }

  const containerClasses = cn(
    "flex flex-col items-center justify-center transition-opacity duration-300",
    {
      "opacity-0": !mounted,
      "opacity-100": mounted,
      "fixed inset-0 z-50 bg-white/80 backdrop-blur-sm": fullScreen,
      "absolute inset-0 z-10 bg-white/50": center && !fullScreen,
    },
    className,
  )

  const dotContainerClasses = cn(
    sizeClasses[size],
    "relative rounded-xl overflow-hidden",
    "bg-[#b55500] shadow-sm flex items-center justify-center",
  )

 return (
  <div
    className={containerClasses}
    style={{
      position: fullScreen ? "fixed" : center ? "absolute" : "relative",
    }}
    dir="auto" // or "rtl"/"ltr" dynamically
  >
    <div className={dotContainerClasses}>
      <div className="flex flex-row-reverse space-x-1 rtl:space-x-reverse items-center justify-center h-full">
        <div
          className={cn(dotSizes[size], "bg-white rounded-full animate-bounce")}
          style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
        />
        <div
          className={cn(dotSizes[size], "bg-white rounded-full animate-bounce")}
          style={{ animationDelay: "200ms", animationDuration: "0.6s" }}
        />
        <div
          className={cn(dotSizes[size], "bg-white rounded-full animate-bounce")}
          style={{ animationDelay: "400ms", animationDuration: "0.6s" }}
        />
      </div>
    </div>
    {text && (
      <p className="mt-3 text-gray-600 text-sm font-medium text-center">
        {text}
      </p>
    )}
  </div>
);

}
