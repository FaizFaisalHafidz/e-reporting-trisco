<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TtDataLogAktivitas;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $query = TtDataLogAktivitas::with('user');

        // Filter berdasarkan parameter
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('modul')) {
            $query->where('modul', $request->modul);
        }

        if ($request->filled('aktivitas')) {
            $query->where('aktivitas', $request->aktivitas);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('aktivitas', 'like', "%{$search}%")
                  ->orWhere('modul', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get data untuk filter
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();
        $moduls = TtDataLogAktivitas::distinct()->pluck('modul')->filter()->sort()->values();
        $aktivitas = TtDataLogAktivitas::distinct()->pluck('aktivitas')->filter()->sort()->values();

        // Stats
        $stats = [
            'total_logs' => TtDataLogAktivitas::count(),
            'today_logs' => TtDataLogAktivitas::whereDate('created_at', today())->count(),
            'login_logs' => TtDataLogAktivitas::where('aktivitas', 'login')->count(),
            'system_logs' => TtDataLogAktivitas::where('modul', '!=', 'auth')->count(),
        ];

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
            'users' => $users,
            'moduls' => $moduls,
            'aktivitas' => $aktivitas,
            'stats' => $stats,
            'filters' => $request->only(['user_id', 'modul', 'aktivitas', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function loginLogs(Request $request)
    {
        $query = TtDataLogAktivitas::with('user')
            ->whereIn('aktivitas', ['login', 'logout', 'login_failed']);

        // Filter berdasarkan parameter
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('aktivitas')) {
            $query->where('aktivitas', $request->aktivitas);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get data untuk filter
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        // Stats untuk login logs
        $stats = [
            'total_logins' => TtDataLogAktivitas::where('aktivitas', 'login')->count(),
            'today_logins' => TtDataLogAktivitas::where('aktivitas', 'login')->whereDate('created_at', today())->count(),
            'failed_logins' => TtDataLogAktivitas::where('aktivitas', 'login_failed')->count(),
            'active_sessions' => TtDataLogAktivitas::where('aktivitas', 'login')->whereDate('created_at', today())->distinct('user_id')->count(),
        ];

        return Inertia::render('admin/logs/login-logs', [
            'logs' => $logs,
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['user_id', 'aktivitas', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function systemLogs(Request $request)
    {
        $query = TtDataLogAktivitas::with('user')
            ->where('modul', '!=', 'auth')
            ->whereNotIn('aktivitas', ['login', 'logout', 'login_failed']);

        // Filter berdasarkan parameter
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('modul')) {
            $query->where('modul', $request->modul);
        }

        if ($request->filled('aktivitas')) {
            $query->where('aktivitas', $request->aktivitas);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('aktivitas', 'like', "%{$search}%")
                  ->orWhere('modul', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get data untuk filter
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();
        $moduls = TtDataLogAktivitas::where('modul', '!=', 'auth')->distinct()->pluck('modul')->filter()->sort()->values();
        $aktivitas = TtDataLogAktivitas::whereNotIn('aktivitas', ['login', 'logout', 'login_failed'])->distinct()->pluck('aktivitas')->filter()->sort()->values();

        // Stats untuk system logs
        $stats = [
            'total_system_logs' => TtDataLogAktivitas::where('modul', '!=', 'auth')->count(),
            'today_system_logs' => TtDataLogAktivitas::where('modul', '!=', 'auth')->whereDate('created_at', today())->count(),
            'create_actions' => TtDataLogAktivitas::where('aktivitas', 'create')->count(),
            'update_actions' => TtDataLogAktivitas::where('aktivitas', 'update')->count(),
        ];

        return Inertia::render('admin/logs/system-logs', [
            'logs' => $logs,
            'users' => $users,
            'moduls' => $moduls,
            'aktivitas' => $aktivitas,
            'stats' => $stats,
            'filters' => $request->only(['user_id', 'modul', 'aktivitas', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function show($id)
    {
        $log = TtDataLogAktivitas::with('user')->findOrFail($id);

        return Inertia::render('admin/logs/show', [
            'log' => $log,
        ]);
    }

    public function export(Request $request)
    {
        $query = TtDataLogAktivitas::with('user');

        // Apply same filters as index
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('modul')) {
            $query->where('modul', $request->modul);
        }

        if ($request->filled('aktivitas')) {
            $query->where('aktivitas', $request->aktivitas);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        $filename = 'log_aktivitas_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Header CSV
            fputcsv($file, [
                'Tanggal',
                'User',
                'Email',
                'Aktivitas',
                'Modul',
                'IP Address',
                'Keterangan'
            ]);

            // Data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at?->format('d/m/Y H:i:s'),
                    $log->user?->name ?? '-',
                    $log->user?->email ?? '-',
                    $log->aktivitas,
                    $log->modul,
                    $log->ip_address,
                    $log->keterangan ?? '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
