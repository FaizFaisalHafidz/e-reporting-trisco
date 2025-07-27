<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TmDataJenisKain;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenisKainController extends Controller
{
    public function index()
    {
        $fabrics = TmDataJenisKain::latest()->get();
        
        $stats = [
            'total_fabrics' => TmDataJenisKain::count(),
            'active_fabrics' => TmDataJenisKain::where('status', 'aktif')->count(),
            'total_categories' => TmDataJenisKain::distinct('kategori')->count(),
            'avg_price' => TmDataJenisKain::avg('harga_per_meter'),
        ];

        return Inertia::render('admin/master/fabrics/index', [
            'fabrics' => $fabrics,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_kain' => 'required|string|max:20|unique:tm_data_jenis_kain,kode_kain',
            'nama_kain' => 'required|string|max:100',
            'kategori' => 'required|string|max:50',
            'gramasi' => 'required|numeric|min:0',
            'lebar_standar' => 'required|numeric|min:0',
            'warna_tersedia' => 'nullable|array',
            'supplier' => 'nullable|string|max:100',
            'harga_per_meter' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:aktif,non_aktif',
        ]);

        TmDataJenisKain::create($validated);

        return redirect()->back()->with('success', 'Data jenis kain berhasil ditambahkan!');
    }

    public function update(Request $request, TmDataJenisKain $fabric)
    {
        $validated = $request->validate([
            'kode_kain' => 'required|string|max:20|unique:tm_data_jenis_kain,kode_kain,' . $fabric->id,
            'nama_kain' => 'required|string|max:100',
            'kategori' => 'required|string|max:50',
            'gramasi' => 'required|numeric|min:0',
            'lebar_standar' => 'required|numeric|min:0',
            'warna_tersedia' => 'nullable|array',
            'supplier' => 'nullable|string|max:100',
            'harga_per_meter' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:aktif,non_aktif',
        ]);

        $fabric->update($validated);

        return redirect()->back()->with('success', 'Data jenis kain berhasil diupdate!');
    }

    public function destroy(TmDataJenisKain $fabric)
    {
        // Check if fabric is being used in any reports
        if ($fabric->laporanCutting()->exists()) {
            return redirect()->back()->with('error', 'Jenis kain tidak dapat dihapus karena sedang digunakan dalam laporan!');
        }

        $fabric->delete();

        return redirect()->back()->with('success', 'Data jenis kain berhasil dihapus!');
    }

    public function toggleStatus(TmDataJenisKain $fabric)
    {
        $newStatus = $fabric->status === 'aktif' ? 'non_aktif' : 'aktif';
        $fabric->update(['status' => $newStatus]);

        $message = $newStatus === 'aktif' 
            ? 'Jenis kain berhasil diaktifkan!' 
            : 'Jenis kain berhasil dinonaktifkan!';

        return redirect()->back()->with('success', $message);
    }
}
