import { Head, router } from '@inertiajs/react';
import { Bell, LogOut, User } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface MobileLayoutProps {
    children: ReactNode;
    title?: string;
    user: User;
    showBackButton?: boolean;
    onBack?: () => void;
}

export default function MobileLayout({ 
    children, 
    title = "E-Reporting", 
    user,
    showBackButton = false,
    onBack 
}: MobileLayoutProps) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        router.post('/logout');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.history.back();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Konfirmasi Logout
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin keluar dari aplikasi?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelLogout}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Mobile Header */}
            <header className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] shadow-lg border-b sticky top-0 z-50">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {showBackButton && (
                                <button
                                    onClick={handleBack}
                                    className="p-1 rounded-full hover:bg-white/20 text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            <h1 className="text-lg font-semibold text-white">{title}</h1>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button className="p-2 rounded-full hover:bg-white/20 relative">
                                <Bell className="w-5 h-5 text-white" />
                                {/* Notification badge */}
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
                            </button>
                            
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-white/20"
                                >
                                    <LogOut className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pb-20">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <div className="grid grid-cols-4 py-2">
                    <button
                        onClick={() => router.visit('/dashboard-operator')}
                        className="flex flex-col items-center py-2 px-1 text-xs hover:bg-blue-50 text-[#1e3a8a]"
                    >
                        <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span>Dashboard</span>
                    </button>
                    
                    <button
                        onClick={() => router.visit('/reports/create')}
                        className="flex flex-col items-center py-2 px-1 text-xs hover:bg-blue-50 text-[#1e3a8a]"
                    >
                        <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Input</span>
                    </button>
                    
                    <button
                        onClick={() => router.visit('/reports')}
                        className="flex flex-col items-center py-2 px-1 text-xs hover:bg-blue-50 text-[#1e3a8a]"
                    >
                        <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        <span>Laporan</span>
                    </button>
                    
                    <button
                        onClick={() => router.visit('/profile')}
                        className="flex flex-col items-center py-2 px-1 text-xs hover:bg-blue-50 text-[#1e3a8a]"
                    >
                        <User className="w-6 h-6 mb-1" />
                        <span>Profil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
