<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        $statuses = Resume::selectRaw('COALESCE(status, \'draft\') as status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'success' => true,
            'stats' => [
                'users' => User::count(),
                'resumes' => Resume::count(),
                'templates' => Template::count(),
                'published_resumes' => Resume::where('status', 'published')->count(),
            ],
            'resume_statuses' => $statuses,
            'recent_users' => User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']),
            'recent_resumes' => Resume::with('user:id,name,email')->latest()->take(5)->get(),
            'top_templates' => Template::orderByDesc('usage_count')->take(5)->get(['id', 'name', 'usage_count']),
        ]);
    }
}
