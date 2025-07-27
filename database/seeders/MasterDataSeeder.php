<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed tm_data_mesin_cutting
        DB::table('tm_data_mesin_cutting')->insert([
            [
                'nama_mesin' => 'Mesin Cutting A1',
                'kode_mesin' => 'MC-A001',
                'lokasi' => 'Lantai 1 Area A',
                'status_mesin' => 'aktif',
                'kapasitas_harian' => 150.0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_mesin' => 'Mesin Cutting A2',
                'kode_mesin' => 'MC-A002',
                'lokasi' => 'Lantai 1 Area A',
                'status_mesin' => 'aktif',
                'kapasitas_harian' => 140.0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_mesin' => 'Mesin Cutting B1',
                'kode_mesin' => 'MC-B001',
                'lokasi' => 'Lantai 1 Area B',
                'status_mesin' => 'maintenance',
                'kapasitas_harian' => 160.0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_mesin' => 'Mesin Cutting B2',
                'kode_mesin' => 'MC-B002',
                'lokasi' => 'Lantai 1 Area B',
                'status_mesin' => 'aktif',
                'kapasitas_harian' => 155.0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_mesin' => 'Mesin Cutting C1',
                'kode_mesin' => 'MC-C001',
                'lokasi' => 'Lantai 2 Area C',
                'status_mesin' => 'rusak',
                'kapasitas_harian' => 120.0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed tm_data_shift
        DB::table('tm_data_shift')->insert([
            [
                'nama_shift' => 'Shift 1',
                'jam_mulai' => '07:00:00',
                'jam_selesai' => '15:00:00',
                'durasi_menit' => 480,
                'break_time' => json_encode([
                    ['mulai' => '09:00:00', 'selesai' => '09:15:00', 'jenis' => 'Istirahat Pagi'],
                    ['mulai' => '12:00:00', 'selesai' => '13:00:00', 'jenis' => 'Istirahat Siang']
                ]),
                'supervisor_default' => 'Supervisor A',
                'status' => 'aktif',
                'keterangan' => 'Shift pagi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_shift' => 'Shift 2',
                'jam_mulai' => '15:00:00',
                'jam_selesai' => '23:00:00',
                'durasi_menit' => 480,
                'break_time' => json_encode([
                    ['mulai' => '17:00:00', 'selesai' => '17:15:00', 'jenis' => 'Istirahat Sore'],
                    ['mulai' => '19:00:00', 'selesai' => '20:00:00', 'jenis' => 'Istirahat Malam']
                ]),
                'supervisor_default' => 'Supervisor B',
                'status' => 'aktif',
                'keterangan' => 'Shift sore',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_shift' => 'Shift 3',
                'jam_mulai' => '23:00:00',
                'jam_selesai' => '07:00:00',
                'durasi_menit' => 480,
                'break_time' => json_encode([
                    ['mulai' => '01:00:00', 'selesai' => '01:15:00', 'jenis' => 'Istirahat Malam'],
                    ['mulai' => '04:00:00', 'selesai' => '05:00:00', 'jenis' => 'Istirahat Dini Hari']
                ]),
                'supervisor_default' => 'Supervisor C',
                'status' => 'aktif',
                'keterangan' => 'Shift malam',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed tm_data_mesin_cutting
        DB::table('tm_data_mesin_cutting')->insert([
            [
                'kode_mesin' => 'MC001',
                'nama_mesin' => 'Mesin Cutting A',
                'tipe_mesin' => 'Automatic Cutting Machine',
                'kapasitas_layer' => 50,
                'status_mesin' => 'aktif',
                'lokasi' => 'Area Cutting A',
                'tanggal_instalasi' => '2023-01-15',
                'spesifikasi' => 'Kapasitas 50 layer, automatic feeding, digital control',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_mesin' => 'MC002',
                'nama_mesin' => 'Mesin Cutting B',
                'tipe_mesin' => 'Semi-Automatic Cutting Machine',
                'kapasitas_layer' => 30,
                'status_mesin' => 'aktif',
                'lokasi' => 'Area Cutting B',
                'tanggal_instalasi' => '2023-03-20',
                'spesifikasi' => 'Kapasitas 30 layer, semi-automatic, manual feeding',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_mesin' => 'MC003',
                'nama_mesin' => 'Mesin Cutting C',
                'tipe_mesin' => 'Manual Cutting Machine',
                'kapasitas_layer' => 20,
                'status_mesin' => 'maintenance',
                'lokasi' => 'Area Cutting C',
                'tanggal_instalasi' => '2022-08-10',
                'spesifikasi' => 'Kapasitas 20 layer, manual operation',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed tm_data_jenis_kain
        DB::table('tm_data_jenis_kain')->insert([
            [
                'kode_kain' => 'CTN001',
                'nama_kain' => 'Cotton Combed 30s',
                'kategori' => 'Cotton',
                'gramasi' => 160.00,
                'lebar_standar' => 150.00,
                'warna_tersedia' => json_encode(['Putih', 'Hitam', 'Navy', 'Abu-abu', 'Merah']),
                'supplier' => 'PT Textile Indonesia',
                'harga_per_meter' => 25000.00,
                'status' => 'aktif',
                'keterangan' => 'Kain cotton premium untuk kaos',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_kain' => 'PLS001',
                'nama_kain' => 'Polyester TC',
                'kategori' => 'Polyester',
                'gramasi' => 140.00,
                'lebar_standar' => 160.00,
                'warna_tersedia' => json_encode(['Putih', 'Hitam', 'Biru', 'Hijau']),
                'supplier' => 'PT Synthetic Fabric',
                'harga_per_meter' => 18000.00,
                'status' => 'aktif',
                'keterangan' => 'Kain polyester untuk seragam',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_kain' => 'DNM001',
                'nama_kain' => 'Denim 12oz',
                'kategori' => 'Denim',
                'gramasi' => 340.00,
                'lebar_standar' => 140.00,
                'warna_tersedia' => json_encode(['Indigo', 'Black', 'Blue Wash']),
                'supplier' => 'PT Denim Works',
                'harga_per_meter' => 45000.00,
                'status' => 'aktif',
                'keterangan' => 'Kain denim untuk jeans',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_kain' => 'SLK001',
                'nama_kain' => 'Silk Premium',
                'kategori' => 'Silk',
                'gramasi' => 120.00,
                'lebar_standar' => 110.00,
                'warna_tersedia' => json_encode(['Putih', 'Cream', 'Gold', 'Silver']),
                'supplier' => 'PT Luxury Textile',
                'harga_per_meter' => 85000.00,
                'status' => 'aktif',
                'keterangan' => 'Kain sutra premium',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
