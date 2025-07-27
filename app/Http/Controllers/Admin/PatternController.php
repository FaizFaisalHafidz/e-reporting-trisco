<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TmDataPattern;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatternController extends Controller
{
    public function index()
    {
        $patterns = TmDataPattern::latest()->get();
        
        $stats = [
            'total_patterns' => TmDataPattern::count(),
            'active_patterns' => TmDataPattern::where('status', 'aktif')->count(),
            'total_categories' => TmDataPattern::distinct('kategori_produk')->count(),
            'avg_consumption' => TmDataPattern::avg('fabric_consumption_yard'),
        ];

        return Inertia::render('admin/master/patterns/index', [
            'patterns' => $patterns,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_pattern' => 'required|string|max:30|unique:tm_data_pattern,kode_pattern',
            'nama_pattern' => 'required|string|max:100',
            'kategori_produk' => 'required|string|max:50',
            'size_range' => 'nullable|string|max:50',
            'panjang_pattern_cm' => 'nullable|numeric|min:0',
            'lebar_pattern_cm' => 'nullable|numeric|min:0',
            'fabric_consumption_yard' => 'nullable|numeric|min:0',
            'size_breakdown' => 'nullable|array',
            'instruksi_cutting' => 'nullable|string',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'status' => 'required|in:aktif,non_aktif,archived',
        ]);

        TmDataPattern::create($validated);

        return redirect()->back()->with('success', 'Data pattern berhasil ditambahkan!');
    }

    public function update(Request $request, TmDataPattern $pattern)
    {
        $validated = $request->validate([
            'kode_pattern' => 'required|string|max:30|unique:tm_data_pattern,kode_pattern,' . $pattern->id,
            'nama_pattern' => 'required|string|max:100',
            'kategori_produk' => 'required|string|max:50',
            'size_range' => 'nullable|string|max:50',
            'panjang_pattern_cm' => 'nullable|numeric|min:0',
            'lebar_pattern_cm' => 'nullable|numeric|min:0',
            'fabric_consumption_yard' => 'nullable|numeric|min:0',
            'size_breakdown' => 'nullable|array',
            'instruksi_cutting' => 'nullable|string',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'status' => 'required|in:aktif,non_aktif,archived',
        ]);

        $pattern->update($validated);

        return redirect()->back()->with('success', 'Data pattern berhasil diupdate!');
    }

    public function destroy(TmDataPattern $pattern)
    {
        // Check if pattern is being used in any reports
        if ($pattern->laporanCutting()->exists()) {
            return redirect()->back()->with('error', 'Pattern tidak dapat dihapus karena sedang digunakan dalam laporan!');
        }

        $pattern->delete();

        return redirect()->back()->with('success', 'Data pattern berhasil dihapus!');
    }

    public function toggleStatus(TmDataPattern $pattern)
    {
        $newStatus = $pattern->status === 'aktif' ? 'non_aktif' : 'aktif';
        $pattern->update(['status' => $newStatus]);

        $message = $newStatus === 'aktif' 
            ? 'Pattern berhasil diaktifkan!' 
            : 'Pattern berhasil dinonaktifkan!';

        return redirect()->back()->with('success', $message);
    }
}
