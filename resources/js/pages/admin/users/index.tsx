import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Edit,
    MoreHorizontal,
    Plus,
    Power,
    PowerOff,
    Search,
    Trash2,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: Array<{ name: string; display_name?: string }>;
    created_at: string;
    updated_at: string;
}

interface Role {
    id: number;
    name: string;
    display_name?: string;
}

interface PageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
        status?: number;
        sort?: string;
        direction?: string;
        per_page?: number;
    };
}

export default function UsersIndex({ users, roles, filters }: PageProps) {
    const { flash } = usePage().props as any;
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        is_active: true,
    });

    // Show flash messages
    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const handleSearch = (value: string) => {
        router.get(route('admin.users.index'), { ...filters, search: value }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterRole = (value: string) => {
        router.get(route('admin.users.index'), { ...filters, role: value === 'all' ? '' : value }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterStatus = (value: string) => {
        router.get(route('admin.users.index'), { 
            ...filters, 
            status: value === 'all' ? '' : (value === 'active' ? '1' : '0') 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePerPageChange = (value: string) => {
        router.get(route('admin.users.index'), { ...filters, per_page: value }, {
            preserveState: true,
            replace: true,
        });
    };

    const openCreateModal = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: '',
            is_active: true,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.roles[0]?.name || '',
            is_active: user.is_active,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            router.put(route('admin.users.update', selectedUser.id), formData, {
                onSuccess: () => setIsEditModalOpen(false),
            });
        } else {
            router.post(route('admin.users.store'), formData, {
                onSuccess: () => setIsCreateModalOpen(false),
            });
        }
    };

    const handleDelete = () => {
        if (selectedUser) {
            router.delete(route('admin.users.destroy', selectedUser.id), {
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    const handleToggleStatus = (user: User) => {
        router.patch(route('admin.users.toggle-status', user.id));
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-semibold text-blue-900"
                >
                    Nama
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">{row.getValue('name')}</div>
            ),
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-auto p-0 font-semibold text-blue-900"
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-gray-700">{row.getValue('email')}</div>
            ),
        },
        {
            accessorKey: 'roles',
            header: 'Role',
            cell: ({ row }) => {
                const roles = row.getValue('roles') as User['roles'];
                return (
                    <Badge variant={roles[0]?.name === 'admin' ? 'default' : 'secondary'} className="font-medium">
                        {roles[0]?.name === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active') as boolean;
                return (
                    <Badge variant={isActive ? 'default' : 'destructive'} className="font-medium">
                        {isActive ? (
                            <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Aktif
                            </>
                        ) : (
                            <>
                                <UserX className="w-3 h-3 mr-1" />
                                Tidak Aktif
                            </>
                        )}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openEditModal(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                {user.is_active ? (
                                    <>
                                        <PowerOff className="h-4 w-4 mr-2" />
                                        Nonaktifkan
                                    </>
                                ) : (
                                    <>
                                        <Power className="h-4 w-4 mr-2" />
                                        Aktifkan
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => openDeleteModal(user)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: users.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <AppLayout>
            <Head title="Kelola Users" />
            <Toaster richColors position="top-right" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Kelola Users</h1>
                            <p className="text-gray-600">Mengelola pengguna dan hak akses sistem</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-xl font-semibold text-gray-900">{users.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Users Aktif</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {users.data.filter(u => u.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <UserX className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Users Tidak Aktif</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {users.data.filter(u => !u.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Cari nama atau email..."
                                    className="pl-10"
                                    defaultValue={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <Select value={filters.role || 'all'} onValueChange={handleFilterRole}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Semua Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Role</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name === 'admin' ? 'Administrator' : 'User'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.status?.toString() || 'all'} onValueChange={handleFilterStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah User
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-gray-50">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="font-semibold text-blue-900">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-blue-50/50">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                        Tidak ada data users.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Menampilkan {users.from} - {users.to} dari {users.total} data
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={filters.per_page?.toString() || '10'} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={users.current_page === 1}
                                    onClick={() => router.get(route('admin.users.index'), { 
                                        ...filters, 
                                        page: users.current_page - 1 
                                    })}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-600 min-w-[100px] text-center">
                                    Page {users.current_page} of {users.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={users.current_page === users.last_page}
                                    onClick={() => router.get(route('admin.users.index'), { 
                                        ...filters, 
                                        page: users.current_page + 1 
                                    })}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-blue-900">
                            {selectedUser ? 'Edit User' : 'Tambah User Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser ? 'Update informasi user.' : 'Buat akun user baru untuk sistem.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Masukkan email"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">
                                Password {selectedUser && '(Kosongkan jika tidak ingin mengubah)'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Masukkan password"
                                required={!selectedUser}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                placeholder="Konfirmasi password"
                                required={!selectedUser || formData.password !== ''}
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name === 'admin' ? 'Administrator' : 'User'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active">User Aktif</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setIsCreateModalOpen(false);
                                setIsEditModalOpen(false);
                            }}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {selectedUser ? 'Update' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-900">Hapus User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus user <strong>{selectedUser?.name}</strong>? 
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
