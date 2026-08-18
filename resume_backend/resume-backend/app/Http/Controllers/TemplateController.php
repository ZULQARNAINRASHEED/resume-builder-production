<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'templates' => $templates,
        ]);
    }

    public function show($id)
    {
        $template = Template::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'template' => $template,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255|unique:templates,slug',
            'preview_url' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        $originalSlug = $slug;
        $counter = 1;

        while (Template::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $template = Template::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'slug' => $slug,
            'preview_url' => $validated['preview_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'usage_count' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template created successfully',
            'template' => $template,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $template = Template::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255|unique:templates,slug,' . $template->id,
            'preview_url' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['name']) && !isset($validated['slug'])) {
            $newSlug = Str::slug($validated['name']);

            $originalSlug = $newSlug;
            $counter = 1;

            while (
                Template::where('slug', $newSlug)
                    ->where('id', '!=', $template->id)
                    ->exists()
            ) {
                $newSlug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $validated['slug'] = $newSlug;
        }

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully',
            'template' => $template->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $template = Template::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found',
            ], 404);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully',
        ]);
    }
}