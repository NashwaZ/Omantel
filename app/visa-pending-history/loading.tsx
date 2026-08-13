'use client';

import { useEffect, useState } from "react"
import LoadingIndicator from "@/components/loading-indicator"
import { useTranslation } from "react-i18next"
import "@/lib/i18n"

export default function Loading() {
  const { t, i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const lang = localStorage.getItem("app_language")
    if (lang) i18n.changeLanguage(lang)
    setMounted(true)
  }, [])

  return <LoadingIndicator fullScreen text={mounted ? t("Loading pending records...") : ""} size="large" />
}
