<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TtDataLaporanCutting;
use App\Models\TtDataValidasiLaporan;
use App\Models\User;
use App\Models\TmDataMesinCutting;
use App\Models\TmDataCustomer;
use App\Models\TmDataPattern;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class MonitoringController extends Controller
{
    public function dashboard(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        $startDate = $dateRange['start'];
        $endDate = $dateRange['end'];

        // Overview Statistics
        $overviewStats = $this->getOverviewStats($startDate, $endDate);
        
        // Production Performance
        $productionPerformance = $this->getProductionPerformance($startDate, $endDate);
        
        // Efficiency Trends
        $efficiencyTrends = $this->getEfficiencyTrends($startDate, $endDate);
        
        // Machine Performance
        $machinePerformance = $this->getMachinePerformance($startDate, $endDate);
        
        // Operator Performance
        $operatorPerformance = $this->getOperatorPerformance($startDate, $endDate);
        
        // Customer Performance
        $customerPerformance = $this->getCustomerPerformance($startDate, $endDate);
        
        // Quality Metrics
        $qualityMetrics = $this->getQualityMetrics($startDate, $endDate);
        
        // Recent Activities
        $recentActivities = $this->getRecentActivities();

        return Inertia::render('admin/monitoring/dashboard', [
            'overviewStats' => $overviewStats,
            'productionPerformance' => $productionPerformance,
            'efficiencyTrends' => $efficiencyTrends,
            'machinePerformance' => $machinePerformance,
            'operatorPerformance' => $operatorPerformance,
            'customerPerformance' => $customerPerformance,
            'qualityMetrics' => $qualityMetrics,
            'recentActivities' => $recentActivities,
            'dateRange' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'filters' => $request->only(['date_from', 'date_to', 'period'])
        ]);
    }

    private function getDateRange(Request $request)
    {
        $period = $request->get('period', '30'); // Default 30 days
        
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $startDate = Carbon::parse($request->date_from);
            $endDate = Carbon::parse($request->date_to);
        } else {
            switch ($period) {
                case '7':
                    $startDate = now()->subDays(7);
                    $endDate = now();
                    break;
                case '30':
                    $startDate = now()->subDays(30);
                    $endDate = now();
                    break;
                case '90':
                    $startDate = now()->subDays(90);
                    $endDate = now();
                    break;
                case '365':
                    $startDate = now()->subYear();
                    $endDate = now();
                    break;
                default:
                    $startDate = now()->subDays(30);
                    $endDate = now();
            }
        }

        return ['start' => $startDate, 'end' => $endDate];
    }

    private function getOverviewStats($startDate, $endDate)
    {
        $totalReports = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])->count();
        $completedReports = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')->count();
        $pendingReports = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'submitted')->count();
        
        $avgEfficiency = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->avg('efisiensi_cutting') ?: 0;

        $totalProduction = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->sum('actual_quantity_pcs') ?: 0;

        $totalYardage = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->sum('total_yard') ?: 0;

        // Calculate growth compared to previous period
        $previousPeriodDays = $endDate->diffInDays($startDate);
        $previousStartDate = $startDate->copy()->subDays($previousPeriodDays);
        $previousEndDate = $startDate->copy()->subDay();

        $previousTotalReports = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$previousStartDate, $previousEndDate])->count();
        $previousAvgEfficiency = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$previousStartDate, $previousEndDate])
            ->where('status_laporan', 'approved')
            ->avg('efisiensi_cutting') ?: 0;

        $reportsGrowth = $previousTotalReports > 0 ? (($totalReports - $previousTotalReports) / $previousTotalReports * 100) : 0;
        $efficiencyGrowth = $previousAvgEfficiency > 0 ? (($avgEfficiency - $previousAvgEfficiency) / $previousAvgEfficiency * 100) : 0;

        return [
            'total_reports' => $totalReports,
            'completed_reports' => $completedReports,
            'pending_reports' => $pendingReports,
            'avg_efficiency' => round($avgEfficiency, 2),
            'total_production' => $totalProduction,
            'total_yardage' => round($totalYardage, 2),
            'reports_growth' => round($reportsGrowth, 1),
            'efficiency_growth' => round($efficiencyGrowth, 1),
            'completion_rate' => $totalReports > 0 ? round(($completedReports / $totalReports) * 100, 1) : 0,
        ];
    }

    private function getProductionPerformance($startDate, $endDate)
    {
        // Daily production data
        $dailyProduction = TtDataLaporanCutting::select(
                DB::raw('DATE(tanggal_laporan) as date'),
                DB::raw('COUNT(*) as total_reports'),
                DB::raw('SUM(actual_quantity_pcs) as total_quantity'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('SUM(total_yard) as total_yard')
            )
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy(DB::raw('DATE(tanggal_laporan)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total_reports' => $item->total_reports,
                    'total_quantity' => $item->total_quantity ?: 0,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                    'total_yard' => round($item->total_yard ?: 0, 2),
                ];
            });

        return $dailyProduction;
    }

    private function getEfficiencyTrends($startDate, $endDate)
    {
        // Weekly efficiency trends
        $weeklyEfficiency = TtDataLaporanCutting::select(
                DB::raw('YEARWEEK(tanggal_laporan) as week'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('MIN(efisiensi_cutting) as min_efficiency'),
                DB::raw('MAX(efisiensi_cutting) as max_efficiency'),
                DB::raw('COUNT(*) as total_reports')
            )
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy(DB::raw('YEARWEEK(tanggal_laporan)'))
            ->orderBy('week')
            ->get()
            ->map(function ($item) {
                return [
                    'week' => $item->week,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                    'min_efficiency' => round($item->min_efficiency ?: 0, 2),
                    'max_efficiency' => round($item->max_efficiency ?: 0, 2),
                    'total_reports' => $item->total_reports,
                ];
            });

        return $weeklyEfficiency;
    }

    private function getMachinePerformance($startDate, $endDate)
    {
        $machineStats = TtDataLaporanCutting::select(
                'mesin_id',
                DB::raw('COUNT(*) as total_reports'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('SUM(actual_quantity_pcs) as total_quantity'),
                DB::raw('AVG(durasi_menit) as avg_duration')
            )
            ->with('mesin:id,nama_mesin,kode_mesin')
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('mesin_id')
            ->orderByDesc('total_reports')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'machine_name' => $item->mesin->nama_mesin ?? 'Unknown',
                    'machine_code' => $item->mesin->kode_mesin ?? 'N/A',
                    'total_reports' => $item->total_reports,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                    'total_quantity' => $item->total_quantity ?: 0,
                    'avg_duration' => round($item->avg_duration ?: 0, 1),
                ];
            });

        return $machineStats;
    }

    private function getOperatorPerformance($startDate, $endDate)
    {
        $operatorStats = TtDataLaporanCutting::select(
                'operator_id',
                DB::raw('COUNT(*) as total_reports'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('SUM(actual_quantity_pcs) as total_quantity')
            )
            ->with('operator:id,name')
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('operator_id')
            ->orderByDesc('avg_efficiency')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'operator_name' => $item->operator->name ?? 'Unknown',
                    'total_reports' => $item->total_reports,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                    'total_quantity' => $item->total_quantity ?: 0,
                ];
            });

        return $operatorStats;
    }

    private function getCustomerPerformance($startDate, $endDate)
    {
        $customerStats = TtDataLaporanCutting::select(
                'customer_id',
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(actual_quantity_pcs) as total_quantity'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency')
            )
            ->with('customer:id,nama_customer')
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('customer_id')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'customer_name' => $item->customer->nama_customer ?? 'Unknown',
                    'total_orders' => $item->total_orders,
                    'total_quantity' => $item->total_quantity ?: 0,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                ];
            });

        return $customerStats;
    }

    private function getQualityMetrics($startDate, $endDate)
    {
        $qualityStats = TtDataLaporanCutting::select(
                DB::raw('AVG(jumlah_defect) as avg_defects'),
                DB::raw('COUNT(CASE WHEN kualitas_hasil = "excellent" THEN 1 END) as excellent_count'),
                DB::raw('COUNT(CASE WHEN kualitas_hasil = "good" THEN 1 END) as good_count'),
                DB::raw('COUNT(CASE WHEN kualitas_hasil = "fair" THEN 1 END) as fair_count'),
                DB::raw('COUNT(CASE WHEN kualitas_hasil = "poor" THEN 1 END) as poor_count'),
                DB::raw('COUNT(*) as total_reports')
            )
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->first();

        $totalReports = $qualityStats->total_reports ?: 1;

        return [
            'avg_defects' => round($qualityStats->avg_defects ?: 0, 2),
            'quality_distribution' => [
                'excellent' => [
                    'count' => $qualityStats->excellent_count ?: 0,
                    'percentage' => round(($qualityStats->excellent_count ?: 0) / $totalReports * 100, 1)
                ],
                'good' => [
                    'count' => $qualityStats->good_count ?: 0,
                    'percentage' => round(($qualityStats->good_count ?: 0) / $totalReports * 100, 1)
                ],
                'fair' => [
                    'count' => $qualityStats->fair_count ?: 0,
                    'percentage' => round(($qualityStats->fair_count ?: 0) / $totalReports * 100, 1)
                ],
                'poor' => [
                    'count' => $qualityStats->poor_count ?: 0,
                    'percentage' => round(($qualityStats->poor_count ?: 0) / $totalReports * 100, 1)
                ]
            ]
        ];
    }

    private function getRecentActivities()
    {
        // Recent validations
        $recentValidations = TtDataValidasiLaporan::with([
                'laporan:id,nomor_laporan,nomor_order',
                'validator:id,name'
            ])
            ->whereNotNull('tanggal_validasi')
            ->orderBy('tanggal_validasi', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($validation) {
                return [
                    'type' => 'validation',
                    'message' => "{$validation->validator->name} " . 
                        ($validation->status_validasi === 'approved' ? 'menyetujui' : 
                        ($validation->status_validasi === 'rejected' ? 'menolak' : 'meminta revisi')) . 
                        " laporan {$validation->laporan->nomor_laporan}",
                    'timestamp' => $validation->tanggal_validasi,
                    'status' => $validation->status_validasi
                ];
            });

        // Recent reports
        $recentReports = TtDataLaporanCutting::with(['operator:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($report) {
                return [
                    'type' => 'report',
                    'message' => "{$report->operator->name} membuat laporan {$report->nomor_laporan}",
                    'timestamp' => $report->created_at,
                    'status' => $report->status_laporan
                ];
            });

        return $recentValidations->concat($recentReports)
            ->sortByDesc('timestamp')
            ->take(15)
            ->values();
    }

    public function team(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        $startDate = $dateRange['start'];
        $endDate = $dateRange['end'];

        // Team Overview Stats
        $teamStats = $this->getTeamOverviewStats($startDate, $endDate);
        
        // Individual Operator Performance
        $operatorDetails = $this->getDetailedOperatorPerformance($startDate, $endDate);
        
        // Shift Performance Comparison
        $shiftComparison = $this->getShiftPerformanceComparison($startDate, $endDate);
        
        // Team Efficiency Trends
        $teamEfficiencyTrends = $this->getTeamEfficiencyTrends($startDate, $endDate);
        
        // Operator Ranking and Achievements
        $operatorRanking = $this->getOperatorRanking($startDate, $endDate);
        
        // Team Collaboration Metrics
        $collaborationMetrics = $this->getCollaborationMetrics($startDate, $endDate);
        
        // Performance Distribution
        $performanceDistribution = $this->getPerformanceDistribution($startDate, $endDate);

        return Inertia::render('admin/monitoring/team', [
            'teamStats' => $teamStats,
            'operatorDetails' => $operatorDetails,
            'shiftComparison' => $shiftComparison,
            'teamEfficiencyTrends' => $teamEfficiencyTrends,
            'operatorRanking' => $operatorRanking,
            'collaborationMetrics' => $collaborationMetrics,
            'performanceDistribution' => $performanceDistribution,
            'dateRange' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'filters' => $request->only(['date_from', 'date_to', 'period', 'shift_id', 'operator_id'])
        ]);
    }

    private function getTeamOverviewStats($startDate, $endDate)
    {
        $totalOperators = User::whereHas('laporanCutting', function($q) use ($startDate, $endDate) {
            $q->whereBetween('tanggal_laporan', [$startDate, $endDate]);
        })->count();

        $activeOperators = User::whereHas('laporanCutting', function($q) use ($startDate, $endDate) {
            $q->whereBetween('tanggal_laporan', [$startDate, $endDate])
              ->where('status_laporan', 'approved');
        })->count();

        $topPerformer = TtDataLaporanCutting::select('operator_id', DB::raw('AVG(efisiensi_cutting) as avg_efficiency'))
            ->with('operator:id,name')
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('operator_id')
            ->orderByDesc('avg_efficiency')
            ->first();

        $avgTeamEfficiency = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->avg('efisiensi_cutting') ?: 0;

        $totalTeamProduction = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->sum('actual_quantity_pcs') ?: 0;

        // Calculate team consistency (standard deviation of efficiency)
        $efficiencies = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->pluck('efisiensi_cutting')
            ->toArray();

        $teamConsistency = 0;
        if (count($efficiencies) > 1) {
            $mean = array_sum($efficiencies) / count($efficiencies);
            $variance = array_sum(array_map(function($x) use ($mean) { return pow($x - $mean, 2); }, $efficiencies)) / count($efficiencies);
            $teamConsistency = 100 - min(sqrt($variance), 100); // Higher is more consistent
        }

        return [
            'total_operators' => $totalOperators,
            'active_operators' => $activeOperators,
            'top_performer' => [
                'name' => $topPerformer->operator->name ?? 'N/A',
                'efficiency' => round($topPerformer->avg_efficiency ?? 0, 2)
            ],
            'avg_team_efficiency' => round($avgTeamEfficiency, 2),
            'total_team_production' => $totalTeamProduction,
            'team_consistency' => round($teamConsistency, 1),
            'participation_rate' => $totalOperators > 0 ? round(($activeOperators / $totalOperators) * 100, 1) : 0
        ];
    }

    private function getDetailedOperatorPerformance($startDate, $endDate)
    {
        return TtDataLaporanCutting::select(
                'operator_id',
                DB::raw('COUNT(*) as total_reports'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('MAX(efisiensi_cutting) as best_efficiency'),
                DB::raw('MIN(efisiensi_cutting) as worst_efficiency'),
                DB::raw('SUM(actual_quantity_pcs) as total_production'),
                DB::raw('AVG(durasi_menit) as avg_duration'),
                DB::raw('AVG(jumlah_defect) as avg_defects'),
                DB::raw('COUNT(CASE WHEN kualitas_hasil = "excellent" THEN 1 END) as excellent_count'),
                DB::raw('STDDEV(efisiensi_cutting) as efficiency_consistency')
            )
            ->with('operator:id,name,email')
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('operator_id')
            ->orderByDesc('avg_efficiency')
            ->get()
            ->map(function ($item) {
                $consistencyScore = $item->efficiency_consistency > 0 ? 
                    max(0, 100 - ($item->efficiency_consistency * 2)) : 100;
                
                return [
                    'operator_id' => $item->operator_id,
                    'operator_name' => $item->operator->name ?? 'Unknown',
                    'operator_email' => $item->operator->email ?? '',
                    'total_reports' => $item->total_reports,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                    'best_efficiency' => round($item->best_efficiency ?: 0, 2),
                    'worst_efficiency' => round($item->worst_efficiency ?: 0, 2),
                    'total_production' => $item->total_production ?: 0,
                    'avg_duration' => round($item->avg_duration ?: 0, 1),
                    'avg_defects' => round($item->avg_defects ?: 0, 2),
                    'excellent_rate' => $item->total_reports > 0 ? round(($item->excellent_count / $item->total_reports) * 100, 1) : 0,
                    'consistency_score' => round($consistencyScore, 1),
                    'productivity_score' => $this->calculateProductivityScore($item)
                ];
            });
    }

    private function calculateProductivityScore($data)
    {
        $efficiencyScore = min(($data->avg_efficiency / 100) * 40, 40);
        $productionScore = min(($data->total_production / 1000) * 30, 30);
        $qualityScore = min(($data->excellent_count / max($data->total_reports, 1)) * 20, 20);
        $consistencyScore = min((100 - ($data->efficiency_consistency ?: 0)) / 100 * 10, 10);
        
        return round($efficiencyScore + $productionScore + $qualityScore + $consistencyScore, 1);
    }

    private function getShiftPerformanceComparison($startDate, $endDate)
    {
        return TtDataLaporanCutting::select(
                'shift_id',
                DB::raw('COUNT(*) as total_reports'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('SUM(actual_quantity_pcs) as total_production'),
                DB::raw('AVG(durasi_menit) as avg_duration'),
                DB::raw('COUNT(DISTINCT operator_id) as unique_operators')
            )
            ->with('shift:id,nama_shift')
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('shift_id')
            ->orderByDesc('avg_efficiency')
            ->get()
            ->map(function ($item) {
                return [
                    'shift_name' => $item->shift->nama_shift ?? 'Unknown',
                    'total_reports' => $item->total_reports,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                    'total_production' => $item->total_production ?: 0,
                    'avg_duration' => round($item->avg_duration ?: 0, 1),
                    'unique_operators' => $item->unique_operators,
                    'productivity_per_operator' => $item->unique_operators > 0 ? 
                        round($item->total_production / $item->unique_operators, 1) : 0
                ];
            });
    }

    private function getTeamEfficiencyTrends($startDate, $endDate)
    {
        return TtDataLaporanCutting::select(
                DB::raw('DATE(tanggal_laporan) as date'),
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('COUNT(DISTINCT operator_id) as active_operators'),
                DB::raw('COUNT(*) as total_reports')
            )
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy(DB::raw('DATE(tanggal_laporan)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                    'active_operators' => $item->active_operators,
                    'total_reports' => $item->total_reports,
                    'efficiency_per_operator' => $item->active_operators > 0 ? 
                        round($item->avg_efficiency / $item->active_operators, 2) : 0
                ];
            });
    }

    private function getOperatorRanking($startDate, $endDate)
    {
        $operators = TtDataLaporanCutting::select(
                'operator_id',
                DB::raw('AVG(efisiensi_cutting) as avg_efficiency'),
                DB::raw('COUNT(*) as total_reports'),
                DB::raw('SUM(actual_quantity_pcs) as total_production')
            )
            ->with('operator:id,name')
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('operator_id')
            ->having('total_reports', '>=', 3) // Minimum 3 reports for ranking
            ->orderByDesc('avg_efficiency')
            ->get();

        return $operators->map(function ($item, $index) {
            $badge = '';
            $badgeColor = '';
            
            if ($index === 0) {
                $badge = '🏆 Champion';
                $badgeColor = 'bg-yellow-100 text-yellow-800';
            } elseif ($index === 1) {
                $badge = '🥈 Runner-up';
                $badgeColor = 'bg-gray-100 text-gray-800';
            } elseif ($index === 2) {
                $badge = '🥉 Third Place';
                $badgeColor = 'bg-orange-100 text-orange-800';
            } elseif ($item->avg_efficiency >= 90) {
                $badge = '⭐ Excellence';
                $badgeColor = 'bg-green-100 text-green-800';
            } elseif ($item->avg_efficiency >= 80) {
                $badge = '👍 Good';
                $badgeColor = 'bg-blue-100 text-blue-800';
            }

            return [
                'rank' => $index + 1,
                'operator_name' => $item->operator->name ?? 'Unknown',
                'avg_efficiency' => round($item->avg_efficiency ?: 0, 2),
                'total_reports' => $item->total_reports,
                'total_production' => $item->total_production ?: 0,
                'badge' => $badge,
                'badge_color' => $badgeColor
            ];
        });
    }

    private function getCollaborationMetrics($startDate, $endDate)
    {
        // Cross-shift collaboration (operators working in multiple shifts)
        $crossShiftOperators = DB::table('tt_data_laporan_cutting')
            ->select('operator_id', DB::raw('COUNT(DISTINCT shift_id) as shift_count'))
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('operator_id')
            ->having('shift_count', '>', 1)
            ->count();

        // Machine versatility (operators working on multiple machines)
        $versatileOperators = DB::table('tt_data_laporan_cutting')
            ->select('operator_id', DB::raw('COUNT(DISTINCT mesin_id) as machine_count'))
            ->whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->groupBy('operator_id')
            ->having('machine_count', '>', 2)
            ->count();

        $totalOperators = User::whereHas('laporanCutting', function($q) use ($startDate, $endDate) {
            $q->whereBetween('tanggal_laporan', [$startDate, $endDate]);
        })->count();

        return [
            'cross_shift_operators' => $crossShiftOperators,
            'versatile_operators' => $versatileOperators,
            'collaboration_rate' => $totalOperators > 0 ? round(($crossShiftOperators / $totalOperators) * 100, 1) : 0,
            'versatility_rate' => $totalOperators > 0 ? round(($versatileOperators / $totalOperators) * 100, 1) : 0
        ];
    }

    private function getPerformanceDistribution($startDate, $endDate)
    {
        $efficiencies = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->where('status_laporan', 'approved')
            ->pluck('efisiensi_cutting')
            ->toArray();

        $distribution = [
            'excellent' => ['min' => 90, 'max' => 100, 'count' => 0, 'color' => '#10b981'],
            'good' => ['min' => 80, 'max' => 89.99, 'count' => 0, 'color' => '#3b82f6'],
            'average' => ['min' => 70, 'max' => 79.99, 'count' => 0, 'color' => '#f59e0b'],
            'below_average' => ['min' => 0, 'max' => 69.99, 'count' => 0, 'color' => '#ef4444']
        ];

        foreach ($efficiencies as $efficiency) {
            if ($efficiency >= 90) {
                $distribution['excellent']['count']++;
            } elseif ($efficiency >= 80) {
                $distribution['good']['count']++;
            } elseif ($efficiency >= 70) {
                $distribution['average']['count']++;
            } else {
                $distribution['below_average']['count']++;
            }
        }

        $total = count($efficiencies);
        
        return array_map(function($item) use ($total) {
            $item['percentage'] = $total > 0 ? round(($item['count'] / $total) * 100, 1) : 0;
            return $item;
        }, $distribution);
    }

    public function production(Request $request)
    {
        $period = $request->get('period', '30');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        // Calculate date range
        if ($period === 'custom' && $dateFrom && $dateTo) {
            $startDate = Carbon::parse($dateFrom);
            $endDate = Carbon::parse($dateTo);
        } else {
            $days = (int) $period;
            $startDate = Carbon::now()->subDays($days);
            $endDate = Carbon::now();
        }

        return Inertia::render('admin/monitoring/production', [
            'productionOverview' => $this->getProductionOverviewStats($startDate, $endDate),
            'productionTrends' => $this->getProductionTrendData($startDate, $endDate),
            'machinePerformance' => $this->getMachinePerformanceData($startDate, $endDate),
            'shiftProductivity' => $this->getShiftProductivityData($startDate, $endDate),
            'qualityAnalysis' => $this->getQualityAnalysisData($startDate, $endDate),
            'productionForecast' => $this->getProductionForecast($startDate, $endDate),
            'capacityUtilization' => $this->getCapacityUtilization($startDate, $endDate),
            'productionBottlenecks' => $this->getProductionBottlenecks($startDate, $endDate),
            'dateRange' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d')
            ],
            'filters' => $request->only(['period', 'date_from', 'date_to'])
        ]);
    }

    private function getProductionOverviewStats($startDate, $endDate)
    {
        $totalProduction = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->sum('actual_quantity_pcs');

        $totalTargetProduction = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->sum('target_quantity_pcs');

        $avgEfficiency = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->avg('efisiensi_cutting');

        $totalReports = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->count();

        $activeLines = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->distinct('line_produksi_id')
            ->count('line_produksi_id');

        $activeMachines = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->distinct('mesin_id')
            ->count('mesin_id');

        $achievementRate = $totalTargetProduction > 0 ? ($totalProduction / $totalTargetProduction) * 100 : 0;

        // Growth calculation (vs previous period)
        $previousStartDate = $startDate->copy()->subDays($endDate->diffInDays($startDate));
        $previousEndDate = $startDate->copy()->subDay();

        $previousProduction = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$previousStartDate, $previousEndDate])
            ->sum('actual_quantity_pcs');

        $productionGrowth = $previousProduction > 0 ? 
            (($totalProduction - $previousProduction) / $previousProduction) * 100 : 0;

        return [
            'total_production' => (int) $totalProduction,
            'total_target' => (int) $totalTargetProduction,
            'achievement_rate' => round($achievementRate, 1),
            'avg_efficiency' => round($avgEfficiency ?: 0, 1),
            'total_reports' => $totalReports,
            'active_lines' => $activeLines,
            'active_machines' => $activeMachines,
            'production_growth' => round($productionGrowth, 1),
            'daily_average' => $endDate->diffInDays($startDate) > 0 ? 
                round($totalProduction / $endDate->diffInDays($startDate), 0) : $totalProduction
        ];
    }

    private function getProductionTrendData($startDate, $endDate)
    {
        return TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->selectRaw('
                DATE(tanggal_laporan) as date,
                SUM(actual_quantity_pcs) as production,
                SUM(target_quantity_pcs) as target,
                AVG(efisiensi_cutting) as efficiency,
                COUNT(*) as reports_count,
                AVG(tt_data_laporan_cutting.durasi_menit) as avg_operational_time,
                SUM(CASE WHEN efisiensi_cutting >= 90 THEN actual_quantity_pcs ELSE 0 END) as high_efficiency_production
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'production' => (int) $item->production,
                    'target' => (int) $item->target,
                    'efficiency' => round($item->efficiency ?: 0, 1),
                    'reports_count' => (int) $item->reports_count,
                    'avg_operational_time' => round($item->avg_operational_time ?: 0, 1),
                    'achievement_rate' => $item->target > 0 ? round(($item->production / $item->target) * 100, 1) : 0,
                    'high_efficiency_production' => (int) $item->high_efficiency_production
                ];
            });
    }

    private function getMachinePerformanceData($startDate, $endDate)
    {
        return TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->join('tm_data_mesin_cutting', 'tt_data_laporan_cutting.mesin_id', '=', 'tm_data_mesin_cutting.id')
            ->selectRaw('
                tm_data_mesin_cutting.nama_mesin,
                tm_data_mesin_cutting.id as mesin_id,
                SUM(actual_quantity_pcs) as total_production,
                SUM(target_quantity_pcs) as total_target,
                AVG(efisiensi_cutting) as avg_efficiency,
                COUNT(*) as total_reports,
                AVG(tt_data_laporan_cutting.durasi_menit) as avg_operational_time,
                SUM(jumlah_defect) as total_defects,
                MIN(efisiensi_cutting) as min_efficiency,
                MAX(efisiensi_cutting) as max_efficiency
            ')
            ->groupBy('tm_data_mesin_cutting.id', 'tm_data_mesin_cutting.nama_mesin')
            ->orderByDesc('total_production')
            ->get()
            ->map(function ($item) {
                $achievementRate = $item->total_target > 0 ? ($item->total_production / $item->total_target) * 100 : 0;
                $defectRate = $item->total_production > 0 ? ($item->total_defects / $item->total_production) * 100 : 0;
                
                return [
                    'machine_id' => $item->mesin_id,
                    'machine_name' => $item->nama_mesin,
                    'total_production' => (int) $item->total_production,
                    'total_target' => (int) $item->total_target,
                    'achievement_rate' => round($achievementRate, 1),
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 1),
                    'total_reports' => (int) $item->total_reports,
                    'avg_operational_time' => round($item->avg_operational_time ?: 0, 1),
                    'defect_rate' => round($defectRate, 2),
                    'efficiency_range' => [
                        'min' => round($item->min_efficiency ?: 0, 1),
                        'max' => round($item->max_efficiency ?: 0, 1)
                    ],
                    'utilization_score' => round(($item->avg_efficiency ?: 0) * 0.6 + $achievementRate * 0.4, 1)
                ];
            });
    }

    private function getShiftProductivityData($startDate, $endDate)
    {
        return TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->join('tm_data_shift', 'tt_data_laporan_cutting.shift_id', '=', 'tm_data_shift.id')
            ->selectRaw('
                tm_data_shift.nama_shift,
                tm_data_shift.id as shift_id,
                SUM(actual_quantity_pcs) as total_production,
                SUM(target_quantity_pcs) as total_target,
                AVG(efisiensi_cutting) as avg_efficiency,
                COUNT(*) as total_reports,
                COUNT(DISTINCT tt_data_laporan_cutting.operator_id) as unique_operators,
                AVG(tt_data_laporan_cutting.durasi_menit) as avg_operational_time,
                COUNT(DISTINCT tt_data_laporan_cutting.mesin_id) as unique_machines
            ')
            ->groupBy('tm_data_shift.id', 'tm_data_shift.nama_shift')
            ->orderByDesc('total_production')
            ->get()
            ->map(function ($item) {
                $achievementRate = $item->total_target > 0 ? ($item->total_production / $item->total_target) * 100 : 0;
                $productivityPerOperator = $item->unique_operators > 0 ? $item->total_production / $item->unique_operators : 0;
                $reportsPerOperator = $item->unique_operators > 0 ? $item->total_reports / $item->unique_operators : 0;
                
                return [
                    'shift_id' => $item->shift_id,
                    'shift_name' => $item->nama_shift,
                    'total_production' => (int) $item->total_production,
                    'total_target' => (int) $item->total_target,
                    'achievement_rate' => round($achievementRate, 1),
                    'avg_efficiency' => round($item->avg_efficiency ?: 0, 1),
                    'total_reports' => (int) $item->total_reports,
                    'unique_operators' => (int) $item->unique_operators,
                    'unique_machines' => (int) $item->unique_machines,
                    'productivity_per_operator' => round($productivityPerOperator, 0),
                    'reports_per_operator' => round($reportsPerOperator, 1),
                    'avg_operational_time' => round($item->avg_operational_time ?: 0, 1)
                ];
            });
    }

    private function getQualityAnalysisData($startDate, $endDate)
    {
        $qualityStats = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->selectRaw('
                AVG(jumlah_defect) as avg_defects,
                SUM(jumlah_defect) as total_defects,
                SUM(actual_quantity_pcs) as total_production,
                COUNT(*) as total_reports,
                SUM(CASE WHEN efisiensi_cutting >= 95 THEN 1 ELSE 0 END) as excellent_count,
                SUM(CASE WHEN efisiensi_cutting >= 85 AND efisiensi_cutting < 95 THEN 1 ELSE 0 END) as good_count,
                SUM(CASE WHEN efisiensi_cutting >= 75 AND efisiensi_cutting < 85 THEN 1 ELSE 0 END) as fair_count,
                SUM(CASE WHEN efisiensi_cutting < 75 THEN 1 ELSE 0 END) as poor_count
            ')
            ->first();

        $defectRate = $qualityStats->total_production > 0 ? 
            ($qualityStats->total_defects / $qualityStats->total_production) * 100 : 0;

        $qualityScore = $qualityStats->total_reports > 0 ? 
            (($qualityStats->excellent_count * 4 + $qualityStats->good_count * 3 + 
              $qualityStats->fair_count * 2 + $qualityStats->poor_count * 1) / 
             ($qualityStats->total_reports * 4)) * 100 : 0;

        // Quality trends by day
        $qualityTrends = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->selectRaw('
                DATE(tanggal_laporan) as date,
                AVG(jumlah_defect) as avg_defects,
                SUM(jumlah_defect) as total_defects,
                SUM(actual_quantity_pcs) as total_production,
                COUNT(*) as reports
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                $dailyDefectRate = $item->total_production > 0 ? 
                    ($item->total_defects / $item->total_production) * 100 : 0;
                
                return [
                    'date' => $item->date,
                    'avg_defects' => round($item->avg_defects ?: 0, 2),
                    'defect_rate' => round($dailyDefectRate, 2),
                    'total_production' => (int) $item->total_production,
                    'reports' => (int) $item->reports
                ];
            });

        return [
            'overall_defect_rate' => round($defectRate, 2),
            'avg_defects_per_report' => round($qualityStats->avg_defects ?: 0, 2),
            'quality_score' => round($qualityScore, 1),
            'total_defects' => (int) $qualityStats->total_defects,
            'quality_distribution' => [
                'excellent' => [
                    'count' => (int) $qualityStats->excellent_count,
                    'percentage' => $qualityStats->total_reports > 0 ? 
                        round(($qualityStats->excellent_count / $qualityStats->total_reports) * 100, 1) : 0
                ],
                'good' => [
                    'count' => (int) $qualityStats->good_count,
                    'percentage' => $qualityStats->total_reports > 0 ? 
                        round(($qualityStats->good_count / $qualityStats->total_reports) * 100, 1) : 0
                ],
                'fair' => [
                    'count' => (int) $qualityStats->fair_count,
                    'percentage' => $qualityStats->total_reports > 0 ? 
                        round(($qualityStats->fair_count / $qualityStats->total_reports) * 100, 1) : 0
                ],
                'poor' => [
                    'count' => (int) $qualityStats->poor_count,
                    'percentage' => $qualityStats->total_reports > 0 ? 
                        round(($qualityStats->poor_count / $qualityStats->total_reports) * 100, 1) : 0
                ]
            ],
            'quality_trends' => $qualityTrends
        ];
    }

    private function getProductionForecast($startDate, $endDate)
    {
        // Simple linear regression forecast based on recent trends
        $trendData = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->selectRaw('
                DATE(tanggal_laporan) as date,
                SUM(actual_quantity_pcs) as production
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        if ($trendData->count() < 3) {
            return [
                'next_7_days' => 0,
                'next_30_days' => 0,
                'trend_direction' => 'stable',
                'confidence' => 'low'
            ];
        }

        // Calculate trend
        $productions = $trendData->pluck('production')->map(function($p) { return (float) $p; })->toArray();
        $n = count($productions);
        $x = range(1, $n);
        
        $sumX = array_sum($x);
        $sumY = array_sum($productions);
        $sumXY = 0;
        $sumX2 = 0;
        
        for ($i = 0; $i < $n; $i++) {
            $sumXY += $x[$i] * $productions[$i];
            $sumX2 += $x[$i] * $x[$i];
        }
        
        $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
        $intercept = ($sumY - $slope * $sumX) / $n;
        
        $avgDaily = array_sum($productions) / $n;
        $next7Days = max(0, ($slope * ($n + 3.5) + $intercept) * 7);
        $next30Days = max(0, ($slope * ($n + 15) + $intercept) * 30);
        
        $trendDirection = $slope > 5 ? 'increasing' : ($slope < -5 ? 'decreasing' : 'stable');
        
        return [
            'next_7_days' => round($next7Days, 0),
            'next_30_days' => round($next30Days, 0),
            'daily_average_forecast' => round($avgDaily, 0),
            'trend_direction' => $trendDirection,
            'trend_slope' => round($slope, 2),
            'confidence' => $n >= 7 ? 'high' : ($n >= 5 ? 'medium' : 'low')
        ];
    }

    private function getCapacityUtilization($startDate, $endDate)
    {
        // Assuming 8 hours per shift, 3 shifts per day
        $totalDays = $endDate->diffInDays($startDate) + 1;
        $totalMachines = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->distinct('mesin_id')
            ->count();

        $totalPossibleHours = $totalDays * 24 * $totalMachines; // 24 hours max capacity
        
        $actualOperationalHours = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->sum('tt_data_laporan_cutting.durasi_menit') / 60; // Convert minutes to hours

        $utilizationRate = $totalPossibleHours > 0 ? ($actualOperationalHours / $totalPossibleHours) * 100 : 0;

        // Machine utilization breakdown
        $machineUtilization = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->join('tm_data_mesin_cutting', 'tt_data_laporan_cutting.mesin_id', '=', 'tm_data_mesin_cutting.id')
            ->selectRaw('
                tm_data_mesin_cutting.nama_mesin,
                SUM(tt_data_laporan_cutting.durasi_menit) / 60 as total_hours,
                COUNT(DISTINCT DATE(tanggal_laporan)) as active_days
            ')
            ->groupBy('tm_data_mesin_cutting.id', 'tm_data_mesin_cutting.nama_mesin')
            ->get()
            ->map(function ($item) use ($totalDays) {
                $maxPossibleHours = $totalDays * 24;
                $utilization = $maxPossibleHours > 0 ? ($item->total_hours / $maxPossibleHours) * 100 : 0;
                
                return [
                    'machine_name' => $item->nama_mesin,
                    'total_hours' => round($item->total_hours, 1),
                    'active_days' => (int) $item->active_days,
                    'utilization_rate' => round($utilization, 1),
                    'avg_daily_hours' => $item->active_days > 0 ? round($item->total_hours / $item->active_days, 1) : 0
                ];
            });

        return [
            'overall_utilization' => round($utilizationRate, 1),
            'total_operational_hours' => round($actualOperationalHours, 1),
            'total_possible_hours' => $totalPossibleHours,
            'active_machines' => $totalMachines,
            'avg_daily_utilization' => round($utilizationRate / $totalDays, 1),
            'machine_breakdown' => $machineUtilization
        ];
    }

    private function getProductionBottlenecks($startDate, $endDate)
    {
        // Identify potential bottlenecks
        $lowEfficiencyMachines = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->join('tm_data_mesin_cutting', 'tt_data_laporan_cutting.mesin_id', '=', 'tm_data_mesin_cutting.id')
            ->selectRaw('
                tm_data_mesin_cutting.nama_mesin,
                AVG(efisiensi_cutting) as avg_efficiency,
                COUNT(*) as reports_count,
                SUM(jumlah_defect) as total_defects
            ')
            ->groupBy('tm_data_mesin_cutting.id', 'tm_data_mesin_cutting.nama_mesin')
            ->havingRaw('AVG(efisiensi_cutting) < 80')
            ->orderBy('avg_efficiency')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'machine_name' => $item->nama_mesin,
                    'avg_efficiency' => round($item->avg_efficiency, 1),
                    'reports_count' => (int) $item->reports_count,
                    'total_defects' => (int) $item->total_defects,
                    'issue_type' => 'low_efficiency'
                ];
            });

        $highDefectMachines = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->join('tm_data_mesin_cutting', 'tt_data_laporan_cutting.mesin_id', '=', 'tm_data_mesin_cutting.id')
            ->selectRaw('
                tm_data_mesin_cutting.nama_mesin,
                SUM(jumlah_defect) as total_defects,
                SUM(actual_quantity_pcs) as total_production,
                AVG(efisiensi_cutting) as avg_efficiency
            ')
            ->groupBy('tm_data_mesin_cutting.id', 'tm_data_mesin_cutting.nama_mesin')
            ->havingRaw('SUM(jumlah_defect) / SUM(actual_quantity_pcs) > 0.05') // > 5% defect rate
            ->orderByDesc('total_defects')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $defectRate = $item->total_production > 0 ? ($item->total_defects / $item->total_production) * 100 : 0;
                
                return [
                    'machine_name' => $item->nama_mesin,
                    'defect_rate' => round($defectRate, 2),
                    'total_defects' => (int) $item->total_defects,
                    'avg_efficiency' => round($item->avg_efficiency, 1),
                    'issue_type' => 'high_defects'
                ];
            });

        // Shifts with low productivity
        $underperformingShifts = TtDataLaporanCutting::whereBetween('tanggal_laporan', [$startDate, $endDate])
            ->join('tm_data_shift', 'tt_data_laporan_cutting.shift_id', '=', 'tm_data_shift.id')
            ->selectRaw('
                tm_data_shift.nama_shift,
                AVG(efisiensi_cutting) as avg_efficiency,
                SUM(actual_quantity_pcs) as total_production,
                COUNT(*) as reports_count
            ')
            ->groupBy('tm_data_shift.id', 'tm_data_shift.nama_shift')
            ->orderBy('avg_efficiency')
            ->get()
            ->map(function ($item) {
                return [
                    'shift_name' => $item->nama_shift,
                    'avg_efficiency' => round($item->avg_efficiency, 1),
                    'total_production' => (int) $item->total_production,
                    'reports_count' => (int) $item->reports_count,
                    'issue_type' => 'shift_underperformance'
                ];
            });

        return [
            'low_efficiency_machines' => $lowEfficiencyMachines,
            'high_defect_machines' => $highDefectMachines,
            'underperforming_shifts' => $underperformingShifts,
            'total_issues' => $lowEfficiencyMachines->count() + $highDefectMachines->count() + 
                            $underperformingShifts->where('avg_efficiency', '<', 80)->count()
        ];
    }
}
