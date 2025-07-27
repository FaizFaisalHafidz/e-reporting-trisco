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
import { Clock, Edit, Layers, Plus, Power, Shirt, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Pattern {
    id: number;
    kode_pattern: string;
    nama_pattern: string;
    kategori_produk: 'kemeja' | 'celana' | 'dress' | 'jaket' | 'rok' | 'lainnya';
    ukuran_tersedia: string[];
    tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'sangat_sulit';
    estimasi_waktu_cutting_menit: number;
    keterangan: string;
    gambar_pattern: string;
    status: 'aktif' | 'non_aktif' | 'draft';
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_patterns: number;
    active_patterns: number;
    draft_patterns: number;
    avg_cutting_time: number;
}

interface Props {
    patterns: Pattern[];
    stats: Stats;
}

export default function PatternsIndex({ patterns, stats }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        kode_pattern: '',
        nama_pattern: '',
        kategori_produk: 'kemeja' as 'kemeja' | 'celana' | 'dress' | 'jaket' | 'rok' | 'lainnya',
        ukuran_tersedia: [] as string[],
        tingkat_kesulitan: 'sedang' as 'mudah' | 'sedang' | 'sulit' | 'sangat_sulit',
        estimasi_waktu_cutting_menit: 60,
        keterangan: '',
        gambar_pattern: '',
        status: 'aktif' as 'aktif' | 'non_aktif' | 'draft',
    });

    const ukuranOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const kategoriOptions = [
        { value: 'kemeja', label: 'Kemeja' },
        { value: 'celana', label: 'Celana' },
        { value: 'dress', label: 'Dress' },
        { value: 'jaket', label: 'Jaket' },
        { value: 'rok', label: 'Rok' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedPattern) {
            put(route('admin.master.patterns.update', selectedPattern.id), {
                onSuccess: () => {
                    setIsEditOpen(false);
                    reset();
                    setSelectedPattern(null);
                }
            });
        } else {
            post(route('admin.master.patterns.store'), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (pattern: Pattern) => {
        setSelectedPattern(pattern);
        setData('kode_pattern', pattern.kode_pattern);
        setData('nama_pattern', pattern.nama_pattern);
        setData('kategori_produk', pattern.kategori_produk);
        setData('ukuran_tersedia', pattern.ukuran_tersedia || []);
        setData('tingkat_kesulitan', pattern.tingkat_kesulitan);
        setData('estimasi_waktu_cutting_menit', pattern.estimasi_waktu_cutting_menit);
        setData('keterangan', pattern.keterangan || '');
        setData('gambar_pattern', pattern.gambar_pattern || '');
        setData('status', pattern.status);
        setIsEditOpen(true);
    };

    const handleDelete = (pattern: Pattern) => {
        if (confirm('Yakin ingin menghapus pattern ini?')) {
            destroy(route('admin.master.patterns.destroy', pattern.id));
        }
    };

    const handleToggleStatus = (pattern: Pattern) => {
        put(route('admin.master.patterns.toggle-status', pattern.id));
    };

    const toggleUkuran = (ukuran: string) => {
        const current = data.ukuran_tersedia;
        if (current.includes(ukuran)) {
            setData('ukuran_tersedia', current.filter(u => u !== ukuran));
        } else {
            setData('ukuran_tersedia', [...current, ukuran]);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'mudah': return 'bg-green-100 text-green-800';
            case 'sedang': return 'bg-yellow-100 text-yellow-800';
            case 'sulit': return 'bg-orange-100 text-orange-800';
            case 'sangat_sulit': return 'bg-red-100 text-red-800';
            default: return '';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'mudah': return 'Mudah';
            case 'sedang': return 'Sedang';
            case 'sulit': return 'Sulit';
            case 'sangat_sulit': return 'Sangat Sulit';
            default: return difficulty;
        }
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}j ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Pattern" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Data Pattern</h2>
                            <p className="text-gray-600">Kelola pola dan model produk</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Pattern
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pattern</CardTitle>
                                <Shirt className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.total_patterns}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pattern Aktif</CardTitle>
                                <Power className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.active_patterns}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Draft Pattern</CardTitle>
                                <Layers className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{stats.draft_patterns}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Waktu Cutting</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{formatTime(Math.round(stats.avg_cutting_time || 0))}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Patterns Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Pattern</CardTitle>
                            <CardDescription>
                                Kelola semua pola dan model produk
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode & Nama Pattern</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Ukuran Tersedia</TableHead>
                                        <TableHead>Tingkat Kesulitan</TableHead>
                                        <TableHead>Estimasi Waktu</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patterns.map((pattern) => (
                                        <TableRow key={pattern.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{pattern.kode_pattern}</div>
                                                    <div className="text-sm text-gray-500">{pattern.nama_pattern}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {kategoriOptions.find(k => k.value === pattern.kategori_produk)?.label || pattern.kategori_produk}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {pattern.ukuran_tersedia?.slice(0, 3).map((ukuran) => (
                                                        <Badge key={ukuran} variant="secondary" className="text-xs">
                                                            {ukuran}
                                                        </Badge>
                                                    ))}
                                                    {pattern.ukuran_tersedia?.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{pattern.ukuran_tersedia.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getDifficultyColor(pattern.tingkat_kesulitan)}>
                                                    {getDifficultyLabel(pattern.tingkat_kesulitan)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-sm">{formatTime(pattern.estimasi_waktu_cutting_menit)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={pattern.status === 'aktif' ? 'default' : 'secondary'}
                                                    className={
                                                        pattern.status === 'aktif' ? 'bg-green-100 text-green-800' :
                                                        pattern.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''
                                                    }
                                                >
                                                    {pattern.status === 'aktif' ? 'Aktif' : 
                                                     pattern.status === 'draft' ? 'Draft' : 'Non Aktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(pattern)}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(pattern)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(pattern)}
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
                            setSelectedPattern(null);
                        }
                    }}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{selectedPattern ? 'Edit Pattern' : 'Tambah Pattern Baru'}</DialogTitle>
                                <DialogDescription>
                                    {selectedPattern ? 'Update informasi pattern' : 'Tambahkan pattern baru'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kode_pattern">Kode Pattern *</Label>
                                        <Input
                                            id="kode_pattern"
                                            value={data.kode_pattern}
                                            onChange={(e) => setData('kode_pattern', e.target.value)}
                                            placeholder="Contoh: PTN-001"
                                        />
                                        {errors.kode_pattern && <p className="text-red-500 text-sm">{errors.kode_pattern}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="nama_pattern">Nama Pattern *</Label>
                                        <Input
                                            id="nama_pattern"
                                            value={data.nama_pattern}
                                            onChange={(e) => setData('nama_pattern', e.target.value)}
                                            placeholder="Contoh: Kemeja Formal Pria"
                                        />
                                        {errors.nama_pattern && <p className="text-red-500 text-sm">{errors.nama_pattern}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kategori_produk">Kategori Produk *</Label>
                                        <Select 
                                            value={data.kategori_produk} 
                                            onValueChange={(value: 'kemeja' | 'celana' | 'dress' | 'jaket' | 'rok' | 'lainnya') => setData('kategori_produk', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kategoriOptions.map((kategori) => (
                                                    <SelectItem key={kategori.value} value={kategori.value}>
                                                        {kategori.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value: 'aktif' | 'non_aktif' | 'draft') => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="non_aktif">Non Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Ukuran Tersedia */}
                                <div>
                                    <Label>Ukuran Tersedia *</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {ukuranOptions.map((ukuran) => (
                                            <button
                                                key={ukuran}
                                                type="button"
                                                onClick={() => toggleUkuran(ukuran)}
                                                className={`px-3 py-1 rounded-md border text-sm ${
                                                    data.ukuran_tersedia.includes(ukuran)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {ukuran}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.ukuran_tersedia && <p className="text-red-500 text-sm">{errors.ukuran_tersedia}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="tingkat_kesulitan">Tingkat Kesulitan *</Label>
                                        <Select 
                                            value={data.tingkat_kesulitan} 
                                            onValueChange={(value: 'mudah' | 'sedang' | 'sulit' | 'sangat_sulit') => setData('tingkat_kesulitan', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mudah">Mudah</SelectItem>
                                                <SelectItem value="sedang">Sedang</SelectItem>
                                                <SelectItem value="sulit">Sulit</SelectItem>
                                                <SelectItem value="sangat_sulit">Sangat Sulit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="estimasi_waktu_cutting_menit">Estimasi Waktu Cutting (Menit) *</Label>
                                        <Input
                                            id="estimasi_waktu_cutting_menit"
                                            type="number"
                                            value={data.estimasi_waktu_cutting_menit}
                                            onChange={(e) => setData('estimasi_waktu_cutting_menit', parseInt(e.target.value) || 0)}
                                            placeholder="60"
                                        />
                                        {errors.estimasi_waktu_cutting_menit && <p className="text-red-500 text-sm">{errors.estimasi_waktu_cutting_menit}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="gambar_pattern">URL Gambar Pattern</Label>
                                    <Input
                                        id="gambar_pattern"
                                        value={data.gambar_pattern}
                                        onChange={(e) => setData('gambar_pattern', e.target.value)}
                                        placeholder="https://example.com/pattern.jpg"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                                        placeholder="Keterangan atau instruksi khusus untuk pattern ini"
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
                                            setSelectedPattern(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : (selectedPattern ? 'Update' : 'Simpan')}
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
