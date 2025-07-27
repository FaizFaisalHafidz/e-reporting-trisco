<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TtDataLaporanCutting;
use App\Models\TtDataDetailCutting;
use App\Models\TmDataShift;
use App\Models\TmDataMesinCutting;
use App\Models\TmDataJenisKain;
use App\Models\TmDataLineProduksi;
use App\Models\TmDataCustomer;
use App\Models\TmDataPattern;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InputReportController extends Controller
{
    use LogsActivity;

    public function index(Request $request)
    {
        $query = TtDataLaporanCutting::with([
            'shift', 'mesin', 'jenisKain', 'operator', 
            'lineProduksi', 'customer', 'pattern'
        ]);

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_laporan', $request->status);
        }

        // Filter berdasarkan operator
        if ($request->filled('operator_id')) {
            $query->where('operator_id', $request->operator_id);
        }

        // Filter berdasarkan tanggal
        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_laporan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_laporan', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_laporan', 'like', "%{$search}%")
                  ->orWhere('nomor_order', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%");
            });
        }

        $reports = $query->orderBy('tanggal_laporan', 'desc')
                        ->orderBy('created_at', 'desc')
                        ->paginate(20);

        // Get operators untuk filter
        $operators = User::whereHas('roles', function($q) {
            $q->where('name', 'user');
        })->select('id', 'name')->orderBy('name')->get();

        // Stats
        $stats = [
            'total_reports' => TtDataLaporanCutting::count(),
            'draft_reports' => TtDataLaporanCutting::where('status_laporan', 'draft')->count(),
            'submitted_reports' => TtDataLaporanCutting::where('status_laporan', 'submitted')->count(),
            'today_reports' => TtDataLaporanCutting::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('admin/input-reports/index', [
            'reports' => $reports,
            'operators' => $operators,
            'stats' => $stats,
            'filters' => $request->only(['status', 'operator_id', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function drafts(Request $request)
    {
        $query = TtDataLaporanCutting::with([
            'shift', 'mesin', 'jenisKain', 'operator', 
            'lineProduksi', 'customer', 'pattern'
        ])->where('status_laporan', 'draft');

        // Filter berdasarkan operator
        if ($request->filled('operator_id')) {
            $query->where('operator_id', $request->operator_id);
        }

        // Filter berdasarkan tanggal
        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_laporan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_laporan', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_laporan', 'like', "%{$search}%")
                  ->orWhere('nomor_order', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%");
            });
        }

        $drafts = $query->orderBy('updated_at', 'desc')->paginate(20);

        // Get operators untuk filter
        $operators = User::whereHas('roles', function($q) {
            $q->where('name', 'user');
        })->select('id', 'name')->orderBy('name')->get();

        // Stats untuk draft
        $stats = [
            'total_drafts' => TtDataLaporanCutting::where('status_laporan', 'draft')->count(),
            'my_drafts' => TtDataLaporanCutting::where('status_laporan', 'draft')
                                              ->where('operator_id', Auth::id())
                                              ->count(),
            'today_drafts' => TtDataLaporanCutting::where('status_laporan', 'draft')
                                                 ->whereDate('created_at', today())
                                                 ->count(),
            'old_drafts' => TtDataLaporanCutting::where('status_laporan', 'draft')
                                               ->where('created_at', '<', now()->subDays(7))
                                               ->count(),
        ];

        return Inertia::render('admin/input-reports/drafts', [
            'drafts' => $drafts,
            'operators' => $operators,
            'stats' => $stats,
            'filters' => $request->only(['operator_id', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create()
    {
        // Get master data untuk form
        $masterData = [
            'shifts' => TmDataShift::where('status', 'aktif')->select('id', 'nama_shift', 'jam_mulai', 'jam_selesai')->get(),
            'machines' => TmDataMesinCutting::where('status_mesin', 'aktif')->select('id', 'kode_mesin', 'nama_mesin')->get(),
            'fabrics' => TmDataJenisKain::where('status', 'aktif')->select('id', 'kode_kain', 'nama_kain', 'warna_tersedia')->get(),
            'lines' => TmDataLineProduksi::where('status', 'aktif')->select('id', 'kode_line', 'nama_line')->get(),
            'customers' => TmDataCustomer::where('status', 'aktif')->select('id', 'kode_customer', 'nama_customer')->get(),
            'patterns' => TmDataPattern::where('status', 'aktif')->select('id', 'kode_pattern', 'nama_pattern', 'difficulty_level')->get(),
            'operators' => User::whereHas('roles', function($q) {
                $q->where('name', 'user');
            })->select('id', 'name', 'email')->orderBy('name')->get(),
        ];

        return Inertia::render('admin/input-reports/create', [
            'masterData' => $masterData,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_order' => 'required|string|max:100',
            'batch_number' => 'required|string|max:100',
            'tanggal_laporan' => 'required|date',
            'shift_id' => 'required|exists:tm_data_shift,id',
            'mesin_id' => 'required|exists:tm_data_mesin_cutting,id',
            'line_produksi_id' => 'required|exists:tm_data_line_produksi,id',
            'customer_id' => 'required|exists:tm_data_customer,id',
            'pattern_id' => 'required|exists:tm_data_pattern,id',
            'jenis_kain_id' => 'required|exists:tm_data_jenis_kain,id',
            'operator_id' => 'required|exists:users,id',
            'target_quantity_pcs' => 'required|integer|min:1',
            'actual_quantity_pcs' => 'nullable|integer|min:0',
            'jumlah_layer' => 'required|integer|min:1',
            'panjang_kain_meter' => 'required|numeric|min:0',
            'lebar_kain_cm' => 'required|numeric|min:0',
            'waktu_mulai_cutting' => 'nullable|date',
            'waktu_selesai_cutting' => 'nullable|date|after:waktu_mulai_cutting',
            'kondisi_mesin' => 'nullable|in:baik,maintenance,rusak',
            'catatan_maintenance' => 'nullable|string',
            'kualitas_hasil' => 'nullable|in:excellent,good,fair,poor',
            'jumlah_defect' => 'nullable|integer|min:0',
            'jenis_defect' => 'nullable|array',
            'catatan_operator' => 'nullable|string',
            'suhu_ruangan' => 'nullable|numeric',
            'kelembaban' => 'nullable|numeric',
            'status_laporan' => 'required|in:draft,submitted',
            
            // Detail cutting
            'detail_cutting' => 'nullable|array',
            'detail_cutting.*.pattern_name' => 'required|string|max:100',
            'detail_cutting.*.ukuran_pattern' => 'required|string|max:50',
            'detail_cutting.*.jumlah_potongan' => 'required|integer|min:1',
            'detail_cutting.*.panjang_pattern_cm' => 'required|numeric|min:0',
            'detail_cutting.*.lebar_pattern_cm' => 'required|numeric|min:0',
            'detail_cutting.*.waste_percentage' => 'nullable|numeric|min:0|max:100',
            'detail_cutting.*.keterangan' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Hitung metrics otomatis
            $totalYard = ($validated['panjang_kain_meter'] * $validated['lebar_kain_cm']) / 91.44; // Convert to yard
            
            $durasi = null;
            if ($validated['waktu_mulai_cutting'] && $validated['waktu_selesai_cutting']) {
                $mulai = new \DateTime($validated['waktu_mulai_cutting']);
                $selesai = new \DateTime($validated['waktu_selesai_cutting']);
                $durasi = $selesai->diff($mulai)->i + ($selesai->diff($mulai)->h * 60);
            }

            // Create laporan
            $laporan = TtDataLaporanCutting::create([
                ...$validated,
                'total_yard' => $totalYard,
                'durasi_menit' => $durasi,
            ]);

            // Create detail cutting jika ada
            if (!empty($validated['detail_cutting'])) {
                foreach ($validated['detail_cutting'] as $detail) {
                    TtDataDetailCutting::create([
                        'laporan_id' => $laporan->id,
                        ...$detail
                    ]);
                }
            }

            // Log activity
            $this->logCreate(
                'input_reports',
                $laporan->toArray(),
                "Membuat laporan cutting baru: {$laporan->nomor_laporan}"
            );

            DB::commit();

            return redirect()->route('admin.input-reports.index')
                           ->with('success', 'Laporan berhasil dibuat');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal menyimpan laporan: ' . $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $report = TtDataLaporanCutting::with([
            'shift', 'mesin', 'jenisKain', 'operator', 
            'lineProduksi', 'customer', 'pattern', 'detailCutting'
        ])->findOrFail($id);

        // Log view activity
        $this->logView(
            'input_reports',
            ['report_id' => $id, 'nomor_laporan' => $report->nomor_laporan],
            "Melihat detail laporan: {$report->nomor_laporan}"
        );

        return Inertia::render('admin/input-reports/show', [
            'report' => $report,
        ]);
    }

    public function edit($id)
    {
        $report = TtDataLaporanCutting::with('detailCutting')->findOrFail($id);

        // Hanya bisa edit jika status draft atau submitted
        if (!in_array($report->status_laporan, ['draft', 'submitted'])) {
            return redirect()->route('admin.input-reports.show', $id)
                           ->with('error', 'Laporan dengan status ini tidak dapat diedit');
        }

        // Get master data untuk form
        $masterData = [
            'shifts' => TmDataShift::where('status', 'aktif')->select('id', 'nama_shift', 'jam_mulai', 'jam_selesai')->get(),
            'machines' => TmDataMesinCutting::where('status_mesin', 'aktif')->select('id', 'kode_mesin', 'nama_mesin')->get(),
            'fabrics' => TmDataJenisKain::where('status', 'aktif')->select('id', 'kode_kain', 'nama_kain', 'warna_tersedia')->get(),
            'lines' => TmDataLineProduksi::where('status', 'aktif')->select('id', 'kode_line', 'nama_line')->get(),
            'customers' => TmDataCustomer::where('status', 'aktif')->select('id', 'kode_customer', 'nama_customer')->get(),
            'patterns' => TmDataPattern::where('status', 'aktif')->select('id', 'kode_pattern', 'nama_pattern', 'difficulty_level')->get(),
            'operators' => User::whereHas('roles', function($q) {
                $q->where('name', 'user');
            })->select('id', 'name', 'email')->orderBy('name')->get(),
        ];

        return Inertia::render('admin/input-reports/edit', [
            'report' => $report,
            'masterData' => $masterData,
        ]);
    }

    public function update(Request $request, $id)
    {
        $report = TtDataLaporanCutting::findOrFail($id);
        $originalData = $report->toArray();

        // Validasi sama seperti store
        $validated = $request->validate([
            'nomor_order' => 'required|string|max:100',
            'batch_number' => 'required|string|max:100',
            'tanggal_laporan' => 'required|date',
            'shift_id' => 'required|exists:tm_data_shift,id',
            'mesin_id' => 'required|exists:tm_data_mesin_cutting,id',
            'line_produksi_id' => 'required|exists:tm_data_line_produksi,id',
            'customer_id' => 'required|exists:tm_data_customer,id',
            'pattern_id' => 'required|exists:tm_data_pattern,id',
            'jenis_kain_id' => 'required|exists:tm_data_jenis_kain,id',
            'operator_id' => 'required|exists:users,id',
            'target_quantity_pcs' => 'required|integer|min:1',
            'actual_quantity_pcs' => 'nullable|integer|min:0',
            'jumlah_layer' => 'required|integer|min:1',
            'panjang_kain_meter' => 'required|numeric|min:0',
            'lebar_kain_cm' => 'required|numeric|min:0',
            'waktu_mulai_cutting' => 'nullable|date',
            'waktu_selesai_cutting' => 'nullable|date|after:waktu_mulai_cutting',
            'kondisi_mesin' => 'nullable|in:baik,maintenance,rusak',
            'catatan_maintenance' => 'nullable|string',
            'kualitas_hasil' => 'nullable|in:excellent,good,fair,poor',
            'jumlah_defect' => 'nullable|integer|min:0',
            'jenis_defect' => 'nullable|array',
            'catatan_operator' => 'nullable|string',
            'suhu_ruangan' => 'nullable|numeric',
            'kelembaban' => 'nullable|numeric',
            'status_laporan' => 'required|in:draft,submitted',
            
            // Detail cutting
            'detail_cutting' => 'nullable|array',
            'detail_cutting.*.pattern_name' => 'required|string|max:100',
            'detail_cutting.*.ukuran_pattern' => 'required|string|max:50',
            'detail_cutting.*.jumlah_potongan' => 'required|integer|min:1',
            'detail_cutting.*.panjang_pattern_cm' => 'required|numeric|min:0',
            'detail_cutting.*.lebar_pattern_cm' => 'required|numeric|min:0',
            'detail_cutting.*.waste_percentage' => 'nullable|numeric|min:0|max:100',
            'detail_cutting.*.keterangan' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Hitung ulang metrics
            $totalYard = ($validated['panjang_kain_meter'] * $validated['lebar_kain_cm']) / 91.44;
            
            $durasi = null;
            if ($validated['waktu_mulai_cutting'] && $validated['waktu_selesai_cutting']) {
                $mulai = new \DateTime($validated['waktu_mulai_cutting']);
                $selesai = new \DateTime($validated['waktu_selesai_cutting']);
                $durasi = $selesai->diff($mulai)->i + ($selesai->diff($mulai)->h * 60);
            }

            // Update laporan
            $report->update([
                ...$validated,
                'total_yard' => $totalYard,
                'durasi_menit' => $durasi,
            ]);

            // Update detail cutting
            if (isset($validated['detail_cutting'])) {
                // Hapus detail lama
                $report->detailCutting()->delete();
                
                // Buat detail baru
                foreach ($validated['detail_cutting'] as $detail) {
                    TtDataDetailCutting::create([
                        'laporan_id' => $report->id,
                        ...$detail
                    ]);
                }
            }

            // Log activity
            $this->logUpdate(
                'input_reports',
                $report->fresh()->toArray(),
                $originalData,
                "Mengupdate laporan cutting: {$report->nomor_laporan}"
            );

            DB::commit();

            return redirect()->route('admin.input-reports.show', $id)
                           ->with('success', 'Laporan berhasil diupdate');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal mengupdate laporan: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $report = TtDataLaporanCutting::findOrFail($id);
        $reportData = $report->toArray();

        // Hanya bisa hapus jika status draft
        if ($report->status_laporan !== 'draft') {
            return back()->with('error', 'Hanya laporan draft yang dapat dihapus');
        }

        try {
            DB::beginTransaction();

            // Hapus detail cutting
            $report->detailCutting()->delete();
            
            // Hapus laporan
            $report->delete();

            // Log activity
            $this->logDelete(
                'input_reports',
                $reportData,
                "Menghapus laporan cutting: {$report->nomor_laporan}"
            );

            DB::commit();

            return redirect()->route('admin.input-reports.index')
                           ->with('success', 'Laporan berhasil dihapus');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal menghapus laporan: ' . $e->getMessage()]);
        }
    }
}
