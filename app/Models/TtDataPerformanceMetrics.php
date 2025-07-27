<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TtDataPerformanceMetrics extends Model
{
    use HasFactory;

    protected $table = 'tt_data_performance_metrics';

    protected $fillable = [
        'laporan_id',
        'oee_percentage',
        'availability_percentage',
        'performance_percentage',
        'quality_percentage',
        'throughput_yard_per_jam',
    ];

    protected $casts = [
        'oee_percentage' => 'decimal:2',
        'availability_percentage' => 'decimal:2',
        'performance_percentage' => 'decimal:2',
        'quality_percentage' => 'decimal:2',
        'throughput_yard_per_jam' => 'decimal:2',
    ];

    // Relationships
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(TtDataLaporanCutting::class, 'laporan_id');
    }

    // Accessors
    public function getOeeBadgeColorAttribute()
    {
        if ($this->oee_percentage >= 85) return 'success';
        if ($this->oee_percentage >= 70) return 'warning';
        return 'danger';
    }

    public function getPerformanceRatingAttribute()
    {
        if ($this->oee_percentage >= 85) return 'Excellent';
        if ($this->oee_percentage >= 70) return 'Good';
        if ($this->oee_percentage >= 50) return 'Fair';
        return 'Poor';
    }
}
