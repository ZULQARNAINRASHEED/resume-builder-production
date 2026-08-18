<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::orderBy('id')->get();
        if ($settings->isEmpty()) {
            $defaults = [
                ['key' => 'site_name', 'value' => 'AI Resume Builder', 'type' => 'string', 'label' => 'Site Name'],
                ['key' => 'support_email', 'value' => '', 'type' => 'string', 'label' => 'Support Email'],
                ['key' => 'default_resume_status', 'value' => 'draft', 'type' => 'string', 'label' => 'Default Resume Status'],
                ['key' => 'gemini_model', 'value' => 'gemini-3.5-flash', 'type' => 'string', 'label' => 'Gemini Model'],
            ];
            foreach ($defaults as $setting) Setting::create($setting);
            $settings = Setting::orderBy('id')->get();
        }

        return response()->json(['success' => true, 'settings' => $settings]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string|max:5000',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => 'string', 'label' => str_replace('_', ' ', ucwords($key, '_'))]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully',
            'settings' => Setting::orderBy('id')->get(),
        ]);
    }
}
