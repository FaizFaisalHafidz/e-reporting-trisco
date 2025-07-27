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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Settings, Shield, Trash2, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Permission {
    id: number;
    name: string;
    guard_name?: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: string[];
    permissions_count: number;
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: Role[];
    permissions: Permission[];
}

export default function RoleManagement({ roles, permissions }: Props) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showCreatePermissionDialog, setShowCreatePermissionDialog] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        permissions: [] as string[],
    });
    const [permissionFormData, setPermissionFormData] = useState({
        name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFormData({
            name: '',
            permissions: [],
        });
        setEditingRole(null);
    };

    const handleCreate = () => {
        resetForm();
        setShowCreateDialog(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            permissions: role.permissions,
        });
        setShowEditDialog(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Nama role harus diisi');
            return;
        }

        setIsSubmitting(true);

        const url = editingRole 
            ? route('admin.roles.update', editingRole.id)
            : route('admin.roles.store');

        const method = editingRole ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                toast.success(editingRole ? 'Role berhasil diperbarui' : 'Role berhasil dibuat');
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

    const handleDelete = (role: Role) => {
        if (['admin', 'user'].includes(role.name)) {
            toast.error('Role sistem tidak dapat dihapus');
            return;
        }

        router.delete(route('admin.roles.destroy', role.id), {
            onSuccess: () => {
                toast.success('Role berhasil dihapus');
            },
            onError: (errors) => {
                const errorMessage = errors.error || 'Gagal menghapus role';
                toast.error(errorMessage);
            },
        });
    };

    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                permissions: [...prev.permissions, permissionName]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.filter(p => p !== permissionName)
            }));
        }
    };

    const handleCreatePermission = () => {
        setPermissionFormData({ name: '' });
        setShowCreatePermissionDialog(true);
    };

    const handleSubmitPermission: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!permissionFormData.name.trim()) {
            toast.error('Nama permission harus diisi');
            return;
        }

        setIsSubmitting(true);

        router.post(route('admin.roles.permissions.store'), permissionFormData, {
            onSuccess: () => {
                toast.success('Permission berhasil dibuat');
                setShowCreatePermissionDialog(false);
                setPermissionFormData({ name: '' });
            },
            onError: (errors) => {
                const errorMessage = errors.error || Object.values(errors)[0];
                toast.error(errorMessage);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeletePermission = (permission: Permission) => {
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
            <Head title="Role & Permission Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Role & Permission Management</h1>
                        <p className="text-slate-600 mt-1">
                            Kelola role dan permission untuk mengatur akses pengguna sistem
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="roles" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="roles" className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>Manajemen Role</span>
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Manajemen Permission</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Roles Tab Content */}
                    <TabsContent value="roles" className="space-y-6">{/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Role</CardTitle>
                            <Shield className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Permission</CardTitle>
                            <Shield className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{permissions.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Roles</CardTitle>
                            <Users className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {roles.filter(role => ['admin', 'user'].includes(role.name)).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                        {/* Role Actions */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleCreate}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Role
                            </Button>
                        </div>

                {/* Roles Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Role</CardTitle>
                        <CardDescription>
                            Kelola role dan permission untuk sistem e-reporting
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Role</TableHead>
                                    <TableHead>Permission</TableHead>
                                    <TableHead>Jumlah User</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium capitalize">{role.name}</span>
                                                {['admin', 'user'].includes(role.name) && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        System
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.slice(0, 3).map((permission) => (
                                                    <Badge key={permission} variant="outline" className="text-xs">
                                                        {permission}
                                                    </Badge>
                                                ))}
                                                {role.permissions.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{role.permissions.length - 3} lainnya
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{role.users_count} user</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={role.permissions_count > 0 ? "default" : "secondary"}
                                                className={role.permissions_count > 0 ? "bg-green-100 text-green-800" : ""}
                                            >
                                                {role.permissions_count > 0 ? 'Aktif' : 'Tidak ada permission'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {role.created_at}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(role)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                {!['admin', 'user'].includes(role.name) && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Role</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Apakah Anda yakin ingin menghapus role "{role.name}"? 
                                                                    Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(role)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                    </TabsContent>

                    {/* Permissions Tab Content */}
                    <TabsContent value="permissions" className="space-y-6">
                        {/* Permission Stats */}
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

                        {/* Permission Actions */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleCreatePermission}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Permission
                            </Button>
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
                                                            {permission.guard_name || 'web'}
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
                                                                        onClick={() => handleDeletePermission(permission)}
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
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Role Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Tambah Role Baru</DialogTitle>
                            <DialogDescription>
                                Buat role baru dan tentukan permission yang dimilikinya
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Role</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Masukkan nama role"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Permission</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                                    {permissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={formData.permissions.includes(permission.name)}
                                                onCheckedChange={(checked) => 
                                                    handlePermissionChange(permission.name, checked as boolean)
                                                }
                                            />
                                            <Label 
                                                htmlFor={`permission-${permission.id}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {permission.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
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

            {/* Edit Role Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Role</DialogTitle>
                            <DialogDescription>
                                Ubah informasi role dan permission yang dimilikinya
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nama Role</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Masukkan nama role"
                                    required
                                    disabled={editingRole ? ['admin', 'user'].includes(editingRole.name) : false}
                                />
                                {editingRole && ['admin', 'user'].includes(editingRole.name) && (
                                    <p className="text-sm text-slate-500">
                                        Role sistem tidak dapat diubah namanya
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Permission</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                                    {permissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-permission-${permission.id}`}
                                                checked={formData.permissions.includes(permission.name)}
                                                onCheckedChange={(checked) => 
                                                    handlePermissionChange(permission.name, checked as boolean)
                                                }
                                            />
                                            <Label 
                                                htmlFor={`edit-permission-${permission.id}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {permission.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
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

            {/* Create Permission Dialog */}
            <Dialog open={showCreatePermissionDialog} onOpenChange={setShowCreatePermissionDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmitPermission}>
                        <DialogHeader>
                            <DialogTitle>Tambah Permission Baru</DialogTitle>
                            <DialogDescription>
                                Buat permission baru untuk sistem e-reporting
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="permission-name">Nama Permission</Label>
                                <Input
                                    id="permission-name"
                                    value={permissionFormData.name}
                                    onChange={(e) => setPermissionFormData(prev => ({ ...prev, name: e.target.value }))}
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
                                onClick={() => setShowCreatePermissionDialog(false)}
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
