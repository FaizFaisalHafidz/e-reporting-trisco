import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Download,
    Eye,
    FileText,
    Filter,
    MoreHorizontal,
    Search,
    Trash2,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface Report {
    id: number;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    target_quantity_pcs: number;
    actual_quantity_pcs: number;
    efisiensi_cutting: number;
    durasi_menit: number;
    status_laporan: 'draft' | 'submitted';
    created_at: string;
    operator?: {
        id: number;
        name: string;
        email: string;
    };
    shift?: {
        id: number;
        nama_shift: string;
    };
    mesin?: {
        id: number;
        nama_mesin: string;
        kode_mesin: string;
    };
    customer?: {
        id: number;
        nama_customer: string;
    };
    pattern?: {
        id: number;
        nama_pattern: string;
    };
    jenis_kain?: {
        id: number;
        nama_kain: string;
    };
}

interface Props {
    reports?: {
        data: Report[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    operators?: Array<{
        id: number;
        name: string;
    }>;
    shifts?: Array<{
        id: number;
        nama_shift: string;
    }>;
    stats?: {
        total_reports: number;
        submitted_reports: number;
        draft_reports: number;
        today_reports: number;
    };
    filters?: {
        status?: string;
        date_from?: string;
        date_to?: string;
        operator?: string;
        shift?: string;
        search?: string;
    } | any[];
}

export default function ReportsIndex({ 
    reports = { data: [], links: [], current_page: 1, last_page: 1, total: 0 }, 
    operators = [], 
    shifts = [], 
    stats = { total_reports: 0, submitted_reports: 0, draft_reports: 0, today_reports: 0 }, 
    filters = {}
}: Props) {
    console.log('Props received:', { reports, operators, shifts, stats, filters });
    
    // Convert filters to object if it's array or null
    const filtersObj = Array.isArray(filters) || !filters ? {} : filters;
    
    const [searchTerm, setSearchTerm] = useState(filtersObj.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filtersObj.status || 'all');
    const [selectedOperator, setSelectedOperator] = useState(filtersObj.operator || 'all');
    const [selectedShift, setSelectedShift] = useState(filtersObj.shift || 'all');
    const [dateFrom, setDateFrom] = useState(filtersObj.date_from || '');
    const [dateTo, setDateTo] = useState(filtersObj.date_to || '');

    const handleSearch = () => {
        router.get(route('admin.reports.index'), {
            search: searchTerm,
            status: selectedStatus === 'all' ? '' : selectedStatus,
            operator: selectedOperator === 'all' ? '' : selectedOperator,
            shift: selectedShift === 'all' ? '' : selectedShift,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedOperator('all');
        setSelectedShift('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.reports.index'));
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            status: selectedStatus,
            operator: selectedOperator,
            shift: selectedShift,
            date_from: dateFrom,
            date_to: dateTo,
        });
        
        window.open(`${route('admin.reports.export')}?${params.toString()}`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
            router.delete(route('admin.reports.destroy', id));
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            submitted: 'bg-green-100 text-green-800 border-green-200',
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
        };

        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {labels[status as keyof typeof labels] || status}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout>
            <Head title="Data Laporan" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Data Laporan</h1>
                        <p className="text-gray-600 mt-2">Kelola dan pantau semua laporan cutting</p>
                    </div>
                    <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Laporan</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total_reports}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.submitted_reports}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Draft</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.draft_reports}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Hari Ini</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.today_reports}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <CalendarDays className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="w-5 h-5 mr-2" />
                            Filter & Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Cari nomor order, batch, customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Operator</SelectItem>
                                    {operators?.map((operator) => (
                                        <SelectItem key={operator.id} value={operator.id.toString()}>
                                            {operator.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedShift} onValueChange={setSelectedShift}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Shift" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Shift</SelectItem>
                                    {shifts?.map((shift) => (
                                        <SelectItem key={shift.id} value={shift.id.toString()}>
                                            {shift.nama_shift}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex-1">
                                    <Search className="w-4 h-4 mr-2" />
                                    Cari
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Dari Tanggal</label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Sampai Tanggal</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Laporan ({reports.total})</CardTitle>
                        <CardDescription>
                            Menampilkan {reports.data.length} dari {reports.total} laporan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order Info</TableHead>
                                        <TableHead>Operator</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Target/Actual</TableHead>
                                        <TableHead>Efisiensi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Dibuat</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                                                    <p className="text-lg font-medium">Tidak ada laporan</p>
                                                    <p className="text-sm">Belum ada laporan yang sesuai dengan filter</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reports.data.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-gray-900">{report.nomor_order}</p>
                                                        <p className="text-sm text-gray-500">Batch: {report.batch_number}</p>
                                                        <p className="text-sm text-gray-500">{report.customer?.nama_customer}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="font-medium">{report.operator?.name}</p>
                                                        <p className="text-sm text-gray-500">{report.shift?.nama_shift}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(report.tanggal_laporan)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="text-sm">Target: {report.target_quantity_pcs} pcs</p>
                                                        <p className="text-sm font-medium">Actual: {report.actual_quantity_pcs} pcs</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-blue-800">
                                                                {Number(report.efisiensi_cutting || 0).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                            {Number(report.durasi_menit || 0)} min
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(report.status_laporan)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDateTime(report.created_at)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.reports.show', report.id)}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(report.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {reports.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-700">
                                    Halaman {reports.current_page} dari {reports.last_page}
                                </div>
                                <div className="flex space-x-2">
                                    {reports.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
