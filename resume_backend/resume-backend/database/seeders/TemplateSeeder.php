<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Template;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Modern Resume',
                'description' => 'A clean and modern resume template suitable for software developers and professionals.',
                'slug' => 'modern-resume',
                'preview_url' => null,
                'template_type' => 'modern',
                'is_active' => true,
                'usage_count' => 0,
            ],

            [
                'name' => 'Professional Resume',
                'description' => 'A professional and well-structured resume template for corporate and professional roles.',
                'slug' => 'professional-resume',
                'preview_url' => null,
                'template_type' => 'professional',
                'is_active' => true,
                'usage_count' => 0,
            ],

            [
                'name' => 'Minimal Resume',
                'description' => 'A simple and elegant resume template focused on clean typography and readability.',
                'slug' => 'minimal-resume',
                'preview_url' => null,
                'template_type' => 'minimal',
                'is_active' => true,
                'usage_count' => 0,
            ],

            [
                'name' => 'Creative Resume',
                'description' => 'A creative resume template designed for developers, designers and creative professionals.',
                'slug' => 'creative-resume',
                'preview_url' => null,
                'template_type' => 'creative',
                'is_active' => true,
                'usage_count' => 0,
            ],

            [
                'name' => 'Executive Resume',
                'description' => 'A polished executive-style resume template for experienced professionals and leadership roles.',
                'slug' => 'executive-resume',
                'preview_url' => null,
                'template_type' => 'executive',
                'is_active' => true,
                'usage_count' => 0,
            ],
        ];

        foreach ($templates as $template) {
            Template::updateOrCreate(
                ['slug' => $template['slug']],
                $template
            );
        }
    }
}