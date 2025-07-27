<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataCustomer extends Model
{
    use HasFactory;

    protected $table = 'tm_data_customer';

    protected $fillable = [
        'kode_customer',
        'nama_customer',
        'negara',
        'alamat',
        'contact_person',
        'email',
        'phone',
        'spesifikasi_khusus',
        'status',
    ];

    protected $casts = [
        'spesifikasi_khusus' => 'array',
    ];

    // Relationship
    public function laporanCutting(): HasMany
    {
        return $this->hasMany(TtDataLaporanCutting::class, 'customer_id');
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
            'non_aktif' => 'secondary',
            default => 'dark'
        };
    }
}
