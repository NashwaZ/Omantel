"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { loginTraveller } from "@/lib/api"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

// Import the CustomInput component at the top of the file
import { CustomInput } from "@/components/ui/custom-input"


export default function HeaderToken() {

    const [loading, setLoading] = useState(false)
    const [Authorizationtoken, setAuthorizationtoken] = useState('')
    const [x_unique_id, setXuniqueid] = useState('')
    const [x_cxp_session_id, setXcxpsessionid] = useState('')
    const [x_partner_user_id, setXpartneruserid] = useState('')
    const [language, setLanguage] = useState('en');



    const validationCheck = Authorizationtoken && x_unique_id && x_cxp_session_id && x_partner_user_id &&language;
    useEffect(() => {
        const auth = document.getElementById("authorization")
        if (auth) {
            auth.focus()
        }
    }, [])

    const handlesubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        debugger
        try {
            const responce = await fetch("https://stg-api.superjetom.com/omantelheader", {
                method: 'GET',
                headers: {
                    'Authorization': Authorizationtoken,
                    'x-unique-id': x_unique_id,
                    'x-cxp-session-id': x_cxp_session_id,
                    'x-partner-user-id': x_partner_user_id,
                    'x-language': language.toUpperCase()
                }
            })
            const result = await responce.json()
            window.location.href = result.message
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false)
    }



    return (
        <div className="min-h-screen flex flex-col justify-center bg-hayyak-background py-10 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center max-w-3xl">
                <div className="text-center mb-5xl">
                    <h1 className="heading-1 mb-4">Header Url Create</h1>
                </div>
                <div className="w-full max-w-3xl px-4 sm:px-0">
                    <Card className="border-0 shadow-z1 bg-hayyak-white w-full">
                        <CardContent className="px-6 sm:px-8 pb-8 pt-8">
                            <form className="space-y-5 w-full relative" autoComplete="off" onSubmit={handlesubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="Authorization" className="label font-medium">
                                        Authorization
                                    </Label>
                                    <div className="relative">
                                        <CustomInput type="text" id='authorization' className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200" onChange={(e) => {
                                            setAuthorizationtoken(e.target.value)
                                        }} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="X-unique-id" className="label font-medium">
                                        X-unique-id
                                    </Label>
                                    <CustomInput type="text" className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200" onChange={(e) => {
                                        setXuniqueid(e.target.value)
                                    }} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="X-cxp-session-id" className="label font-medium">
                                        X-cxp-session-id
                                    </Label>
                                    <CustomInput type="text" className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200" onChange={(e) => {
                                        setXcxpsessionid(e.target.value)
                                    }} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="X-partner-user-id" className="label font-medium">
                                        X-partner-user-id
                                    </Label>
                                    <CustomInput type="text" className="w-full h-12 px-4 body-small focus:outline-none focus:ring-2 focus:ring-hayyak focus:border-transparent transition-all duration-200" onChange={(e) => {
                                        setXpartneruserid(e.target.value)
                                    }} required />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="language" className="block font-medium">
                                        Choose Language
                                    </label>

                                    <div className="flex gap-6">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="english"
                                                name="language"
                                                value="en"
                                                checked={language === 'en'}
                                                onChange={() => setLanguage('en')}
                                                className="mr-2"
                                                required
                                            />
                                            <label htmlFor="english">English</label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="arabic"
                                                name="language"
                                                value="ar"
                                                checked={language === 'ar'}
                                                onChange={() => setLanguage('ar')}
                                                className="mr-2"
                                                required
                                            />
                                            <label htmlFor="arabic">Arabic</label>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full h-12 body-large font-medium rounded-[16px] ${validationCheck ? "bg-[#ea6e00]" : "bg-[grey]"} hover:bg-[#ff7800] active:bg-[#b55500] text-white px-4xl py-3 disabled:bg-hayyak-moderate-grey disabled:text-hayyak-dark-grey mt-4`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-m"></div>
                                            Searching...
                                        </div>
                                    ) : (
                                        "Submit"
                                    )}
                                </Button>

                            </form>
                        </CardContent>
                    </Card>
                </div>




            </div>
        </div>
    )
}