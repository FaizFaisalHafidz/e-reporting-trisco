<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TtDataLaporanCutting extends Model
{
    use HasFactory;

    protected $table = 'tt_data_laporan_cutting';

    protected $fillable = [
        'nomor_laporan',
        'nomor_order',
        'batch_number',
        'tanggal_laporan',
        'shift_id',
        'mesin_id',
        'kondisi_mesin',
        'catatan_maintenance',
        'line_produksi_id',
        'customer_id',
        'pattern_id',
        'jenis_kain_id',
        'operator_id',
        'target_quantity_pcs',
        'actual_quantity_pcs',
        'jumlah_layer',
        'panjang_kain_meter',
        'lebar_kain_cm',
        'total_yard',
        'target_yard',
        'selisih_yard',
        'efisiensi_cutting',
        'fabric_utilization_percentage',
        'waktu_mulai_cutting',
        'waktu_selesai_cutting',
        'durasi_menit',
        'kualitas_hasil',
        'jumlah_defect',
        'jenis_defect',
        'catatan_operator',
        'foto_hasil',
        'suhu_ruangan',
        'kelembaban',
        'biaya_bahan',
        'biaya_operasional',
        'status_laporan',
    ];

    protected $casts = [
        'tanggal_laporan' => 'date',
        'waktu_mulai_cutting' => 'datetime',
        'waktu_selesai_cutting' => 'datetime',
        'foto_hasil' => 'array',
        'jenis_defect' => 'array',
        'panjang_kain_meter' => 'decimal:2',
        'lebar_kain_cm' => 'decimal:2',
        'total_yard' => 'decimal:2',
        'target_yard' => 'decimal:2',
        'selisih_yard' => 'decimal:2',
        'efisiensi_cutting' => 'decimal:2',
        'fabric_utilization_percentage' => 'decimal:2',
        'suhu_ruangan' => 'decimal:1',
        'kelembaban' => 'decimal:1',
        'biaya_bahan' => 'decimal:2',
        'biaya_operasional' => 'decimal:2',
    ];

    protected $attributes = [
        'target_quantity_pcs' => 0,
        'actual_quantity_pcs' => 0,
        'efisiensi_cutting' => 0,
        'fabric_utilization_percentage' => 0,
        'durasi_menit' => 0,
        'jumlah_defect' => 0,
        'foto_hasil' => '[]',
        'jenis_defect' => '[]',
    ];

    // Relationships
    public function shift(): BelongsTo
    {
        return $this->belongsTo(TmDataShift::class, 'shift_id');
    }

    public function mesin(): BelongsTo
    {
        return $this->belongsTo(TmDataMesinCutting::class, 'mesin_id');
    }

    public function jenisKain(): BelongsTo
    {
        return $this->belongsTo(TmDataJenisKain::class, 'jenis_kain_id');
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function lineProduksi(): BelongsTo
    {
        return $this->belongsTo(TmDataLineProduksi::class, 'line_produksi_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(TmDataCustomer::class, 'customer_id');
    }

    public function pattern(): BelongsTo
    {
        return $this->belongsTo(TmDataPattern::class, 'pattern_id');
    }

    public function validasi(): HasOne
    {
        return $this->hasOne(TtDataValidasiLaporan::class, 'laporan_id');
    }

    public function detailCutting(): HasMany
    {
        return $this->hasMany(TtDataDetailCutting::class, 'laporan_id');
    }

    public function detailCuttings(): HasMany
    {
        return $this->hasMany(TtDataDetailCutting::class, 'laporan_id');
    }

    public function mesinDowntime(): HasMany
    {
        return $this->hasMany(TtDataMesinDowntime::class, 'laporan_id');
    }

    public function materialWaste(): HasMany
    {
        return $this->hasMany(TtDataMaterialWaste::class, 'laporan_id');
    }

    public function performanceMetrics(): HasOne
    {
        return $this->hasOne(TtDataPerformanceMetrics::class, 'laporan_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status_laporan', $status);
    }

    public function scopeByOperator($query, $operatorId)
    {
        return $query->where('operator_id', $operatorId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_laporan', [$startDate, $endDate]);
    }

    public function scopePendingValidation($query)
    {
        return $query->where('status_laporan', 'submitted');
    }

    // Accessors
    public function getStatusBadgeColorAttribute()
    {
        return match($this->status_laporan) {
            'draft' => 'secondary',
            'submitted' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
            default => 'dark'
        };
    }

    public function getDurasiJamAttribute()
    {
        return $this->durasi_menit ? round($this->durasi_menit / 60, 2) : null;
    }

    public function getFormattedNomorLaporanAttribute()
    {
        return strtoupper($this->nomor_laporan);
    }

    // Boot method untuk auto generate nomor laporan
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->nomor_laporan)) {
                $model->nomor_laporan = $model->generateNomorLaporan();
            }
        });
    }

    private function generateNomorLaporan()
    {
        $tanggal = $this->tanggal_laporan ?? now();
        $prefix = 'LC-' . $tanggal->format('Ymd') . '-';
        
        $lastNumber = static::where('nomor_laporan', 'like', $prefix . '%')
            ->max('nomor_laporan');
            
        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }
        
        return $prefix . str_pad($newSequence, 4, '0', STR_PAD_LEFT);
    }
}
