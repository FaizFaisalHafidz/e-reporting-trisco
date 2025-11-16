import MobileLayout from '@/layouts/mobile-layout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Report {
    id: number;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    status_laporan: 'draft' | 'submitted';
    shift?: {
        nama_shift: string;
    };
    customer?: {
        nama_customer: string;
    };
    pattern?: {
        nama_pattern: string;
    };
    created_at: string;
}

interface DashboardOperatorProps {
    user: any;
    roles: any;
    permissions: any;
    stats: {
        laporanHariIni: number;
        totalBulanIni: number;
        totalMeter: number;
        rataRataWaktu: number;
    };
    recentReports: Array<{
        tanggal: string;
        operator: string;
        mesin: string;
        kualitas_hasil: string;
        jumlah_layer: number;
        total_meter: number;
    }>;
    performanceStats: {
        avgEfficiency: number;
        qualityDistribution: {
            OK: number;
            NG: number;
            Rework: number;
        };
    };
}

export default function DashboardOperator({ 
    user, 
    roles, 
    permissions,
    stats,
    recentReports = [],
    performanceStats = {
        avgEfficiency: 0,
        qualityDistribution: {
            OK: 0,
            NG: 0,
            Rework: 0
        }
    }
}: DashboardOperatorProps) {
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <MobileLayout title="Dashboard" user={user}>
            <Head title="Dashboard Operator" />
            
            <div className="p-4 space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Selamat Datang!</h2>
                            <p className="text-blue-100 mb-2">{user.name}</p>
                            <p className="text-blue-200 text-sm">{currentDate}</p>
                        </div>
                        <img
                            src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/logo-trisco.png"
                            alt="Trisco Logo"
                            className="h-12 w-auto object-contain opacity-80"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Laporan Hari Ini</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.laporanHariIni}</p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Bulan Ini</h3>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalBulanIni}</p>
                                <p className="text-sm text-gray-500">Laporan</p>
                            </div>                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Meter</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalMeter}</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Rata-rata Waktu</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.rataRataWaktu}<span className="text-sm text-gray-500">min</span></p>
                            </div>
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Reports Section */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4 text-[#1e3a8a]">Laporan Terbaru</h3>
                    {recentReports.length > 0 ? (
                        <div className="space-y-3">
                            {recentReports.map((report, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{report.tanggal}</p>
                                            <p className="text-xs text-gray-600">Mesin: {report.mesin}</p>
                                            <p className="text-xs text-gray-600">Operator: {report.operator}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-gray-900">{report.jumlah_layer} Layer</p>
                                            <p className="text-xs text-gray-600">{report.total_meter}m</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                report.kualitas_hasil === 'OK' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : report.kualitas_hasil === 'NG'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {report.kualitas_hasil}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-500 text-sm">Belum ada laporan</p>
                        </div>
                    )}
                </div>

                {/* Performance Stats Section */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4 text-[#1e3a8a]">Statistik Performa</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Rata-rata Efisiensi</p>
                            <p className="text-2xl font-bold text-blue-600">{Number(performanceStats.avgEfficiency || 0).toFixed(1)}%</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">Distribusi Kualitas</p>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-green-600">OK</span>
                                    <span className="text-xs text-gray-900">{performanceStats.qualityDistribution.OK}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-red-600">NG</span>
                                    <span className="text-xs text-gray-900">{performanceStats.qualityDistribution.NG}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-yellow-600">Rework</span>
                                    <span className="text-xs text-gray-900">{performanceStats.qualityDistribution.Rework}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4 text-[#1e3a8a]">Aksi Cepat</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href={route('reports.create')}>
                            <button className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:from-[#1e40af] hover:to-[#1e3a8a] transition-all duration-200 shadow-md w-full">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Input Laporan</span>
                            </button>
                        </Link>

                        <Link href={route('reports.index')}>
                            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:from-orange-600 hover:to-orange-500 transition-all duration-200 shadow-md w-full">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Lihat Laporan</span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity - Updated */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                {stats.laporanHariIni > 0 ? (
                                    <>
                                        <p className="text-sm font-medium text-gray-900">{stats.laporanHariIni} laporan hari ini</p>
                                        <p className="text-xs text-gray-500">Terus pertahankan performa yang baik!</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-gray-900">Belum ada laporan hari ini</p>
                                        <p className="text-xs text-gray-500">Mulai buat laporan cutting pertama Anda</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Informasi Akun</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="text-gray-900">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Role</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Operator
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Permissions</span>
                            <span className="text-gray-900">{permissions.length} izin</span>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
