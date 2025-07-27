import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { DollarSign, Edit, Package, Palette, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Fabric {
    id: number;
    kode_kain: string;
    nama_kain: string;
    kategori: string;
    gramasi: number;
    lebar_standar: number;
    warna_tersedia: string[];
    supplier: string;
    harga_per_meter: number;
    status: 'aktif' | 'non_aktif';
    keterangan: string;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_fabrics: number;
    active_fabrics: number;
    total_categories: number;
    avg_price: number;
}

interface Props {
    fabrics: Fabric[];
    stats: Stats;
}

export default function FabricsIndex({ fabrics, stats }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
    const [warnaColors, setWarnaColors] = useState<string[]>(['']);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        kode_kain: '',
        nama_kain: '',
        kategori: '',
        gramasi: 0,
        lebar_standar: 0,
        warna_tersedia: [] as string[],
        supplier: '',
        harga_per_meter: 0,
        keterangan: '',
        status: 'aktif' as 'aktif' | 'non_aktif',
    });

    const categoriesList = [
        'Cotton', 'Polyester', 'Viscose', 'Linen', 'Silk', 'Wool', 'Denim', 'Jersey', 'Fleece', 'Canvas'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, warna_tersedia: warnaColors.filter(color => color.trim() !== '') };
        
        if (selectedFabric) {
            put(route('admin.master.fabrics.update', selectedFabric.id), {
                ...payload,
                onSuccess: () => {
                    setIsEditOpen(false);
                    reset();
                    setWarnaColors(['']);
                    setSelectedFabric(null);
                }
            });
        } else {
            post(route('admin.master.fabrics.store'), {
                ...payload,
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                    setWarnaColors(['']);
                }
            });
        }
    };

    const handleEdit = (fabric: Fabric) => {
        setSelectedFabric(fabric);
        setData('kode_kain', fabric.kode_kain);
        setData('nama_kain', fabric.nama_kain);
        setData('kategori', fabric.kategori);
        setData('gramasi', fabric.gramasi);
        setData('lebar_standar', fabric.lebar_standar);
        setData('supplier', fabric.supplier || '');
        setData('harga_per_meter', fabric.harga_per_meter);
        setData('keterangan', fabric.keterangan || '');
        setData('status', fabric.status);
        setWarnaColors(fabric.warna_tersedia && fabric.warna_tersedia.length > 0 ? fabric.warna_tersedia : ['']);
        setIsEditOpen(true);
    };

    const handleDelete = (fabric: Fabric) => {
        if (confirm('Yakin ingin menghapus jenis kain ini?')) {
            destroy(route('admin.master.fabrics.destroy', fabric.id));
        }
    };

    const handleToggleStatus = (fabric: Fabric) => {
        put(route('admin.master.fabrics.toggle-status', fabric.id));
    };

    const addColor = () => {
        setWarnaColors([...warnaColors, '']);
    };

    const removeColor = (index: number) => {
        setWarnaColors(warnaColors.filter((_, i) => i !== index));
    };

    const updateColor = (index: number, value: string) => {
        const updated = warnaColors.map((color, i) => 
            i === index ? value : color
        );
        setWarnaColors(updated);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Jenis Kain" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Jenis Kain</h2>
                            <p className="text-gray-600">Kelola data jenis kain dan material</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Jenis Kain
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Jenis Kain</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.total_fabrics}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Kain Aktif</CardTitle>
                                <Power className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.active_fabrics}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Kategori</CardTitle>
                                <Palette className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{stats.total_categories}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Harga</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{formatPrice(stats.avg_price || 0)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fabrics Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Jenis Kain</CardTitle>
                            <CardDescription>
                                Kelola semua data jenis kain dan material produksi
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode & Nama Kain</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Spesifikasi</TableHead>
                                        <TableHead>Warna Tersedia</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Harga/Meter</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fabrics.map((fabric) => (
                                        <TableRow key={fabric.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{fabric.kode_kain}</div>
                                                    <div className="text-sm text-gray-500">{fabric.nama_kain}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{fabric.kategori}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <div>Gramasi: {fabric.gramasi}g/m²</div>
                                                    <div>Lebar: {fabric.lebar_standar}cm</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {fabric.warna_tersedia && fabric.warna_tersedia.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {fabric.warna_tersedia.slice(0, 3).map((warna, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {warna}
                                                            </Badge>
                                                        ))}
                                                        {fabric.warna_tersedia.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{fabric.warna_tersedia.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{fabric.supplier || '-'}</TableCell>
                                            <TableCell className="font-medium">{formatPrice(fabric.harga_per_meter)}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={fabric.status === 'aktif' ? 'default' : 'secondary'}
                                                    className={fabric.status === 'aktif' ? 'bg-green-100 text-green-800' : ''}
                                                >
                                                    {fabric.status === 'aktif' ? 'Aktif' : 'Non Aktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(fabric)}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(fabric)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(fabric)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Create/Edit Dialog */}
                    <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
                        if (!open) {
                            setIsCreateOpen(false);
                            setIsEditOpen(false);
                            reset();
                            setWarnaColors(['']);
                            setSelectedFabric(null);
                        }
                    }}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{selectedFabric ? 'Edit Jenis Kain' : 'Tambah Jenis Kain Baru'}</DialogTitle>
                                <DialogDescription>
                                    {selectedFabric ? 'Update informasi jenis kain' : 'Tambahkan jenis kain baru ke database'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kode_kain">Kode Kain *</Label>
                                        <Input
                                            id="kode_kain"
                                            value={data.kode_kain}
                                            onChange={(e) => setData('kode_kain', e.target.value)}
                                            placeholder="Contoh: CTN001"
                                        />
                                        {errors.kode_kain && <p className="text-red-500 text-sm">{errors.kode_kain}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="nama_kain">Nama Kain *</Label>
                                        <Input
                                            id="nama_kain"
                                            value={data.nama_kain}
                                            onChange={(e) => setData('nama_kain', e.target.value)}
                                            placeholder="Contoh: Cotton Combed 30s"
                                        />
                                        {errors.nama_kain && <p className="text-red-500 text-sm">{errors.nama_kain}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kategori">Kategori *</Label>
                                        <Select value={data.kategori} onValueChange={(value) => setData('kategori', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoriesList.map((category) => (
                                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.kategori && <p className="text-red-500 text-sm">{errors.kategori}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value: 'aktif' | 'non_aktif') => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="non_aktif">Non Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="gramasi">Gramasi (g/m²) *</Label>
                                        <Input
                                            id="gramasi"
                                            type="number"
                                            step="0.01"
                                            value={data.gramasi}
                                            onChange={(e) => setData('gramasi', parseFloat(e.target.value) || 0)}
                                            placeholder="180"
                                        />
                                        {errors.gramasi && <p className="text-red-500 text-sm">{errors.gramasi}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="lebar_standar">Lebar Standar (cm) *</Label>
                                        <Input
                                            id="lebar_standar"
                                            type="number"
                                            step="0.01"
                                            value={data.lebar_standar}
                                            onChange={(e) => setData('lebar_standar', parseFloat(e.target.value) || 0)}
                                            placeholder="150"
                                        />
                                        {errors.lebar_standar && <p className="text-red-500 text-sm">{errors.lebar_standar}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="harga_per_meter">Harga per Meter (IDR) *</Label>
                                        <Input
                                            id="harga_per_meter"
                                            type="number"
                                            step="0.01"
                                            value={data.harga_per_meter}
                                            onChange={(e) => setData('harga_per_meter', parseFloat(e.target.value) || 0)}
                                            placeholder="25000"
                                        />
                                        {errors.harga_per_meter && <p className="text-red-500 text-sm">{errors.harga_per_meter}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Input
                                        id="supplier"
                                        value={data.supplier}
                                        onChange={(e) => setData('supplier', e.target.value)}
                                        placeholder="Nama supplier kain"
                                    />
                                </div>

                                {/* Warna Tersedia */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label>Warna Tersedia</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addColor}>
                                            <Plus className="w-4 h-4 mr-1" />
                                            Tambah Warna
                                        </Button>
                                    </div>
                                    
                                    {warnaColors.map((warna, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                placeholder="Nama warna (contoh: Merah, Biru)"
                                                value={warna}
                                                onChange={(e) => updateColor(index, e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeColor(index)}
                                                className="text-red-600"
                                                disabled={warnaColors.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                                        placeholder="Informasi tambahan tentang jenis kain ini"
                                        rows={3}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateOpen(false);
                                            setIsEditOpen(false);
                                            reset();
                                            setWarnaColors(['']);
                                            setSelectedFabric(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : (selectedFabric ? 'Update' : 'Simpan')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
