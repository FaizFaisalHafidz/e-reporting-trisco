<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TtDataDetailCutting extends Model
{
    use HasFactory;

    protected $table = 'tt_data_detail_cutting';

    protected $fillable = [
        'laporan_id',
        'pattern_name',
        'ukuran_pattern',
        'jumlah_potongan',
        'panjang_pattern_cm',
        'lebar_pattern_cm',
        'waste_percentage',
        'keterangan',
    ];

    protected $casts = [
        'panjang_pattern_cm' => 'decimal:2',
        'lebar_pattern_cm' => 'decimal:2',
        'waste_percentage' => 'decimal:2',
    ];

    // Relationships
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(TtDataLaporanCutting::class, 'laporan_id');
    }

    // Accessors
    public function getTotalLuasPatternAttribute()
    {
        return ($this->panjang_pattern_cm * $this->lebar_pattern_cm) / 10000; // Convert to m²
    }

    public function getTotalLuasSemuaPatternAttribute()
    {
        return $this->total_luas_pattern * $this->jumlah_potongan;
    }

    public function getFormattedWastePercentageAttribute()
    {
        return $this->waste_percentage . '%';
    }
}
