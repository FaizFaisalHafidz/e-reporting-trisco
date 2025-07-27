import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    FileText,
    Filter,
    Search,
    Trash2
} from 'lucide-react';
import { useState } from 'react';

interface Report {
    id: number;
    nomor_laporan: string;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    operator: {
        id: number;
        name: string;
    };
    shift: {
        id: number;
        nama_shift: string;
    };
    line_produksi: {
        id: number;
        nama_line: string;
    };
    customer: {
        id: number;
        nama_customer: string;
    };
    target_quantity_pcs: number;
    actual_quantity_pcs: number | null;
    created_at: string;
    updated_at: string;
}

interface Operator {
    id: number;
    name: string;
}

interface Stats {
    total_drafts: number;
    my_drafts: number;
    today_drafts: number;
    old_drafts: number;
}

interface Props {
    drafts: {
        data: Report[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    operators: Operator[];
    stats: Stats;
    filters: {
        operator_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function InputReportsDrafts({ drafts, operators, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [operatorId, setOperatorId] = useState(filters.operator_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = () => {
        router.get('/admin/input-reports/drafts', {
            search,
            operator_id: operatorId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setOperatorId('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/input-reports/drafts');
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus draft ini?')) {
            router.delete(`/admin/input-reports/${id}`, {
                onSuccess: () => {
                    // Handle success
                },
            });
        }
    };

    const getDaysOld = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Draft Laporan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/admin/input-reports">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Draft Laporan</h1>
                            <p className="text-muted-foreground">
                                Kelola laporan yang belum selesai
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Draft</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_drafts.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft Saya</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.my_drafts.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft Hari Ini</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.today_drafts.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft Lama (&gt;7 hari)</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.old_drafts.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Warning untuk draft lama */}
                {stats.old_drafts > 0 && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-orange-800">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="font-medium">
                                    Perhatian: Ada {stats.old_drafts} draft yang sudah lebih dari 7 hari. 
                                    Segera selesaikan atau hapus untuk menjaga kebersihan data.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter & Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Cari no. laporan, order, batch..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Select value={operatorId} onValueChange={setOperatorId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Operator</SelectItem>
                                        {operators.map((operator) => (
                                            <SelectItem key={operator.id} value={operator.id.toString()}>
                                                {operator.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Input
                                    type="date"
                                    placeholder="Dari Tanggal"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div>
                                <Input
                                    type="date"
                                    placeholder="Sampai Tanggal"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <Button onClick={handleSearch} className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Cari
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Daftar Draft</CardTitle>
                                <CardDescription>
                                    Menampilkan {drafts.data.length} dari {drafts.total} draft
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Laporan</TableHead>
                                    <TableHead>No. Order</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Shift</TableHead>
                                    <TableHead>Line</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Target (pcs)</TableHead>
                                    <TableHead>Last Update</TableHead>
                                    <TableHead>Umur Draft</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drafts.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                                            Tidak ada draft laporan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    drafts.data.map((draft) => {
                                        const daysOld = getDaysOld(draft.updated_at);
                                        const isOld = daysOld > 7;
                                        
                                        return (
                                            <TableRow key={draft.id} className={isOld ? 'bg-orange-50' : ''}>
                                                <TableCell className="font-medium">
                                                    <Link 
                                                        href={`/admin/input-reports/${draft.id}`}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {draft.nomor_laporan}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{draft.nomor_order}</TableCell>
                                                <TableCell>{new Date(draft.tanggal_laporan).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>{draft.operator.name}</TableCell>
                                                <TableCell>{draft.shift.nama_shift}</TableCell>
                                                <TableCell>{draft.line_produksi.nama_line}</TableCell>
                                                <TableCell>{draft.customer.nama_customer}</TableCell>
                                                <TableCell className="text-right">{draft.target_quantity_pcs.toLocaleString('id-ID')}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(draft.updated_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={isOld ? 'destructive' : 'secondary'}>
                                                        {daysOld} hari
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/input-reports/${draft.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/input-reports/${draft.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(draft.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {drafts.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {((drafts.current_page - 1) * drafts.per_page) + 1} - {Math.min(drafts.current_page * drafts.per_page, drafts.total)} dari {drafts.total} hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/admin/input-reports/drafts?page=${drafts.current_page - 1}`, {}, { preserveState: true, preserveScroll: true })}
                                        disabled={drafts.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {drafts.current_page} of {drafts.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/admin/input-reports/drafts?page=${drafts.current_page + 1}`, {}, { preserveState: true, preserveScroll: true })}
                                        disabled={drafts.current_page === drafts.last_page}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
