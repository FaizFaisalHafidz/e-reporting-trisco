<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataJenisKain extends Model
{
    use HasFactory;

    protected $table = 'tm_data_jenis_kain';

    protected $fillable = [
        'kode_kain',
        'nama_kain',
        'kategori',
        'gramasi',
        'lebar_standar',
        'warna_tersedia',
        'supplier',
        'harga_per_meter',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'warna_tersedia' => 'array',
        'gramasi' => 'decimal:2',
        'lebar_standar' => 'decimal:2',
        'harga_per_meter' => 'decimal:2',
    ];

    // Relationship dengan laporan cutting
    public function laporanCutting(): HasMany
    {
        return $this->hasMany(TtDataLaporanCutting::class, 'jenis_kain_id');
    }

    // Scope untuk kain aktif
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    // Scope berdasarkan kategori
    public function scopeByKategori($query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    // Accessor untuk format harga
    public function getFormattedHargaAttribute()
    {
        return 'Rp ' . number_format($this->harga_per_meter, 0, ',', '.');
    }

    // Accessor untuk total warna tersedia
    public function getTotalWarnaAttribute()
    {
        return count($this->warna_tersedia ?? []);
    }
}
