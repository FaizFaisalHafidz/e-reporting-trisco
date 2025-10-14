import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Gauge,
    Hash,
    ImageIcon,
    MessageSquare,
    Package,
    Settings,
    Thermometer,
    Timer,
    User,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface Report {
    id: number;
    nomor_laporan: string;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    status_laporan: string;
    target_quantity_pcs?: number;
    actual_quantity_pcs?: number;
    efisiensi_cutting?: number;
    fabric_utilization_percentage?: number;
    durasi_menit?: number;
    kualitas_hasil?: string;
    jumlah_defect?: number;
    jenis_defect?: string[];
    catatan_operator?: string;
    foto_hasil?: string[];
    suhu_ruangan?: number;
    kelembaban?: number;
    waktu_mulai_cutting?: string;
    waktu_selesai_cutting?: string;
    operator?: {
        id: number;
        name: string;
        email: string;
    };
    shift?: {
        id: number;
        nama_shift: string;
        jam_mulai?: string;
        jam_selesai?: string;
    };
    mesin?: {
        id: number;
        nama_mesin: string;
        kode_mesin: string;
    };
    lineProduksi?: {
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
        difficulty_level?: string;
    };
    jenisKain?: {
        id: number;
        nama_kain: string;
        kode_kain: string;
    };
    validasi?: {
        id: number;
        status_validasi: string;
        catatan_validasi?: string;
        tanggal_validasi?: string;
        validator?: {
            id: number;
            name: string;
        };
    };
    detailCuttings?: Array<{
        id: number;
        size: string;
        quantity: number;
        defect_count: number;
    }>;
}

interface Props {
    report: Report;
}

export default function ValidationShow({ report }: Props) {
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showRevisionDialog, setShowRevisionDialog] = useState(false);
    const [approveNote, setApproveNote] = useState('');
    const [rejectNote, setRejectNote] = useState('');
    const [revisionNote, setRevisionNote] = useState('');
    const [revisionItems, setRevisionItems] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'bg-yellow-100 text-yellow-800',
            submitted: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
            approved: 'Approved',
            rejected: 'Rejected',
        };

        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const getQualityBadge = (quality?: string) => {
        if (!quality) return null;
        
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

    const handleApprove = () => {
        setIsSubmitting(true);
        router.post(route('admin.validation.approve', report.id), {
            catatan_validasi: approveNote
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setShowApproveDialog(false);
            }
        });
    };

    const handleReject = () => {
        setIsSubmitting(true);
        router.post(route('admin.validation.reject', report.id), {
            catatan_validasi: rejectNote
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setShowRejectDialog(false);
            }
        });
    };

    const handleRequestRevision = () => {
        setIsSubmitting(true);
        router.post(route('admin.validation.revision', report.id), {
            catatan_validasi: revisionNote,
            revisi_diminta: revisionItems
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setShowRevisionDialog(false);
            }
        });
    };

    const revisionOptions = [
        'Data quantity tidak sesuai',
        'Efisiensi terlalu rendah',
        'Foto hasil kurang jelas',
        'Catatan operator tidak lengkap',
        'Data waktu cutting tidak akurat',
        'Informasi defect tidak detail',
        'Data suhu/kelembaban tidak tercatat'
    ];

    return (
        <AppLayout>
            <Head title={`Review Laporan - ${report.nomor_laporan}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('admin.validation.pending')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Review Validasi Laporan</h1>
                            <p className="text-gray-600">Validasi dan persetujuan laporan cutting</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusBadge(report.status_laporan)}
                    </div>
                </div>

                {/* Action Buttons - Only show if status is submitted */}
                {report.status_laporan === 'submitted' && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-blue-900">Laporan Menunggu Validasi</h3>
                                        <p className="text-sm text-blue-700">Lakukan review dan tentukan tindakan selanjutnya</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Setujui
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Setujui Laporan</DialogTitle>
                                                <DialogDescription>
                                                    Konfirmasi persetujuan laporan cutting ini
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="approve-note">Catatan Validasi (Opsional)</Label>
                                                    <Textarea
                                                        id="approve-note"
                                                        placeholder="Tambahkan catatan persetujuan..."
                                                        value={approveNote}
                                                        onChange={(e) => setApproveNote(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                                                    Batal
                                                </Button>
                                                <Button 
                                                    onClick={handleApprove}
                                                    disabled={isSubmitting}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {isSubmitting ? 'Memproses...' : 'Setujui Laporan'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                Minta Revisi
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Minta Revisi Laporan</DialogTitle>
                                                <DialogDescription>
                                                    Tentukan bagian yang perlu diperbaiki
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Poin Revisi yang Diminta</Label>
                                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                                        {revisionOptions.map((option, index) => (
                                                            <label key={index} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={revisionItems.includes(option)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setRevisionItems([...revisionItems, option]);
                                                                        } else {
                                                                            setRevisionItems(revisionItems.filter(item => item !== option));
                                                                        }
                                                                    }}
                                                                    className="rounded"
                                                                />
                                                                <span className="text-sm">{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="revision-note">Catatan Revisi *</Label>
                                                    <Textarea
                                                        id="revision-note"
                                                        placeholder="Jelaskan detail revisi yang diperlukan..."
                                                        value={revisionNote}
                                                        onChange={(e) => setRevisionNote(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
                                                    Batal
                                                </Button>
                                                <Button 
                                                    onClick={handleRequestRevision}
                                                    disabled={isSubmitting || !revisionNote.trim()}
                                                    className="bg-orange-600 hover:bg-orange-700"
                                                >
                                                    {isSubmitting ? 'Memproses...' : 'Kirim Permintaan Revisi'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Tolak
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Tolak Laporan</DialogTitle>
                                                <DialogDescription>
                                                    Berikan alasan penolakan laporan ini
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="reject-note">Alasan Penolakan *</Label>
                                                    <Textarea
                                                        id="reject-note"
                                                        placeholder="Jelaskan alasan penolakan..."
                                                        value={rejectNote}
                                                        onChange={(e) => setRejectNote(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                                                    Batal
                                                </Button>
                                                <Button 
                                                    onClick={handleReject}
                                                    disabled={isSubmitting || !rejectNote.trim()}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {isSubmitting ? 'Memproses...' : 'Tolak Laporan'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Previous Validation Info */}
                {report.validasi && (
                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-purple-900">Riwayat Validasi</h3>
                                    <p className="text-sm text-purple-700">
                                        Divalidasi oleh {report.validasi.validator?.name} • 
                                        {report.validasi.tanggal_validasi && new Date(report.validasi.tanggal_validasi).toLocaleDateString('id-ID')}
                                    </p>
                                    {report.validasi.catatan_validasi && (
                                        <p className="text-sm text-purple-800 mt-1 italic">
                                            "{report.validasi.catatan_validasi}"
                                        </p>
                                    )}
                                </div>
                                <Badge className={
                                    report.validasi.status_validasi === 'approved' ? 'bg-green-100 text-green-800' :
                                    report.validasi.status_validasi === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-orange-100 text-orange-800'
                                }>
                                    {report.validasi.status_validasi}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Report Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Informasi Laporan</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Hash className="w-4 h-4" />
                                            <span>Nomor Laporan</span>
                                        </div>
                                        <p className="font-mono font-medium mt-1">{report.nomor_laporan}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Package className="w-4 h-4" />
                                            <span>Nomor Order</span>
                                        </div>
                                        <p className="font-medium mt-1">{report.nomor_order}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Tanggal Laporan</span>
                                        </div>
                                        <p className="font-medium mt-1">
                                            {new Date(report.tanggal_laporan).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Package className="w-4 h-4" />
                                            <span>Batch Number</span>
                                        </div>
                                        <p className="font-medium mt-1">{report.batch_number}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Production Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Gauge className="w-5 h-5" />
                                    <span>Performa Produksi</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {report.target_quantity_pcs || 0}
                                        </div>
                                        <div className="text-sm text-blue-700">Target (pcs)</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {report.actual_quantity_pcs || 0}
                                        </div>
                                        <div className="text-sm text-green-700">Actual (pcs)</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {Number(report.efisiensi_cutting || 0).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-purple-700">Efisiensi</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {report.durasi_menit || 0}
                                        </div>
                                        <div className="text-sm text-orange-700">Durasi (menit)</div>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Kualitas Hasil</span>
                                            {getQualityBadge(report.kualitas_hasil)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Jumlah Defect</span>
                                            <span className="font-medium">{report.jumlah_defect || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {report.waktu_mulai_cutting && report.waktu_selesai_cutting && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Timer className="w-4 h-4" />
                                                    <span>Waktu Mulai</span>
                                                </div>
                                                <p className="font-medium mt-1">
                                                    {new Date(report.waktu_mulai_cutting).toLocaleTimeString('id-ID')}
                                                </p>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Timer className="w-4 h-4" />
                                                    <span>Waktu Selesai</span>
                                                </div>
                                                <p className="font-medium mt-1">
                                                    {new Date(report.waktu_selesai_cutting).toLocaleTimeString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Environment Conditions */}
                        {(report.suhu_ruangan || report.kelembaban) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Thermometer className="w-5 h-5" />
                                        <span>Kondisi Lingkungan</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {report.suhu_ruangan && (
                                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {report.suhu_ruangan}°C
                                                </div>
                                                <div className="text-sm text-red-700">Suhu Ruangan</div>
                                            </div>
                                        )}
                                        {report.kelembaban && (
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {report.kelembaban}%
                                                </div>
                                                <div className="text-sm text-blue-700">Kelembaban</div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Operator Notes */}
                        {report.catatan_operator && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <MessageSquare className="w-5 h-5" />
                                        <span>Catatan Operator</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 italic">"{report.catatan_operator}"</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Photos */}
                        {report.foto_hasil && Array.isArray(report.foto_hasil) && report.foto_hasil.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <ImageIcon className="w-5 h-5" />
                                        <span>Foto Hasil Cutting</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {report.foto_hasil.map((photo, index) => (
                                            <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={`/storage/${photo}`}
                                                    alt={`Hasil cutting ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="absolute top-2 right-2"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl">
                                                        <img
                                                            src={`/storage/${photo}`}
                                                            alt={`Hasil cutting ${index + 1}`}
                                                            className="w-full h-auto"
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Metadata */}
                    <div className="space-y-6">
                        {/* Operator Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="w-5 h-5" />
                                    <span>Operator</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-600">Nama</div>
                                    <div className="font-medium">{report.operator?.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Email</div>
                                    <div className="font-medium">{report.operator?.email || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Shift</div>
                                    <div className="font-medium">{report.shift?.nama_shift || 'N/A'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Production Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="w-5 h-5" />
                                    <span>Informasi Produksi</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-600">Customer</div>
                                    <div className="font-medium">{report.customer?.nama_customer || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Pattern</div>
                                    <div className="font-medium">{report.pattern?.nama_pattern || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Jenis Kain</div>
                                    <div className="font-medium">{report.jenisKain?.nama_kain || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Mesin</div>
                                    <div className="font-medium">{report.mesin?.nama_mesin || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Line Produksi</div>
                                    <div className="font-medium">{report.lineProduksi?.nama_line || 'N/A'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detail Cutting */}
                        {report.detailCuttings && Array.isArray(report.detailCuttings) && report.detailCuttings.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detail Cutting</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {report.detailCuttings.map((detail, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div>
                                                    <div className="font-medium">{detail.size}</div>
                                                    <div className="text-sm text-gray-600">{detail.quantity} pcs</div>
                                                </div>
                                                {detail.defect_count > 0 && (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        {detail.defect_count} defect
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
