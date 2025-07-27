<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataPattern extends Model
{
    use HasFactory;

    protected $table = 'tm_data_pattern';

    protected $fillable = [
        'kode_pattern',
        'nama_pattern',
        'kategori_produk',
        'size_range',
        'panjang_pattern_cm',
        'lebar_pattern_cm',
        'fabric_consumption_yard',
        'size_breakdown',
        'instruksi_cutting',
        'difficulty_level',
        'status',
    ];

    protected $casts = [
        'panjang_pattern_cm' => 'decimal:2',
        'lebar_pattern_cm' => 'decimal:2',
        'fabric_consumption_yard' => 'decimal:3',
        'size_breakdown' => 'array',
    ];

    // Relationship
    public function laporanCutting(): HasMany
    {
        return $this->hasMany(TtDataLaporanCutting::class, 'pattern_id');
    }

    // Scope
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    public function scopeByKategori($query, $kategori)
    {
        return $query->where('kategori_produk', $kategori);
    }

    // Accessors
    public function getStatusBadgeColorAttribute()
    {
        return match($this->status) {
            'aktif' => 'success',
            'archived' => 'warning',
            'non_aktif' => 'secondary',
            default => 'dark'
        };
    }

    public function getDifficultyBadgeColorAttribute()
    {
        return match($this->difficulty_level) {
            'easy' => 'success',
            'medium' => 'warning',
            'hard' => 'danger',
            default => 'secondary'
        };
    }
}
