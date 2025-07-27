<?php

namespace App\Http\Controllers;

use App\Models\TmDataShift;
use App\Models\TmDataMesinCutting;
use App\Models\TmDataLineProduksi;
use App\Models\TmDataCustomer;
use App\Models\TmDataPattern;
use App\Models\TmDataJenisKain;
use App\Models\User;
use App\Models\TtDataLaporanCutting;
use App\Models\TtDataDetailCutting;
use App\Models\TtDataLogAktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class OperatorReportController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get reports created by this operator
        $reports = TtDataLaporanCutting::with([
            'shift:id,nama_shift',
            'mesin:id,nama_mesin,kode_mesin',
            'lineProduksi:id,nama_line',
            'customer:id,nama_customer',
            'pattern:id,nama_pattern',
            'jenisKain:id,nama_kain',
            'operator:id,name'
        ])
        ->where('operator_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return Inertia::render('reports/index', [
            'reports' => $reports,
        ]);
    }

    public function create()
    {
        // Load master data for form dropdowns
        $masterData = [
            'shifts' => TmDataShift::select('id', 'nama_shift', 'jam_mulai', 'jam_selesai')->get(),
            'machines' => TmDataMesinCutting::select('id', 'kode_mesin', 'nama_mesin')->get(),
            'lines' => TmDataLineProduksi::select('id', 'kode_line', 'nama_line')->get(),
            'customers' => TmDataCustomer::select('id', 'kode_customer', 'nama_customer')->get(),
            'patterns' => TmDataPattern::select('id', 'kode_pattern', 'nama_pattern', 'difficulty_level')->get(),
            'fabrics' => TmDataJenisKain::select('id', 'kode_kain', 'nama_kain', 'warna_tersedia')->get(),
            'operators' => User::select('id', 'name', 'email')->whereHas('roles', function($q) {
                $q->where('name', 'operator');
            })->get(),
        ];

        return Inertia::render('reports/create', [
            'masterData' => $masterData,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomor_order' => 'required|string|max:255',
            'batch_number' => 'required|string|max:255',
            'tanggal_laporan' => 'required|date',
            'shift_id' => 'required|exists:tm_data_shift,id',
            'mesin_id' => 'required|exists:tm_data_mesin_cutting,id',
            'line_produksi_id' => 'required|exists:tm_data_line_produksi,id',
            'customer_id' => 'required|exists:tm_data_customer,id',
            'pattern_id' => 'required|exists:tm_data_pattern,id',
            'jenis_kain_id' => 'required|exists:tm_data_jenis_kain,id',
            'target_quantity_pcs' => 'required|integer|min:1',
            'actual_quantity_pcs' => 'required|integer|min:0',
            'jumlah_layer' => 'required|integer|min:1',
            'panjang_kain_meter' => 'required|numeric|min:0',
            'lebar_kain_cm' => 'required|numeric|min:0',
            'waktu_mulai_cutting' => 'required',
            'waktu_selesai_cutting' => 'required',
            'kondisi_mesin' => 'required|in:baik,perlu_maintenance,rusak',
            'kualitas_hasil' => 'required|in:baik,bagus,cukup,kurang',
            'jumlah_defect' => 'required|integer|min:0',
            'status_laporan' => 'required|in:draft,submitted',
            'detail_cutting' => 'sometimes|array',
            'detail_cutting.*.pattern_name' => 'required|string',
            'detail_cutting.*.ukuran_pattern' => 'required|string',
            'detail_cutting.*.jumlah_potongan' => 'required|integer|min:1',
            'detail_cutting.*.panjang_pattern_cm' => 'required|numeric|min:0',
            'detail_cutting.*.lebar_pattern_cm' => 'required|numeric|min:0',
            'detail_cutting.*.waste_percentage' => 'required|numeric|min:0|max:100',
            // Upload foto
            'foto_hasil' => 'nullable|array|max:5',
            'foto_hasil.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed in store:', [
                'errors' => $validator->errors()->toArray(),
                'input' => $request->all()
            ]);
            return back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();
        try {
            $user = Auth::user();

            // Calculate efficiency
            $efficiency = $request->target_quantity_pcs > 0 
                ? ($request->actual_quantity_pcs / $request->target_quantity_pcs) * 100 
                : 0;

            // Calculate total area
            $total_area_m2 = ($request->panjang_kain_meter * ($request->lebar_kain_cm / 100)) * $request->jumlah_layer;

            // Calculate cutting time
            $waktu_mulai = \Carbon\Carbon::parse($request->tanggal_laporan . ' ' . $request->waktu_mulai_cutting);
            $waktu_selesai = \Carbon\Carbon::parse($request->tanggal_laporan . ' ' . $request->waktu_selesai_cutting);
            $durasi_menit = $waktu_mulai->diffInMinutes($waktu_selesai);

            $operator = Auth::user();

            // Create main report
            $report = TtDataLaporanCutting::create([
                'nomor_order' => $request->nomor_order,
                'batch_number' => $request->batch_number,
                'tanggal_laporan' => $request->tanggal_laporan,
                'shift_id' => $request->shift_id,
                'mesin_id' => $request->mesin_id,
                'line_produksi_id' => $request->line_produksi_id,
                'customer_id' => $request->customer_id,
                'pattern_id' => $request->pattern_id,
                'jenis_kain_id' => $request->jenis_kain_id,
                'operator_id' => $operator->id,
                'target_quantity_pcs' => $request->target_quantity_pcs,
                'actual_quantity_pcs' => $request->actual_quantity_pcs,
                'jumlah_layer' => $request->jumlah_layer,
                'panjang_kain_meter' => $request->panjang_kain_meter,
                'lebar_kain_cm' => $request->lebar_kain_cm,
                'total_area_m2' => $total_area_m2,
                'waktu_mulai_cutting' => $waktu_mulai,
                'waktu_selesai_cutting' => $waktu_selesai,
                'durasi_menit' => $durasi_menit,
                'efisiensi_cutting' => $efficiency,
                'kondisi_mesin' => $request->kondisi_mesin,
                'catatan_maintenance' => $request->catatan_maintenance,
                'kualitas_hasil' => $request->kualitas_hasil,
                'jumlah_defect' => $request->jumlah_defect,
                'jenis_defect' => $request->jenis_defect ? json_encode($request->jenis_defect) : null,
                'catatan_operator' => $request->catatan_operator,
                'suhu_ruangan' => $request->suhu_ruangan,
                'kelembaban' => $request->kelembaban,
                'status_laporan' => $request->status_laporan,
            ]);
            Log::info('Main report created', ['report_id' => $report->id]);

            // Handle foto upload
            $foto_paths = [];
            if ($request->hasFile('foto_hasil')) {
                foreach ($request->file('foto_hasil') as $foto) {
                    if ($foto->isValid()) {
                        $path = $foto->store('reports/photos', 'public');
                        $foto_paths[] = $path;
                    }
                }
                
                // Update report dengan foto paths
                $report->update([
                    'foto_hasil' => json_encode($foto_paths)
                ]);
            }

            // Create detail cutting records
            if ($request->has('detail_cutting') && is_array($request->detail_cutting)) {
                foreach ($request->detail_cutting as $detail) {
                    TtDataDetailCutting::create([
                        'laporan_id' => $report->id,
                        'pattern_name' => $detail['pattern_name'],
                        'ukuran_pattern' => $detail['ukuran_pattern'],
                        'jumlah_potongan' => $detail['jumlah_potongan'],
                        'panjang_pattern_cm' => $detail['panjang_pattern_cm'],
                        'lebar_pattern_cm' => $detail['lebar_pattern_cm'],
                        'waste_percentage' => $detail['waste_percentage'],
                        'keterangan' => $detail['keterangan'] ?? null,
                    ]);
                }
                Log::info('Detail cutting records created', ['count' => count($request->detail_cutting)]);
            }

            // Log activity
            TtDataLogAktivitas::create([
                'user_id' => $user->id,
                'modul' => 'operator_report',
                'aktivitas' => $request->status_laporan === 'draft' ? 'Menyimpan draft laporan cutting' : 'Mengirim laporan cutting',
                'deskripsi' => "Order: {$request->nomor_order}, Batch: {$request->batch_number}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            Log::info('Activity log created', ['user_id' => $user->id]);

            DB::commit();

            return redirect()->route('reports.index')->with('success', 
                $request->status_laporan === 'draft' 
                    ? 'Draft laporan berhasil disimpan.' 
                    : 'Laporan berhasil dikirim.'
            );

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Exception in store:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan laporan.'])->withInput();
        }
    }

    public function show($id)
    {
        $report = TtDataLaporanCutting::with([
            'shift:id,nama_shift,jam_mulai,jam_selesai',
            'mesin:id,nama_mesin,kode_mesin',
            'lineProduksi:id,nama_line',
            'customer:id,nama_customer',
            'pattern:id,nama_pattern',
            'jenisKain:id,nama_kain',
            'operator:id,name',
            'detailCuttings'
        ])
        ->where('operator_id', Auth::id())
        ->findOrFail($id);

        return Inertia::render('reports/show', [
            'report' => $report,
        ]);
    }

    public function edit($id)
    {
        $report = TtDataLaporanCutting::with('detailCuttings')
            ->where('operator_id', Auth::id())
            ->where('status_laporan', 'draft') // Only allow editing drafts
            ->findOrFail($id);

        // Load master data for form dropdowns
        $masterData = [
            'shifts' => TmDataShift::select('id', 'nama_shift', 'jam_mulai', 'jam_selesai')->get(),
            'machines' => TmDataMesinCutting::select('id', 'kode_mesin', 'nama_mesin')->get(),
            'lines' => TmDataLineProduksi::select('id', 'kode_line', 'nama_line')->get(),
            'customers' => TmDataCustomer::select('id', 'kode_customer', 'nama_customer')->get(),
            'patterns' => TmDataPattern::select('id', 'kode_pattern', 'nama_pattern', 'difficulty_level')->get(),
            'fabrics' => TmDataJenisKain::select('id', 'kode_kain', 'nama_kain', 'warna_tersedia')->get(),
            'operators' => User::select('id', 'name', 'email')->whereHas('roles', function($q) {
                $q->where('name', 'operator');
            })->get(),
        ];

        return Inertia::render('reports/edit', [
            'report' => $report,
            'masterData' => $masterData,
        ]);
    }

    public function update(Request $request, $id)
    {
        $report = TtDataLaporanCutting::where('operator_id', Auth::id())
            ->where('status_laporan', 'draft') // Only allow updating drafts
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nomor_order' => 'required|string|max:255',
            'batch_number' => 'required|string|max:255',
            'tanggal_laporan' => 'required|date',
            'shift_id' => 'required|exists:tm_data_shift,id',
            'mesin_id' => 'required|exists:tm_data_mesin_cutting,id',
            'line_produksi_id' => 'required|exists:tm_data_line_produksi,id',
            'customer_id' => 'required|exists:tm_data_customer,id',
            'pattern_id' => 'required|exists:tm_data_pattern,id',
            'jenis_kain_id' => 'required|exists:tm_data_jenis_kain,id',
            'operator_id' => 'required|exists:users,id',
            'target_quantity_pcs' => 'required|integer|min:1',
            'actual_quantity_pcs' => 'required|integer|min:0',
            'jumlah_layer' => 'required|integer|min:1',
            'panjang_kain_meter' => 'required|numeric|min:0',
            'lebar_kain_cm' => 'required|numeric|min:0',
            'waktu_mulai_cutting' => 'required',
            'waktu_selesai_cutting' => 'required',
            'kondisi_mesin' => 'required|in:baik,perlu_maintenance,rusak',
            'kualitas_hasil' => 'required|in:baik,bagus,cukup,kurang',
            'jumlah_defect' => 'required|integer|min:0',
            'status_laporan' => 'required|in:draft,submitted',
            'detail_cutting' => 'sometimes|array',
            // Upload foto
            'foto_hasil' => 'nullable|array|max:5',
            'foto_hasil.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();
        try {
            $user = Auth::user();
            
            // Calculate efficiency
            $efficiency = $request->target_quantity_pcs > 0 
                ? ($request->actual_quantity_pcs / $request->target_quantity_pcs) * 100 
                : 0;

            // Calculate total area
            $total_area_m2 = ($request->panjang_kain_meter * ($request->lebar_kain_cm / 100)) * $request->jumlah_layer;

            // Calculate cutting time
            $waktu_mulai = \Carbon\Carbon::parse($request->tanggal_laporan . ' ' . $request->waktu_mulai_cutting);
            $waktu_selesai = \Carbon\Carbon::parse($request->tanggal_laporan . ' ' . $request->waktu_selesai_cutting);
            $durasi_menit = $waktu_mulai->diffInMinutes($waktu_selesai);

            // Update main report
            $report->update([
                'nomor_order' => $request->nomor_order,
                'batch_number' => $request->batch_number,
                'tanggal_laporan' => $request->tanggal_laporan,
                'shift_id' => $request->shift_id,
                'mesin_id' => $request->mesin_id,
                'line_produksi_id' => $request->line_produksi_id,
                'customer_id' => $request->customer_id,
                'pattern_id' => $request->pattern_id,
                'jenis_kain_id' => $request->jenis_kain_id,
                'operator_id' => $request->operator_id,
                'target_quantity_pcs' => $request->target_quantity_pcs,
                'actual_quantity_pcs' => $request->actual_quantity_pcs,
                'jumlah_layer' => $request->jumlah_layer,
                'panjang_kain_meter' => $request->panjang_kain_meter,
                'lebar_kain_cm' => $request->lebar_kain_cm,
                'total_area_m2' => $total_area_m2,
                'waktu_mulai_cutting' => $waktu_mulai,
                'waktu_selesai_cutting' => $waktu_selesai,
                'durasi_menit' => $durasi_menit,
                'efisiensi_cutting' => $efficiency,
                'kondisi_mesin' => $request->kondisi_mesin,
                'catatan_maintenance' => $request->catatan_maintenance,
                'kualitas_hasil' => $request->kualitas_hasil,
                'jumlah_defect' => $request->jumlah_defect,
                'jenis_defect' => $request->jenis_defect ? json_encode($request->jenis_defect) : null,
                'catatan_operator' => $request->catatan_operator,
                'suhu_ruangan' => $request->suhu_ruangan,
                'kelembaban' => $request->kelembaban,
                'status_laporan' => $request->status_laporan,
            ]);

            // Update detail cutting records
            $report->detailCuttings()->delete(); // Remove old details
            if ($request->has('detail_cutting') && is_array($request->detail_cutting)) {
                foreach ($request->detail_cutting as $detail) {
                    TtDataDetailCutting::create([
                        'laporan_id' => $report->id,
                        'pattern_name' => $detail['pattern_name'],
                        'ukuran_pattern' => $detail['ukuran_pattern'],
                        'jumlah_potongan' => $detail['jumlah_potongan'],
                        'panjang_pattern_cm' => $detail['panjang_pattern_cm'],
                        'lebar_pattern_cm' => $detail['lebar_pattern_cm'],
                        'waste_percentage' => $detail['waste_percentage'],
                        'keterangan' => $detail['keterangan'] ?? null,
                    ]);
                }
            }

            // Log activity
            TtDataLogAktivitas::create([
                'user_id' => $user->id,
                'modul' => 'operator_report',
                'aktivitas' => $request->status_laporan === 'draft' ? 'Memperbarui draft laporan cutting' : 'Memperbarui dan mengirim laporan cutting',
                'deskripsi' => "Order: {$request->nomor_order}, Batch: {$request->batch_number}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return redirect()->route('reports.index')->with('success', 
                $request->status_laporan === 'draft' 
                    ? 'Draft laporan berhasil diperbarui.' 
                    : 'Laporan berhasil diperbarui dan dikirim.'
            );

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat memperbarui laporan.'])->withInput();
        }
    }

    public function destroy($id)
    {
        $report = TtDataLaporanCutting::where('operator_id', Auth::id())
            ->where('status_laporan', 'draft') // Only allow deleting drafts
            ->findOrFail($id);

        DB::beginTransaction();
        try {
            $user = Auth::user();
            
            // Delete detail cutting records first
            $report->detailCuttings()->delete();
            
            // Delete main report
            $report->delete();

            // Log activity
            TtDataLogAktivitas::create([
                'user_id' => $user->id,
                'modul' => 'operator_report',
                'aktivitas' => 'Menghapus draft laporan cutting',
                'deskripsi' => "Order: {$report->nomor_order}, Batch: {$report->batch_number}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();

            return redirect()->route('reports.index')->with('success', 'Draft laporan berhasil dihapus.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menghapus laporan.']);
        }
    }
}
