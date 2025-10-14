import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MobileLayout from '@/layouts/mobile-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Edit,
    Factory,
    Package,
    Scissors,
    ThermometerSun,
    User
} from 'lucide-react';

interface Report {
    id: number;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    status_laporan: 'draft' | 'submitted';
    target_quantity_pcs: number;
    actual_quantity_pcs: number;
    jumlah_layer: number;
    panjang_kain_meter: number;
    lebar_kain_cm: number;
    total_area_m2: number;
    waktu_mulai_cutting: string;
    waktu_selesai_cutting: string;
    durasi_cutting_menit: number;
    efficiency_percentage: number;
    kondisi_mesin: 'baik' | 'perlu_maintenance' | 'rusak';
    catatan_maintenance: string;
    kualitas_hasil: 'A' | 'B' | 'C';
    jumlah_defect: number;
    jenis_defect: string[];
    catatan_operator: string;
    suhu_ruangan: number;
    kelembaban: number;
    shift?: {
        nama_shift: string;
        jam_mulai: string;
        jam_selesai: string;
    };
    mesin?: {
        nama_mesin: string;
        nomor_mesin: string;
    };
    lineProduksi?: {
        nama_line: string;
    };
    customer?: {
        nama_customer: string;
    };
    pattern?: {
        nama_pattern: string;
    };
    jenisKain?: {
        nama_kain: string;
    };
    operator?: {
        name: string;
    };
    detailCuttings: Array<{
        pattern_name: string;
        ukuran_pattern: string;
        jumlah_potongan: number;
        panjang_pattern_cm: number;
        lebar_pattern_cm: number;
        waste_percentage: number;
        keterangan: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface Props {
    report: Report;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function ShowReport({ report, user }: Props) {
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
            A: 'bg-green-100 text-green-800',
            B: 'bg-yellow-100 text-yellow-800',
            C: 'bg-red-100 text-red-800',
        };

        return (
            <Badge className={variants[quality as keyof typeof variants]}>
                Grade {quality}
            </Badge>
        );
    };

    const getMachineConditionBadge = (condition: string) => {
        const variants = {
            baik: 'bg-green-100 text-green-800',
            perlu_maintenance: 'bg-yellow-100 text-yellow-800',
            rusak: 'bg-red-100 text-red-800',
        };
        
        const labels = {
            baik: 'Baik',
            perlu_maintenance: 'Perlu Maintenance',
            rusak: 'Rusak',
        };

        return (
            <Badge className={variants[condition as keyof typeof variants]}>
                {labels[condition as keyof typeof labels]}
            </Badge>
        );
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <MobileLayout title="Detail Laporan" user={user}>
            <Head title={`Laporan ${report.nomor_order}`} />
            
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href={route('reports.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div className="ml-2">
                            <h1 className="text-xl font-bold text-gray-900">{report.nomor_order}</h1>
                            <p className="text-sm text-gray-600">Batch: {report.batch_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusBadge(report.status_laporan)}
                        {report.status_laporan === 'draft' && (
                            <Link href={route('reports.edit', report.id)}>
                                <Button size="sm" className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Overview Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <Package className="w-5 h-5 mr-2" />
                                Ringkasan
                            </span>
                            {getQualityBadge(report.kualitas_hasil)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">{report.actual_quantity_pcs || 0}</div>
                                <div className="text-sm text-gray-600">Actual / {report.target_quantity_pcs || 0} Target</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-lg font-bold text-green-600">{Number(report.efficiency_percentage || 0).toFixed(1)}%</div>
                                <div className="text-xs text-gray-600">Efisiensi</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(report.tanggal_laporan)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span>{report.customer?.nama_customer || 'Unknown'} • {report.pattern?.nama_pattern || 'Unknown'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Production Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Factory className="w-5 h-5 mr-2" />
                            Informasi Produksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Shift</div>
                                <div className="font-medium">{report.shift?.nama_shift || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{report.shift?.jam_mulai || '00:00'} - {report.shift?.jam_selesai || '00:00'}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Operator</div>
                                <div className="font-medium">{report.operator?.name || 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Mesin</div>
                                <div className="font-medium">{report.mesin?.nama_mesin || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{report.mesin?.nomor_mesin || 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Line</div>
                                <div className="font-medium">{report.lineProduksi?.nama_line || 'Unknown'}</div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Waktu Cutting</div>
                                <div className="font-medium">
                                    {formatTime(report.waktu_mulai_cutting)} - {formatTime(report.waktu_selesai_cutting)}
                                </div>
                                <div className="text-xs text-gray-500">{report.durasi_cutting_menit || 0} menit</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Kondisi Mesin</div>
                                <div>{getMachineConditionBadge(report.kondisi_mesin)}</div>
                            </div>
                        </div>

                        {report.catatan_maintenance && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="text-sm font-medium text-yellow-800 mb-1">Catatan Maintenance</div>
                                <div className="text-sm text-yellow-700">{report.catatan_maintenance}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Material Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Scissors className="w-5 h-5 mr-2" />
                            Informasi Material
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Jenis Kain</div>
                                <div className="font-medium">{report.jenisKain?.nama_kain || 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Jumlah Layer</div>
                                <div className="font-medium">{report.jumlah_layer || 0} layer</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Panjang</div>
                                <div className="font-medium">{report.panjang_kain_meter || 0} m</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Lebar</div>
                                <div className="font-medium">{report.lebar_kain_cm || 0} cm</div>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 mb-1">Total Area</div>
                            <div className="text-lg font-bold text-blue-900">{Number(report.total_area_m2 || 0).toFixed(2)} m²</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quality Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Kualitas & Defect
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Grade Kualitas</div>
                                <div>{getQualityBadge(report.kualitas_hasil)}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Jumlah Defect</div>
                                <div className="font-medium">{report.jumlah_defect || 0}</div>
                            </div>
                        </div>

                        {report.jenis_defect && report.jenis_defect.length > 0 && (
                            <div>
                                <div className="text-gray-600 text-sm mb-2">Jenis Defect</div>
                                <div className="flex flex-wrap gap-1">
                                    {report.jenis_defect.map((defect, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {defect}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Environment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ThermometerSun className="w-5 h-5 mr-2" />
                            Kondisi Lingkungan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Suhu Ruangan</div>
                                <div className="font-medium">{report.suhu_ruangan || 0}°C</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Kelembaban</div>
                                <div className="font-medium">{report.kelembaban || 0}%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detail Cutting */}
                {report.detailCuttings && report.detailCuttings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Scissors className="w-5 h-5 mr-2" />
                                Detail Cutting ({report.detailCuttings.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {report.detailCuttings.map((detail, index) => (
                                <Card key={index} className="border-dashed">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium">{detail.pattern_name || 'Unknown'}</div>
                                            <Badge variant="outline">{detail.ukuran_pattern || 'Unknown'}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div>Potongan: {detail.jumlah_potongan || 0}</div>
                                            <div>Waste: {detail.waste_percentage || 0}%</div>
                                            <div>Panjang: {detail.panjang_pattern_cm || 0} cm</div>
                                            <div>Lebar: {detail.lebar_pattern_cm || 0} cm</div>
                                        </div>
                                        {detail.keterangan && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                <div className="font-medium">Keterangan:</div>
                                                <div>{detail.keterangan}</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Operator Notes */}
                {report.catatan_operator && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Catatan Operator
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-700">{report.catatan_operator}</div>
                        </CardContent>
                    </Card>
                )}

                {/* Timestamps */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
                            <div>Dibuat: {new Date(report.created_at).toLocaleString('id-ID')}</div>
                            <div>Diperbarui: {new Date(report.updated_at).toLocaleString('id-ID')}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MobileLayout>
    );
}
