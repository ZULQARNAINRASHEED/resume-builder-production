<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoverLetterController extends Controller
{
    /**
     * Generate AI Cover Letter
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',

            'jobTitle' => 'required|string|max:255',
            'companyName' => 'required|string|max:255',

            'experience' => 'nullable|string',
            'skills' => 'nullable|string',
            'education' => 'nullable|string',
            'projects' => 'nullable|string',

            'jobDescription' => 'required|string|max:10000',

            'tone' => 'nullable|string|in:professional,friendly,confident,formal',
        ]);

        try {
            $apiKey = env('GEMINI_API_KEY');

            if (empty($apiKey)) {
                return response()->json([
                    'success' => false,
                    'error' => 'API key not configured'
                ], 500);
            }

            $prompt = $this->buildCoverLetterPrompt($validated);

            $coverLetter = $this->callGemini(
                $prompt,
                $apiKey
            );

            $coverLetter = $this->cleanCoverLetter(
                $coverLetter
            );

            return response()->json([
                'success' => true,
                'cover_letter' => $coverLetter,
                'provider' => 'gemini'
            ]);

        } catch (\Throwable $e) {

            Log::error('Cover letter generation failed', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Cover letter generation failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Build AI Prompt
     */
   private function buildCoverLetterPrompt(array $data): string
{
    $tone = $data['tone'] ?? 'professional';

    $phone = $data['phone'] ?? '';
    $experience = $data['experience'] ?? '';
    $skills = $data['skills'] ?? '';
    $education = $data['education'] ?? '';
    $projects = $data['projects'] ?? '';

    $fullName = $data['fullName'];
    $jobTitle = $data['jobTitle'];
    $companyName = $data['companyName'];
    $jobDescription = $data['jobDescription'];

    return <<<PROMPT
Write a professional, personalized job application cover letter.

IMPORTANT RULES:

1. Use ONLY the information provided by the applicant.
2. Do NOT invent companies, qualifications, degrees, experience,
   achievements, technologies, awards, or statistics.
3. Do NOT make false claims.
4. Match the letter to the provided job description.
5. Highlight the applicant's relevant skills and experience.
6. Keep it concise and professional.
7. Maximum length: approximately 400-500 words.
8. Use a {$tone} tone.
9. Do not use markdown.
10. Do not add explanations before or after the cover letter.

=== APPLICANT INFORMATION ===

Full Name:
{$fullName}

Email:
{$data['email']}

Phone:
{$phone}

Experience:
{$experience}

Skills:
{$skills}

Education:
{$education}

Projects:
{$projects}


=== JOB INFORMATION ===

Job Title:
{$jobTitle}

Company:
{$companyName}

Job Description:
{$jobDescription}


=== OUTPUT ===

Write only the final cover letter.

Use this general structure:

Dear Hiring Manager,

[Opening paragraph showing interest in the position]

[Paragraph explaining relevant skills, experience, education or projects]

[Paragraph explaining why the applicant is a good fit based on the job description]

[Professional closing]

Sincerely,
{$fullName}
PROMPT;
}


    /**
     * Call Gemini API
     */
    private function callGemini(
        string $prompt,
        string $apiKey
    ): string {

        $model = env(
            'GEMINI_MODEL',
            'gemini-3.5-flash'
        );

        $url =
            'https://generativelanguage.googleapis.com/v1beta/models/'
            . $model
            . ':generateContent';


        $response = Http::timeout(120)
            ->withHeaders([
                'Content-Type' => 'application/json'
            ])
            ->post(
                $url . '?key=' . urlencode($apiKey),
                [
                    'contents' => [[
                        'parts' => [[
                            'text' => $prompt
                        ]]
                    ]],

                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 1024,
                        'topP' => 0.9,
                        'topK' => 40,
                        'thinkingConfig' => [
                            'thinkingLevel' => 'low',
                        ],
                    ],
                ]
            );


        if ($response->failed()) {

            Log::error('Gemini cover letter API failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            throw new \Exception(
                'Gemini API request failed: '
                . $response->body()
            );
        }


        $result = $response->json();


        if (isset($result['error'])) {

            throw new \Exception(
                'Gemini API error: '
                . (
                    $result['error']['message']
                    ?? 'Unknown error'
                )
            );
        }


        if (
            isset(
                $result['candidates'][0]
                ['content']
                ['parts'][0]
                ['text']
            )
        ) {

            return $result['candidates'][0]
                ['content']
                ['parts'][0]
                ['text'];
        }


        throw new \Exception(
            'Unexpected Gemini response format'
        );
    }


    /**
     * Clean AI response
     */
    private function cleanCoverLetter(string $text): string
    {
        $text = strip_tags($text);

        // Remove markdown code fences if Gemini returns them
        $text = preg_replace(
            '/```[a-zA-Z]*\s*/',
            '',
            $text
        );

        $text = str_replace(
            '```',
            '',
            $text
        );

        // Remove excessive blank lines
        $text = preg_replace(
            "/\n{3,}/",
            "\n\n",
            $text
        );

        return trim($text);
    }
}