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
        Schema::create('tt_data_laporan_cutting', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_laporan', 30)->unique();
            $table->date('tanggal_laporan');
            $table->foreignId('shift_id')->constrained('tm_data_shift')->onDelete('restrict');
            $table->foreignId('mesin_id')->constrained('tm_data_mesin_cutting')->onDelete('restrict');
            $table->foreignId('jenis_kain_id')->constrained('tm_data_jenis_kain')->onDelete('restrict');
            $table->foreignId('operator_id')->constrained('users')->onDelete('restrict');
            $table->integer('jumlah_layer');
            $table->decimal('panjang_kain_meter', 10, 2);
            $table->decimal('lebar_kain_cm', 8, 2)->nullable();
            $table->decimal('total_yard', 10, 2)->nullable();
            $table->datetime('waktu_mulai_cutting')->nullable();
            $table->datetime('waktu_selesai_cutting')->nullable();
            $table->integer('durasi_menit')->nullable();
            $table->enum('kualitas_hasil', ['baik', 'cukup', 'kurang'])->default('baik');
            $table->text('catatan_operator')->nullable();
            $table->json('foto_hasil')->nullable();
            $table->enum('status_laporan', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['tanggal_laporan']);
            $table->index(['status_laporan']);
            $table->index(['operator_id']);
            $table->index(['tanggal_laporan', 'shift_id', 'mesin_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_laporan_cutting');
    }
};
