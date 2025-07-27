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
        Schema::create('tm_data_shift', function (Blueprint $table) {
            $table->id();
            $table->string('nama_shift', 50)->unique();
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->integer('durasi_menit');
            $table->json('break_time')->nullable();
            $table->string('supervisor_default', 100)->nullable();
            $table->enum('status', ['aktif', 'non-aktif'])->default('aktif');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tm_data_shift');
    }
};
