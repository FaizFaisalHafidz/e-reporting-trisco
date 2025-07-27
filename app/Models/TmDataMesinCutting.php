<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataMesinCutting extends Model
{
    use HasFactory;

    protected $table = 'tm_data_mesin_cutting';

    protected $fillable = [
        'kode_mesin',
        'nama_mesin',
        'tipe_mesin',
        'kapasitas_layer',
        'status_mesin',
        'lokasi_mesin',
        'lokasi',
        'tanggal_instalasi',
        'spesifikasi',
        'kapasitas_harian',
    ];

    protected $casts = [
        'tanggal_instalasi' => 'date',
    ];

    // Relationship dengan laporan cutting
    public function laporanCutting(): HasMany
    {
        return $this->hasMany(TtDataLaporanCutting::class, 'mesin_id');
    }

    // Scope untuk mesin aktif
    public function scopeAktif($query)
    {
        return $query->where('status_mesin', 'aktif');
    }

    // Scope untuk mesin yang bisa digunakan (aktif + maintenance)
    public function scopeTersedia($query)
    {
        return $query->whereIn('status_mesin', ['aktif', 'maintenance']);
    }

    // Accessor untuk status badge color
    public function getStatusBadgeColorAttribute()
    {
        return match($this->status_mesin) {
            'aktif' => 'success',
            'maintenance' => 'warning',
            'rusak' => 'danger',
            default => 'secondary'
        };
    }
}
