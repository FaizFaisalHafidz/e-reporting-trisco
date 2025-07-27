import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CalendarDays,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Filter,
    Hash,
    Package,
    Search,
    User
} from 'lucide-react';
import { useState } from 'react';

interface Report {
    id: number;
    nomor_laporan: string;
    nomor_order: string;
    batch_number: string;
    tanggal_laporan: string;
    updated_at: string;
    target_quantity_pcs?: number;
    actual_quantity_pcs?: number;
    efisiensi_cutting?: number;
    status_laporan: string;
    operator?: {
        id: number;
        name: string;
        email: string;
    };
    shift?: {
        id: number;
        nama_shift: string;
    };
    customer?: {
        id: number;
        nama_customer: string;
    };
    pattern?: {
        id: number;
        nama_pattern: string;
    };
    validasi?: {
        id: number;
        status_validasi: string;
        validator?: {
            id: number;
            name: string;
        };
    };
}

interface Props {
    pendingReports?: {
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
        total_pending: number;
        urgent_pending: number;
        today_submitted: number;
        this_week_submitted: number;
    };
    filters?: {
        date_from?: string;
        date_to?: string;
        operator?: string;
        shift?: string;
        search?: string;
    } | any[];
}

export default function ValidationPending({ 
    pendingReports = { data: [], links: [], current_page: 1, last_page: 1, total: 0 }, 
    operators = [], 
    shifts = [], 
    stats = { total_pending: 0, urgent_pending: 0, today_submitted: 0, this_week_submitted: 0 }, 
    filters = {}
}: Props) {
    // Convert filters to object if it's array or null
    const filtersObj = Array.isArray(filters) || !filters ? {} : filters;
    
    const [searchTerm, setSearchTerm] = useState(filtersObj.search || '');
    const [selectedOperator, setSelectedOperator] = useState(filtersObj.operator || 'all');
    const [selectedShift, setSelectedShift] = useState(filtersObj.shift || 'all');
    const [dateFrom, setDateFrom] = useState(filtersObj.date_from || '');
    const [dateTo, setDateTo] = useState(filtersObj.date_to || '');

    const handleSearch = () => {
        router.get(route('admin.validation.pending'), {
            search: searchTerm,
            operator: selectedOperator === 'all' ? '' : selectedOperator,
            shift: selectedShift === 'all' ? '' : selectedShift,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedOperator('all');
        setSelectedShift('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.validation.pending'));
    };

    const getUrgencyBadge = (updatedAt: string) => {
        const daysDiff = Math.floor((new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff >= 7) {
            return <Badge className="bg-red-100 text-red-800">Critical ({daysDiff}d)</Badge>;
        } else if (daysDiff >= 3) {
            return <Badge className="bg-orange-100 text-orange-800">Urgent ({daysDiff}d)</Badge>;
        } else {
            return <Badge className="bg-yellow-100 text-yellow-800">New ({daysDiff}d)</Badge>;
        }
    };

    const getEfficiencyColor = (efficiency?: number) => {
        const eff = efficiency || 0;
        if (eff >= 90) return 'text-green-600';
        if (eff >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout>
            <Head title="Pending Approval - Validasi & Approval" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pending Approval</h1>
                        <p className="text-gray-600">Validasi laporan yang menunggu persetujuan</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_pending}</p>
                                    <p className="text-sm text-gray-600">Total Pending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{stats.urgent_pending}</p>
                                    <p className="text-sm text-gray-600">Urgent (&gt;3 hari)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CalendarDays className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{stats.today_submitted}</p>
                                    <p className="text-sm text-gray-600">Hari Ini</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">{stats.this_week_submitted}</p>
                                    <p className="text-sm text-gray-600">Minggu Ini</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="w-5 h-5" />
                            <span>Filter & Pencarian</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Cari nomor order, batch, laporan..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

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

                            <Input
                                type="date"
                                placeholder="Dari tanggal"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />

                            <Input
                                type="date"
                                placeholder="Sampai tanggal"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-4">
                            <Button onClick={handleSearch} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                                <Search className="w-4 h-4 mr-2" />
                                Cari
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Reset Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Laporan Menunggu Validasi</CardTitle>
                        <CardDescription>
                            {pendingReports.total} laporan menunggu validasi • Diurutkan berdasarkan yang paling lama
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pendingReports.data.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Semua Laporan Sudah Divalidasi</h3>
                                <p className="text-gray-600">Tidak ada laporan yang menunggu validasi saat ini</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No. Laporan</TableHead>
                                            <TableHead>Order & Batch</TableHead>
                                            <TableHead>Operator</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Performa</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Prioritas</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingReports.data.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Hash className="w-4 h-4 text-gray-400" />
                                                            <span className="font-mono text-sm font-medium">
                                                                {report.nomor_laporan}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(report.tanggal_laporan).toLocaleDateString('id-ID')}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{report.nomor_order}</div>
                                                        <div className="text-sm text-gray-600">
                                                            Batch: {report.batch_number}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <div className="font-medium">{report.operator?.name || 'N/A'}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {report.shift?.nama_shift || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <div className="font-medium text-sm">
                                                                {report.customer?.nama_customer || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {report.pattern?.nama_pattern || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Package className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm">
                                                                {report.actual_quantity_pcs || 0}/{report.target_quantity_pcs || 0} pcs
                                                            </span>
                                                        </div>
                                                        <div className={`text-sm font-medium ${getEfficiencyColor(report.efisiensi_cutting || 0)}`}>
                                                            {(report.efisiensi_cutting || 0).toFixed(1)}% efisiensi
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(report.updated_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getUrgencyBadge(report.updated_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={route('admin.validation.show', report.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Review
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {pendingReports.last_page > 1 && (
                    <div className="flex justify-center items-center space-x-2">
                        {pendingReports.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 text-sm rounded-md ${link.active 
                                    ? 'bg-[#1e3a8a] text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
