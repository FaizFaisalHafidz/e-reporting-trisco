import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Mail, Phone } from 'lucide-react';

export default function AccountInactive() {
    return (
        <>
            <Head title="Akun Tidak Aktif" />
            
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                        {/* Logo */}
                        <div className="mb-6">
                            <img 
                                src="https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-trisco.png" 
                                alt="TRISCO Logo" 
                                className="h-16 mx-auto object-contain"
                            />
                        </div>

                        {/* Warning Icon */}
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-10 h-10 text-red-600" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Akun Tidak Aktif
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Maaf, akun Anda telah dinonaktifkan oleh administrator. 
                            Untuk mengaktifkan kembali akun Anda, silakan hubungi administrator sistem.
                        </p>

                        {/* Contact Info */}
                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-3">
                                Hubungi Administrator
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-center text-blue-700">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span>admin@trisco.com</span>
                                </div>
                                <div className="flex items-center justify-center text-blue-700">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <span>+62 xxx-xxxx-xxxx</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                <Link href="/login">
                                    Kembali ke Login
                                </Link>
                            </Button>
                            
                            <Button variant="outline" asChild className="w-full">
                                <a href="mailto:admin@trisco.com?subject=Aktivasi Akun E-Reporting">
                                    Kirim Email ke Admin
                                </a>
                            </Button>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                PT TRISCO - E-Reporting System
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
