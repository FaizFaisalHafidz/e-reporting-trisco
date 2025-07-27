import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    ArrowUp,
    BarChart3,
    Calendar,
    Clock,
    Cog,
    Download,
    Filter,
    Package,
    Percent,
    TrendingDown,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Cell,
    Line,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface OverviewStats {
    total_reports: number;
    completed_reports: number;
    pending_reports: number;
    avg_efficiency: number;
    total_production: number;
    total_yardage: number;
    reports_growth: number;
    efficiency_growth: number;
    completion_rate: number;
}

interface ProductionData {
    date: string;
    total_reports: number;
    total_quantity: number;
    avg_efficiency: number;
    total_yard: number;
}

interface EfficiencyTrend {
    week: string;
    avg_efficiency: number;
    min_efficiency: number;
    max_efficiency: number;
    total_reports: number;
}

interface MachinePerformance {
    machine_name: string;
    machine_code: string;
    total_reports: number;
    avg_efficiency: number;
    total_quantity: number;
    avg_duration: number;
}

interface OperatorPerformance {
    operator_name: string;
    total_reports: number;
    avg_efficiency: number;
    total_quantity: number;
}

interface CustomerPerformance {
    customer_name: string;
    total_orders: number;
    total_quantity: number;
    avg_efficiency: number;
}

interface QualityMetrics {
    avg_defects: number;
    quality_distribution: {
        excellent: { count: number; percentage: number };
        good: { count: number; percentage: number };
        fair: { count: number; percentage: number };
        poor: { count: number; percentage: number };
    };
}

interface RecentActivity {
    type: string;
    message: string;
    timestamp: string;
    status: string;
}

interface Props {
    overviewStats: OverviewStats;
    productionPerformance: ProductionData[];
    efficiencyTrends: EfficiencyTrend[];
    machinePerformance: MachinePerformance[];
    operatorPerformance: OperatorPerformance[];
    customerPerformance: CustomerPerformance[];
    qualityMetrics: QualityMetrics;
    recentActivities: RecentActivity[];
    dateRange: {
        start: string;
        end: string;
    };
    filters?: {
        date_from?: string;
        date_to?: string;
        period?: string;
    };
}

export default function MonitoringDashboard({
    overviewStats,
    productionPerformance,
    efficiencyTrends,
    machinePerformance,
    operatorPerformance,
    customerPerformance,
    qualityMetrics,
    recentActivities,
    dateRange,
    filters = {}
}: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(filters.period || '30');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        if (period !== 'custom') {
            router.get(route('admin.monitoring.dashboard'), { period });
        }
    };

    const handleCustomDateFilter = () => {
        router.get(route('admin.monitoring.dashboard'), {
            date_from: dateFrom,
            date_to: dateTo,
            period: 'custom'
        });
    };

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <ArrowUp className="w-4 h-4 text-gray-400" />;
    };

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600';
        if (growth < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'validation':
                return <Zap className="w-4 h-4 text-blue-500" />;
            case 'report':
                return <Package className="w-4 h-4 text-green-500" />;
            default:
                return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            need_revision: 'bg-orange-100 text-orange-800',
            submitted: 'bg-blue-100 text-blue-800',
            draft: 'bg-gray-100 text-gray-800',
        };

        return (
            <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                {status}
            </Badge>
        );
    };

    // Chart colors
    const chartColors = {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4'
    };

    const qualityColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    const qualityData = Object.entries(qualityMetrics.quality_distribution).map(([key, value], index) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: value.count,
        percentage: value.percentage,
        color: qualityColors[index]
    }));

    return (
        <AppLayout>
            <Head title="Dashboard Monitoring - Rekap & Monitoring" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h1>
                        <p className="text-gray-600">
                            Overview performa produksi dan analytics laporan cutting
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Date Range Filter */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">Period:</span>
                            </div>
                            
                            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 Hari</SelectItem>
                                    <SelectItem value="30">30 Hari</SelectItem>
                                    <SelectItem value="90">90 Hari</SelectItem>
                                    <SelectItem value="365">1 Tahun</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>

                            {selectedPeriod === 'custom' && (
                                <>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-40"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-40"
                                    />
                                    <Button onClick={handleCustomDateFilter}>
                                        <Filter className="w-4 h-4 mr-2" />
                                        Apply
                                    </Button>
                                </>
                            )}

                            <div className="text-sm text-gray-500">
                                {new Date(dateRange.start).toLocaleDateString('id-ID')} - {new Date(dateRange.end).toLocaleDateString('id-ID')}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
                                    <p className="text-2xl font-bold">{overviewStats.total_reports}</p>
                                    <div className="flex items-center space-x-1 mt-1">
                                        {getGrowthIcon(overviewStats.reports_growth)}
                                        <span className={`text-xs ${getGrowthColor(overviewStats.reports_growth)}`}>
                                            {Math.abs(overviewStats.reports_growth)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Rata-rata Efisiensi</p>
                                    <p className="text-2xl font-bold">{overviewStats.avg_efficiency}%</p>
                                    <div className="flex items-center space-x-1 mt-1">
                                        {getGrowthIcon(overviewStats.efficiency_growth)}
                                        <span className={`text-xs ${getGrowthColor(overviewStats.efficiency_growth)}`}>
                                            {Math.abs(overviewStats.efficiency_growth)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Percent className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Produksi</p>
                                    <p className="text-2xl font-bold">{overviewStats.total_production.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">pieces</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Package className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                                    <p className="text-2xl font-bold">{overviewStats.completion_rate}%</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {overviewStats.completed_reports}/{overviewStats.total_reports} selesai
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Production Performance Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performa Produksi Harian</CardTitle>
                            <CardDescription>Trend produksi dan efisiensi per hari</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={productionPerformance}>
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(date: any) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                                        />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip 
                                            labelFormatter={(date: any) => new Date(date).toLocaleDateString('id-ID')}
                                            formatter={(value: any, name: any) => [
                                                typeof value === 'number' ? value.toLocaleString() : value,
                                                name === 'total_quantity' ? 'Total Produksi' : 
                                                name === 'avg_efficiency' ? 'Rata-rata Efisiensi (%)' : name
                                            ]}
                                        />
                                        <Area 
                                            yAxisId="left" 
                                            type="monotone" 
                                            dataKey="total_quantity" 
                                            stackId="1" 
                                            stroke={chartColors.primary} 
                                            fill={chartColors.primary} 
                                            fillOpacity={0.3}
                                        />
                                        <Line 
                                            yAxisId="right" 
                                            type="monotone" 
                                            dataKey="avg_efficiency" 
                                            stroke={chartColors.success} 
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quality Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribusi Kualitas</CardTitle>
                            <CardDescription>Persentase kualitas hasil cutting</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={qualityData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                            label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                                        >
                                            {qualityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any, name: any) => [`${value} laporan`, name]} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                {qualityData.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span>{item.name}: {item.value} ({item.percentage}%)</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Machine Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Cog className="w-5 h-5" />
                                <span>Performa Mesin</span>
                            </CardTitle>
                            <CardDescription>Top 10 mesin dengan performa terbaik</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mesin</TableHead>
                                            <TableHead className="text-right">Laporan</TableHead>
                                            <TableHead className="text-right">Efisiensi</TableHead>
                                            <TableHead className="text-right">Produksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {machinePerformance.slice(0, 5).map((machine, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{machine.machine_name}</div>
                                                        <div className="text-xs text-gray-500">{machine.machine_code}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{machine.total_reports}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`font-medium ${
                                                        machine.avg_efficiency >= 90 ? 'text-green-600' :
                                                        machine.avg_efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        {machine.avg_efficiency}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {machine.total_quantity.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operator Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>Performa Operator</span>
                            </CardTitle>
                            <CardDescription>Top 10 operator dengan efisiensi tertinggi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Operator</TableHead>
                                            <TableHead className="text-right">Laporan</TableHead>
                                            <TableHead className="text-right">Efisiensi</TableHead>
                                            <TableHead className="text-right">Produksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {operatorPerformance.slice(0, 5).map((operator, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    {operator.operator_name}
                                                </TableCell>
                                                <TableCell className="text-right">{operator.total_reports}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`font-medium ${
                                                        operator.avg_efficiency >= 90 ? 'text-green-600' :
                                                        operator.avg_efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        {operator.avg_efficiency}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {operator.total_quantity.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>Aktivitas Terbaru</span>
                        </CardTitle>
                        <CardDescription>Log aktivitas sistem dan validasi terbaru</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {recentActivities.slice(0, 10).map((activity, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="mt-0.5">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">{activity.message}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-gray-500">
                                                {new Date(activity.timestamp).toLocaleString('id-ID')}
                                            </span>
                                            {getStatusBadge(activity.status)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
