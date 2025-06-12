'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm, RegisterForm } from "@/components/portal/login-form"
import PageSuspense from '@/components/shared/PageSuspense';

function PortalContent() {
    const searchParams = useSearchParams();
    const isLogin = searchParams.get('register') !== 'true';

    return isLogin ? <LoginForm /> : <RegisterForm />;
}

export default function Page() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">    
                <Suspense fallback={PageSuspense()}>
                    <PortalContent />
                </Suspense>
            </div>
        </div>
    )
}
