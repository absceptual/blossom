'use client'

import { LoginForm, RegisterForm } from "@/components/login-form"

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PortalContent() {
    const searchParams = useSearchParams();
    const isLogin = searchParams.get('register') !== 'true';

    return isLogin ? <LoginForm /> : <RegisterForm />;
}


export default function Page() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">    
                <Suspense fallback={<div>Loading...</div>}> {/* Or any other loading UI */}
                    <PortalContent />
                </Suspense>
            </div>
        </div>
    )
}
