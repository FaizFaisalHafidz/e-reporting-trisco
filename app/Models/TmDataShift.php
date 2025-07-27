<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataShift extends Model
{
    use HasFactory;

    protected $table = 'tm_data_shift';

    protected $fillable = [
        'nama_shift',
        'jam_mulai',
        'jam_selesai',
        'durasi_menit',
        'break_time',
        'supervisor_default',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'break_time' => 'array',
        'jam_mulai' => 'datetime:H:i:s',
        'jam_selesai' => 'datetime:H:i:s',
    ];

    // Relationship dengan laporan cutting
    public function laporanCutting(): HasMany
    {
        return $this->hasMany(TtDataLaporanCutting::class, 'shift_id');
    }

    // Scope untuk shift aktif
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    // Accessor untuk durasi dalam jam
    public function getDurasiJamAttribute()
    {
        return round($this->durasi_menit / 60, 2);
    }
}
