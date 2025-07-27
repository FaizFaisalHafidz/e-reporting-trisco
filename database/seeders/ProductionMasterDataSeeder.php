<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TmDataLineProduksi;
use App\Models\TmDataCustomer;
use App\Models\TmDataPattern;

class ProductionMasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Line Produksi
        $lines = [
            [
                'kode_line' => 'LINE-A01',
                'nama_line' => 'Line Cutting A1',
                'deskripsi' => 'Line cutting untuk produk garment basic',
                'kapasitas_harian_yard' => 1500,
                'supervisor_default' => 'Budi Santoso',
                'mesin_ids' => [1, 2, 3],
                'status' => 'aktif',
            ],
            [
                'kode_line' => 'LINE-A02',
                'nama_line' => 'Line Cutting A2',
                'deskripsi' => 'Line cutting untuk produk garment premium',
                'kapasitas_harian_yard' => 1200,
                'supervisor_default' => 'Siti Nurhaliza',
                'mesin_ids' => [4, 5],
                'status' => 'aktif',
            ],
            [
                'kode_line' => 'LINE-B01',
                'nama_line' => 'Line Cutting B1',
                'deskripsi' => 'Line cutting untuk produk khusus export',
                'kapasitas_harian_yard' => 2000,
                'supervisor_default' => 'Ahmad Fauzi',
                'mesin_ids' => [6, 7, 8],
                'status' => 'aktif',
            ],
        ];

        foreach ($lines as $line) {
            TmDataLineProduksi::create($line);
        }

        // 2. Seed Customers
        $customers = [
            [
                'kode_customer' => 'CUST-001',
                'nama_customer' => 'PT Global Fashion Indonesia',
                'negara' => 'Indonesia',
                'alamat' => 'Jl. Industri No. 123, Jakarta Utara',
                'contact_person' => 'John Doe',
                'email' => 'orders@globalfashion.co.id',
                'phone' => '+6221-12345678',
                'spesifikasi_khusus' => [
                    'quality_standard' => 'Premium',
                    'toleransi_ukuran' => '±2mm',
                    'packaging' => 'Individual plastic bag'
                ],
                'status' => 'aktif',
            ],
            [
                'kode_customer' => 'CUST-002',
                'nama_customer' => 'H&M Hennes & Mauritz',
                'negara' => 'Sweden',
                'alamat' => 'Mäster Samuelsgatan 46A, 106 38 Stockholm',
                'contact_person' => 'Anna Larsson',
                'email' => 'supplier.hm@hm.com',
                'phone' => '+46-8-796-5500',
                'spesifikasi_khusus' => [
                    'quality_standard' => 'H&M Standard',
                    'toleransi_ukuran' => '±1.5mm',
                    'packaging' => 'Eco-friendly packaging',
                    'certification' => 'OEKO-TEX Standard 100'
                ],
                'status' => 'aktif',
            ],
            [
                'kode_customer' => 'CUST-003',
                'nama_customer' => 'Uniqlo Indonesia',
                'negara' => 'Japan',
                'alamat' => 'Plaza Indonesia, Jakarta',
                'contact_person' => 'Takeshi Yamamoto',
                'email' => 'procurement@uniqlo.co.jp',
                'phone' => '+81-3-6977-7000',
                'spesifikasi_khusus' => [
                    'quality_standard' => 'Uniqlo Quality',
                    'toleransi_ukuran' => '±1mm',
                    'packaging' => 'Minimalist packaging',
                    'technology' => 'HeatTech compatible'
                ],
                'status' => 'aktif',
            ],
        ];

        foreach ($customers as $customer) {
            TmDataCustomer::create($customer);
        }

        // 3. Seed Patterns
        $patterns = [
            [
                'kode_pattern' => 'PTN-SH001',
                'nama_pattern' => 'Basic T-Shirt Regular Fit',
                'kategori_produk' => 'T-Shirt',
                'size_range' => 'S-XXL',
                'panjang_pattern_cm' => 68.5,
                'lebar_pattern_cm' => 52.0,
                'fabric_consumption_yard' => 0.75,
                'size_breakdown' => [
                    'S' => ['chest' => 96, 'length' => 66],
                    'M' => ['chest' => 101, 'length' => 68],
                    'L' => ['chest' => 106, 'length' => 70],
                    'XL' => ['chest' => 111, 'length' => 72],
                    'XXL' => ['chest' => 116, 'length' => 74]
                ],
                'instruksi_cutting' => 'Cut dengan toleransi +2mm. Perhatikan arah serat kain.',
                'difficulty_level' => 'easy',
                'status' => 'aktif',
            ],
            [
                'kode_pattern' => 'PTN-SH002',
                'nama_pattern' => 'Polo Shirt Classic',
                'kategori_produk' => 'Polo Shirt',
                'size_range' => 'S-XL',
                'panjang_pattern_cm' => 72.0,
                'lebar_pattern_cm' => 54.0,
                'fabric_consumption_yard' => 0.85,
                'size_breakdown' => [
                    'S' => ['chest' => 98, 'length' => 68],
                    'M' => ['chest' => 103, 'length' => 70],
                    'L' => ['chest' => 108, 'length' => 72],
                    'XL' => ['chest' => 113, 'length' => 74]
                ],
                'instruksi_cutting' => 'Hati-hati dengan bagian kerah. Gunakan stabilizer.',
                'difficulty_level' => 'medium',
                'status' => 'aktif',
            ],
            [
                'kode_pattern' => 'PTN-DR001',
                'nama_pattern' => 'Summer Dress A-Line',
                'kategori_produk' => 'Dress',
                'size_range' => 'XS-L',
                'panjang_pattern_cm' => 95.0,
                'lebar_pattern_cm' => 68.0,
                'fabric_consumption_yard' => 1.25,
                'size_breakdown' => [
                    'XS' => ['bust' => 82, 'waist' => 66, 'length' => 92],
                    'S' => ['bust' => 86, 'waist' => 70, 'length' => 94],
                    'M' => ['bust' => 90, 'waist' => 74, 'length' => 96],
                    'L' => ['bust' => 94, 'waist' => 78, 'length' => 98]
                ],
                'instruksi_cutting' => 'Pattern kompleks. Perhatikan notch marks. Cutting bertahap.',
                'difficulty_level' => 'hard',
                'status' => 'aktif',
            ],
            [
                'kode_pattern' => 'PTN-JK001',
                'nama_pattern' => 'Casual Jacket Hoodie',
                'kategori_produk' => 'Jacket',
                'size_range' => 'M-XXL',
                'panjang_pattern_cm' => 85.0,
                'lebar_pattern_cm' => 75.0,
                'fabric_consumption_yard' => 1.45,
                'size_breakdown' => [
                    'M' => ['chest' => 108, 'length' => 82],
                    'L' => ['chest' => 113, 'length' => 84],
                    'XL' => ['chest' => 118, 'length' => 86],
                    'XXL' => ['chest' => 123, 'length' => 88]
                ],
                'instruksi_cutting' => 'Multi-layer cutting. Perhatikan arah zipper dan kantong.',
                'difficulty_level' => 'hard',
                'status' => 'aktif',
            ],
        ];

        foreach ($patterns as $pattern) {
            TmDataPattern::create($pattern);
        }
    }
}
