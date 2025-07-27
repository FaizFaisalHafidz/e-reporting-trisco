<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TmDataMesinCutting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class MesinController extends Controller
{
    public function index()
    {
        $mesin = TmDataMesinCutting::orderBy('nama_mesin')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_mesin' => $item->nama_mesin,
                    'kode_mesin' => $item->kode_mesin,
                    'lokasi' => $item->lokasi,
                    'status_mesin' => $item->status_mesin,
                    'kapasitas_harian' => $item->kapasitas_harian,
                    'created_at' => $item->created_at?->format('d M Y H:i'),
                    'updated_at' => $item->updated_at?->format('d M Y H:i'),
                ];
            });

        $stats = [
            'total_mesin' => TmDataMesinCutting::count(),
            'mesin_aktif' => TmDataMesinCutting::where('status_mesin', 'aktif')->count(),
            'mesin_maintenance' => TmDataMesinCutting::where('status_mesin', 'maintenance')->count(),
            'mesin_rusak' => TmDataMesinCutting::where('status_mesin', 'rusak')->count(),
        ];

        return Inertia::render('admin/master/mesin/index', [
            'mesin' => $mesin,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_mesin' => ['required', 'string', 'max:255'],
            'kode_mesin' => ['required', 'string', 'max:50', 'unique:tm_data_mesin_cutting,kode_mesin'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'status_mesin' => ['required', 'in:aktif,maintenance,rusak'],
            'kapasitas_harian' => ['nullable', 'numeric', 'min:0'],
        ]);

        try {
            TmDataMesinCutting::create([
                'nama_mesin' => $request->nama_mesin,
                'kode_mesin' => $request->kode_mesin,
                'lokasi' => $request->lokasi,
                'status_mesin' => $request->status_mesin,
                'kapasitas_harian' => $request->kapasitas_harian,
            ]);

            return redirect()->back()->with('success', 'Data mesin berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal menambahkan data mesin: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, TmDataMesinCutting $mesin)
    {
        $request->validate([
            'nama_mesin' => ['required', 'string', 'max:255'],
            'kode_mesin' => ['required', 'string', 'max:50', Rule::unique('tm_data_mesin_cutting')->ignore($mesin->id)],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'status_mesin' => ['required', 'in:aktif,maintenance,rusak'],
            'kapasitas_harian' => ['nullable', 'numeric', 'min:0'],
        ]);

        try {
            $mesin->update([
                'nama_mesin' => $request->nama_mesin,
                'kode_mesin' => $request->kode_mesin,
                'lokasi' => $request->lokasi,
                'status_mesin' => $request->status_mesin,
                'kapasitas_harian' => $request->kapasitas_harian,
            ]);

            return redirect()->back()->with('success', 'Data mesin berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui data mesin: ' . $e->getMessage()]);
        }
    }

    public function destroy(TmDataMesinCutting $mesin)
    {
        try {
            // Check if mesin is being used in reports
            $isUsed = DB::table('tt_data_laporan_cutting')
                ->where('id_mesin_cutting', $mesin->id)
                ->exists();

            if ($isUsed) {
                return redirect()->back()->withErrors(['error' => 'Data mesin tidak dapat dihapus karena sedang digunakan dalam laporan']);
            }

            $mesin->delete();
            return redirect()->back()->with('success', 'Data mesin berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal menghapus data mesin: ' . $e->getMessage()]);
        }
    }

    public function toggleStatus(Request $request, TmDataMesinCutting $mesin)
    {
        $request->validate([
            'status_mesin' => ['required', 'in:aktif,maintenance,rusak'],
        ]);

        try {
            $mesin->update([
                'status_mesin' => $request->status_mesin,
            ]);

            return redirect()->back()->with('success', 'Status mesin berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui status mesin: ' . $e->getMessage()]);
        }
    }
}
