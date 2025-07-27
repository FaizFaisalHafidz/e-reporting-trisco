<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TtDataMaterialWaste extends Model
{
    use HasFactory;

    protected $table = 'tt_data_material_waste';

    protected $fillable = [
        'laporan_id',
        'jenis_waste',
        'jumlah_waste_meter',
        'estimasi_nilai_kerugian',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_waste_meter' => 'decimal:2',
        'estimasi_nilai_kerugian' => 'decimal:2',
    ];

    // Relationships
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(TtDataLaporanCutting::class, 'laporan_id');
    }

    // Accessors
    public function getJenisWasteBadgeColorAttribute()
    {
        return match($this->jenis_waste) {
            'sisa_kain_normal' => 'secondary',
            'cacat_potong' => 'warning',
            'sobek_material' => 'danger',
            'salah_ukuran' => 'warning',
            'noda_kain' => 'danger',
            default => 'dark'
        };
    }

    // Scope
    public function scopeByJenis($query, $jenis)
    {
        return $query->where('jenis_waste', $jenis);
    }
}
