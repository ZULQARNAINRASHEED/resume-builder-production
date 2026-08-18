<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobController extends Controller
{
    /**
     * Search jobs from Adzuna API
     *
     * Example:
     * /api/jobs?what=software%20developer&where=london&country=gb
     */
    public function index(Request $request)
    {
        try {
            // --------------------------------------------------
            // ADZUNA CREDENTIALS
            // --------------------------------------------------

            $appId = config('services.adzuna.app_id');
            $appKey = config('services.adzuna.app_key');

            if (!$appId || !$appKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Adzuna API credentials are not configured.'
                ], 500);
            }

            // --------------------------------------------------
            // SEARCH PARAMETERS
            // --------------------------------------------------

            $what = trim(
                $request->query('what', 'software developer')
            );

            $where = trim(
                $request->query('where', '')
            );

            $page = max(
                1,
                (int) $request->query('page', 1)
            );

            $resultsPerPage = min(
                50,
                max(
                    1,
                    (int) $request->query('results_per_page', 20)
                )
            );

            // --------------------------------------------------
            // COUNTRY
            // --------------------------------------------------

            $country = strtolower(
                trim($request->query('country', 'gb'))
            );

            if (!preg_match('/^[a-z]{2}$/', $country)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid country code.'
                ], 422);
            }

            // --------------------------------------------------
            // ADZUNA URL
            // --------------------------------------------------

            $url =
                'https://api.adzuna.com/v1/api/jobs/'
                . $country
                . '/search/'
                . $page;

            // --------------------------------------------------
            // QUERY PARAMETERS
            // --------------------------------------------------

            $query = [
                'app_id' => $appId,
                'app_key' => $appKey,
                'results_per_page' => $resultsPerPage,
                'what' => $what,
            ];

            if ($where !== '') {
                $query['where'] = $where;
            }

            // --------------------------------------------------
            // OPTIONAL FILTERS
            // --------------------------------------------------

            if ($request->filled('full_time')) {
                $query['full_time'] =
                    $request->boolean('full_time') ? 1 : 0;
            }

            if ($request->filled('permanent')) {
                $query['permanent'] =
                    $request->boolean('permanent') ? 1 : 0;
            }

            if ($request->filled('salary_min')) {
                $query['salary_min'] =
                    (int) $request->query('salary_min');
            }

            if ($request->filled('sort_by')) {
                $allowedSorts = [
                    'relevance',
                    'date',
                    'salary',
                ];

                $sortBy = $request->query('sort_by');

                if (in_array($sortBy, $allowedSorts, true)) {
                    $query['sort_by'] = $sortBy;
                }
            }

            // --------------------------------------------------
            // CALL ADZUNA
            // --------------------------------------------------

            $response = Http::acceptJson()
                ->timeout(20)
                ->get($url, $query);

            // --------------------------------------------------
            // LOG ONLY SAFE INFORMATION
            // --------------------------------------------------

            Log::info('Adzuna API request', [
                'url' => $url,
                'country' => $country,
                'what' => $what,
                'where' => $where,
                'status' => $response->status(),
                'app_id_exists' => !empty($appId),
                'app_key_exists' => !empty($appKey),
            ]);

            // --------------------------------------------------
            // ADZUNA ERROR
            // --------------------------------------------------

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Adzuna API request failed.',
                    'status' => $response->status(),
                    'details' => $response->json(),
                ], $response->status());
            }

            // --------------------------------------------------
            // RESPONSE DATA
            // --------------------------------------------------

            $data = $response->json();

            // --------------------------------------------------
            // FORMAT JOBS
            // --------------------------------------------------

            $jobs = collect(
                $data['results'] ?? []
            )->map(function ($job) {

                return [
                    'id' => $job['id'] ?? null,

                    'title' =>
                        $job['title'] ?? 'Untitled Job',

                    'company' =>
                        $job['company']['display_name']
                        ?? 'Company not specified',

                    'location' =>
                        $job['location']['display_name']
                        ?? 'Location not specified',

                    'description' =>
                        $job['description'] ?? '',

                    'salary_min' =>
                        $job['salary_min'] ?? null,

                    'salary_max' =>
                        $job['salary_max'] ?? null,

                    'salary_is_predicted' =>
                        $job['salary_is_predicted'] ?? 0,

                    'contract_type' =>
                        $job['contract_type'] ?? null,

                    'contract_time' =>
                        $job['contract_time'] ?? null,

                    'category' =>
                        $job['category']['label'] ?? null,

                    'created' =>
                        $job['created'] ?? null,

                    'redirect_url' =>
                        $job['redirect_url'] ?? null,
                ];

            })->values();

            // --------------------------------------------------
            // SUCCESS RESPONSE
            // --------------------------------------------------

            return response()->json([
                'success' => true,

                'count' =>
                    $data['count'] ?? $jobs->count(),

                'page' => $page,

                'results_per_page' =>
                    $resultsPerPage,

                'country' => $country,

                'search' => [
                    'what' => $what,
                    'where' => $where,
                ],

                'jobs' => $jobs,
            ]);

        } catch (\Throwable $e) {

            Log::error(
                'Adzuna Job API Error',
                [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            );

            return response()->json([
                'success' => false,

                'message' =>
                    'Unable to fetch jobs at the moment.',

                'error' =>
                    config('app.debug')
                        ? $e->getMessage()
                        : null,
            ], 500);
        }
    }
}