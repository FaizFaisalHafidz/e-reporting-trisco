import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    Factory,
    Package,
    Plus,
    Save,
    Scissors,
    Send,
    Settings,
    Trash2,
    User
} from 'lucide-react';
import { useState } from 'react';

interface MasterData {
    shifts: Array<{
        id: number;
        nama_shift: string;
        jam_mulai: string;
        jam_selesai: string;
    }>;
    machines: Array<{
        id: number;
        kode_mesin: string;
        nama_mesin: string;
    }>;
    fabrics: Array<{
        id: number;
        kode_kain: string;
        nama_kain: string;
        warna_tersedia: string[];
    }>;
    lines: Array<{
        id: number;
        kode_line: string;
        nama_line: string;
    }>;
    customers: Array<{
        id: number;
        kode_customer: string;
        nama_customer: string;
    }>;
    patterns: Array<{
        id: number;
        kode_pattern: string;
        nama_pattern: string;
        difficulty_level: string;
    }>;
    operators: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

interface Props {
    masterData: MasterData;
}

interface DetailCutting {
    pattern_name: string;
    ukuran_pattern: string;
    jumlah_potongan: number;
    panjang_pattern_cm: number;
    lebar_pattern_cm: number;
    waste_percentage: number;
    keterangan: string;
}

export default function CreateInputReport({ masterData }: Props) {
    const [detailCuttings, setDetailCuttings] = useState<DetailCutting[]>([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [data, setDataField] = useState({
        nomor_order: '',
        batch_number: '',
        tanggal_laporan: new Date().toISOString().split('T')[0],
        shift_id: '',
        mesin_id: '',
        line_produksi_id: '',
        customer_id: '',
        pattern_id: '',
        jenis_kain_id: '',
        operator_id: '',
        target_quantity_pcs: '',
        actual_quantity_pcs: '',
        jumlah_layer: '',
        panjang_kain_meter: '',
        lebar_kain_cm: '',
        waktu_mulai_cutting: '',
        waktu_selesai_cutting: '',
        kondisi_mesin: '',
        catatan_maintenance: '',
        kualitas_hasil: '',
        jumlah_defect: '',
        jenis_defect: [] as string[],
        catatan_operator: '',
        suhu_ruangan: '',
        kelembaban: '',
        status_laporan: 'draft',
    });

    const setData = (field: string, value: any) => {
        setDataField(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (status: 'draft' | 'submitted') => {
        setProcessing(true);
        setErrors({});
        
        const submitData = {
            ...data,
            status_laporan: status,
            detail_cutting: detailCuttings.map(detail => ({
                pattern_name: detail.pattern_name,
                ukuran_pattern: detail.ukuran_pattern,
                jumlah_potongan: detail.jumlah_potongan,
                panjang_pattern_cm: detail.panjang_pattern_cm,
                lebar_pattern_cm: detail.lebar_pattern_cm,
                waste_percentage: detail.waste_percentage,
                keterangan: detail.keterangan,
            })),
        };
        
        router.visit(route('admin.input-reports.store'), {
            method: 'post',
            data: submitData,
            onSuccess: () => {
                setDataField({
                    nomor_order: '',
                    batch_number: '',
                    tanggal_laporan: new Date().toISOString().split('T')[0],
                    shift_id: '',
                    mesin_id: '',
                    line_produksi_id: '',
                    customer_id: '',
                    pattern_id: '',
                    jenis_kain_id: '',
                    operator_id: '',
                    target_quantity_pcs: '',
                    actual_quantity_pcs: '',
                    jumlah_layer: '',
                    panjang_kain_meter: '',
                    lebar_kain_cm: '',
                    waktu_mulai_cutting: '',
                    waktu_selesai_cutting: '',
                    kondisi_mesin: '',
                    catatan_maintenance: '',
                    kualitas_hasil: '',
                    jumlah_defect: '',
                    jenis_defect: [],
                    catatan_operator: '',
                    suhu_ruangan: '',
                    kelembaban: '',
                    status_laporan: 'draft',
                });
                setDetailCuttings([]);
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    const addDetailCutting = () => {
        setDetailCuttings([...detailCuttings, {
            pattern_name: '',
            ukuran_pattern: '',
            jumlah_potongan: 1,
            panjang_pattern_cm: 0,
            lebar_pattern_cm: 0,
            waste_percentage: 0,
            keterangan: '',
        }]);
    };

    const removeDetailCutting = (index: number) => {
        setDetailCuttings(detailCuttings.filter((_, i) => i !== index));
    };

    const updateDetailCutting = (index: number, field: keyof DetailCutting, value: any) => {
        const updated = [...detailCuttings];
        updated[index] = { ...updated[index], [field]: value };
        setDetailCuttings(updated);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Laporan Baru" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/admin/input-reports">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Buat Laporan Baru</h1>
                            <p className="text-muted-foreground">
                                Input data laporan cutting produksi
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => handleSubmit('draft')}
                            disabled={processing}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Simpan Draft
                        </Button>
                        <Button 
                            type="button"
                            onClick={() => handleSubmit('submitted')}
                            disabled={processing}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Submit Laporan
                        </Button>
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Informasi Dasar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Informasi Dasar
                            </CardTitle>
                            <CardDescription>
                                Data dasar order dan batch produksi
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="nomor_order">Nomor Order *</Label>
                                    <Input
                                        id="nomor_order"
                                        value={data.nomor_order}
                                        onChange={(e) => setData('nomor_order', e.target.value)}
                                        placeholder="Masukkan nomor order"
                                        className={errors.nomor_order ? 'border-red-500' : ''}
                                    />
                                    {errors.nomor_order && <p className="text-sm text-red-500">{errors.nomor_order}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batch_number">Batch Number *</Label>
                                    <Input
                                        id="batch_number"
                                        value={data.batch_number}
                                        onChange={(e) => setData('batch_number', e.target.value)}
                                        placeholder="Masukkan batch number"
                                        className={errors.batch_number ? 'border-red-500' : ''}
                                    />
                                    {errors.batch_number && <p className="text-sm text-red-500">{errors.batch_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_laporan">Tanggal Laporan *</Label>
                                    <Input
                                        id="tanggal_laporan"
                                        type="date"
                                        value={data.tanggal_laporan}
                                        onChange={(e) => setData('tanggal_laporan', e.target.value)}
                                        className={errors.tanggal_laporan ? 'border-red-500' : ''}
                                    />
                                    {errors.tanggal_laporan && <p className="text-sm text-red-500">{errors.tanggal_laporan}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shift dan Operator */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Shift dan Operator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="shift_id">Shift *</Label>
                                    <Select value={data.shift_id} onValueChange={(value) => setData('shift_id', value)}>
                                        <SelectTrigger className={errors.shift_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterData.shifts.map((shift) => (
                                                <SelectItem key={shift.id} value={shift.id.toString()}>
                                                    {shift.nama_shift} ({shift.jam_mulai} - {shift.jam_selesai})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.shift_id && <p className="text-sm text-red-500">{errors.shift_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="operator_id">Operator *</Label>
                                    <Select value={data.operator_id} onValueChange={(value) => setData('operator_id', value)}>
                                        <SelectTrigger className={errors.operator_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterData.operators.map((operator) => (
                                                <SelectItem key={operator.id} value={operator.id.toString()}>
                                                    {operator.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.operator_id && <p className="text-sm text-red-500">{errors.operator_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mesin dan Line Produksi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Factory className="h-5 w-5" />
                                Mesin dan Line Produksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mesin_id">Mesin Cutting *</Label>
                                    <Select value={data.mesin_id} onValueChange={(value) => setData('mesin_id', value)}>
                                        <SelectTrigger className={errors.mesin_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih mesin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterData.machines.map((machine) => (
                                                <SelectItem key={machine.id} value={machine.id.toString()}>
                                                    {machine.kode_mesin} - {machine.nama_mesin}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.mesin_id && <p className="text-sm text-red-500">{errors.mesin_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="line_produksi_id">Line Produksi *</Label>
                                    <Select value={data.line_produksi_id} onValueChange={(value) => setData('line_produksi_id', value)}>
                                        <SelectTrigger className={errors.line_produksi_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih line produksi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterData.lines.map((line) => (
                                                <SelectItem key={line.id} value={line.id.toString()}>
                                                    {line.kode_line} - {line.nama_line}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.line_produksi_id && <p className="text-sm text-red-500">{errors.line_produksi_id}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kondisi_mesin">Kondisi Mesin</Label>
                                <Select value={data.kondisi_mesin} onValueChange={(value) => setData('kondisi_mesin', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kondisi mesin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baik">Baik</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="rusak">Rusak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.kondisi_mesin === 'maintenance' && (
                                <div className="space-y-2">
                                    <Label htmlFor="catatan_maintenance">Catatan Maintenance</Label>
                                    <Textarea
                                        id="catatan_maintenance"
                                        value={data.catatan_maintenance}
                                        onChange={(e) => setData('catatan_maintenance', e.target.value)}
                                        placeholder="Catatan maintenance..."
                                        rows={3}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Material dan Pattern */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scissors className="h-5 w-5" />
                                Material dan Pattern
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer *</Label>
                                    <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                        <SelectTrigger className={errors.customer_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterData.customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.kode_customer} - {customer.nama_customer}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pattern_id">Pattern *</Label>
                                    <Select value={data.pattern_id} onValueChange={(value) => setData('pattern_id', value)}>
                                        <SelectTrigger className={errors.pattern_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih pattern" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterData.patterns.map((pattern) => (
                                                <SelectItem key={pattern.id} value={pattern.id.toString()}>
                                                    {pattern.kode_pattern} - {pattern.nama_pattern}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.pattern_id && <p className="text-sm text-red-500">{errors.pattern_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kain_id">Jenis Kain *</Label>
                                    <Select value={data.jenis_kain_id} onValueChange={(value) => setData('jenis_kain_id', value)}>
                                        <SelectTrigger className={errors.jenis_kain_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih jenis kain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterData.fabrics.map((fabric) => (
                                                <SelectItem key={fabric.id} value={fabric.id.toString()}>
                                                    {fabric.kode_kain} - {fabric.nama_kain}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.jenis_kain_id && <p className="text-sm text-red-500">{errors.jenis_kain_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Target dan Dimensi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Target dan Dimensi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="target_quantity_pcs">Target Quantity (pcs) *</Label>
                                    <Input
                                        id="target_quantity_pcs"
                                        type="number"
                                        value={data.target_quantity_pcs}
                                        onChange={(e) => setData('target_quantity_pcs', e.target.value)}
                                        placeholder="0"
                                        className={errors.target_quantity_pcs ? 'border-red-500' : ''}
                                    />
                                    {errors.target_quantity_pcs && <p className="text-sm text-red-500">{errors.target_quantity_pcs}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="actual_quantity_pcs">Actual Quantity (pcs)</Label>
                                    <Input
                                        id="actual_quantity_pcs"
                                        type="number"
                                        value={data.actual_quantity_pcs}
                                        onChange={(e) => setData('actual_quantity_pcs', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_layer">Jumlah Layer *</Label>
                                    <Input
                                        id="jumlah_layer"
                                        type="number"
                                        value={data.jumlah_layer}
                                        onChange={(e) => setData('jumlah_layer', e.target.value)}
                                        placeholder="0"
                                        className={errors.jumlah_layer ? 'border-red-500' : ''}
                                    />
                                    {errors.jumlah_layer && <p className="text-sm text-red-500">{errors.jumlah_layer}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="panjang_kain_meter">Panjang Kain (meter) *</Label>
                                    <Input
                                        id="panjang_kain_meter"
                                        type="number"
                                        step="0.01"
                                        value={data.panjang_kain_meter}
                                        onChange={(e) => setData('panjang_kain_meter', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.panjang_kain_meter ? 'border-red-500' : ''}
                                    />
                                    {errors.panjang_kain_meter && <p className="text-sm text-red-500">{errors.panjang_kain_meter}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lebar_kain_cm">Lebar Kain (cm) *</Label>
                                    <Input
                                        id="lebar_kain_cm"
                                        type="number"
                                        step="0.01"
                                        value={data.lebar_kain_cm}
                                        onChange={(e) => setData('lebar_kain_cm', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.lebar_kain_cm ? 'border-red-500' : ''}
                                    />
                                    {errors.lebar_kain_cm && <p className="text-sm text-red-500">{errors.lebar_kain_cm}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Waktu Cutting */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Waktu Cutting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="waktu_mulai_cutting">Waktu Mulai</Label>
                                    <Input
                                        id="waktu_mulai_cutting"
                                        type="datetime-local"
                                        value={data.waktu_mulai_cutting}
                                        onChange={(e) => setData('waktu_mulai_cutting', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="waktu_selesai_cutting">Waktu Selesai</Label>
                                    <Input
                                        id="waktu_selesai_cutting"
                                        type="datetime-local"
                                        value={data.waktu_selesai_cutting}
                                        onChange={(e) => setData('waktu_selesai_cutting', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kualitas dan Environment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Kualitas dan Environment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kualitas_hasil">Kualitas Hasil</Label>
                                    <Select value={data.kualitas_hasil} onValueChange={(value) => setData('kualitas_hasil', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kualitas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="excellent">Excellent</SelectItem>
                                            <SelectItem value="good">Good</SelectItem>
                                            <SelectItem value="fair">Fair</SelectItem>
                                            <SelectItem value="poor">Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_defect">Jumlah Defect</Label>
                                    <Input
                                        id="jumlah_defect"
                                        type="number"
                                        value={data.jumlah_defect}
                                        onChange={(e) => setData('jumlah_defect', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="suhu_ruangan">Suhu Ruangan (°C)</Label>
                                    <Input
                                        id="suhu_ruangan"
                                        type="number"
                                        step="0.1"
                                        value={data.suhu_ruangan}
                                        onChange={(e) => setData('suhu_ruangan', e.target.value)}
                                        placeholder="0.0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kelembaban">Kelembaban (%)</Label>
                                    <Input
                                        id="kelembaban"
                                        type="number"
                                        step="0.1"
                                        value={data.kelembaban}
                                        onChange={(e) => setData('kelembaban', e.target.value)}
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="catatan_operator">Catatan Operator</Label>
                                <Textarea
                                    id="catatan_operator"
                                    value={data.catatan_operator}
                                    onChange={(e) => setData('catatan_operator', e.target.value)}
                                    placeholder="Catatan tambahan..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detail Cutting */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Detail Cutting</CardTitle>
                                    <CardDescription>
                                        Detail potongan pattern (opsional)
                                    </CardDescription>
                                </div>
                                <Button type="button" variant="outline" onClick={addDetailCutting}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Detail
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {detailCuttings.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada detail cutting. Klik "Tambah Detail" untuk menambahkan.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {detailCuttings.map((detail, index) => (
                                        <Card key={index} className="border-2 border-dashed">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm">Detail #{index + 1}</CardTitle>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeDetailCutting(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Nama Pattern</Label>
                                                        <Input
                                                            value={detail.pattern_name}
                                                            onChange={(e) => updateDetailCutting(index, 'pattern_name', e.target.value)}
                                                            placeholder="Nama pattern"
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Ukuran</Label>
                                                        <Input
                                                            value={detail.ukuran_pattern}
                                                            onChange={(e) => updateDetailCutting(index, 'ukuran_pattern', e.target.value)}
                                                            placeholder="S, M, L, XL"
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Jumlah Potongan</Label>
                                                        <Input
                                                            type="number"
                                                            value={detail.jumlah_potongan}
                                                            onChange={(e) => updateDetailCutting(index, 'jumlah_potongan', parseInt(e.target.value) || 0)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Panjang (cm)</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            value={detail.panjang_pattern_cm}
                                                            onChange={(e) => updateDetailCutting(index, 'panjang_pattern_cm', parseFloat(e.target.value) || 0)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Lebar (cm)</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            value={detail.lebar_pattern_cm}
                                                            onChange={(e) => updateDetailCutting(index, 'lebar_pattern_cm', parseFloat(e.target.value) || 0)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Waste (%)</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            value={detail.waste_percentage}
                                                            onChange={(e) => updateDetailCutting(index, 'waste_percentage', parseFloat(e.target.value) || 0)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Keterangan</Label>
                                                    <Textarea
                                                        value={detail.keterangan}
                                                        onChange={(e) => updateDetailCutting(index, 'keterangan', e.target.value)}
                                                        placeholder="Keterangan tambahan..."
                                                        rows={2}
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>

                {/* Action Buttons Fixed */}
                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => handleSubmit('draft')}
                        disabled={processing}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Draft
                    </Button>
                    <Button 
                        type="button"
                        onClick={() => handleSubmit('submitted')}
                        disabled={processing}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Laporan
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
