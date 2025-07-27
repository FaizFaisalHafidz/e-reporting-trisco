<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TmDataLineProduksi;
use App\Models\TmDataMesinCutting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LineProduksiController extends Controller
{
    public function index()
    {
        $lines = TmDataLineProduksi::latest()->get();
        $machines = TmDataMesinCutting::where('status_mesin', 'aktif')->get(['id', 'kode_mesin', 'nama_mesin']);
        
        $stats = [
            'total_lines' => TmDataLineProduksi::count(),
            'active_lines' => TmDataLineProduksi::where('status', 'aktif')->count(),
            'total_capacity' => TmDataLineProduksi::sum('kapasitas_harian_yard'),
            'avg_capacity' => TmDataLineProduksi::avg('kapasitas_harian_yard'),
        ];

        return Inertia::render('admin/master/lines/index', [
            'lines' => $lines,
            'machines' => $machines,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_line' => 'required|string|max:20|unique:tm_data_line_produksi,kode_line',
            'nama_line' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'kapasitas_harian_yard' => 'required|integer|min:0',
            'supervisor_default' => 'nullable|string|max:100',
            'mesin_ids' => 'nullable|array',
            'mesin_ids.*' => 'exists:tm_data_mesin_cutting,id',
            'status' => 'required|in:aktif,non_aktif,maintenance',
        ]);

        TmDataLineProduksi::create($validated);

        return redirect()->back()->with('success', 'Data line produksi berhasil ditambahkan!');
    }

    public function update(Request $request, TmDataLineProduksi $line)
    {
        $validated = $request->validate([
            'kode_line' => 'required|string|max:20|unique:tm_data_line_produksi,kode_line,' . $line->id,
            'nama_line' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'kapasitas_harian_yard' => 'required|integer|min:0',
            'supervisor_default' => 'nullable|string|max:100',
            'mesin_ids' => 'nullable|array',
            'mesin_ids.*' => 'exists:tm_data_mesin_cutting,id',
            'status' => 'required|in:aktif,non_aktif,maintenance',
        ]);

        $line->update($validated);

        return redirect()->back()->with('success', 'Data line produksi berhasil diupdate!');
    }

    public function destroy(TmDataLineProduksi $line)
    {
        // Check if line is being used in any reports
        if ($line->laporanCutting()->exists()) {
            return redirect()->back()->with('error', 'Line produksi tidak dapat dihapus karena sedang digunakan dalam laporan!');
        }

        $line->delete();

        return redirect()->back()->with('success', 'Data line produksi berhasil dihapus!');
    }

    public function toggleStatus(TmDataLineProduksi $line)
    {
        $newStatus = $line->status === 'aktif' ? 'non_aktif' : 'aktif';
        $line->update(['status' => $newStatus]);

        $message = $newStatus === 'aktif' 
            ? 'Line produksi berhasil diaktifkan!' 
            : 'Line produksi berhasil dinonaktifkan!';

        return redirect()->back()->with('success', $message);
    }
}
