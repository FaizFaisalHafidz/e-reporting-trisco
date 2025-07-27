import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MobileLayout from '@/layouts/mobile-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
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
    masterData?: MasterData;
    user?: {
        id: number;
        name: string;
        email: string;
    };
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

export default function CreateReport({ masterData, user }: Props) {
    // Default user if not provided
    const currentUser = user || { id: 0, name: 'Guest', email: '' };
    
    // Default masterData if not provided
    const defaultMasterData: MasterData = {
        shifts: [],
        machines: [],
        fabrics: [],
        lines: [],
        customers: [],
        patterns: [],
        operators: []
    };
    
    const currentMasterData = masterData || defaultMasterData;
    
    const [detailCuttings, setDetailCuttings] = useState<DetailCutting[]>([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;
    
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
        operator_id: currentUser?.id?.toString() || '',
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
        foto_hasil: [] as File[],
    });

    const setData = (field: string, value: any) => {
        setDataField(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (status: 'draft' | 'submitted') => {
        setProcessing(true);
        setErrors({});
        
        const formData = new FormData();
        
        // Add form fields
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'foto_hasil') {
                // Handle file uploads
                (value as File[]).forEach((file, index) => {
                    formData.append(`foto_hasil[${index}]`, file);
                });
            } else if (key === 'jenis_defect') {
                // Handle array data
                (value as string[]).forEach((item, index) => {
                    formData.append(`jenis_defect[${index}]`, item);
                });
            } else {
                formData.append(key, value as string);
            }
        });
        
        // Add status
        formData.append('status_laporan', status);
        
        // Add detail cutting
        detailCuttings.forEach((detail, index) => {
            formData.append(`detail_cutting[${index}][pattern_name]`, detail.pattern_name);
            formData.append(`detail_cutting[${index}][ukuran_pattern]`, detail.ukuran_pattern);
            formData.append(`detail_cutting[${index}][jumlah_potongan]`, detail.jumlah_potongan.toString());
            formData.append(`detail_cutting[${index}][panjang_pattern_cm]`, detail.panjang_pattern_cm.toString());
            formData.append(`detail_cutting[${index}][lebar_pattern_cm]`, detail.lebar_pattern_cm.toString());
            formData.append(`detail_cutting[${index}][waste_percentage]`, detail.waste_percentage.toString());
            formData.append(`detail_cutting[${index}][keterangan]`, detail.keterangan || '');
        });
        
        router.visit(route('reports.store'), {
            method: 'post',
            data: formData,
            onSuccess: () => {
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
            jumlah_potongan: 0,
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

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2" />
                                Informasi Order
                            </CardTitle>
                            <CardDescription>Data dasar laporan cutting</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="nomor_order">Nomor Order *</Label>
                                <Input
                                    id="nomor_order"
                                    value={data.nomor_order}
                                    onChange={(e) => setData('nomor_order', e.target.value)}
                                    placeholder="Masukkan nomor order"
                                />
                                {errors.nomor_order && <p className="text-sm text-red-600">{errors.nomor_order}</p>}
                            </div>

                            <div>
                                <Label htmlFor="batch_number">Batch Number *</Label>
                                <Input
                                    id="batch_number"
                                    value={data.batch_number}
                                    onChange={(e) => setData('batch_number', e.target.value)}
                                    placeholder="Masukkan batch number"
                                />
                                {errors.batch_number && <p className="text-sm text-red-600">{errors.batch_number}</p>}
                            </div>

                            <div>
                                <Label htmlFor="tanggal_laporan">Tanggal Laporan *</Label>
                                <Input
                                    id="tanggal_laporan"
                                    type="date"
                                    value={data.tanggal_laporan}
                                    onChange={(e) => setData('tanggal_laporan', e.target.value)}
                                />
                                {errors.tanggal_laporan && <p className="text-sm text-red-600">{errors.tanggal_laporan}</p>}
                            </div>

                            <div>
                                <Label htmlFor="customer_id">Customer *</Label>
                                <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentMasterData.customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.nama_customer} ({customer.kode_customer})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
                            </div>
                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Shift & Operator
                            </CardTitle>
                            <CardDescription>Informasi shift dan operator</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="shift_id">Shift *</Label>
                                <Select value={data.shift_id} onValueChange={(value) => setData('shift_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih shift" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentMasterData.shifts.map((shift) => (
                                            <SelectItem key={shift.id} value={shift.id.toString()}>
                                                {shift.nama_shift} ({shift.jam_mulai} - {shift.jam_selesai})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.shift_id && <p className="text-sm text-red-600">{errors.shift_id}</p>}
                            </div>

                            {/* <div>
                                <Label htmlFor="operator_id">Operator *</Label>
                                <Select value={data.operator_id} onValueChange={(value) => setData('operator_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentMasterData.operators.map((operator) => (
                                            <SelectItem key={operator.id} value={operator.id.toString()}>
                                                {operator.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.operator_id && <p className="text-sm text-red-600">{errors.operator_id}</p>}
                            </div> */}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="waktu_mulai_cutting">Waktu Mulai *</Label>
                                    <Input
                                        id="waktu_mulai_cutting"
                                        type="time"
                                        value={data.waktu_mulai_cutting}
                                        onChange={(e) => setData('waktu_mulai_cutting', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="waktu_selesai_cutting">Waktu Selesai *</Label>
                                    <Input
                                        id="waktu_selesai_cutting"
                                        type="time"
                                        value={data.waktu_selesai_cutting}
                                        onChange={(e) => setData('waktu_selesai_cutting', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 3:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Factory className="w-5 h-5 mr-2" />
                                Mesin & Line
                            </CardTitle>
                            <CardDescription>Setup produksi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="mesin_id">Mesin *</Label>
                                <Select value={data.mesin_id} onValueChange={(value) => setData('mesin_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih mesin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentMasterData.machines.map((machine) => (
                                            <SelectItem key={machine.id} value={machine.id.toString()}>
                                                {machine.nama_mesin} ({machine.kode_mesin})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="line_produksi_id">Line Produksi *</Label>
                                <Select value={data.line_produksi_id} onValueChange={(value) => setData('line_produksi_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih line produksi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentMasterData.lines.map((line) => (
                                            <SelectItem key={line.id} value={line.id.toString()}>
                                                {line.nama_line} ({line.kode_line})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="kondisi_mesin">Kondisi Mesin *</Label>
                                <Select value={data.kondisi_mesin} onValueChange={(value) => setData('kondisi_mesin', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kondisi mesin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baik">Baik</SelectItem>
                                        <SelectItem value="perlu_maintenance">Perlu Maintenance</SelectItem>
                                        <SelectItem value="rusak">Rusak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="catatan_maintenance">Catatan Maintenance</Label>
                                <Textarea
                                    id="catatan_maintenance"
                                    value={data.catatan_maintenance}
                                    onChange={(e) => setData('catatan_maintenance', e.target.value)}
                                    placeholder="Catatan kondisi mesin atau maintenance yang diperlukan"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                );

            case 4:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Scissors className="w-5 h-5 mr-2" />
                                Material & Pattern
                            </CardTitle>
                            <CardDescription>Informasi bahan dan pattern</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="pattern_id">Pattern *</Label>
                                <Select value={data.pattern_id} onValueChange={(value) => setData('pattern_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih pattern" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentMasterData.patterns.map((pattern) => (
                                            <SelectItem key={pattern.id} value={pattern.id.toString()}>
                                                {pattern.nama_pattern} ({pattern.kode_pattern}) - {pattern.difficulty_level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="jenis_kain_id">Jenis Kain *</Label>
                                <Select value={data.jenis_kain_id} onValueChange={(value) => setData('jenis_kain_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis kain" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentMasterData.fabrics.map((fabric) => (
                                            <SelectItem key={fabric.id} value={fabric.id.toString()}>
                                                {fabric.nama_kain} ({fabric.kode_kain})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="jumlah_layer">Jumlah Layer *</Label>
                                    <Input
                                        id="jumlah_layer"
                                        type="number"
                                        min="1"
                                        value={data.jumlah_layer}
                                        onChange={(e) => setData('jumlah_layer', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="panjang_kain_meter">Panjang (m) *</Label>
                                    <Input
                                        id="panjang_kain_meter"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.panjang_kain_meter}
                                        onChange={(e) => setData('panjang_kain_meter', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="lebar_kain_cm">Lebar Kain (cm) *</Label>
                                <Input
                                    id="lebar_kain_cm"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={data.lebar_kain_cm}
                                    onChange={(e) => setData('lebar_kain_cm', e.target.value)}
                                    placeholder="0.0"
                                />
                            </div>
                        </CardContent>
                    </Card>
                );

            case 5:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="w-5 h-5 mr-2" />
                                Target & Hasil
                            </CardTitle>
                            <CardDescription>Target produksi dan kualitas hasil</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="target_quantity_pcs">Target (pcs) *</Label>
                                    <Input
                                        id="target_quantity_pcs"
                                        type="number"
                                        min="1"
                                        value={data.target_quantity_pcs}
                                        onChange={(e) => setData('target_quantity_pcs', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="actual_quantity_pcs">Actual (pcs) *</Label>
                                    <Input
                                        id="actual_quantity_pcs"
                                        type="number"
                                        min="0"
                                        value={data.actual_quantity_pcs}
                                        onChange={(e) => setData('actual_quantity_pcs', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="kualitas_hasil">Kualitas Hasil *</Label>
                                <Select value={data.kualitas_hasil} onValueChange={(value) => setData('kualitas_hasil', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih grade kualitas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baik">Baik</SelectItem>
                                        <SelectItem value="cukup">Cukup</SelectItem>
                                        <SelectItem value="kurang">Kurang</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="jumlah_defect">Jumlah Defect *</Label>
                                <Input
                                    id="jumlah_defect"
                                    type="number"
                                    min="0"
                                    value={data.jumlah_defect}
                                    onChange={(e) => setData('jumlah_defect', e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="suhu_ruangan">Suhu Ruangan (°C)</Label>
                                    <Input
                                        id="suhu_ruangan"
                                        type="number"
                                        step="0.1"
                                        value={data.suhu_ruangan}
                                        onChange={(e) => setData('suhu_ruangan', e.target.value)}
                                        placeholder="25.0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="kelembaban">Kelembaban (%)</Label>
                                    <Input
                                        id="kelembaban"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={data.kelembaban}
                                        onChange={(e) => setData('kelembaban', e.target.value)}
                                        placeholder="60.0"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="catatan_operator">Catatan Operator</Label>
                                <Textarea
                                    id="catatan_operator"
                                    value={data.catatan_operator}
                                    onChange={(e) => setData('catatan_operator', e.target.value)}
                                    placeholder="Catatan tambahan dari operator"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="foto_hasil">Upload Foto Hasil (Opsional)</Label>
                                <Input
                                    id="foto_hasil"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setData('foto_hasil', files);
                                    }}
                                    className="cursor-pointer"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Maksimal 5 foto, ukuran maksimal 2MB per foto
                                </p>
                                {data.foto_hasil.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium">File terpilih:</p>
                                        <ul className="text-sm text-muted-foreground">
                                            {data.foto_hasil.map((file, index) => (
                                                <li key={index}>• {file.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );

            case 6:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Scissors className="w-5 h-5 mr-2" />
                                Detail Cutting
                            </CardTitle>
                            <CardDescription>Detail potongan pattern (opsional)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {detailCuttings.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 mb-4">Belum ada detail cutting</p>
                                    <Button onClick={addDetailCutting} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah Detail
                                    </Button>
                                </div>
                            ) : (
                                detailCuttings.map((detail, index) => (
                                    <Card key={index} className="border-dashed">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">Detail {index + 1}</CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDetailCutting(index)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <Label>Nama Pattern</Label>
                                                <Input
                                                    value={detail.pattern_name}
                                                    onChange={(e) => updateDetailCutting(index, 'pattern_name', e.target.value)}
                                                    placeholder="Nama pattern"
                                                />
                                            </div>
                                            <div>
                                                <Label>Ukuran Pattern</Label>
                                                <Input
                                                    value={detail.ukuran_pattern}
                                                    onChange={(e) => updateDetailCutting(index, 'ukuran_pattern', e.target.value)}
                                                    placeholder="Ukuran (misal: S, M, L)"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label>Jumlah Potongan</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={detail.jumlah_potongan}
                                                        onChange={(e) => updateDetailCutting(index, 'jumlah_potongan', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Waste (%)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="100"
                                                        value={detail.waste_percentage}
                                                        onChange={(e) => updateDetailCutting(index, 'waste_percentage', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label>Panjang (cm)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        value={detail.panjang_pattern_cm}
                                                        onChange={(e) => updateDetailCutting(index, 'panjang_pattern_cm', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Lebar (cm)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        value={detail.lebar_pattern_cm}
                                                        onChange={(e) => updateDetailCutting(index, 'lebar_pattern_cm', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Keterangan</Label>
                                                <Textarea
                                                    value={detail.keterangan}
                                                    onChange={(e) => updateDetailCutting(index, 'keterangan', e.target.value)}
                                                    placeholder="Keterangan tambahan"
                                                    rows={2}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                            
                            {detailCuttings.length > 0 && (
                                <Button onClick={addDetailCutting} variant="outline" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Detail Lagi
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <MobileLayout title="Buat Laporan" user={currentUser}>
            <Head title="Buat Laporan Cutting" />
            
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
                            <h1 className="text-xl font-bold text-gray-900">Buat Laporan</h1>
                            <p className="text-sm text-gray-600">Step {currentStep} dari {totalSteps}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-[#1e3a8a] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>

                {/* Form Step */}
                {renderStep()}

                {/* Navigation */}
                <div className="pt-6 border-t border-gray-200">
                    {currentStep < totalSteps ? (
                        <div className="flex justify-between items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                disabled={currentStep === 1}
                                className="flex-1"
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                                className="bg-[#1e3a8a] hover:bg-[#1e40af] flex-1"
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Back Button */}
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                className="w-full h-12 text-base font-medium"
                            >
                                Sebelumnya
                            </Button>
                            
                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleSubmit('draft')}
                                    disabled={processing}
                                    className="w-full h-12 text-base font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    {processing ? 'Menyimpan...' : 'Simpan Draft'}
                                </Button>
                                <Button
                                    onClick={() => handleSubmit('submitted')}
                                    disabled={processing}
                                    className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Send className="w-5 h-5 mr-2" />
                                    {processing ? 'Mengirim...' : 'Kirim Laporan'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
