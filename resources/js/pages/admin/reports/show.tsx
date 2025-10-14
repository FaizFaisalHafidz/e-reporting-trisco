import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    Factory,
    Image,
    Package,
    Scissors,
    Settings,
    TrendingUp
} from 'lucide-react';

interface DetailCutting {
    id: number;
    pattern_name: string;
    ukuran_pattern: string;
    jumlah_potongan: number;
    panjang_pattern_cm: number;
    lebar_pattern_cm: number;
    waste_percentage: number;
    keterangan: string;
}

interface Report {
    id: number;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    target_quantity_pcs: number;
    actual_quantity_pcs: number;
    jumlah_layer: number;
    panjang_kain_meter: number;
    lebar_kain_cm: number;
    waktu_mulai_cutting: string;
    waktu_selesai_cutting: string;
    kondisi_mesin: string;
    catatan_maintenance: string;
    kualitas_hasil: string;
    jumlah_defect: number;
    jenis_defect: string[];
    catatan_operator: string;
    suhu_ruangan: number;
    kelembaban: number;
    efisiensi_cutting: number;
    durasi_menit: number;
    status_laporan: 'draft' | 'submitted';
    foto_hasil: string[];
    created_at: string;
    updated_at: string;
    operator?: {
        id: number;
        name: string;
        email: string;
    };
    shift?: {
        id: number;
        nama_shift: string;
        jam_mulai: string;
        jam_selesai: string;
    };
    mesin?: {
        id: number;
        nama_mesin: string;
        kode_mesin: string;
    };
    line_produksi?: {
        id: number;
        nama_line: string;
        kode_line: string;
    };
    customer?: {
        id: number;
        nama_customer: string;
        kode_customer: string;
    };
    pattern?: {
        id: number;
        nama_pattern: string;
        kode_pattern: string;
        difficulty_level: string;
    };
    jenis_kain?: {
        id: number;
        nama_kain: string;
        kode_kain: string;
    };
    detail_cuttings?: DetailCutting[];
}

interface Props {
    report: Report;
}

export default function ReportShow({ report }: Props) {
    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            submitted: 'bg-green-100 text-green-800 border-green-200',
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
        };

        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {labels[status as keyof typeof labels] || status}
            </Badge>
        );
    };

    const getKualitasBadge = (kualitas: string) => {
        const variants = {
            baik: 'bg-green-100 text-green-800',
            cukup: 'bg-yellow-100 text-yellow-800',
            kurang: 'bg-red-100 text-red-800',
        };

        return (
            <Badge className={variants[kualitas as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {kualitas.charAt(0).toUpperCase() + kualitas.slice(1)}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateEfficiency = () => {
        if (report.target_quantity_pcs > 0) {
            return Number(((report.actual_quantity_pcs / report.target_quantity_pcs) * 100)).toFixed(1);
        }
        return '0';
    };

    return (
        <AppLayout>
            <Head title={`Detail Laporan - ${report.nomor_order}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/reports">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Detail Laporan</h1>
                            <p className="text-gray-600 mt-1">{report.nomor_order} - {report.batch_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {getStatusBadge(report.status_laporan)}
                        <span className="text-sm text-gray-500">
                            Dibuat: {formatDateTime(report.created_at)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Informasi Order
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nomor Order</label>
                                        <p className="text-lg font-semibold">{report.nomor_order}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Batch Number</label>
                                        <p className="text-lg font-semibold">{report.batch_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tanggal Laporan</label>
                                        <p className="text-lg">{formatDate(report.tanggal_laporan)}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Customer</label>
                                        <p className="text-lg font-semibold">{report.customer?.nama_customer}</p>
                                        <p className="text-sm text-gray-500">({report.customer?.kode_customer})</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Pattern</label>
                                        <p className="text-lg font-semibold">{report.pattern?.nama_pattern}</p>
                                        <p className="text-sm text-gray-500">
                                            {report.pattern?.kode_pattern} - {report.pattern?.difficulty_level}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Production Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Factory className="w-5 h-5 mr-2" />
                                    Detail Produksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Operator</label>
                                        <p className="text-lg font-semibold">{report.operator?.name}</p>
                                        <p className="text-sm text-gray-500">{report.operator?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Shift</label>
                                        <p className="text-lg">{report.shift?.nama_shift}</p>
                                        <p className="text-sm text-gray-500">
                                            {report.shift?.jam_mulai} - {report.shift?.jam_selesai}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Mesin</label>
                                        <p className="text-lg font-semibold">{report.mesin?.nama_mesin}</p>
                                        <p className="text-sm text-gray-500">({report.mesin?.kode_mesin})</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Line Produksi</label>
                                        <p className="text-lg">{report.line_produksi?.nama_line}</p>
                                        <p className="text-sm text-gray-500">({report.line_produksi?.kode_line})</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Jenis Kain</label>
                                        <p className="text-lg font-semibold">{report.jenis_kain?.nama_kain}</p>
                                        <p className="text-sm text-gray-500">({report.jenis_kain?.kode_kain})</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Kondisi Mesin</label>
                                        <p className="text-lg capitalize">{report.kondisi_mesin}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Material & Specifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Scissors className="w-5 h-5 mr-2" />
                                    Spesifikasi Material
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Jumlah Layer</label>
                                        <p className="text-2xl font-bold text-blue-600">{report.jumlah_layer}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Panjang Kain</label>
                                        <p className="text-lg font-semibold">{report.panjang_kain_meter} meter</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Lebar Kain</label>
                                        <p className="text-lg font-semibold">{report.lebar_kain_cm} cm</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Waktu Cutting</label>
                                        <p className="text-lg">
                                            {report.waktu_mulai_cutting} - {report.waktu_selesai_cutting}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Durasi</label>
                                        <p className="text-2xl font-bold text-purple-600">{report.durasi_menit} min</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Suhu / Kelembaban</label>
                                        <p className="text-lg">{report.suhu_ruangan}°C / {report.kelembaban}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quality & Results */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Hasil & Kualitas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Target Quantity</label>
                                            <p className="text-3xl font-bold text-blue-600">{report.target_quantity_pcs} pcs</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Actual Quantity</label>
                                            <p className="text-3xl font-bold text-green-600">{report.actual_quantity_pcs} pcs</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Efisiensi</label>
                                            <p className="text-3xl font-bold text-purple-600">{Number(report.efisiensi_cutting || 0).toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Kualitas Hasil</label>
                                            <div className="mt-2">
                                                {getKualitasBadge(report.kualitas_hasil)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Jumlah Defect</label>
                                        <p className="text-2xl font-bold text-red-600">{report.jumlah_defect}</p>
                                        {report.jenis_defect && report.jenis_defect.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-500 mb-1">Jenis Defect:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {report.jenis_defect.map((defect, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {defect}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Catatan Operator</label>
                                        <p className="text-gray-900 mt-1">
                                            {report.catatan_operator || '-'}
                                        </p>
                                    </div>
                                </div>

                                {report.catatan_maintenance && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-500">Catatan Maintenance</label>
                                        <p className="text-gray-900 mt-1">{report.catatan_maintenance}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detail Cutting */}
                        {report.detail_cuttings && report.detail_cuttings.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Scissors className="w-5 h-5 mr-2" />
                                        Detail Cutting
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {report.detail_cuttings.map((detail, index) => (
                                            <div key={detail.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold">Detail {index + 1}</h4>
                                                    <Badge variant="outline">{detail.pattern_name}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Ukuran:</span>
                                                        <p className="font-medium">{detail.ukuran_pattern}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Jumlah:</span>
                                                        <p className="font-medium">{detail.jumlah_potongan} pcs</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Dimensi:</span>
                                                        <p className="font-medium">{detail.panjang_pattern_cm} x {detail.lebar_pattern_cm} cm</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Waste:</span>
                                                        <p className="font-medium">{detail.waste_percentage}%</p>
                                                    </div>
                                                </div>
                                                {detail.keterangan && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <span className="text-gray-500 text-sm">Keterangan:</span>
                                                        <p className="text-sm mt-1">{detail.keterangan}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Photos */}
                        {report.foto_hasil && report.foto_hasil.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Image className="w-5 h-5 mr-2" />
                                        Foto Hasil ({report.foto_hasil.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {report.foto_hasil.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={`/storage/${photo}`}
                                                    alt={`Foto hasil ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => window.open(`/storage/${photo}`, '_blank')}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="sm" variant="secondary">
                                                            Lihat
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Summary & Stats */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Ringkasan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center">
                                        <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                                        <span className="text-sm font-medium">Efisiensi</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600">
                                        {Number(report.efisiensi_cutting || 0).toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Package className="w-5 h-5 text-green-600 mr-2" />
                                        <span className="text-sm font-medium">Output</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600">
                                        {report.actual_quantity_pcs} pcs
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-purple-600 mr-2" />
                                        <span className="text-sm font-medium">Durasi</span>
                                    </div>
                                    <span className="text-lg font-bold text-purple-600">
                                        {report.durasi_menit} min
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Settings className="w-5 h-5 text-red-600 mr-2" />
                                        <span className="text-sm font-medium">Defect</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600">
                                        {report.jumlah_defect}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Laporan Dibuat</p>
                                        <p className="text-xs text-gray-500">{formatDateTime(report.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Terakhir Diupdate</p>
                                        <p className="text-xs text-gray-500">{formatDateTime(report.updated_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <div className="mt-1">
                                            {getStatusBadge(report.status_laporan)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
