<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan field spesifik untuk kebutuhan PT Trisco
     */
    public function up(): void
    {
        // 1. Tambahan field untuk laporan cutting utama
        Schema::table('tt_data_laporan_cutting', function (Blueprint $table) {
            // Identifikasi order/batch
            $table->string('nomor_order', 50)->nullable()->after('nomor_laporan');
            $table->string('batch_number', 50)->nullable()->after('nomor_order');
            
            // Target vs aktual
            $table->decimal('target_yard', 10, 2)->nullable()->after('total_yard');
            $table->decimal('selisih_yard', 10, 2)->nullable()->after('target_yard');
            $table->decimal('efisiensi_cutting', 5, 2)->nullable()->after('selisih_yard'); // %
            
            // Kualitas lebih detail
            $table->integer('jumlah_defect')->default(0)->after('kualitas_hasil');
            $table->json('jenis_defect')->nullable()->after('jumlah_defect'); // [cacat_potong, sobek, dll]
            
            // Maintenance tracking
            $table->enum('kondisi_mesin', ['baik', 'perlu_maintenance', 'rusak'])->default('baik')->after('mesin_id');
            $table->text('catatan_maintenance')->nullable()->after('kondisi_mesin');
            
            // Environmental factors
            $table->decimal('suhu_ruangan', 4, 1)->nullable()->after('catatan_maintenance'); // °C
            $table->decimal('kelembaban', 4, 1)->nullable()->after('suhu_ruangan'); // %
            
            // Cost tracking
            $table->decimal('biaya_bahan', 12, 2)->nullable()->after('kelembaban');
            $table->decimal('biaya_operasional', 12, 2)->nullable()->after('biaya_bahan');
            
            $table->index(['nomor_order']);
            $table->index(['batch_number']);
            $table->index(['kondisi_mesin']);
        });
        
        // 2. Tabel tracking downtime mesin
        Schema::create('tt_data_mesin_downtime', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mesin_id')->constrained('tm_data_mesin_cutting')->onDelete('cascade');
            $table->foreignId('laporan_id')->nullable()->constrained('tt_data_laporan_cutting')->onDelete('set null');
            $table->datetime('waktu_mulai_downtime');
            $table->datetime('waktu_selesai_downtime')->nullable();
            $table->integer('durasi_downtime_menit')->nullable();
            $table->enum('jenis_downtime', [
                'maintenance_terjadwal',
                'maintenance_mendadak', 
                'kerusakan',
                'setup_mesin',
                'ganti_mata_pisau',
                'istirahat',
                'lainnya'
            ]);
            $table->text('deskripsi_masalah')->nullable();
            $table->string('teknisi_penanganan', 100)->nullable();
            $table->decimal('biaya_perbaikan', 12, 2)->nullable();
            $table->timestamps();
            
            $table->index(['mesin_id', 'waktu_mulai_downtime']);
            $table->index(['jenis_downtime']);
        });
        
        // 3. Tabel tracking material waste
        Schema::create('tt_data_material_waste', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_id')->constrained('tt_data_laporan_cutting')->onDelete('cascade');
            $table->enum('jenis_waste', [
                'sisa_kain_normal',
                'cacat_potong', 
                'sobek_material',
                'salah_ukuran',
                'noda_kain',
                'lainnya'
            ]);
            $table->decimal('jumlah_waste_meter', 8, 2);
            $table->decimal('estimasi_nilai_kerugian', 12, 2)->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            $table->index(['laporan_id']);
            $table->index(['jenis_waste']);
        });
        
        // 4. Tabel performance metrics
        Schema::create('tt_data_performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_id')->constrained('tt_data_laporan_cutting')->onDelete('cascade');
            $table->decimal('oee_percentage', 5, 2)->nullable(); // Overall Equipment Effectiveness
            $table->decimal('availability_percentage', 5, 2)->nullable();
            $table->decimal('performance_percentage', 5, 2)->nullable();
            $table->decimal('quality_percentage', 5, 2)->nullable();
            $table->decimal('throughput_yard_per_jam', 8, 2)->nullable();
            $table->timestamps();
            
            $table->index(['laporan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_performance_metrics');
        Schema::dropIfExists('tt_data_material_waste');
        Schema::dropIfExists('tt_data_mesin_downtime');
        
        Schema::table('tt_data_laporan_cutting', function (Blueprint $table) {
            $table->dropColumn([
                'nomor_order',
                'batch_number',
                'target_yard',
                'selisih_yard',
                'efisiensi_cutting',
                'jumlah_defect',
                'jenis_defect',
                'kondisi_mesin',
                'catatan_maintenance',
                'suhu_ruangan',
                'kelembaban',
                'biaya_bahan',
                'biaya_operasional'
            ]);
        });
    }
};
