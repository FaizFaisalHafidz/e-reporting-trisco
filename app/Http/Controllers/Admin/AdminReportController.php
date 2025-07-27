<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TtDataLaporanCutting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminReportController extends Controller
{
    public function index(Request $request)
    {
        $query = TtDataLaporanCutting::with([
            'operator:id,name,email',
            'shift:id,nama_shift',
            'mesin:id,nama_mesin,kode_mesin',
            'lineProduksi:id,nama_line',
            'customer:id,nama_customer',
            'pattern:id,nama_pattern',
            'jenisKain:id,nama_kain'
        ]);

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_laporan', $request->status);
        }

        // Filter berdasarkan tanggal
        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_laporan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_laporan', '<=', $request->date_to);
        }

        // Filter berdasarkan operator
        if ($request->filled('operator')) {
            $query->where('operator_id', $request->operator);
        }

        // Filter berdasarkan shift
        if ($request->filled('shift')) {
            $query->where('shift_id', $request->shift);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_order', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%")
                  ->orWhereHas('operator', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('nama_customer', 'like', "%{$search}%");
                  });
            });
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(20);

        // Data untuk filter
        $operators = User::select('id', 'name')->get();
        $shifts = collect([
            (object)['id' => 1, 'nama_shift' => 'Shift 1'],
            (object)['id' => 2, 'nama_shift' => 'Shift 2'],
            (object)['id' => 3, 'nama_shift' => 'Shift 3'],
        ]);

        // Statistik
        $stats = [
            'total_reports' => TtDataLaporanCutting::count(),
            'submitted_reports' => TtDataLaporanCutting::where('status_laporan', 'submitted')->count(),
            'draft_reports' => TtDataLaporanCutting::where('status_laporan', 'draft')->count(),
            'today_reports' => TtDataLaporanCutting::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('admin/reports/index', [
            'reports' => $reports,
            'operators' => $operators,
            'shifts' => $shifts,
            'stats' => $stats,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'operator', 'shift', 'search'])
        ]);
    }

    public function show($id)
    {
        $report = TtDataLaporanCutting::with([
            'operator:id,name,email',
            'shift:id,nama_shift,jam_mulai,jam_selesai',
            'mesin:id,nama_mesin,kode_mesin',
            'lineProduksi:id,nama_line,kode_line',
            'customer:id,nama_customer,kode_customer',
            'pattern:id,nama_pattern,kode_pattern,difficulty_level',
            'jenisKain:id,nama_kain,kode_kain',
            'detailCuttings'
        ])->findOrFail($id);

        return Inertia::render('admin/reports/show', [
            'report' => $report
        ]);
    }

    public function destroy($id)
    {
        $report = TtDataLaporanCutting::findOrFail($id);
        
        // Hapus foto jika ada
        if ($report->foto_hasil) {
            $photos = json_decode($report->foto_hasil, true);
            if (is_array($photos)) {
                foreach ($photos as $photo) {
                    $path = storage_path('app/public/' . $photo);
                    if (file_exists($path)) {
                        unlink($path);
                    }
                }
            }
        }

        $report->delete();

        return redirect()->back()->with('success', 'Laporan berhasil dihapus');
    }

    public function export(Request $request)
    {
        $query = TtDataLaporanCutting::with([
            'operator:id,name',
            'shift:id,nama_shift',
            'mesin:id,nama_mesin',
            'customer:id,nama_customer',
            'pattern:id,nama_pattern',
            'jenisKain:id,nama_kain'
        ]);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status_laporan', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_laporan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_laporan', '<=', $request->date_to);
        }

        $reports = $query->orderBy('tanggal_laporan', 'desc')->get();

        $filename = 'laporan_cutting_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($reports) {
            $file = fopen('php://output', 'w');
            
            // Header CSV
            fputcsv($file, [
                'Nomor Order',
                'Batch Number', 
                'Tanggal Laporan',
                'Operator',
                'Shift',
                'Mesin',
                'Customer',
                'Pattern',
                'Jenis Kain',
                'Target (pcs)',
                'Actual (pcs)',
                'Efisiensi (%)',
                'Durasi (menit)',
                'Status',
                'Dibuat'
            ]);

            // Data
            foreach ($reports as $report) {
                fputcsv($file, [
                    $report->nomor_order,
                    $report->batch_number,
                    Carbon::parse($report->tanggal_laporan)->format('d/m/Y'),
                    $report->operator->name ?? '',
                    $report->shift->nama_shift ?? '',
                    $report->mesin->nama_mesin ?? '',
                    $report->customer->nama_customer ?? '',
                    $report->pattern->nama_pattern ?? '',
                    $report->jenisKain->nama_kain ?? '',
                    $report->target_quantity_pcs,
                    $report->actual_quantity_pcs,
                    $report->efisiensi_cutting,
                    $report->durasi_menit,
                    ucfirst($report->status_laporan),
                    Carbon::parse($report->created_at)->format('d/m/Y H:i')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
