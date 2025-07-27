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
import { Building, Edit, Globe, Mail, Phone, Plus, Power, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Customer {
    id: number;
    kode_customer: string;
    nama_customer: string;
    tipe_customer: 'lokal' | 'ekspor';
    alamat: string;
    kota: string;
    negara: string;
    kode_pos: string;
    kontak_person: string;
    telepon: string;
    email: string;
    fax: string;
    spesifikasi_khusus: string;
    keterangan: string;
    status: 'aktif' | 'non_aktif';
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_customers: number;
    active_customers: number;
    lokal_customers: number;
    ekspor_customers: number;
}

interface Props {
    customers: Customer[];
    stats: Stats;
}

export default function CustomersIndex({ customers, stats }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        kode_customer: '',
        nama_customer: '',
        tipe_customer: 'lokal' as 'lokal' | 'ekspor',
        alamat: '',
        kota: '',
        negara: 'Indonesia',
        kode_pos: '',
        kontak_person: '',
        telepon: '',
        email: '',
        fax: '',
        spesifikasi_khusus: '',
        keterangan: '',
        status: 'aktif' as 'aktif' | 'non_aktif',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedCustomer) {
            put(route('admin.master.customers.update', selectedCustomer.id), {
                onSuccess: () => {
                    setIsEditOpen(false);
                    reset();
                    setSelectedCustomer(null);
                }
            });
        } else {
            post(route('admin.master.customers.store'), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setData('kode_customer', customer.kode_customer);
        setData('nama_customer', customer.nama_customer);
        setData('tipe_customer', customer.tipe_customer);
        setData('alamat', customer.alamat || '');
        setData('kota', customer.kota || '');
        setData('negara', customer.negara || 'Indonesia');
        setData('kode_pos', customer.kode_pos || '');
        setData('kontak_person', customer.kontak_person || '');
        setData('telepon', customer.telepon || '');
        setData('email', customer.email || '');
        setData('fax', customer.fax || '');
        setData('spesifikasi_khusus', customer.spesifikasi_khusus || '');
        setData('keterangan', customer.keterangan || '');
        setData('status', customer.status);
        setIsEditOpen(true);
    };

    const handleDelete = (customer: Customer) => {
        if (confirm('Yakin ingin menghapus data customer ini?')) {
            destroy(route('admin.master.customers.destroy', customer.id));
        }
    };

    const handleToggleStatus = (customer: Customer) => {
        put(route('admin.master.customers.toggle-status', customer.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Customer" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Data Customer</h2>
                            <p className="text-gray-600">Kelola data customer dan klien</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Customer
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Customer</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.total_customers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Customer Aktif</CardTitle>
                                <Power className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.active_customers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Customer Lokal</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{stats.lokal_customers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Customer Ekspor</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{stats.ekspor_customers}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customers Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Customer</CardTitle>
                            <CardDescription>
                                Kelola semua data customer dan klien
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode & Nama Customer</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead>Kontak</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{customer.kode_customer}</div>
                                                    <div className="text-sm text-gray-500">{customer.nama_customer}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={customer.tipe_customer === 'ekspor' ? 'default' : 'secondary'}
                                                    className={customer.tipe_customer === 'ekspor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                                                >
                                                    {customer.tipe_customer === 'ekspor' ? 'Ekspor' : 'Lokal'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <div className="text-sm">{customer.kota}</div>
                                                    <div className="text-xs text-gray-500">{customer.negara}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm space-y-1">
                                                    {customer.kontak_person && (
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            <span className="truncate max-w-[120px]">{customer.kontak_person}</span>
                                                        </div>
                                                    )}
                                                    {customer.telepon && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{customer.telepon}</span>
                                                        </div>
                                                    )}
                                                    {customer.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            <span className="truncate max-w-[120px]">{customer.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={customer.status === 'aktif' ? 'default' : 'secondary'}
                                                    className={customer.status === 'aktif' ? 'bg-green-100 text-green-800' : ''}
                                                >
                                                    {customer.status === 'aktif' ? 'Aktif' : 'Non Aktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(customer)}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(customer)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(customer)}
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
                            setSelectedCustomer(null);
                        }
                    }}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Tambah Customer Baru'}</DialogTitle>
                                <DialogDescription>
                                    {selectedCustomer ? 'Update informasi customer' : 'Tambahkan customer baru'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kode_customer">Kode Customer *</Label>
                                        <Input
                                            id="kode_customer"
                                            value={data.kode_customer}
                                            onChange={(e) => setData('kode_customer', e.target.value)}
                                            placeholder="Contoh: CUST-001"
                                        />
                                        {errors.kode_customer && <p className="text-red-500 text-sm">{errors.kode_customer}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="nama_customer">Nama Customer *</Label>
                                        <Input
                                            id="nama_customer"
                                            value={data.nama_customer}
                                            onChange={(e) => setData('nama_customer', e.target.value)}
                                            placeholder="Nama perusahaan customer"
                                        />
                                        {errors.nama_customer && <p className="text-red-500 text-sm">{errors.nama_customer}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="tipe_customer">Tipe Customer *</Label>
                                        <Select value={data.tipe_customer} onValueChange={(value: 'lokal' | 'ekspor') => setData('tipe_customer', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lokal">Lokal</SelectItem>
                                                <SelectItem value="ekspor">Ekspor</SelectItem>
                                            </SelectContent>
                                        </Select>
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

                                {/* Address Info */}
                                <div>
                                    <Label htmlFor="alamat">Alamat</Label>
                                    <Textarea
                                        id="alamat"
                                        value={data.alamat}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('alamat', e.target.value)}
                                        placeholder="Alamat lengkap customer"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="kota">Kota</Label>
                                        <Input
                                            id="kota"
                                            value={data.kota}
                                            onChange={(e) => setData('kota', e.target.value)}
                                            placeholder="Kota"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="negara">Negara</Label>
                                        <Input
                                            id="negara"
                                            value={data.negara}
                                            onChange={(e) => setData('negara', e.target.value)}
                                            placeholder="Negara"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="kode_pos">Kode Pos</Label>
                                        <Input
                                            id="kode_pos"
                                            value={data.kode_pos}
                                            onChange={(e) => setData('kode_pos', e.target.value)}
                                            placeholder="Kode pos"
                                        />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="kontak_person">Kontak Person</Label>
                                        <Input
                                            id="kontak_person"
                                            value={data.kontak_person}
                                            onChange={(e) => setData('kontak_person', e.target.value)}
                                            placeholder="Nama kontak person"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="telepon">Telepon</Label>
                                        <Input
                                            id="telepon"
                                            value={data.telepon}
                                            onChange={(e) => setData('telepon', e.target.value)}
                                            placeholder="Nomor telepon"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Email customer"
                                        />
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="fax">Fax</Label>
                                        <Input
                                            id="fax"
                                            value={data.fax}
                                            onChange={(e) => setData('fax', e.target.value)}
                                            placeholder="Nomor fax"
                                        />
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div>
                                    <Label htmlFor="spesifikasi_khusus">Spesifikasi Khusus</Label>
                                    <Textarea
                                        id="spesifikasi_khusus"
                                        value={data.spesifikasi_khusus}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('spesifikasi_khusus', e.target.value)}
                                        placeholder="Spesifikasi atau kebutuhan khusus customer"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                                        placeholder="Keterangan tambahan"
                                        rows={2}
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
                                            setSelectedCustomer(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : (selectedCustomer ? 'Update' : 'Simpan')}
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
