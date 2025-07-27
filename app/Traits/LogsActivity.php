<?php

namespace App\Traits;

use App\Models\TtDataLogAktivitas;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log activity untuk create operation
     */
    protected function logCreate($modul, $data, $keterangan = null)
    {
        TtDataLogAktivitas::logActivity(
            Auth::id(),
            'create',
            $modul,
            $data,
            null,
            $keterangan ?? "Membuat data baru di {$modul}"
        );
    }

    /**
     * Log activity untuk update operation
     */
    protected function logUpdate($modul, $dataAfter, $dataBefore, $keterangan = null)
    {
        TtDataLogAktivitas::logActivity(
            Auth::id(),
            'update',
            $modul,
            $dataAfter,
            $dataBefore,
            $keterangan ?? "Mengupdate data di {$modul}"
        );
    }

    /**
     * Log activity untuk delete operation
     */
    protected function logDelete($modul, $data, $keterangan = null)
    {
        TtDataLogAktivitas::logActivity(
            Auth::id(),
            'delete',
            $modul,
            null,
            $data,
            $keterangan ?? "Menghapus data di {$modul}"
        );
    }

    /**
     * Log activity untuk view operation
     */
    protected function logView($modul, $data = null, $keterangan = null)
    {
        TtDataLogAktivitas::logActivity(
            Auth::id(),
            'view',
            $modul,
            $data,
            null,
            $keterangan ?? "Melihat data di {$modul}"
        );
    }

    /**
     * Log activity untuk export operation
     */
    protected function logExport($modul, $data = null, $keterangan = null)
    {
        TtDataLogAktivitas::logActivity(
            Auth::id(),
            'export',
            $modul,
            $data,
            null,
            $keterangan ?? "Mengekspor data dari {$modul}"
        );
    }

    /**
     * Log activity untuk toggle status operation
     */
    protected function logToggleStatus($modul, $dataAfter, $dataBefore, $keterangan = null)
    {
        $newStatus = $dataAfter['status'] ?? $dataAfter['status_mesin'] ?? 'unknown';
        $oldStatus = $dataBefore['status'] ?? $dataBefore['status_mesin'] ?? 'unknown';
        
        TtDataLogAktivitas::logActivity(
            Auth::id(),
            'update',
            $modul,
            $dataAfter,
            $dataBefore,
            $keterangan ?? "Mengubah status dari {$oldStatus} ke {$newStatus} di {$modul}"
        );
    }

    /**
     * Log login activity
     */
    public static function logLogin($userId, $keterangan = 'Login berhasil')
    {
        TtDataLogAktivitas::logActivity(
            $userId,
            'login',
            'auth',
            null,
            null,
            $keterangan
        );
    }

    /**
     * Log logout activity
     */
    public static function logLogout($userId, $keterangan = 'Logout berhasil')
    {
        TtDataLogAktivitas::logActivity(
            $userId,
            'logout',
            'auth',
            null,
            null,
            $keterangan
        );
    }

    /**
     * Log failed login activity
     */
    public static function logLoginFailed($email, $keterangan = 'Login gagal')
    {
        TtDataLogAktivitas::create([
            'user_id' => null, // Karena login gagal, user_id tidak ada
            'aktivitas' => 'login_failed',
            'modul' => 'auth',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'data_before' => null,
            'data_after' => ['email' => $email],
            'keterangan' => $keterangan,
            'created_at' => now(),
        ]);
    }

    /**
     * Log custom activity
     */
    protected function logCustomActivity($aktivitas, $modul, $dataAfter = null, $dataBefore = null, $keterangan = null)
    {
        TtDataLogAktivitas::logActivity(
            Auth::id(),
            $aktivitas,
            $modul,
            $dataAfter,
            $dataBefore,
            $keterangan
        );
    }
}
