<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tm_data_jenis_kain', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kain', 20)->unique();
            $table->string('nama_kain', 100);
            $table->string('kategori', 50)->nullable();
            $table->decimal('gramasi', 8, 2)->nullable();
            $table->decimal('lebar_standar', 8, 2)->nullable();
            $table->json('warna_tersedia')->nullable();
            $table->string('supplier', 100)->nullable();
            $table->decimal('harga_per_meter', 10, 2)->nullable();
            $table->enum('status', ['aktif', 'non-aktif'])->default('aktif');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            $table->index(['status']);
            $table->index(['kode_kain']);
            $table->index(['kategori']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tm_data_jenis_kain');
    }
};
