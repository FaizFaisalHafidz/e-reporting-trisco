import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Calendar,
    Clock,
    Download,
    Factory,
    Filter,
    Gauge,
    Target,
    TrendingDown,
    TrendingUp,
    Wrench,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    Cell,
    ComposedChart,
    Line,
    Pie,
    PieChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface ProductionOverview {
    total_production: number;
    total_target: number;
    achievement_rate: number;
    avg_efficiency: number;
    total_reports: number;
    active_lines: number;
    active_machines: number;
    production_growth: number;
    daily_average: number;
}

interface ProductionTrend {
    date: string;
    production: number;
    target: number;
    efficiency: number;
    reports_count: number;
    avg_operational_time: number;
    achievement_rate: number;
    high_efficiency_production: number;
}

interface MachinePerformance {
    machine_id: number;
    machine_name: string;
    total_production: number;
    total_target: number;
    achievement_rate: number;
    avg_efficiency: number;
    total_reports: number;
    avg_operational_time: number;
    defect_rate: number;
    efficiency_range: {
        min: number;
        max: number;
    };
    utilization_score: number;
}

interface ShiftProductivity {
    shift_id: number;
    shift_name: string;
    total_production: number;
    total_target: number;
    achievement_rate: number;
    avg_efficiency: number;
    total_reports: number;
    unique_operators: number;
    unique_machines: number;
    productivity_per_operator: number;
    reports_per_operator: number;
    avg_operational_time: number;
}

interface QualityAnalysis {
    overall_defect_rate: number;
    avg_defects_per_report: number;
    quality_score: number;
    total_defects: number;
    quality_distribution: {
        excellent: { count: number; percentage: number };
        good: { count: number; percentage: number };
        fair: { count: number; percentage: number };
        poor: { count: number; percentage: number };
    };
    quality_trends: Array<{
        date: string;
        avg_defects: number;
        defect_rate: number;
        total_production: number;
        reports: number;
    }>;
}

interface ProductionForecast {
    next_7_days: number;
    next_30_days: number;
    daily_average_forecast: number;
    trend_direction: string;
    trend_slope: number;
    confidence: string;
}

interface CapacityUtilization {
    overall_utilization: number;
    total_operational_hours: number;
    total_possible_hours: number;
    active_machines: number;
    avg_daily_utilization: number;
    machine_breakdown: Array<{
        machine_name: string;
        total_hours: number;
        active_days: number;
        utilization_rate: number;
        avg_daily_hours: number;
    }>;
}

interface ProductionBottlenecks {
    low_efficiency_machines: Array<{
        machine_name: string;
        avg_efficiency: number;
        reports_count: number;
        total_defects: number;
        issue_type: string;
    }>;
    high_defect_machines: Array<{
        machine_name: string;
        defect_rate: number;
        total_defects: number;
        avg_efficiency: number;
        issue_type: string;
    }>;
    underperforming_shifts: Array<{
        shift_name: string;
        avg_efficiency: number;
        total_production: number;
        reports_count: number;
        issue_type: string;
    }>;
    total_issues: number;
}

interface Props {
    productionOverview: ProductionOverview;
    productionTrends: ProductionTrend[];
    machinePerformance: MachinePerformance[];
    shiftProductivity: ShiftProductivity[];
    qualityAnalysis: QualityAnalysis;
    productionForecast: ProductionForecast;
    capacityUtilization: CapacityUtilization;
    productionBottlenecks: ProductionBottlenecks;
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

export default function ProductionTrends({
    productionOverview,
    productionTrends,
    machinePerformance,
    shiftProductivity,
    qualityAnalysis,
    productionForecast,
    capacityUtilization,
    productionBottlenecks,
    dateRange,
    filters = {}
}: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(filters.period || '30');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        if (period !== 'custom') {
            router.get(route('admin.monitoring.production'), { period });
        }
    };

    const handleCustomDateFilter = () => {
        router.get(route('admin.monitoring.production'), {
            date_from: dateFrom,
            date_to: dateTo,
            period: 'custom'
        });
    };

    const getEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 90) return 'text-green-600 bg-green-100';
        if (efficiency >= 80) return 'text-blue-600 bg-blue-100';
        if (efficiency >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'increasing':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'decreasing':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            default:
                return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high':
                return 'text-green-600 bg-green-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-red-600 bg-red-100';
        }
    };

    // Chart colors
    const chartColors = {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6'
    };

    // Quality distribution data for pie chart
    const qualityDistributionData = [
        { name: 'Excellent', value: qualityAnalysis.quality_distribution.excellent.count, color: '#10b981' },
        { name: 'Good', value: qualityAnalysis.quality_distribution.good.count, color: '#3b82f6' },
        { name: 'Fair', value: qualityAnalysis.quality_distribution.fair.count, color: '#f59e0b' },
        { name: 'Poor', value: qualityAnalysis.quality_distribution.poor.count, color: '#ef4444' }
    ];

    return (
        <AppLayout>
            <Head title="Trend Produksi - Rekap & Monitoring" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Trend Produksi</h1>
                        <p className="text-gray-600">
                            Analisis komprehensif trend produksi, kapasitas, dan kualitas
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

                {/* Production Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Produksi</p>
                                    <p className="text-2xl font-bold">{productionOverview.total_production.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">pcs</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Factory className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Achievement Rate</p>
                                    <p className="text-2xl font-bold">{productionOverview.achievement_rate}%</p>
                                    <p className="text-xs text-gray-500">vs target</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Rata-rata Efisiensi</p>
                                    <p className="text-2xl font-bold">{productionOverview.avg_efficiency}%</p>
                                    <p className="text-xs text-gray-500">efficiency</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Gauge className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pertumbuhan</p>
                                    <div className="flex items-center space-x-1">
                                        {getTrendIcon(productionOverview.production_growth > 0 ? 'increasing' : 
                                                     productionOverview.production_growth < 0 ? 'decreasing' : 'stable')}
                                        <p className="text-2xl font-bold">{Math.abs(productionOverview.production_growth)}%</p>
                                    </div>
                                    <p className="text-xs text-gray-500">vs periode lalu</p>
                                </div>
                                <div className={`p-3 rounded-lg ${
                                    productionOverview.production_growth > 0 ? 'bg-green-100' : 
                                    productionOverview.production_growth < 0 ? 'bg-red-100' : 'bg-gray-100'
                                }`}>
                                    <BarChart className={`w-6 h-6 ${
                                        productionOverview.production_growth > 0 ? 'text-green-600' : 
                                        productionOverview.production_growth < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Kapasitas</p>
                                    <p className="text-2xl font-bold">{capacityUtilization.overall_utilization}%</p>
                                    <p className="text-xs text-gray-500">utilization</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Production Trends Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trend Produksi Harian</CardTitle>
                        <CardDescription>Perbandingan produksi aktual vs target dan efisiensi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={productionTrends}>
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
                                            name === 'production' ? 'Produksi Aktual' : 
                                            name === 'target' ? 'Target Produksi' :
                                            name === 'efficiency' ? 'Efisiensi (%)' : name
                                        ]}
                                    />
                                    <Bar yAxisId="left" dataKey="production" fill={chartColors.primary} opacity={0.8} />
                                    <Bar yAxisId="left" dataKey="target" fill={chartColors.secondary} opacity={0.6} />
                                    <Line 
                                        yAxisId="right" 
                                        type="monotone" 
                                        dataKey="efficiency" 
                                        stroke={chartColors.success} 
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                    <ReferenceLine yAxisId="right" y={80} stroke={chartColors.warning} strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Production Forecast */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <span>Forecast Produksi</span>
                        </CardTitle>
                        <CardDescription>Prediksi produksi berdasarkan trend historis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="p-4 bg-blue-100 rounded-lg mb-2">
                                    <h3 className="text-2xl font-bold text-blue-600">
                                        {productionForecast.next_7_days.toLocaleString()}
                                    </h3>
                                </div>
                                <p className="text-sm font-medium">Prediksi 7 Hari</p>
                                <p className="text-xs text-gray-500">pcs</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="p-4 bg-green-100 rounded-lg mb-2">
                                    <h3 className="text-2xl font-bold text-green-600">
                                        {productionForecast.next_30_days.toLocaleString()}
                                    </h3>
                                </div>
                                <p className="text-sm font-medium">Prediksi 30 Hari</p>
                                <p className="text-xs text-gray-500">pcs</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="p-4 bg-yellow-100 rounded-lg mb-2">
                                    <div className="flex items-center justify-center space-x-2">
                                        {getTrendIcon(productionForecast.trend_direction)}
                                        <h3 className="text-lg font-bold text-yellow-600 capitalize">
                                            {productionForecast.trend_direction}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm font-medium">Trend Direction</p>
                                <p className="text-xs text-gray-500">slope: {productionForecast.trend_slope}</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="p-4 rounded-lg mb-2">
                                    <Badge className={getConfidenceColor(productionForecast.confidence)}>
                                        <span className="text-lg font-bold capitalize">
                                            {productionForecast.confidence}
                                        </span>
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium">Confidence Level</p>
                                <p className="text-xs text-gray-500">forecast accuracy</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Machine Performance & Quality Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Machine Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Wrench className="w-5 h-5" />
                                <span>Performa Mesin</span>
                            </CardTitle>
                            <CardDescription>Top 5 mesin berdasarkan utilization score</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {machinePerformance.slice(0, 5).map((machine, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-sm">{machine.machine_name}</h4>
                                                <Badge className={getEfficiencyColor(machine.avg_efficiency)}>
                                                    {machine.avg_efficiency}%
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <Progress value={machine.utilization_score} className="h-2" />
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Produksi: {machine.total_production.toLocaleString()}</span>
                                                    <span>Defect: {machine.defect_rate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quality Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Analisis Kualitas</CardTitle>
                            <CardDescription>Distribusi kualitas produksi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {qualityAnalysis.overall_defect_rate}%
                                    </div>
                                    <p className="text-sm text-gray-500">Overall Defect Rate</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {qualityAnalysis.quality_score}
                                    </div>
                                    <p className="text-sm text-gray-500">Quality Score</p>
                                </div>
                            </div>
                            
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={qualityDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={60}
                                            dataKey="value"
                                            label={({ name, value }: any) => `${name}: ${value}`}
                                        >
                                            {qualityDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Shift Productivity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Clock className="w-5 h-5" />
                            <span>Produktivitas Shift</span>
                        </CardTitle>
                        <CardDescription>Perbandingan performa antar shift kerja</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shift</TableHead>
                                        <TableHead className="text-right">Produksi</TableHead>
                                        <TableHead className="text-right">Achievement</TableHead>
                                        <TableHead className="text-right">Efisiensi</TableHead>
                                        <TableHead className="text-right">Operator</TableHead>
                                        <TableHead className="text-right">Prod/Operator</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shiftProductivity.map((shift, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{shift.shift_name}</TableCell>
                                            <TableCell className="text-right">
                                                {shift.total_production.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={getEfficiencyColor(shift.achievement_rate)}>
                                                    {shift.achievement_rate}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {shift.avg_efficiency}%
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {shift.unique_operators}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {shift.productivity_per_operator.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Production Bottlenecks */}
                {productionBottlenecks.total_issues > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span>Bottleneck Analysis</span>
                            </CardTitle>
                            <CardDescription>Identifikasi potensi hambatan produksi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Low Efficiency Machines */}
                                {productionBottlenecks.low_efficiency_machines.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                            <Wrench className="w-4 h-4 text-red-500" />
                                            <span>Mesin Efisiensi Rendah</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {productionBottlenecks.low_efficiency_machines.map((machine, index) => (
                                                <Alert key={index}>
                                                    <AlertDescription>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium">{machine.machine_name}</span>
                                                            <Badge variant="destructive">
                                                                {machine.avg_efficiency}%
                                                            </Badge>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* High Defect Machines */}
                                {productionBottlenecks.high_defect_machines.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            <span>Mesin Defect Tinggi</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {productionBottlenecks.high_defect_machines.map((machine, index) => (
                                                <Alert key={index}>
                                                    <AlertDescription>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium">{machine.machine_name}</span>
                                                            <Badge variant="destructive">
                                                                {machine.defect_rate}% defect
                                                            </Badge>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Underperforming Shifts */}
                                {productionBottlenecks.underperforming_shifts.filter(s => s.avg_efficiency < 80).length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-yellow-500" />
                                            <span>Shift Underperform</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {productionBottlenecks.underperforming_shifts
                                                .filter(s => s.avg_efficiency < 80)
                                                .map((shift, index) => (
                                                <Alert key={index}>
                                                    <AlertDescription>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium">{shift.shift_name}</span>
                                                            <Badge variant="destructive">
                                                                {shift.avg_efficiency}%
                                                            </Badge>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Capacity Utilization Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Gauge className="w-5 h-5" />
                            <span>Detail Utilisasi Kapasitas</span>
                        </CardTitle>
                        <CardDescription>Breakdown utilisasi per mesin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {capacityUtilization.machine_breakdown.map((machine, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-sm">{machine.machine_name}</h4>
                                        <Badge className={getEfficiencyColor(machine.utilization_rate)}>
                                            {machine.utilization_rate}%
                                        </Badge>
                                    </div>
                                    <Progress value={machine.utilization_rate} className="mb-2 h-2" />
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Hours:</span>
                                            <span>{machine.total_hours}h</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Active Days:</span>
                                            <span>{machine.active_days}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Avg Daily:</span>
                                            <span>{machine.avg_daily_hours}h</span>
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
