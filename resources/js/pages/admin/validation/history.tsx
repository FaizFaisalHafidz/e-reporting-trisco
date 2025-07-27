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
    Download,
    Eye,
    Filter,
    Hash,
    History,
    MessageSquare,
    Search,
    User,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface ValidationRecord {
    id: number;
    status_validasi: 'approved' | 'rejected' | 'need_revision';
    catatan_validasi?: string;
    tanggal_validasi: string;
    revisi_diminta?: string[];
    validator?: {
        id: number;
        name: string;
    };
    laporan?: {
        id: number;
        nomor_laporan: string;
        nomor_order: string;
        batch_number: string;
        tanggal_laporan: string;
        efisiensi_cutting?: number;
        operator?: {
            id: number;
            name: string;
        };
        customer?: {
            id: number;
            nama_customer: string;
        };
        pattern?: {
            id: number;
            nama_pattern: string;
        };
    };
}

interface Props {
    validationHistory?: {
        data: ValidationRecord[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    validators?: Array<{
        id: number;
        name: string;
    }>;
    stats?: {
        total_validated: number;
        approved_count: number;
        rejected_count: number;
        revision_count: number;
    };
    filters?: {
        status?: string;
        date_from?: string;
        date_to?: string;
        validator?: string;
        search?: string;
    } | any[];
}

export default function ValidationHistory({ 
    validationHistory = { data: [], links: [], current_page: 1, last_page: 1, total: 0 }, 
    validators = [], 
    stats = { total_validated: 0, approved_count: 0, rejected_count: 0, revision_count: 0 }, 
    filters = {}
}: Props) {
    // Convert filters to object if it's array or null
    const filtersObj = Array.isArray(filters) || !filters ? {} : filters;
    
    const [searchTerm, setSearchTerm] = useState(filtersObj.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filtersObj.status || 'all');
    const [selectedValidator, setSelectedValidator] = useState(filtersObj.validator || 'all');
    const [dateFrom, setDateFrom] = useState(filtersObj.date_from || '');
    const [dateTo, setDateTo] = useState(filtersObj.date_to || '');

    const handleSearch = () => {
        router.get(route('admin.validation.history'), {
            search: searchTerm,
            status: selectedStatus === 'all' ? '' : selectedStatus,
            validator: selectedValidator === 'all' ? '' : selectedValidator,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedValidator('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.validation.history'));
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            need_revision: 'bg-orange-100 text-orange-800',
        };
        
        const labels = {
            approved: 'Disetujui',
            rejected: 'Ditolak',
            need_revision: 'Perlu Revisi',
        };

        const icons = {
            approved: CheckCircle,
            rejected: XCircle,
            need_revision: AlertTriangle,
        };

        const Icon = icons[status as keyof typeof icons];

        return (
            <Badge className={variants[status as keyof typeof variants]}>
                <Icon className="w-3 h-3 mr-1" />
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const getEfficiencyColor = (efficiency?: number) => {
        const eff = efficiency || 0;
        if (eff >= 90) return 'text-green-600';
        if (eff >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const exportHistory = () => {
        const params = new URLSearchParams({
            search: searchTerm,
            status: selectedStatus === 'all' ? '' : selectedStatus,
            validator: selectedValidator === 'all' ? '' : selectedValidator,
            date_from: dateFrom,
            date_to: dateTo,
        });
        
        window.open(`/admin/validation/export?${params.toString()}`, '_blank');
    };

    return (
        <AppLayout>
            <Head title="History Validasi - Validasi & Approval" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">History Validasi</h1>
                        <p className="text-gray-600">Riwayat semua validasi laporan cutting</p>
                    </div>
                    <Button onClick={exportHistory} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <History className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_validated}</p>
                                    <p className="text-sm text-gray-600">Total Validasi</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{stats.approved_count}</p>
                                    <p className="text-sm text-gray-600">Disetujui</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejected_count}</p>
                                    <p className="text-sm text-gray-600">Ditolak</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">{stats.revision_count}</p>
                                    <p className="text-sm text-gray-600">Perlu Revisi</p>
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

                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status Validasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                    <SelectItem value="need_revision">Perlu Revisi</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedValidator} onValueChange={setSelectedValidator}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Validator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Validator</SelectItem>
                                    {validators?.map((validator) => (
                                        <SelectItem key={validator.id} value={validator.id.toString()}>
                                            {validator.name}
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

                {/* History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Validasi</CardTitle>
                        <CardDescription>
                            {validationHistory.total} record validasi • Diurutkan berdasarkan yang terbaru
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {validationHistory.data.length === 0 ? (
                            <div className="text-center py-8">
                                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat Validasi</h3>
                                <p className="text-gray-600">Riwayat validasi akan muncul setelah ada laporan yang divalidasi</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal Validasi</TableHead>
                                            <TableHead>No. Laporan</TableHead>
                                            <TableHead>Order & Batch</TableHead>
                                            <TableHead>Operator</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Efisiensi</TableHead>
                                            <TableHead>Validator</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {validationHistory.data.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <CalendarDays className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium text-sm">
                                                                {new Date(record.tanggal_validasi).toLocaleDateString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(record.tanggal_validasi).toLocaleTimeString('id-ID', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Hash className="w-4 h-4 text-gray-400" />
                                                        <span className="font-mono text-sm font-medium">
                                                            {record.laporan?.nomor_laporan}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{record.laporan?.nomor_order}</div>
                                                        <div className="text-sm text-gray-600">
                                                            Batch: {record.laporan?.batch_number}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-sm">
                                                            {record.laporan?.operator?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <div className="font-medium text-sm">
                                                                {record.laporan?.customer?.nama_customer || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {record.laporan?.pattern?.nama_pattern || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`font-medium ${getEfficiencyColor(record.laporan?.efisiensi_cutting)}`}>
                                                        {(record.laporan?.efisiensi_cutting || 0).toFixed(1)}%
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-4 h-4 text-blue-400" />
                                                        <span className="font-medium text-sm text-blue-600">
                                                            {record.validator?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(record.status_validasi)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={route('admin.validation.show', record.laporan?.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Detail
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

                {/* Additional Info - Show validation notes for recent records */}
                {validationHistory.data.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MessageSquare className="w-5 h-5" />
                                <span>Catatan Validasi Terbaru</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {validationHistory.data.slice(0, 5).filter(record => record.catatan_validasi).map((record) => (
                                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm font-medium">
                                                    {record.laporan?.nomor_laporan}
                                                </span>
                                                {getStatusBadge(record.status_validasi)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {record.validator?.name} • {new Date(record.tanggal_validasi).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 italic">"{record.catatan_validasi}"</p>

                                        {/* Show revision items if available */}
                                        {record.status_validasi === 'need_revision' && record.revisi_diminta && Array.isArray(record.revisi_diminta) && record.revisi_diminta.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-600 mb-1">Poin Revisi:</p>
                                                <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                                    {record.revisi_diminta.map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {validationHistory.last_page > 1 && (
                    <div className="flex justify-center items-center space-x-2">
                        {validationHistory.links.map((link, index) => (
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
