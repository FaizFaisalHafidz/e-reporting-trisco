import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Calendar, Database, Download, Edit, Eye, Filter, Plus, Search, Settings, Shield, Trash2, Upload, Users } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Log {
    id: number;
    user_id: number;
    aktivitas: string;
    modul: string;
    ip_address: string;
    user_agent: string;
    data_before: any;
    data_after: any;
    keterangan: string;
    created_at: string;
    user: User;
}

interface Stats {
    total_system_logs: number;
    today_system_logs: number;
    create_actions: number;
    update_actions: number;
}

interface Props {
    logs: {
        data: Log[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    users: User[];
    moduls: string[];
    aktivitas: string[];
    stats: Stats;
    filters: {
        user_id?: string;
        modul?: string;
        aktivitas?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function SystemLogs({ logs, users, moduls, aktivitas, stats, filters }: Props) {
    const [localFilters, setLocalFilters] = useState({
        user_id: filters.user_id || 'all',
        modul: filters.modul || 'all',
        aktivitas: filters.aktivitas || 'all',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        search: filters.search || '',
    });

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        // Convert 'all' back to empty string for backend
        const filtersForBackend = {
            ...localFilters,
            user_id: localFilters.user_id === 'all' ? '' : localFilters.user_id,
            modul: localFilters.modul === 'all' ? '' : localFilters.modul,
            aktivitas: localFilters.aktivitas === 'all' ? '' : localFilters.aktivitas,
        };
        
        router.get(route('admin.logs.system'), filtersForBackend, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setLocalFilters({
            user_id: 'all',
            modul: 'all',
            aktivitas: 'all',
            date_from: '',
            date_to: '',
            search: '',
        });
        router.get(route('admin.logs.system'));
    };

    const exportLogs = () => {
        // Convert 'all' back to empty string for backend
        const filtersForExport = {
            ...localFilters,
            user_id: localFilters.user_id === 'all' ? '' : localFilters.user_id,
            modul: localFilters.modul === 'all' ? '' : localFilters.modul,
            aktivitas: localFilters.aktivitas === 'all' ? '' : localFilters.aktivitas,
        };
        window.open(route('admin.logs.export', { ...filtersForExport, type: 'system' }));
    };

    const getActivityColor = (activity: string) => {
        switch (activity.toLowerCase()) {
            case 'create':
                return 'bg-green-100 text-green-800';
            case 'update':
                return 'bg-yellow-100 text-yellow-800';
            case 'delete':
                return 'bg-red-100 text-red-800';
            case 'view':
                return 'bg-blue-100 text-blue-800';
            case 'export':
                return 'bg-purple-100 text-purple-800';
            case 'import':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getActivityIcon = (activity: string) => {
        switch (activity.toLowerCase()) {
            case 'create':
                return <Plus className="w-3 h-3" />;
            case 'update':
                return <Edit className="w-3 h-3" />;
            case 'delete':
                return <Trash2 className="w-3 h-3" />;
            case 'view':
                return <Eye className="w-3 h-3" />;
            case 'export':
                return <Download className="w-3 h-3" />;
            case 'import':
                return <Upload className="w-3 h-3" />;
            default:
                return <Activity className="w-3 h-3" />;
        }
    };

    const getModulIcon = (modul: string) => {
        switch (modul.toLowerCase()) {
            case 'master_data':
                return <Database className="w-3 h-3" />;
            case 'users':
                return <Users className="w-3 h-3" />;
            case 'roles':
                return <Shield className="w-3 h-3" />;
            case 'settings':
                return <Settings className="w-3 h-3" />;
            default:
                return <Activity className="w-3 h-3" />;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatModulName = (modul: string) => {
        const modulNames: { [key: string]: string } = {
            'master_data': 'Master Data',
            'users': 'Manajemen User',
            'roles': 'Role & Permission',
            'settings': 'Pengaturan',
            'reports': 'Laporan',
            'monitoring': 'Monitoring',
        };
        return modulNames[modul] || modul;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Log Sistem" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Log Sistem</h2>
                            <p className="text-gray-600">Monitor aktivitas sistem dan perubahan data</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('admin.logs.index')}>
                                <Button variant="outline">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Semua Log
                                </Button>
                            </Link>
                            <Link href={route('admin.logs.login')}>
                                <Button variant="outline">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Log Login
                                </Button>
                            </Link>
                            <Button onClick={exportLogs} variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Log Sistem</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.total_system_logs.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Log Hari Ini</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.today_system_logs.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Data Dibuat</CardTitle>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">{stats.create_actions.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Data Diupdate</CardTitle>
                                <Edit className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{stats.update_actions.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filter Log Sistem
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                                <div>
                                    <Label htmlFor="search">Pencarian</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Cari..."
                                            value={localFilters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="user_id">User</Label>
                                    <Select value={localFilters.user_id} onValueChange={(value) => handleFilterChange('user_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua User" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua User</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="modul">Modul</Label>
                                    <Select value={localFilters.modul} onValueChange={(value) => handleFilterChange('modul', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Modul" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Modul</SelectItem>
                                            {moduls.map((modul) => (
                                                <SelectItem key={modul} value={modul}>
                                                    {formatModulName(modul)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="aktivitas">Aktivitas</Label>
                                    <Select value={localFilters.aktivitas} onValueChange={(value) => handleFilterChange('aktivitas', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Aktivitas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Aktivitas</SelectItem>
                                            {aktivitas.map((act) => (
                                                <SelectItem key={act} value={act}>
                                                    {act.charAt(0).toUpperCase() + act.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="date_from">Dari Tanggal</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={localFilters.date_from}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="date_to">Sampai Tanggal</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={localFilters.date_to}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={applyFilters}>
                                    <Filter className="w-4 h-4 mr-2" />
                                    Terapkan Filter
                                </Button>
                                <Button onClick={resetFilters} variant="outline">
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Log Sistem</CardTitle>
                            <CardDescription>
                                Menampilkan {logs.total.toLocaleString()} aktivitas sistem
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Aktivitas</TableHead>
                                        <TableHead>Modul</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{formatDateTime(log.created_at).split(' ')[0]}</div>
                                                    <div className="text-gray-500">{formatDateTime(log.created_at).split(' ')[1]}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{log.user?.name || 'System'}</div>
                                                    <div className="text-sm text-gray-500">{log.user?.email || '-'}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getActivityColor(log.aktivitas)} flex items-center gap-1 w-fit`}>
                                                    {getActivityIcon(log.aktivitas)}
                                                    {log.aktivitas.charAt(0).toUpperCase() + log.aktivitas.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getModulIcon(log.modul)}
                                                    <span>{formatModulName(log.modul)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">{log.ip_address}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate" title={log.keterangan}>
                                                    {log.keterangan || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('admin.logs.show', log.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {logs.links && logs.links.length > 3 && (
                                <div className="flex justify-center mt-6">
                                    <div className="flex space-x-1">
                                        {logs.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded-md ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
