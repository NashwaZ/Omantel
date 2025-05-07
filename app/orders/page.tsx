"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Orders() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
}
