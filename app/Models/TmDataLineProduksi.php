<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataLineProduksi extends Model
{
    use HasFactory;

    protected $table = 'tm_data_line_produksi';

    protected $fillable = [
        'kode_line',
        'nama_line',
        'deskripsi',
        'kapasitas_harian_yard',
        'supervisor_default',
        'mesin_ids',
        'status',
    ];

    protected $casts = [
        'mesin_ids' => 'array',
    ];

    // Relationship
    public function laporanCutting(): HasMany
    {
        return $this->hasMany(TtDataLaporanCutting::class, 'line_produksi_id');
    }

    // Scope
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    // Accessors
    public function getStatusBadgeColorAttribute()
    {
        return match($this->status) {
            'aktif' => 'success',
            'maintenance' => 'warning',
            'non_aktif' => 'secondary',
            default => 'dark'
        };
    }
}
