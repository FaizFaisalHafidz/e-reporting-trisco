<?php

namespace App\Http\Controllers;

use App\Models\TtDataLaporanCutting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        
        // Get user statistics - check if user has reports (indicating operator role)
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        $stats = [
            'totalReports' => TtDataLaporanCutting::where('operator_id', $user->id)->count(),
            'thisMonthReports' => TtDataLaporanCutting::where('operator_id', $user->id)
                ->whereDate('tanggal_laporan', '>=', $thisMonth)
                ->count(),
            'lastMonthReports' => TtDataLaporanCutting::where('operator_id', $user->id)
                ->whereBetween('tanggal_laporan', [$lastMonth, $thisMonth->copy()->subDay()])
                ->count(),
            'avgEfficiency' => TtDataLaporanCutting::where('operator_id', $user->id)
                ->whereNotNull('efisiensi_cutting')
                ->avg('efisiensi_cutting') ?? 0,
            'totalMeter' => TtDataLaporanCutting::where('operator_id', $user->id)
                ->sum('panjang_kain_meter') ?? 0,
        ];

        return Inertia::render('profile', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'nullable|string',
            'password' => 'nullable|confirmed|min:8',
        ]);

        // Prepare update data
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        // Update password if provided
        if ($request->filled('password')) {
            if (!$request->filled('current_password') || !Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'Password saat ini tidak benar.']);
            }
            
            $updateData['password'] = Hash::make($request->password);
        }

        // Update user using DB query
        DB::table('users')
            ->where('id', $user->id)
            ->update($updateData);

        return back()->with('success', 'Profile berhasil diperbarui.');
    }
}
