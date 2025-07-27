<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambah master data untuk line produksi dan customer
     */
    public function up(): void
    {
        // 1. Master data line produksi
        Schema::create('tm_data_line_produksi', function (Blueprint $table) {
            $table->id();
            $table->string('kode_line', 20)->unique();
            $table->string('nama_line', 100);
            $table->text('deskripsi')->nullable();
            $table->integer('kapasitas_harian_yard')->default(0);
            $table->string('supervisor_default', 100)->nullable();
            $table->json('mesin_ids')->nullable(); // Array ID mesin yang ada di line ini
            $table->enum('status', ['aktif', 'non_aktif', 'maintenance'])->default('aktif');
            $table->timestamps();
            
            $table->index(['status']);
        });
        
        // 2. Master data customer/buyer
        Schema::create('tm_data_customer', function (Blueprint $table) {
            $table->id();
            $table->string('kode_customer', 20)->unique();
            $table->string('nama_customer', 100);
            $table->string('negara', 50)->nullable();
            $table->text('alamat')->nullable();
            $table->string('contact_person', 100)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->json('spesifikasi_khusus')->nullable(); // Requirements khusus customer
            $table->enum('status', ['aktif', 'non_aktif'])->default('aktif');
            $table->timestamps();
            
            $table->index(['status']);
        });
        
        // 3. Master data pattern/model
        Schema::create('tm_data_pattern', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pattern', 30)->unique();
            $table->string('nama_pattern', 100);
            $table->string('kategori_produk', 50)->nullable(); // Shirt, Pants, Dress, dll
            $table->string('size_range', 50)->nullable(); // S-XL, 28-34, dll  
            $table->decimal('panjang_pattern_cm', 8, 2)->nullable();
            $table->decimal('lebar_pattern_cm', 8, 2)->nullable();
            $table->decimal('fabric_consumption_yard', 8, 3)->nullable(); // Konsumsi kain per piece
            $table->json('size_breakdown')->nullable(); // Detail size dan jumlah
            $table->text('instruksi_cutting')->nullable();
            $table->string('difficulty_level', 20)->default('medium'); // easy, medium, hard
            $table->enum('status', ['aktif', 'non_aktif', 'archived'])->default('aktif');
            $table->timestamps();
            
            $table->index(['kategori_produk']);
            $table->index(['status']);
        });
        
        // 4. Update tabel laporan cutting untuk menambah relasi
        Schema::table('tt_data_laporan_cutting', function (Blueprint $table) {
            $table->foreignId('line_produksi_id')->nullable()->after('mesin_id')
                  ->constrained('tm_data_line_produksi')->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->after('line_produksi_id')
                  ->constrained('tm_data_customer')->onDelete('set null');
            $table->foreignId('pattern_id')->nullable()->after('customer_id')
                  ->constrained('tm_data_pattern')->onDelete('set null');
            
            // Produksi planning
            $table->integer('target_quantity_pcs')->nullable()->after('pattern_id');
            $table->integer('actual_quantity_pcs')->nullable()->after('target_quantity_pcs');
            $table->decimal('fabric_utilization_percentage', 5, 2)->nullable()->after('actual_quantity_pcs');
        });
        
        // 5. Detail cutting yang lebih spesifik untuk garment
        Schema::table('tt_data_detail_cutting', function (Blueprint $table) {
            $table->string('size', 10)->nullable()->after('pattern_name'); // S, M, L, XL
            $table->string('color', 30)->nullable()->after('size');
            $table->integer('quantity_per_size')->default(0)->after('color');
            $table->decimal('marker_efficiency', 5, 2)->nullable()->after('quantity_per_size'); // %
            $table->enum('cutting_method', ['manual', 'mesin_potong', 'laser_cut'])->default('mesin_potong')->after('marker_efficiency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tt_data_detail_cutting', function (Blueprint $table) {
            $table->dropColumn(['size', 'color', 'quantity_per_size', 'marker_efficiency', 'cutting_method']);
        });
        
        Schema::table('tt_data_laporan_cutting', function (Blueprint $table) {
            $table->dropForeign(['line_produksi_id']);
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['pattern_id']);
            $table->dropColumn(['line_produksi_id', 'customer_id', 'pattern_id', 'target_quantity_pcs', 'actual_quantity_pcs', 'fabric_utilization_percentage']);
        });
        
        Schema::dropIfExists('tm_data_pattern');
        Schema::dropIfExists('tm_data_customer');
        Schema::dropIfExists('tm_data_line_produksi');
    }
};
