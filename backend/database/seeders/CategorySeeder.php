<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Komputer & Teknologi',
                'slug' => 'komputer-teknologi',
                'description' => 'Buku referensi informatika, rekayasa perangkat lunak, dan kecerdasan buatan.',
                'children' => [
                    ['name' => 'Pemrograman & Software', 'slug' => 'pemrograman-software', 'description' => 'Bahasa pemrograman, arsitektur sistem, dan pengembangan web/mobile.'],
                    ['name' => 'AI & Data Science', 'slug' => 'ai-data-science', 'description' => 'Machine learning, deep learning, statistika komputasi, dan big data.'],
                    ['name' => 'Jaringan & Keamanan Siber', 'slug' => 'jaringan-keamanan', 'description' => 'Infrastruktur cloud, keamanan informasi, dan protokol jaringan.'],
                ],
            ],
            [
                'name' => 'Teknik & Sains',
                'slug' => 'teknik-sains',
                'description' => 'Buku teknik sipil, mesin, elektro, dan ilmu rekayasa terapan.',
                'children' => [
                    ['name' => 'Teknik Sipil & Struktur', 'slug' => 'teknik-sipil', 'description' => 'Perencanaan beton, geoteknik, manajemen konstruksi, dan hidrologi.'],
                    ['name' => 'Teknik Mesin & Manufaktur', 'slug' => 'teknik-mesin', 'description' => 'Termodinamika, mekanika fluida, mekatronika, dan perancangan elemen mesin.'],
                    ['name' => 'Teknik Elektro & Energi', 'slug' => 'teknik-elektro', 'description' => 'Elektronika daya, sistem kendali, dan energi baru terbarukan.'],
                ],
            ],
            [
                'name' => 'Kedokteran & Kesehatan',
                'slug' => 'kedokteran-kesehatan',
                'description' => 'Literatur medis, keperawatan, farmasi, dan kesehatan masyarakat.',
                'children' => [
                    ['name' => 'Keperawatan & Kebidanan', 'slug' => 'keperawatan-kebidanan', 'description' => 'Asuhan keperawatan kritis, komunitas, dan manajemen kebidanan praktis.'],
                    ['name' => 'Farmasi & Terapi Obat', 'slug' => 'farmasi', 'description' => 'Kimia farmasi, farmakologi klinik, dan formulasi sediaan obat.'],
                    ['name' => 'Kesehatan Masyarakat', 'slug' => 'kesehatan-masyarakat', 'description' => 'Epidemiologi, administrasi kebijakan kesehatan, dan gizi masyarakat.'],
                ],
            ],
            [
                'name' => 'Ekonomi & Bisnis',
                'slug' => 'ekonomi-bisnis',
                'description' => 'Kajian manajemen, akuntansi, pemasaran, dan kewirausahaan.',
                'children' => [
                    ['name' => 'Manajemen & Kepemimpinan', 'slug' => 'manajemen-kepemimpinan', 'description' => 'Manajemen strategik, perilaku organisasi, dan operasional bisnis.'],
                    ['name' => 'Akuntansi & Perpajakan', 'slug' => 'akuntansi-perpajakan', 'description' => 'Standar akuntansi keuangan, audit, dan tata kelola perpajakan modern.'],
                    ['name' => 'Kewirausahaan & UMKM', 'slug' => 'kewirausahaan-umkm', 'description' => 'Model bisnis kanvas, digital marketing, dan inkubasi usaha rintisan.'],
                ],
            ],
            [
                'name' => 'Hukum & Sosial',
                'slug' => 'hukum-sosial',
                'description' => 'Analisis hukum perdata, pidana, tata negara, dan dinamika sosial.',
                'children' => [
                    ['name' => 'Hukum Perdata & Bisnis', 'slug' => 'hukum-perdata-bisnis', 'description' => 'Hukum kontrak, kepailitan, hak kekayaan intelektual, dan ketenagakerjaan.'],
                    ['name' => 'Hukum Pidana & Kriminologi', 'slug' => 'hukum-pidana', 'description' => 'Sistem peradilan pidana, tindak pidana korupsi, dan hukum acara.'],
                ],
            ],
            [
                'name' => 'Pendidikan & Humaniora',
                'slug' => 'pendidikan-humaniora',
                'description' => 'Metodologi pembelajaran, filsafat, psikologi pendidikan, dan sastra.',
                'children' => [
                    ['name' => 'Metodologi Penelitian & Evaluasi', 'slug' => 'metodologi-penelitian', 'description' => 'Penelitian kuantitatif, kualitatif, mixed methods, dan evaluasi pembelajaran.'],
                ],
            ],
        ];

        foreach ($categories as $parentData) {
            $children = $parentData['children'] ?? [];
            unset($parentData['children']);

            $parent = Category::create($parentData);

            foreach ($children as $childData) {
                $childData['parent_id'] = $parent->id;
                Category::create($childData);
            }
        }
    }
}
