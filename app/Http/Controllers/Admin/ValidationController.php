<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TtDataLaporanCutting;
use App\Models\TtDataValidasiLaporan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ValidationController extends Controller
{
    public function pending(Request $request)
    {
        $query = TtDataLaporanCutting::with([
            'operator:id,name,email',
            'shift:id,nama_shift',
            'mesin:id,nama_mesin,kode_mesin',
            'lineProduksi:id,nama_line',
            'customer:id,nama_customer',
            'pattern:id,nama_pattern',
            'jenisKain:id,nama_kain',
            'validasi.validator:id,name'
        ])->pendingValidation(); // Menggunakan scope yang sudah ada

        // Filter berdasarkan tanggal laporan
        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_laporan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_laporan', '<=', $request->date_to);
        }

        // Filter berdasarkan prioritas
        if ($request->filled('priority')) {
            $priorityDays = [
                'urgent' => 0,
                'high' => 1,
                'medium' => 3,
                'low' => 7
            ];
            
            if (isset($priorityDays[$request->priority])) {
                $cutoffDate = now()->subDays($priorityDays[$request->priority]);
                if ($request->priority === 'urgent') {
                    $query->whereDate('tanggal_laporan', '=', now()->toDateString());
                } else {
                    $query->whereDate('tanggal_laporan', '<=', $cutoffDate->toDateString());
                }
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_order', 'like', "%{$search}%")
                  ->orWhere('nomor_laporan', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%");
            });
        }

        $pendingReports = $query->orderBy('tanggal_laporan', 'desc')->paginate(20);

        // Statistik
        $stats = [
            'total_pending' => TtDataLaporanCutting::pendingValidation()->count(),
            'urgent_count' => TtDataLaporanCutting::pendingValidation()
                ->whereDate('tanggal_laporan', now()->toDateString())->count(),
            'high_priority' => TtDataLaporanCutting::pendingValidation()
                ->whereBetween('tanggal_laporan', [now()->subDay()->toDateString(), now()->subHours(12)->toDateString()])->count(),
            'overdue_count' => TtDataLaporanCutting::pendingValidation()
                ->where('tanggal_laporan', '<', now()->subDays(3)->toDateString())->count(),
        ];

        return Inertia::render('admin/validation/pending', [
            'pendingReports' => $pendingReports, 
            'stats' => $stats,
            'filters' => $request->only(['date_from', 'date_to', 'priority', 'search'])
        ]);
    }

    public function show(TtDataLaporanCutting $report)
    {
        $report->load([
            'operator:id,name,email',
            'shift:id,nama_shift',
            'mesin:id,nama_mesin,kode_mesin',
            'lineProduksi:id,nama_line',
            'customer:id,nama_customer',
            'pattern:id,nama_pattern',
            'jenisKain:id,nama_kain',
            'validasi.validator:id,name',
            'detailCuttings',
            'mesinDowntime',
            'materialWaste',
            'performanceMetrics'
        ]);

        return Inertia::render('admin/validation/show', [
            'report' => $report
        ]);
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'catatan_validasi' => 'nullable|string|max:1000',
        ]);

        $report = TtDataLaporanCutting::findOrFail($id);
        
        // Update status laporan
        $report->update(['status_laporan' => 'approved']);

        // Buat atau update validasi
        $validasi = TtDataValidasiLaporan::updateOrCreate(
            ['laporan_id' => $report->id],
            [
                'validator_id' => Auth::id(),
                'status_validasi' => 'approved',
                'catatan_validasi' => $request->catatan_validasi,
                'tanggal_validasi' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Laporan telah disetujui');
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'catatan_validasi' => 'required|string|max:1000',
        ]);

        $report = TtDataLaporanCutting::findOrFail($id);
        
        // Update status laporan
        $report->update(['status_laporan' => 'rejected']);

        // Buat atau update validasi
        $validasi = TtDataValidasiLaporan::updateOrCreate(
            ['laporan_id' => $report->id],
            [
                'validator_id' => Auth::id(),
                'status_validasi' => 'rejected',
                'catatan_validasi' => $request->catatan_validasi,
                'tanggal_validasi' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Laporan telah ditolak');
    }

    public function requestRevision(Request $request, $id)
    {
        $request->validate([
            'catatan_validasi' => 'required|string|max:1000',
            'revisi_diminta' => 'nullable|array',
            'revisi_diminta.*' => 'string'
        ]);

        $report = TtDataLaporanCutting::findOrFail($id);
        
        // Update status laporan kembali ke draft untuk revisi
        $report->update(['status_laporan' => 'draft']);

        // Buat atau update validasi
        $validasi = TtDataValidasiLaporan::updateOrCreate(
            ['laporan_id' => $report->id],
            [
                'validator_id' => Auth::id(),
                'status_validasi' => 'need_revision',
                'catatan_validasi' => $request->catatan_validasi,
                'revisi_diminta' => $request->revisi_diminta,
                'tanggal_validasi' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Permintaan revisi telah dikirim');
    }

    public function history(Request $request)
    {
        $query = TtDataValidasiLaporan::with([
            'laporan.operator:id,name',
            'laporan.customer:id,nama_customer',
            'laporan.pattern:id,nama_pattern',
            'validator:id,name'
        ])->whereNotNull('tanggal_validasi');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('laporan', function ($q) use ($search) {
                $q->where('nomor_laporan', 'like', "%{$search}%")
                  ->orWhere('nomor_order', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status_validasi', $request->status);
        }

        if ($request->filled('validator')) {
            $query->where('validator_id', $request->validator);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_validasi', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_validasi', '<=', $request->date_to);
        }

        $validationHistory = $query->orderBy('tanggal_validasi', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get validators for filter dropdown
        $validators = User::whereHas('validations')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Calculate stats
        $stats = [
            'total_validated' => TtDataValidasiLaporan::whereNotNull('tanggal_validasi')->count(),
            'approved_count' => TtDataValidasiLaporan::where('status_validasi', 'approved')->count(),
            'rejected_count' => TtDataValidasiLaporan::where('status_validasi', 'rejected')->count(),
            'revision_count' => TtDataValidasiLaporan::where('status_validasi', 'need_revision')->count(),
        ];

        return Inertia::render('admin/validation/history', [
            'validationHistory' => $validationHistory,
            'validators' => $validators,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'validator', 'date_from', 'date_to'])
        ]);
    }

    public function export(Request $request)
    {
        $query = TtDataValidasiLaporan::with([
            'laporan.operator:id,name',
            'laporan.customer:id,nama_customer',
            'laporan.pattern:id,nama_pattern',
            'validator:id,name'
        ])->whereNotNull('tanggal_validasi');

        // Apply same filters as history
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('laporan', function ($q) use ($search) {
                $q->where('nomor_laporan', 'like', "%{$search}%")
                  ->orWhere('nomor_order', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status_validasi', $request->status);
        }

        if ($request->filled('validator')) {
            $query->where('validator_id', $request->validator);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_validasi', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_validasi', '<=', $request->date_to);
        }

        $validations = $query->orderBy('tanggal_validasi', 'desc')->get();

        $filename = 'validation_history_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($validations) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fwrite($file, "\xEF\xBB\xBF");
            
            // CSV headers
            fputcsv($file, [
                'Tanggal Validasi',
                'No. Laporan',
                'No. Order',
                'Batch Number',
                'Operator',
                'Customer',
                'Pattern',
                'Efisiensi (%)',
                'Validator',
                'Status',
                'Catatan Validasi',
                'Revisi Diminta'
            ]);

            foreach ($validations as $validation) {
                $revisi = '';
                if ($validation->revisi_diminta && is_array($validation->revisi_diminta)) {
                    $revisi = implode('; ', $validation->revisi_diminta);
                }

                $statusLabels = [
                    'approved' => 'Disetujui',
                    'rejected' => 'Ditolak',
                    'need_revision' => 'Perlu Revisi',
                ];

                fputcsv($file, [
                    $validation->tanggal_validasi ? $validation->tanggal_validasi->format('d/m/Y H:i') : '',
                    $validation->laporan->nomor_laporan ?? '',
                    $validation->laporan->nomor_order ?? '',
                    $validation->laporan->batch_number ?? '',
                    $validation->laporan->operator->name ?? '',
                    $validation->laporan->customer->nama_customer ?? '',
                    $validation->laporan->pattern->nama_pattern ?? '',
                    $validation->laporan->efisiensi_cutting ?? 0,
                    $validation->validator->name ?? '',
                    $statusLabels[$validation->status_validasi] ?? $validation->status_validasi,
                    $validation->catatan_validasi ?? '',
                    $revisi
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}