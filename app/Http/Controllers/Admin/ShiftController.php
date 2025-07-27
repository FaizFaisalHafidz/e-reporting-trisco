<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TmDataShift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = TmDataShift::latest()->get();
        
        $stats = [
            'total_shifts' => TmDataShift::count(),
            'active_shifts' => TmDataShift::where('status', 'aktif')->count(),
            'total_duration' => TmDataShift::sum('durasi_menit'),
            'avg_duration' => TmDataShift::avg('durasi_menit'),
        ];

        return Inertia::render('admin/master/shifts/index', [
            'shifts' => $shifts,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_shift' => 'required|string|max:100',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i',
            'durasi_menit' => 'required|integer|min:1',
            'break_time' => 'nullable|array',
            'break_time.*.mulai' => 'nullable|date_format:H:i',
            'break_time.*.selesai' => 'nullable|date_format:H:i',
            'break_time.*.deskripsi' => 'nullable|string|max:100',
            'supervisor_default' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:aktif,non_aktif',
        ]);

        TmDataShift::create($validated);

        return redirect()->back()->with('success', 'Data shift berhasil ditambahkan!');
    }

    public function update(Request $request, TmDataShift $shift)
    {
        $validated = $request->validate([
            'nama_shift' => 'required|string|max:100',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i',
            'durasi_menit' => 'required|integer|min:1',
            'break_time' => 'nullable|array',
            'break_time.*.mulai' => 'nullable|date_format:H:i',
            'break_time.*.selesai' => 'nullable|date_format:H:i',
            'break_time.*.deskripsi' => 'nullable|string|max:100',
            'supervisor_default' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:aktif,non_aktif',
        ]);

        $shift->update($validated);

        return redirect()->back()->with('success', 'Data shift berhasil diupdate!');
    }

    public function destroy(TmDataShift $shift)
    {
        // Check if shift is being used in any reports
        if ($shift->laporanCutting()->exists()) {
            return redirect()->back()->with('error', 'Shift tidak dapat dihapus karena sedang digunakan dalam laporan!');
        }

        $shift->delete();

        return redirect()->back()->with('success', 'Data shift berhasil dihapus!');
    }

    public function toggleStatus(TmDataShift $shift)
    {
        $newStatus = $shift->status === 'aktif' ? 'non_aktif' : 'aktif';
        $shift->update(['status' => $newStatus]);

        $message = $newStatus === 'aktif' 
            ? 'Shift berhasil diaktifkan!' 
            : 'Shift berhasil dinonaktifkan!';

        return redirect()->back()->with('success', $message);
    }
}
