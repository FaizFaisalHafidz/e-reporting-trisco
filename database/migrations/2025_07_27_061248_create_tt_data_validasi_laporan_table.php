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
        Schema::create('tt_data_validasi_laporan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_id')->constrained('tt_data_laporan_cutting')->onDelete('cascade');
            $table->foreignId('validator_id')->constrained('users')->onDelete('restrict');
            $table->enum('status_validasi', ['approved', 'rejected', 'need_revision']);
            $table->text('catatan_validasi')->nullable();
            $table->datetime('tanggal_validasi');
            $table->json('revisi_diminta')->nullable();
            $table->timestamps();
            
            $table->index(['laporan_id']);
            $table->index(['validator_id']);
            $table->index(['status_validasi']);
            $table->index(['tanggal_validasi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_validasi_laporan');
    }
};
