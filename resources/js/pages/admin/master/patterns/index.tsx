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
    kategori_produk: string;
    size_range?: string;
    panjang_pattern_cm?: number;
    lebar_pattern_cm?: number;
    fabric_consumption_yard?: number;
    size_breakdown?: string[];
    instruksi_cutting?: string;
    difficulty_level: 'easy' | 'medium' | 'hard';
    status: 'aktif' | 'non_aktif' | 'archived';
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_patterns: number;
    active_patterns: number;
    total_categories: number;
    avg_consumption: number;
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
        kategori_produk: '',
        size_range: '',
        panjang_pattern_cm: 0,
        lebar_pattern_cm: 0,
        fabric_consumption_yard: 0,
        size_breakdown: [] as string[],
        instruksi_cutting: '',
        difficulty_level: 'medium' as 'easy' | 'medium' | 'hard',
        status: 'aktif' as 'aktif' | 'non_aktif' | 'archived',
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
        setData('size_range', pattern.size_range || '');
        setData('panjang_pattern_cm', pattern.panjang_pattern_cm || 0);
        setData('lebar_pattern_cm', pattern.lebar_pattern_cm || 0);
        setData('fabric_consumption_yard', pattern.fabric_consumption_yard || 0);
        setData('size_breakdown', pattern.size_breakdown || []);
        setData('instruksi_cutting', pattern.instruksi_cutting || '');
        setData('difficulty_level', pattern.difficulty_level);
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
        const current = data.size_breakdown;
        if (current.includes(ukuran)) {
            setData('size_breakdown', current.filter(u => u !== ukuran));
        } else {
            setData('size_breakdown', [...current, ukuran]);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return '';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Mudah';
            case 'medium': return 'Sedang';
            case 'hard': return 'Sulit';
            default: return difficulty;
        }
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
                                <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
                                <Layers className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{stats.total_categories}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Konsumsi Kain</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{Number(stats.avg_consumption || 0).toFixed(2)} yd</div>
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
                                        <TableHead>Size Range</TableHead>
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
                                                    {pattern.size_breakdown?.slice(0, 3).map((ukuran: string) => (
                                                        <Badge key={ukuran} variant="secondary" className="text-xs">
                                                            {ukuran}
                                                        </Badge>
                                                    ))}
                                                    {(pattern.size_breakdown?.length ?? 0) > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{(pattern.size_breakdown?.length ?? 0) - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getDifficultyColor(pattern.difficulty_level)}>
                                                    {getDifficultyLabel(pattern.difficulty_level)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{pattern.size_range || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={pattern.status === 'aktif' ? 'default' : 'secondary'}
                                                    className={
                                                        pattern.status === 'aktif' ? 'bg-green-100 text-green-800' :
                                                        pattern.status === 'archived' ? 'bg-yellow-100 text-yellow-800' : ''
                                                    }
                                                >
                                                    {pattern.status === 'aktif' ? 'Aktif' : 
                                                     pattern.status === 'archived' ? 'Archived' : 'Non Aktif'}
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
                                        <Select value={data.status} onValueChange={(value: 'aktif' | 'non_aktif' | 'archived') => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="non_aktif">Non Aktif</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Size Breakdown */}
                                <div>
                                    <Label>Ukuran Tersedia</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {ukuranOptions.map((ukuran) => (
                                            <button
                                                key={ukuran}
                                                type="button"
                                                onClick={() => toggleUkuran(ukuran)}
                                                className={`px-3 py-1 rounded-md border text-sm ${
                                                    data.size_breakdown.includes(ukuran)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {ukuran}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.size_breakdown && <p className="text-red-500 text-sm">{errors.size_breakdown}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="difficulty_level">Tingkat Kesulitan *</Label>
                                        <Select 
                                            value={data.difficulty_level} 
                                            onValueChange={(value: 'easy' | 'medium' | 'hard') => setData('difficulty_level', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">Mudah</SelectItem>
                                                <SelectItem value="medium">Sedang</SelectItem>
                                                <SelectItem value="hard">Sulit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="size_range">Size Range</Label>
                                        <Input
                                            id="size_range"
                                            value={data.size_range}
                                            onChange={(e) => setData('size_range', e.target.value)}
                                            placeholder="S-XL, 28-34, dll"
                                        />
                                        {errors.size_range && <p className="text-red-500 text-sm">{errors.size_range}</p>}
                                    </div>
                                </div>

                                {/* Pattern Measurements */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="panjang_pattern_cm">Panjang (cm)</Label>
                                        <Input
                                            id="panjang_pattern_cm"
                                            type="number"
                                            step="0.01"
                                            value={data.panjang_pattern_cm}
                                            onChange={(e) => setData('panjang_pattern_cm', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="lebar_pattern_cm">Lebar (cm)</Label>
                                        <Input
                                            id="lebar_pattern_cm"
                                            type="number"
                                            step="0.01"
                                            value={data.lebar_pattern_cm}
                                            onChange={(e) => setData('lebar_pattern_cm', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="fabric_consumption_yard">Konsumsi Kain (yard)</Label>
                                        <Input
                                            id="fabric_consumption_yard"
                                            type="number"
                                            step="0.001"
                                            value={data.fabric_consumption_yard}
                                            onChange={(e) => setData('fabric_consumption_yard', parseFloat(e.target.value) || 0)}
                                            placeholder="0.000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="instruksi_cutting">Instruksi Cutting</Label>
                                    <Textarea
                                        id="instruksi_cutting"
                                        value={data.instruksi_cutting}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('instruksi_cutting', e.target.value)}
                                        placeholder="Instruksi atau keterangan khusus untuk proses cutting"
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
