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
        Schema::create('tt_data_detail_cutting', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_id')->constrained('tt_data_laporan_cutting')->onDelete('cascade');
            $table->string('pattern_name', 100)->nullable();
            $table->string('ukuran_pattern', 20)->nullable();
            $table->integer('jumlah_potongan')->default(0);
            $table->decimal('panjang_pattern_cm', 8, 2)->nullable();
            $table->decimal('lebar_pattern_cm', 8, 2)->nullable();
            $table->decimal('waste_percentage', 5, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            $table->index(['laporan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_detail_cutting');
    }
};
