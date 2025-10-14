import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileLayout from '@/layouts/mobile-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Edit,
    Eye,
    FileText,
    Package,
    Plus,
    Trash2,
    User
} from 'lucide-react';
import { useState } from 'react';

interface Report {
    id: number;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    status_laporan: 'draft' | 'submitted';
    actual_quantity_pcs?: number;
    target_quantity_pcs?: number;
    efisiensi_cutting?: number; // Field yang benar dari model
    kualitas_hasil?: 'baik' | 'bagus' | 'cukup' | 'kurang'; // Sesuai validasi yang diperbaiki
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

interface Props {
    reports: {
        data: Report[];
        current_page: number;
        last_page: number;
        total: number;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function ReportsIndex({ reports, user }: Props) {
    const [filter, setFilter] = useState<'all' | 'draft' | 'submitted'>('all');

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'bg-yellow-100 text-yellow-800',
            submitted: 'bg-green-100 text-green-800',
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Terkirim',
        };

        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const getQualityBadge = (quality: string) => {
        const variants = {
            baik: 'bg-green-100 text-green-800',
            bagus: 'bg-green-100 text-green-800',
            cukup: 'bg-yellow-100 text-yellow-800',
            kurang: 'bg-red-100 text-red-800',
        };

        const labels = {
            baik: 'Baik',
            bagus: 'Bagus', 
            cukup: 'Cukup',
            kurang: 'Kurang',
        };

        return (
            <Badge className={variants[quality as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {labels[quality as keyof typeof labels] || quality}
            </Badge>
        );
    };

    const filteredReports = reports.data.filter(report => {
        if (filter === 'all') return true;
        return report.status_laporan === filter;
    });

    const stats = {
        total: reports.total,
        drafts: reports.data.filter(r => r.status_laporan === 'draft').length,
        submitted: reports.data.filter(r => r.status_laporan === 'submitted').length,
    };

    return (
        <MobileLayout title="Laporan Saya" user={user}>
            <Head title="Laporan Saya" />
            
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Laporan Saya</h1>
                        <p className="text-sm text-gray-600">{reports.total} total laporan</p>
                    </div>
                    <Link href={route('reports.create')}>
                        <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Laporan
                        </Button>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                            <div className="text-xs text-gray-600">Total</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <div className="text-lg font-bold text-yellow-600">{stats.drafts}</div>
                            <div className="text-xs text-gray-600">Draft</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <div className="text-lg font-bold text-green-600">{stats.submitted}</div>
                            <div className="text-xs text-gray-600">Terkirim</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Buttons */}
                <div className="flex space-x-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-[#1e3a8a] hover:bg-[#1e40af]' : ''}
                    >
                        Semua
                    </Button>
                    <Button
                        variant={filter === 'draft' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('draft')}
                        className={filter === 'draft' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                    >
                        Draft
                    </Button>
                    <Button
                        variant={filter === 'submitted' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('submitted')}
                        className={filter === 'submitted' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        Terkirim
                    </Button>
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                    {filteredReports.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Belum ada laporan</p>
                                <p className="text-sm text-gray-500 mb-4">Mulai buat laporan cutting pertama Anda</p>
                                <Link href={route('reports.create')}>
                                    <Button className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Buat Laporan
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredReports.map((report) => (
                            <Card key={report.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <CardTitle className="text-base font-semibold">
                                                    {report.nomor_order}
                                                </CardTitle>
                                                {getStatusBadge(report.status_laporan)}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Batch: {report.batch_number}
                                            </p>
                                        </div>
                                        {report.kualitas_hasil && getQualityBadge(report.kualitas_hasil)}
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        {/* Customer & Pattern */}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Package className="w-4 h-4 mr-2" />
                                            <span>{report.customer?.nama_customer || 'N/A'} • {report.pattern?.nama_pattern || 'N/A'}</span>
                                        </div>
                                        
                                        {/* Date & Shift */}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>{new Date(report.tanggal_laporan).toLocaleDateString('id-ID')} • {report.shift?.nama_shift || 'N/A'}</span>
                                        </div>
                                        
                                        {/* Production Info */}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <User className="w-4 h-4 mr-2" />
                                                <span>{report.actual_quantity_pcs || 0}/{report.target_quantity_pcs || 0} pcs</span>
                                            </div>
                                            <div className={`font-medium ${Number(report.efisiensi_cutting || 0) >= 90 ? 'text-green-600' : 
                                                Number(report.efisiensi_cutting || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {Number(report.efisiensi_cutting || 0).toFixed(1)}%
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="text-xs text-gray-500">
                                                {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link href={route('reports.show', report.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-3 h-3" />
                                                    </Button>
                                                </Link>
                                                {report.status_laporan === 'draft' && (
                                                    <>
                                                        <Link href={route('reports.edit', report.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="w-3 h-3" />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => {
                                                                if (confirm('Hapus draft laporan ini?')) {
                                                                    // TODO: Implement delete
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {reports.last_page > 1 && (
                    <div className="flex justify-center items-center space-x-2 py-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            disabled={reports.current_page === 1}
                        >
                            Sebelumnya
                        </Button>
                        <span className="text-sm text-gray-600">
                            Halaman {reports.current_page} dari {reports.last_page}
                        </span>
                        <Button 
                            variant="outline" 
                            size="sm"
                            disabled={reports.current_page === reports.last_page}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
