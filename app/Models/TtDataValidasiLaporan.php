<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TtDataValidasiLaporan extends Model
{
    use HasFactory;

    protected $table = 'tt_data_validasi_laporan';

    protected $fillable = [
        'laporan_id',
        'validator_id',
        'status_validasi',
        'catatan_validasi',
        'tanggal_validasi',
        'revisi_diminta',
    ];

    protected $casts = [
        'tanggal_validasi' => 'datetime',
        'revisi_diminta' => 'array',
    ];

    // Relationships
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(TtDataLaporanCutting::class, 'laporan_id');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validator_id');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status_validasi', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status_validasi', 'rejected');
    }

    public function scopeNeedRevision($query)
    {
        return $query->where('status_validasi', 'need_revision');
    }

    public function scopeByValidator($query, $validatorId)
    {
        return $query->where('validator_id', $validatorId);
    }

    // Accessors
    public function getStatusBadgeColorAttribute()
    {
        return match($this->status_validasi) {
            'approved' => 'success',
            'rejected' => 'danger',
            'need_revision' => 'warning',
            default => 'secondary'
        };
    }

    public function getFormattedTanggalValidasiAttribute()
    {
        return $this->tanggal_validasi?->format('d/m/Y H:i');
    }
}
