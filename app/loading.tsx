'use client';

import LoadingIndicator from "@/components/loading-indicator"
import { useTranslation } from "react-i18next"
import  "@/lib/i18n"

export default function Loading() {
    const { t,i18n } = useTranslation();
    return <LoadingIndicator fullScreen size="large" />
}
