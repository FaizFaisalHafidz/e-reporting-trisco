import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-orange-50 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-3 self-center font-medium">
                    <div className="flex flex-col items-center gap-4">
                        <img
                            src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/logo-trisco.png"
                            alt="Trisco Logo"
                            className="h-20 w-auto object-contain"
                        />
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-[#1e3a8a]">E-REPORTING CUTTING</h1>
                            <p className="text-sm text-gray-600">PT TRISCO</p>
                        </div>
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardHeader className="px-8 pt-8 pb-4 text-center">
                            <CardTitle className="text-xl text-[#1e3a8a] font-semibold">{title}</CardTitle>
                            <CardDescription className="text-gray-600">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 py-6">{children}</CardContent>
                    </Card>
                </div>
                
                {/* Footer */}
                <div className="text-center text-xs text-gray-500">
                    <p>&copy; 2025 PT TRISCO. All rights reserved.</p>
                    <p className="mt-1">Tailored Apparel Manufacturing</p>
                </div>
            </div>
        </div>
    );
}
