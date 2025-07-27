<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TtDataMesinDowntime extends Model
{
    use HasFactory;

    protected $table = 'tt_data_mesin_downtime';

    protected $fillable = [
        'mesin_id',
        'laporan_id',
        'waktu_mulai_downtime',
        'waktu_selesai_downtime',
        'durasi_downtime_menit',
        'jenis_downtime',
        'deskripsi_masalah',
        'teknisi_penanganan',
        'biaya_perbaikan',
    ];

    protected $casts = [
        'waktu_mulai_downtime' => 'datetime',
        'waktu_selesai_downtime' => 'datetime',
        'biaya_perbaikan' => 'decimal:2',
    ];

    // Relationships
    public function mesin(): BelongsTo
    {
        return $this->belongsTo(TmDataMesinCutting::class, 'mesin_id');
    }

    public function laporan(): BelongsTo
    {
        return $this->belongsTo(TtDataLaporanCutting::class, 'laporan_id');
    }

    // Accessors
    public function getJenisDowntimeBadgeColorAttribute()
    {
        return match($this->jenis_downtime) {
            'maintenance_terjadwal' => 'primary',
            'maintenance_mendadak' => 'warning',
            'kerusakan' => 'danger',
            'setup_mesin' => 'info',
            'ganti_mata_pisau' => 'secondary',
            'istirahat' => 'success',
            default => 'dark'
        };
    }

    public function getDurasiJamAttribute()
    {
        return $this->durasi_downtime_menit ? round($this->durasi_downtime_menit / 60, 2) : null;
    }
}
