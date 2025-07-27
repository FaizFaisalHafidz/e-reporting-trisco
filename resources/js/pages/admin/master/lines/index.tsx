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
import { Edit, Factory, Plus, Power, Target, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Machine {
    id: number;
    kode_mesin: string;
    nama_mesin: string;
}

interface Line {
    id: number;
    kode_line: string;
    nama_line: string;
    deskripsi: string;
    kapasitas_harian_yard: number;
    supervisor_default: string;
    mesin_ids: number[];
    status: 'aktif' | 'non_aktif' | 'maintenance';
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_lines: number;
    active_lines: number;
    total_capacity: number;
    avg_capacity: number;
}

interface Props {
    lines: Line[];
    machines: Machine[];
    stats: Stats;
}

export default function LinesIndex({ lines, machines, stats }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedLine, setSelectedLine] = useState<Line | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        kode_line: '',
        nama_line: '',
        deskripsi: '',
        kapasitas_harian_yard: 0,
        supervisor_default: '',
        mesin_ids: [] as number[],
        status: 'aktif' as 'aktif' | 'non_aktif' | 'maintenance',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedLine) {
            put(route('admin.master.lines.update', selectedLine.id), {
                onSuccess: () => {
                    setIsEditOpen(false);
                    reset();
                    setSelectedLine(null);
                }
            });
        } else {
            post(route('admin.master.lines.store'), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (line: Line) => {
        setSelectedLine(line);
        setData('kode_line', line.kode_line);
        setData('nama_line', line.nama_line);
        setData('deskripsi', line.deskripsi || '');
        setData('kapasitas_harian_yard', line.kapasitas_harian_yard);
        setData('supervisor_default', line.supervisor_default || '');
        setData('mesin_ids', line.mesin_ids || []);
        setData('status', line.status);
        setIsEditOpen(true);
    };

    const handleDelete = (line: Line) => {
        if (confirm('Yakin ingin menghapus line produksi ini?')) {
            destroy(route('admin.master.lines.destroy', line.id));
        }
    };

    const handleToggleStatus = (line: Line) => {
        put(route('admin.master.lines.toggle-status', line.id));
    };

    const getMachineNames = (mesinIds: number[]) => {
        if (!mesinIds || mesinIds.length === 0) return '-';
        return machines
            .filter(machine => mesinIds.includes(machine.id))
            .map(machine => machine.nama_mesin)
            .join(', ');
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Line Produksi" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Line Produksi</h2>
                            <p className="text-gray-600">Kelola data line produksi cutting</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Line Produksi
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Line</CardTitle>
                                <Factory className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.total_lines}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Line Aktif</CardTitle>
                                <Power className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.active_lines}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Kapasitas</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.total_capacity)} yard</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Kapasitas</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{formatNumber(Math.round(stats.avg_capacity || 0))} yard</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lines Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Line Produksi</CardTitle>
                            <CardDescription>
                                Kelola semua line produksi cutting
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode & Nama Line</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Kapasitas Harian</TableHead>
                                        <TableHead>Supervisor</TableHead>
                                        <TableHead>Mesin Terpasang</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lines.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{line.kode_line}</div>
                                                    <div className="text-sm text-gray-500">{line.nama_line}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate">{line.deskripsi || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{formatNumber(line.kapasitas_harian_yard)} yard/hari</div>
                                            </TableCell>
                                            <TableCell>{line.supervisor_default || '-'}</TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate text-sm">
                                                    {getMachineNames(line.mesin_ids)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={line.status === 'aktif' ? 'default' : 'secondary'}
                                                    className={
                                                        line.status === 'aktif' ? 'bg-green-100 text-green-800' :
                                                        line.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : ''
                                                    }
                                                >
                                                    {line.status === 'aktif' ? 'Aktif' : 
                                                     line.status === 'maintenance' ? 'Maintenance' : 'Non Aktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(line)}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(line)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(line)}
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
                            setSelectedLine(null);
                        }
                    }}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{selectedLine ? 'Edit Line Produksi' : 'Tambah Line Produksi Baru'}</DialogTitle>
                                <DialogDescription>
                                    {selectedLine ? 'Update informasi line produksi' : 'Tambahkan line produksi baru'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kode_line">Kode Line *</Label>
                                        <Input
                                            id="kode_line"
                                            value={data.kode_line}
                                            onChange={(e) => setData('kode_line', e.target.value)}
                                            placeholder="Contoh: LINE-A01"
                                        />
                                        {errors.kode_line && <p className="text-red-500 text-sm">{errors.kode_line}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="nama_line">Nama Line *</Label>
                                        <Input
                                            id="nama_line"
                                            value={data.nama_line}
                                            onChange={(e) => setData('nama_line', e.target.value)}
                                            placeholder="Contoh: Line Cutting A1"
                                        />
                                        {errors.nama_line && <p className="text-red-500 text-sm">{errors.nama_line}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <Textarea
                                        id="deskripsi"
                                        value={data.deskripsi}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('deskripsi', e.target.value)}
                                        placeholder="Deskripsi line produksi"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kapasitas_harian_yard">Kapasitas Harian (Yard) *</Label>
                                        <Input
                                            id="kapasitas_harian_yard"
                                            type="number"
                                            value={data.kapasitas_harian_yard}
                                            onChange={(e) => setData('kapasitas_harian_yard', parseInt(e.target.value) || 0)}
                                            placeholder="1500"
                                        />
                                        {errors.kapasitas_harian_yard && <p className="text-red-500 text-sm">{errors.kapasitas_harian_yard}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="supervisor_default">Supervisor Default</Label>
                                        <Input
                                            id="supervisor_default"
                                            value={data.supervisor_default}
                                            onChange={(e) => setData('supervisor_default', e.target.value)}
                                            placeholder="Nama supervisor"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="mesin_ids">Mesin yang Digunakan</Label>
                                    <Select 
                                        value={data.mesin_ids.length > 0 ? data.mesin_ids[0].toString() : ''} 
                                        onValueChange={(value) => {
                                            const mesinId = parseInt(value);
                                            if (!data.mesin_ids.includes(mesinId)) {
                                                setData('mesin_ids', [...data.mesin_ids, mesinId]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih mesin untuk line ini" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {machines.map((machine) => (
                                                <SelectItem key={machine.id} value={machine.id.toString()}>
                                                    {machine.kode_mesin} - {machine.nama_mesin}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Selected Machines */}
                                    {data.mesin_ids.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <Label className="text-sm text-gray-600">Mesin Terpilih:</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {data.mesin_ids.map((mesinId) => {
                                                    const machine = machines.find(m => m.id === mesinId);
                                                    return (
                                                        <Badge key={mesinId} variant="secondary" className="flex items-center gap-1">
                                                            {machine?.nama_mesin}
                                                            <button
                                                                type="button"
                                                                onClick={() => setData('mesin_ids', data.mesin_ids.filter(id => id !== mesinId))}
                                                                className="ml-1 text-red-500 hover:text-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value: 'aktif' | 'non_aktif' | 'maintenance') => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aktif">Aktif</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="non_aktif">Non Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateOpen(false);
                                            setIsEditOpen(false);
                                            reset();
                                            setSelectedLine(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : (selectedLine ? 'Update' : 'Simpan')}
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
