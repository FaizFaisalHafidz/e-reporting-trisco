<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TtDataLogAktivitas extends Model
{
    use HasFactory;

    protected $table = 'tt_data_log_aktivitas';

    // Disable updated_at karena ini log table
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'aktivitas',
        'modul',
        'ip_address',
        'user_agent',
        'data_before',
        'data_after',
        'keterangan',
    ];

    protected $casts = [
        'data_before' => 'array',
        'data_after' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault([
            'name' => 'System',
            'email' => 'system@localhost'
        ]);
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByModul($query, $modul)
    {
        return $query->where('modul', $modul);
    }

    public function scopeByAktivitas($query, $aktivitas)
    {
        return $query->where('aktivitas', $aktivitas);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at?->format('d/m/Y H:i:s');
    }

    // Static methods untuk logging
    public static function logActivity($userId, $aktivitas, $modul, $dataAfter = null, $dataBefore = null, $keterangan = null)
    {
        return static::create([
            'user_id' => $userId,
            'aktivitas' => $aktivitas,
            'modul' => $modul,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'data_before' => $dataBefore,
            'data_after' => $dataAfter,
            'keterangan' => $keterangan,
        ]);
    }
}
