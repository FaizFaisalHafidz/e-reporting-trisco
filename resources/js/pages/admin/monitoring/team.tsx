import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    Award,
    Calendar,
    Clock,
    Download,
    Filter,
    Medal,
    Percent,
    Star,
    Target,
    TrendingUp,
    Trophy,
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
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface TeamStats {
    total_operators: number;
    active_operators: number;
    top_performer: {
        name: string;
        efficiency: number;
    };
    avg_team_efficiency: number;
    total_team_production: number;
    team_consistency: number;
    participation_rate: number;
}

interface OperatorDetail {
    operator_id: number;
    operator_name: string;
    operator_email: string;
    total_reports: number;
    avg_efficiency: number;
    best_efficiency: number;
    worst_efficiency: number;
    total_production: number;
    avg_duration: number;
    avg_defects: number;
    excellent_rate: number;
    consistency_score: number;
    productivity_score: number;
}

interface ShiftComparison {
    shift_name: string;
    total_reports: number;
    avg_efficiency: number;
    total_production: number;
    avg_duration: number;
    unique_operators: number;
    productivity_per_operator: number;
}

interface TeamEfficiencyTrend {
    date: string;
    avg_efficiency: number;
    active_operators: number;
    total_reports: number;
    efficiency_per_operator: number;
}

interface OperatorRanking {
    rank: number;
    operator_name: string;
    avg_efficiency: number;
    total_reports: number;
    total_production: number;
    badge: string;
    badge_color: string;
}

interface CollaborationMetrics {
    cross_shift_operators: number;
    versatile_operators: number;
    collaboration_rate: number;
    versatility_rate: number;
}

interface PerformanceDistribution {
    excellent: { min: number; max: number; count: number; percentage: number; color: string };
    good: { min: number; max: number; count: number; percentage: number; color: string };
    average: { min: number; max: number; count: number; percentage: number; color: string };
    below_average: { min: number; max: number; count: number; percentage: number; color: string };
}

interface Props {
    teamStats: TeamStats;
    operatorDetails: OperatorDetail[];
    shiftComparison: ShiftComparison[];
    teamEfficiencyTrends: TeamEfficiencyTrend[];
    operatorRanking: OperatorRanking[];
    collaborationMetrics: CollaborationMetrics;
    performanceDistribution: PerformanceDistribution;
    dateRange: {
        start: string;
        end: string;
    };
    filters?: {
        date_from?: string;
        date_to?: string;
        period?: string;
        shift_id?: string;
        operator_id?: string;
    };
}

export default function TeamPerformance({
    teamStats,
    operatorDetails,
    shiftComparison,
    teamEfficiencyTrends,
    operatorRanking,
    collaborationMetrics,
    performanceDistribution,
    dateRange,
    filters = {}
}: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(filters.period || '30');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedOperator, setSelectedOperator] = useState(filters.operator_id || 'all');

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        if (period !== 'custom') {
            router.get(route('admin.monitoring.team'), { period });
        }
    };

    const handleCustomDateFilter = () => {
        router.get(route('admin.monitoring.team'), {
            date_from: dateFrom,
            date_to: dateTo,
            period: 'custom'
        });
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-400" />;
            case 3:
                return <Award className="w-5 h-5 text-orange-500" />;
            default:
                return <Star className="w-5 h-5 text-gray-300" />;
        }
    };

    const getEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 90) return 'text-green-600 bg-green-100';
        if (efficiency >= 80) return 'text-blue-600 bg-blue-100';
        if (efficiency >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getConsistencyColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Chart colors
    const chartColors = {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
    };

    // Performance distribution data for pie chart
    const distributionData = Object.entries(performanceDistribution).map(([key, value]) => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: value.count,
        percentage: value.percentage,
        color: value.color
    }));

    // Radar chart data for top 5 operators
    const radarData = operatorDetails.slice(0, 5).map(operator => ({
        operator: operator.operator_name.split(' ')[0], // First name only
        efficiency: operator.avg_efficiency,
        consistency: operator.consistency_score,
        quality: operator.excellent_rate,
        productivity: Math.min(operator.total_production / 100, 100) // Scale to 0-100
    }));

    return (
        <AppLayout>
            <Head title="Performa Tim - Rekap & Monitoring" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Performa Tim</h1>
                        <p className="text-gray-600">
                            Analisis mendalam performa operator dan tim produksi
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

                {/* Team Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Operator</p>
                                    <p className="text-2xl font-bold">{teamStats.total_operators}</p>
                                    <p className="text-xs text-green-600">
                                        {teamStats.active_operators} aktif ({teamStats.participation_rate}%)
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Rata-rata Tim</p>
                                    <p className="text-2xl font-bold">{teamStats.avg_team_efficiency}%</p>
                                    <p className="text-xs text-gray-500">efisiensi tim</p>
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
                                    <p className="text-sm text-gray-600 mb-1">Top Performer</p>
                                    <p className="text-lg font-bold truncate">{teamStats.top_performer.name}</p>
                                    <p className="text-xs text-yellow-600">
                                        {teamStats.top_performer.efficiency}% efisiensi
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Trophy className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Konsistensi Tim</p>
                                    <p className="text-2xl font-bold">{teamStats.team_consistency}%</p>
                                    <p className="text-xs text-gray-500">stability score</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Team Efficiency Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trend Efisiensi Tim</CardTitle>
                            <CardDescription>Perkembangan efisiensi dan partisipasi harian</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={teamEfficiencyTrends}>
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
                                                name === 'avg_efficiency' ? 'Efisiensi (%)' : 
                                                name === 'active_operators' ? 'Operator Aktif' : name
                                            ]}
                                        />
                                        <Area 
                                            yAxisId="left" 
                                            type="monotone" 
                                            dataKey="avg_efficiency" 
                                            stroke={chartColors.success} 
                                            fill={chartColors.success} 
                                            fillOpacity={0.3}
                                        />
                                        <Line 
                                            yAxisId="right" 
                                            type="monotone" 
                                            dataKey="active_operators" 
                                            stroke={chartColors.primary} 
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribusi Performa</CardTitle>
                            <CardDescription>Sebaran tingkat performa operator</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                            label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any, name: any) => [`${value} operator`, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                {distributionData.map((item, index) => (
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

                {/* Operator Ranking Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span>Leaderboard Operator</span>
                        </CardTitle>
                        <CardDescription>Ranking operator berdasarkan efisiensi dan performa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {operatorRanking.slice(0, 9).map((operator, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm">
                                            {getRankIcon(operator.rank)}
                                        </div>
                                        <span className="font-bold text-lg text-gray-700">#{operator.rank}</span>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{operator.operator_name}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`text-sm px-2 py-1 rounded-full ${getEfficiencyColor(operator.avg_efficiency)}`}>
                                                {operator.avg_efficiency}%
                                            </span>
                                            {operator.badge && (
                                                <Badge className={operator.badge_color}>
                                                    {operator.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {operator.total_reports} laporan • {operator.total_production.toLocaleString()} pcs
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Performance Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Detailed Operator Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Performa Operator</CardTitle>
                            <CardDescription>Analisis mendalam performa individual</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Operator</TableHead>
                                            <TableHead className="text-right">Efisiensi</TableHead>
                                            <TableHead className="text-right">Konsistensi</TableHead>
                                            <TableHead className="text-right">Quality</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {operatorDetails.slice(0, 8).map((operator, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="text-xs">
                                                                {operator.operator_name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-sm">{operator.operator_name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {operator.total_reports} laporan
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="space-y-1">
                                                        <span className={`font-medium ${getEfficiencyColor(operator.avg_efficiency).split(' ')[0]}`}>
                                                            {operator.avg_efficiency}%
                                                        </span>
                                                        <Progress 
                                                            value={operator.avg_efficiency} 
                                                            className="h-1"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`font-medium ${getConsistencyColor(operator.consistency_score)}`}>
                                                        {operator.consistency_score}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-medium text-blue-600">
                                                        {operator.excellent_rate}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shift Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>Perbandingan Shift</span>
                            </CardTitle>
                            <CardDescription>Performa antar shift kerja</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {shiftComparison.map((shift, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-lg">{shift.shift_name}</h4>
                                            <Badge className={`${getEfficiencyColor(shift.avg_efficiency)}`}>
                                                {shift.avg_efficiency}%
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Operator</p>
                                                <p className="font-medium">{shift.unique_operators}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Total Laporan</p>
                                                <p className="font-medium">{shift.total_reports}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Produksi/Operator</p>
                                                <p className="font-medium">{shift.productivity_per_operator.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <Progress 
                                                value={shift.avg_efficiency} 
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Collaboration Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Metrics Kolaborasi Tim</span>
                        </CardTitle>
                        <CardDescription>Indikator kerjasama dan fleksibilitas tim</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="p-4 bg-blue-100 rounded-lg inline-block mb-2">
                                    <TrendingUp className="w-8 h-8 text-blue-600" />
                                </div>
                                <h4 className="font-medium text-lg">{collaborationMetrics.cross_shift_operators}</h4>
                                <p className="text-sm text-gray-500">Cross-shift Operators</p>
                                <p className="text-xs text-blue-600 mt-1">{collaborationMetrics.collaboration_rate}% dari total</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="p-4 bg-green-100 rounded-lg inline-block mb-2">
                                    <Star className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="font-medium text-lg">{collaborationMetrics.versatile_operators}</h4>
                                <p className="text-sm text-gray-500">Multi-machine Operators</p>
                                <p className="text-xs text-green-600 mt-1">{collaborationMetrics.versatility_rate}% versatility</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="p-4 bg-yellow-100 rounded-lg inline-block mb-2">
                                    <Percent className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h4 className="font-medium text-lg">{teamStats.participation_rate}%</h4>
                                <p className="text-sm text-gray-500">Participation Rate</p>
                                <p className="text-xs text-yellow-600 mt-1">operator aktif</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="p-4 bg-purple-100 rounded-lg inline-block mb-2">
                                    <Zap className="w-8 h-8 text-purple-600" />
                                </div>
                                <h4 className="font-medium text-lg">{teamStats.team_consistency}%</h4>
                                <p className="text-sm text-gray-500">Team Consistency</p>
                                <p className="text-xs text-purple-600 mt-1">stability score</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
