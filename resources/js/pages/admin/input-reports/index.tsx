import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    Plus,
    Search,
    Trash2,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface Report {
    id: number;
    nomor_laporan: string;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    status_laporan: 'draft' | 'submitted' | 'approved' | 'rejected';
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
    total_reports: number;
    draft_reports: number;
    submitted_reports: number;
    today_reports: number;
}

interface Props {
    reports: {
        data: Report[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    operators: Operator[];
    stats: Stats;
    filters: {
        status?: string;
        operator_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

const getStatusBadge = (status: string) => {
    const variants = {
        draft: { variant: 'secondary' as const, icon: Clock, label: 'Draft' },
        submitted: { variant: 'outline' as const, icon: FileText, label: 'Submitted' },
        approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
        rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.draft;
    const IconComponent = config.icon;
    
    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <IconComponent className="h-3 w-3" />
            {config.label}
        </Badge>
    );
};

export default function InputReportsIndex({ reports, operators, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [operatorId, setOperatorId] = useState(filters.operator_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = () => {
        router.get('/admin/input-reports', {
            search,
            status: status || undefined,
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
        setStatus('');
        setOperatorId('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/input-reports');
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
            router.delete(`/admin/input-reports/${id}`, {
                onSuccess: () => {
                    // Handle success
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Input Laporan" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Input Laporan</h1>
                        <p className="text-muted-foreground">
                            Kelola laporan cutting produksi
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/input-reports/drafts">
                                <Clock className="h-4 w-4 mr-2" />
                                Draft Laporan
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/input-reports/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Laporan
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_reports.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.draft_reports.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.submitted_reports.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.today_reports.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter & Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Cari no. laporan, order, batch..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                <CardTitle>Daftar Laporan</CardTitle>
                                <CardDescription>
                                    Menampilkan {reports.data.length} dari {reports.total} laporan
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Laporan</TableHead>
                                    <TableHead>No. Order</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Shift</TableHead>
                                    <TableHead>Line</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Target (pcs)</TableHead>
                                    <TableHead className="text-right">Actual (pcs)</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                                            Tidak ada data laporan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reports.data.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">
                                                <Link 
                                                    href={`/admin/input-reports/${report.id}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {report.nomor_laporan}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{report.nomor_order}</TableCell>
                                            <TableCell>{new Date(report.tanggal_laporan).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{getStatusBadge(report.status_laporan)}</TableCell>
                                            <TableCell>{report.operator.name}</TableCell>
                                            <TableCell>{report.shift.nama_shift}</TableCell>
                                            <TableCell>{report.line_produksi.nama_line}</TableCell>
                                            <TableCell>{report.customer.nama_customer}</TableCell>
                                            <TableCell className="text-right">{report.target_quantity_pcs.toLocaleString('id-ID')}</TableCell>
                                            <TableCell className="text-right">{report.actual_quantity_pcs?.toLocaleString('id-ID') || '-'}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={`/admin/input-reports/${report.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {(report.status_laporan === 'draft' || report.status_laporan === 'submitted') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/input-reports/${report.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {report.status_laporan === 'draft' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(report.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {reports.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {((reports.current_page - 1) * reports.per_page) + 1} - {Math.min(reports.current_page * reports.per_page, reports.total)} dari {reports.total} hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/admin/input-reports?page=${reports.current_page - 1}`, {}, { preserveState: true, preserveScroll: true })}
                                        disabled={reports.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {reports.current_page} of {reports.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/admin/input-reports?page=${reports.current_page + 1}`, {}, { preserveState: true, preserveScroll: true })}
                                        disabled={reports.current_page === reports.last_page}
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
