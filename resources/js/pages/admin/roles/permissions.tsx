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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Shield, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

interface Props {
    permissions: Permission[];
}

export default function PermissionManagement({ permissions }: Props) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFormData({
            name: '',
        });
    };

    const handleCreate = () => {
        resetForm();
        setShowCreateDialog(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Nama permission harus diisi');
            return;
        }

        setIsSubmitting(true);

        router.post(route('admin.roles.permissions.store'), formData, {
            onSuccess: () => {
                toast.success('Permission berhasil dibuat');
                setShowCreateDialog(false);
                resetForm();
            },
            onError: (errors) => {
                const errorMessage = errors.error || Object.values(errors)[0];
                toast.error(errorMessage);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDelete = (permission: Permission) => {
        router.delete(route('admin.roles.permissions.destroy', permission.id), {
            onSuccess: () => {
                toast.success('Permission berhasil dihapus');
            },
            onError: (errors) => {
                const errorMessage = errors.error || 'Gagal menghapus permission';
                toast.error(errorMessage);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Permission" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.roles.index')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Role
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Manajemen Permission</h1>
                            <p className="text-slate-600 mt-1">
                                Kelola permission untuk sistem e-reporting
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Permission
                    </Button>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Permission</CardTitle>
                            <Shield className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{permissions.length}</div>
                            <p className="text-xs text-slate-600 mt-1">
                                Permission aktif dalam sistem
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Guard Name</CardTitle>
                            <Shield className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">WEB</div>
                            <p className="text-xs text-slate-600 mt-1">
                                Default guard untuk permission
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Permissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Permission</CardTitle>
                        <CardDescription>
                            Kelola permission yang tersedia dalam sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Permission</TableHead>
                                    <TableHead>Guard Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                            Belum ada permission yang dibuat
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    permissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">{permission.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {permission.guard_name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">
                                                    Aktif
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus Permission</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Apakah Anda yakin ingin menghapus permission "{permission.name}"? 
                                                                Permission yang sedang digunakan oleh role tidak dapat dihapus.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(permission)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Permission Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Tambah Permission Baru</DialogTitle>
                            <DialogDescription>
                                Buat permission baru untuk sistem e-reporting
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Permission</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="contoh: manage-users, view-reports"
                                    required
                                />
                                <p className="text-sm text-slate-500">
                                    Gunakan format kebab-case (huruf kecil dengan tanda strip)
                                </p>
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
        </AppLayout>
    );
}
