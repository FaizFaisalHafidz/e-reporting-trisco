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
        Schema::table('tm_data_mesin_cutting', function (Blueprint $table) {
            $table->decimal('kapasitas_harian', 8, 2)->nullable()->after('status_mesin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tm_data_mesin_cutting', function (Blueprint $table) {
            $table->dropColumn('kapasitas_harian');
        });
    }
};
