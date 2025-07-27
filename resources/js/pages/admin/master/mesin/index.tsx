import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Activity, AlertTriangle, Edit, Plus, Settings, Trash2, Wrench } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Mesin {
    id: number;
    nama_mesin: string;
    kode_mesin: string;
    lokasi: string | null;
    status_mesin: 'aktif' | 'maintenance' | 'rusak';
    kapasitas_harian: number | null;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_mesin: number;
    mesin_aktif: number;
    mesin_maintenance: number;
    mesin_rusak: number;
}

interface Props {
    mesin: Mesin[];
    stats: Stats;
}

export default function DataMesin({ mesin, stats }: Props) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingMesin, setEditingMesin] = useState<Mesin | null>(null);
    const [formData, setFormData] = useState({
        nama_mesin: '',
        kode_mesin: '',
        lokasi: '',
        status_mesin: 'aktif' as 'aktif' | 'maintenance' | 'rusak',
        kapasitas_harian: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFormData({
            nama_mesin: '',
            kode_mesin: '',
            lokasi: '',
            status_mesin: 'aktif',
            kapasitas_harian: '',
        });
        setEditingMesin(null);
    };

    const handleCreate = () => {
        resetForm();
        setShowCreateDialog(true);
    };

    const handleEdit = (mesin: Mesin) => {
        setEditingMesin(mesin);
        setFormData({
            nama_mesin: mesin.nama_mesin,
            kode_mesin: mesin.kode_mesin,
            lokasi: mesin.lokasi || '',
            status_mesin: mesin.status_mesin,
            kapasitas_harian: mesin.kapasitas_harian?.toString() || '',
        });
        setShowEditDialog(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!formData.nama_mesin.trim()) {
            toast.error('Nama mesin harus diisi');
            return;
        }

        if (!formData.kode_mesin.trim()) {
            toast.error('Kode mesin harus diisi');
            return;
        }

        setIsSubmitting(true);

        const url = editingMesin 
            ? route('admin.master.machines.update', editingMesin.id)
            : route('admin.master.machines.store');

        const method = editingMesin ? 'put' : 'post';

        const data = {
            ...formData,
            kapasitas_harian: formData.kapasitas_harian ? parseFloat(formData.kapasitas_harian) : null,
        };

        router[method](url, data, {
            onSuccess: () => {
                toast.success(editingMesin ? 'Data mesin berhasil diperbarui' : 'Data mesin berhasil ditambahkan');
                setShowCreateDialog(false);
                setShowEditDialog(false);
                resetForm();
            },
            onError: (errors) => {
                const errorMessage = errors.error || Object.values(errors)[0];
                toast.error(errorMessage);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDelete = (mesin: Mesin) => {
        router.delete(route('admin.master.machines.destroy', mesin.id), {
            onSuccess: () => {
                toast.success('Data mesin berhasil dihapus');
            },
            onError: (errors) => {
                const errorMessage = errors.error || 'Gagal menghapus data mesin';
                toast.error(errorMessage);
            },
        });
    };

    const handleToggleStatus = (mesin: Mesin, newStatus: 'aktif' | 'maintenance' | 'rusak') => {
        router.patch(route('admin.master.machines.toggle-status', mesin.id), {
            status_mesin: newStatus,
        }, {
            onSuccess: () => {
                toast.success('Status mesin berhasil diperbarui');
            },
            onError: (errors) => {
                const errorMessage = errors.error || 'Gagal memperbarui status mesin';
                toast.error(errorMessage);
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'bg-green-100 text-green-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            case 'rusak':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'aktif':
                return <Activity className="w-3 h-3" />;
            case 'maintenance':
                return <Wrench className="w-3 h-3" />;
            case 'rusak':
                return <AlertTriangle className="w-3 h-3" />;
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Data Mesin Cutting" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Data Mesin Cutting</h1>
                        <p className="text-slate-600 mt-1">
                            Kelola data mesin cutting untuk operasional produksi
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Mesin
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mesin</CardTitle>
                            <Settings className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.total_mesin}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mesin Aktif</CardTitle>
                            <Activity className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.mesin_aktif}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                            <Wrench className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.mesin_maintenance}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rusak</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.mesin_rusak}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mesin Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Mesin Cutting</CardTitle>
                        <CardDescription>
                            Kelola data mesin cutting untuk operasional produksi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Mesin</TableHead>
                                    <TableHead>Kode Mesin</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Kapasitas/Hari</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="w-[150px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mesin.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                            Belum ada data mesin
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    mesin.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Settings className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">{item.nama_mesin}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {item.kode_mesin}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {item.lokasi || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={item.status_mesin}
                                                    onValueChange={(value) => 
                                                        handleToggleStatus(item, value as 'aktif' | 'maintenance' | 'rusak')
                                                    }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(item.status_mesin)}
                                                            <SelectValue />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="aktif">
                                                            <div className="flex items-center space-x-2">
                                                                <Activity className="w-3 h-3 text-green-600" />
                                                                <span>Aktif</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="maintenance">
                                                            <div className="flex items-center space-x-2">
                                                                <Wrench className="w-3 h-3 text-yellow-600" />
                                                                <span>Maintenance</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="rusak">
                                                            <div className="flex items-center space-x-2">
                                                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                                                <span>Rusak</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {item.kapasitas_harian ? `${item.kapasitas_harian} unit` : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {item.created_at}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Data Mesin</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Apakah Anda yakin ingin menghapus mesin "{item.nama_mesin}"? 
                                                                    Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(item)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Mesin Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Tambah Mesin Baru</DialogTitle>
                            <DialogDescription>
                                Tambahkan data mesin cutting baru untuk operasional produksi
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_mesin">Nama Mesin</Label>
                                <Input
                                    id="nama_mesin"
                                    value={formData.nama_mesin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nama_mesin: e.target.value }))}
                                    placeholder="Masukkan nama mesin"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="kode_mesin">Kode Mesin</Label>
                                <Input
                                    id="kode_mesin"
                                    value={formData.kode_mesin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, kode_mesin: e.target.value }))}
                                    placeholder="Contoh: MC-001"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="lokasi">Lokasi Mesin</Label>
                                <Input
                                    id="lokasi"
                                    value={formData.lokasi}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                                    placeholder="Contoh: Lantai 1 Area A"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="status_mesin">Status Mesin</Label>
                                <Select
                                    value={formData.status_mesin}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status_mesin: value as 'aktif' | 'maintenance' | 'rusak' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="rusak">Rusak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="kapasitas_harian">Kapasitas Harian (unit/hari)</Label>
                                <Input
                                    id="kapasitas_harian"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.kapasitas_harian}
                                    onChange={(e) => setFormData(prev => ({ ...prev, kapasitas_harian: e.target.value }))}
                                    placeholder="Masukkan kapasitas harian"
                                />
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateDialog(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Mesin Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Data Mesin</DialogTitle>
                            <DialogDescription>
                                Ubah informasi data mesin cutting
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_nama_mesin">Nama Mesin</Label>
                                <Input
                                    id="edit_nama_mesin"
                                    value={formData.nama_mesin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nama_mesin: e.target.value }))}
                                    placeholder="Masukkan nama mesin"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="edit_kode_mesin">Kode Mesin</Label>
                                <Input
                                    id="edit_kode_mesin"
                                    value={formData.kode_mesin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, kode_mesin: e.target.value }))}
                                    placeholder="Contoh: MC-001"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="edit_lokasi">Lokasi Mesin</Label>
                                <Input
                                    id="edit_lokasi"
                                    value={formData.lokasi}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                                    placeholder="Contoh: Lantai 1 Area A"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="edit_status_mesin">Status Mesin</Label>
                                <Select
                                    value={formData.status_mesin}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status_mesin: value as 'aktif' | 'maintenance' | 'rusak' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="rusak">Rusak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="edit_kapasitas_harian">Kapasitas Harian (unit/hari)</Label>
                                <Input
                                    id="edit_kapasitas_harian"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.kapasitas_harian}
                                    onChange={(e) => setFormData(prev => ({ ...prev, kapasitas_harian: e.target.value }))}
                                    placeholder="Masukkan kapasitas harian"
                                />
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEditDialog(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
