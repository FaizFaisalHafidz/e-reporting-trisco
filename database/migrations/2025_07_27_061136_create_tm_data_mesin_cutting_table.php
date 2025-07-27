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
        Schema::create('tm_data_mesin_cutting', function (Blueprint $table) {
            $table->id();
            $table->string('kode_mesin', 20)->unique();
            $table->string('nama_mesin', 100);
            $table->string('tipe_mesin', 50)->nullable();
            $table->integer('kapasitas_layer')->default(1);
            $table->enum('status_mesin', ['aktif', 'maintenance', 'rusak'])->default('aktif');
            $table->string('lokasi', 100)->nullable();
            $table->date('tanggal_instalasi')->nullable();
            $table->text('spesifikasi')->nullable();
            $table->timestamps();
            
            $table->index(['status_mesin']);
            $table->index(['kode_mesin']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tm_data_mesin_cutting');
    }
};
