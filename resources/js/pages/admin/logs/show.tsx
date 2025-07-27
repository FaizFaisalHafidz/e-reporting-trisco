import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, Calendar, Database, Edit, Eye, Globe, Monitor, Plus, Trash2, User } from 'lucide-react';

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

interface Props {
    log: Log;
}

export default function LogShow({ log }: Props) {
    const getActivityColor = (activity: string) => {
        switch (activity.toLowerCase()) {
            case 'login':
                return 'bg-green-100 text-green-800';
            case 'logout':
                return 'bg-blue-100 text-blue-800';
            case 'login_failed':
                return 'bg-red-100 text-red-800';
            case 'create':
                return 'bg-emerald-100 text-emerald-800';
            case 'update':
                return 'bg-yellow-100 text-yellow-800';
            case 'delete':
                return 'bg-red-100 text-red-800';
            case 'view':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getActivityIcon = (activity: string) => {
        switch (activity.toLowerCase()) {
            case 'create':
                return <Plus className="w-4 h-4" />;
            case 'update':
                return <Edit className="w-4 h-4" />;
            case 'delete':
                return <Trash2 className="w-4 h-4" />;
            case 'view':
                return <Eye className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getBrowserFromUserAgent = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return 'Google Chrome';
        if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Microsoft Edge';
        return 'Unknown Browser';
    };

    const getOSFromUserAgent = (userAgent: string) => {
        if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
        if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
        if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
        if (userAgent.includes('Mac OS X')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown OS';
    };

    const formatJSON = (data: any) => {
        if (!data) return null;
        try {
            return JSON.stringify(data, null, 2);
        } catch (e) {
            return JSON.stringify(data);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Log #${log.id}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={route('admin.logs.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Detail Log Aktivitas</h2>
                                <p className="text-gray-600">ID: #{log.id}</p>
                            </div>
                        </div>
                        <Badge className={`${getActivityColor(log.aktivitas)} flex items-center gap-2`}>
                            {getActivityIcon(log.aktivitas)}
                            {log.aktivitas.charAt(0).toUpperCase() + log.aktivitas.slice(1)}
                        </Badge>
                    </div>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Informasi Umum
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Waktu</div>
                                            <div className="text-sm">{formatDateTime(log.created_at)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">User</div>
                                            <div className="text-sm font-medium">{log.user?.name || 'System'}</div>
                                            <div className="text-xs text-gray-500">{log.user?.email || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Database className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Modul</div>
                                            <div className="text-sm capitalize">{log.modul}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">IP Address</div>
                                            <div className="text-sm font-mono">{log.ip_address}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Monitor className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Perangkat</div>
                                            <div className="text-sm">{getBrowserFromUserAgent(log.user_agent)}</div>
                                            <div className="text-xs text-gray-500">{getOSFromUserAgent(log.user_agent)}</div>
                                        </div>
                                    </div>

                                    {log.keterangan && (
                                        <div className="flex items-start space-x-3">
                                            <Activity className="w-4 h-4 text-gray-500 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Keterangan</div>
                                                <div className="text-sm">{log.keterangan}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Agent Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="w-5 h-5" />
                                Detail User Agent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <code className="text-sm text-gray-700 break-all">
                                    {log.user_agent}
                                </code>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Changes */}
                    {(log.data_before || log.data_after) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Data Before */}
                            {log.data_before && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-red-600">Data Sebelum Perubahan</CardTitle>
                                        <CardDescription>
                                            Kondisi data sebelum aktivitas dilakukan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                            <pre className="text-sm text-red-800 whitespace-pre-wrap overflow-x-auto">
                                                {formatJSON(log.data_before)}
                                            </pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Data After */}
                            {log.data_after && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-green-600">Data Setelah Perubahan</CardTitle>
                                        <CardDescription>
                                            Kondisi data setelah aktivitas dilakukan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <pre className="text-sm text-green-800 whitespace-pre-wrap overflow-x-auto">
                                                {formatJSON(log.data_after)}
                                            </pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <Link href={route('admin.logs.index')}>
                                    <Button variant="outline">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Kembali ke Daftar Log
                                    </Button>
                                </Link>

                                <div className="flex gap-2">
                                    <Link href={route('admin.logs.login')}>
                                        <Button variant="outline" size="sm">
                                            Log Login
                                        </Button>
                                    </Link>
                                    <Link href={route('admin.logs.system')}>
                                        <Button variant="outline" size="sm">
                                            Log Sistem
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
