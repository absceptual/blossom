'use client'

import { LoginForm, RegisterForm } from "@/components/login-form"

import { useSearchParams } from 'next/navigation';


export default function Page() {

    const searchParams = useSearchParams();
    const isLogin = searchParams.get('register') !== 'true';

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
            {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
        </div>
    )
}
