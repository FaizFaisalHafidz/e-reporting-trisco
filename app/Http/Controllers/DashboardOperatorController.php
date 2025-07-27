<?php

namespace App\Http\Controllers;

use App\Models\TtDataLaporanCutting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardOperatorController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Only allow users with 'user' role
        if (!$user->hasRole('user')) {
            return redirect()->route('dashboard');
        }

        // Get real stats for this operator
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        
        // Laporan hari ini
        $laporanHariIni = TtDataLaporanCutting::where('operator_id', $user->id)
            ->whereDate('tanggal_laporan', $today)
            ->count();

        // Total layer bulan ini
        $totalLayer = TtDataLaporanCutting::where('operator_id', $user->id)
            ->whereDate('tanggal_laporan', '>=', $thisMonth)
            ->sum('jumlah_layer');

        // Total meter bulan ini
        $totalMeter = TtDataLaporanCutting::where('operator_id', $user->id)
            ->whereDate('tanggal_laporan', '>=', $thisMonth)
            ->sum('panjang_kain_meter');

        // Rata-rata waktu cutting (dalam menit) bulan ini
        $avgWaktu = TtDataLaporanCutting::where('operator_id', $user->id)
            ->whereDate('tanggal_laporan', '>=', $thisMonth)
            ->whereNotNull('durasi_menit')
            ->avg('durasi_menit');

        // Recent reports (5 terakhir)
        $recentReports = TtDataLaporanCutting::with([
            'shift:id,nama_shift',
            'customer:id,nama_customer',
            'pattern:id,nama_pattern'
        ])
        ->where('operator_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get();

        // Performance stats
        $performanceStats = [
            'avgEfficiency' => TtDataLaporanCutting::where('operator_id', $user->id)
                ->whereDate('tanggal_laporan', '>=', $thisMonth)
                ->whereNotNull('efisiensi_cutting')
                ->avg('efisiensi_cutting') ?? 0,
            
            'qualityDistribution' => [
                'OK' => 0,
                'NG' => 0,
                'Rework' => 0,
            ],
                
            'draft_count' => TtDataLaporanCutting::where('operator_id', $user->id)
                ->where('status_laporan', 'draft')
                ->count(),
                
            'submitted_count' => TtDataLaporanCutting::where('operator_id', $user->id)
                ->where('status_laporan', 'submitted')
                ->count(),
        ];

        // Get quality distribution and merge with defaults
        $qualityData = TtDataLaporanCutting::where('operator_id', $user->id)
            ->whereDate('tanggal_laporan', '>=', $thisMonth)
            ->whereNotNull('kualitas_hasil')
            ->select('kualitas_hasil', DB::raw('count(*) as total'))
            ->groupBy('kualitas_hasil')
            ->pluck('total', 'kualitas_hasil')
            ->toArray();

        // Merge with defaults
        $performanceStats['qualityDistribution'] = array_merge(
            $performanceStats['qualityDistribution'],
            $qualityData
        );

        return Inertia::render('dashboard-operator', [
            'user' => $user,
            'roles' => [], // $user->getRoleNames(),
            'permissions' => [], // $user->getAllPermissions()->pluck('name'),
            'stats' => [
                'laporanHariIni' => $laporanHariIni,
                'totalBulanIni' => TtDataLaporanCutting::where('operator_id', $user->id)
                    ->whereDate('tanggal_laporan', '>=', $thisMonth)
                    ->count(),
                'totalMeter' => round($totalMeter, 2),
                'rataRataWaktu' => $avgWaktu ? round($avgWaktu, 0) : 0, // dalam menit
            ],
            'recentReports' => $recentReports->map(function ($report) {
                return [
                    'tanggal' => $report->tanggal_laporan->format('d/m/Y'),
                    'operator' => $report->operator->name ?? 'Unknown',
                    'mesin' => $report->mesin->kode_mesin ?? 'Unknown', 
                    'kualitas_hasil' => $report->kualitas_hasil ?? 'Unknown',
                    'jumlah_layer' => $report->jumlah_layer ?? 0,
                    'total_meter' => $report->panjang_kain_meter ?? 0,
                ];
            }),
            'performanceStats' => $performanceStats,
        ]);
    }
}
