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
        Schema::table('tt_data_log_aktivitas', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['user_id']);
            // Make user_id nullable
            $table->foreignId('user_id')->nullable()->change();
            // Add foreign key constraint back with nullable
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tt_data_log_aktivitas', function (Blueprint $table) {
            // Drop foreign key constraint
            $table->dropForeign(['user_id']);
            // Make user_id not nullable again
            $table->foreignId('user_id')->change();
            // Add foreign key constraint back
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
