
<?php

use App\Http\Controllers\ResumeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JobController;
use App\Http\Controllers\CoverLetterController;
use App\Http\Controllers\InterviewController;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => config('app.name', 'Resume Builder API'),
        'environment' => app()->environment(),
    ]);
});

// Resume / AI
Route::post('/enhance-resume', [ResumeController::class, 'enhance']);
Route::get('/test', [ResumeController::class, 'test']);
Route::post('/generate-resume', [ResumeController::class, 'generate']);
Route::get('/test-gemini-direct', [ResumeController::class, 'testGeminiDirect']);
// Cover Letter / AI
Route::post('/generate-cover-letter', [CoverLetterController::class, 'generate']);
// Authentication
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
    Route::get('/jobs', [JobController::class, 'index']);

// Contact
Route::post('/contact', [ContactController::class, 'send']);

Route::post('/interview/start', [InterviewController::class, 'start']);

Route::post('/interview/answer', [InterviewController::class, 'answer']);

Route::get('/interview/result/{sessionId}', [InterviewController::class, 'result']);

Route::get('/interview/history', [InterviewController::class, 'history']);

/*
|--------------------------------------------------------------------------
| Public Template Routes
|--------------------------------------------------------------------------
|
| Users need to be able to see available templates without admin access.
| Admin-only actions are kept below.
|
*/

Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/{id}', [TemplateController::class, 'show']);


/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [UserController::class, 'logout']);

    // Current logged-in user
    Route::get('/user', [UserController::class, 'currentUser']);

    /*
    |--------------------------------------------------------------------------
    | User's Own Resumes
    |--------------------------------------------------------------------------
    */

    Route::get('/resumes', [ResumeController::class, 'index']);
    Route::get('/resumes/{id}', [ResumeController::class, 'show']);
    Route::post('/resumes', [ResumeController::class, 'store']);
    Route::put('/resumes/{id}', [ResumeController::class, 'update']);
    Route::delete('/resumes/{id}', [ResumeController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Users Management
    |--------------------------------------------------------------------------
    */

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | Admin Resume Management
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/resumes', [ResumeController::class, 'index']);
    Route::get('/admin/resumes/{id}', [ResumeController::class, 'show']);
    Route::delete('/admin/resumes/{id}', [ResumeController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | Template Management
    |--------------------------------------------------------------------------
    |
    | Anyone can VIEW templates using the public routes above.
    | Only admins can CREATE, UPDATE and DELETE templates.
    |
    */

    Route::post('/templates', [TemplateController::class, 'store']);
    Route::put('/templates/{id}', [TemplateController::class, 'update']);
    Route::delete('/templates/{id}', [TemplateController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | Analytics
    |--------------------------------------------------------------------------
    */

    Route::get('/analytics', [AnalyticsController::class, 'index']);


    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    */

    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);


});

