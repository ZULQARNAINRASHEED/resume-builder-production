<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResumeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GENERATE RESUME
    |--------------------------------------------------------------------------
    */

    public function generate(Request $request)
    {
        Log::info('Resume generation started', [
            'data' => $request->all()
        ]);

        $payload = $request->input('data', []);

        if (!is_array($payload)) {
            return response()->json([
                'error' => 'Invalid resume data.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (empty($payload['fullName'])) {
            return response()->json([
                'error' => 'Full name is required.'
            ], 422);
        }

        if (empty($payload['email'])) {
            return response()->json([
                'error' => 'Email is required.'
            ], 422);
        }

        if (!filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'error' => 'Invalid email format.'
            ], 422);
        }

        try {

            /*
            |--------------------------------------------------------------------------
            | API KEY
            |--------------------------------------------------------------------------
            */

            $apiKey = config('services.gemini.api_key');

            if (empty($apiKey)) {
                $apiKey = env('GEMINI_API_KEY');
            }

            if (empty($apiKey)) {

                Log::error('Gemini API key missing.');

                return response()->json([
                    'error' => 'API key not configured.',
                    'details' => 'Please check GEMINI_API_KEY in your .env file.'
                ], 500);
            }

            /*
            |--------------------------------------------------------------------------
            | PROMPT
            |--------------------------------------------------------------------------
            */

            $prompt = $this->buildPrompt($payload);

            /*
            |--------------------------------------------------------------------------
            | GEMINI
            |--------------------------------------------------------------------------
            */

            $generatedText = $this->callGemini(
                $prompt,
                $apiKey
            );

            /*
            |--------------------------------------------------------------------------
            | CLEAN TEXT
            |--------------------------------------------------------------------------
            */

            $generatedText = $this->cleanGeneratedText(
                $generatedText,
                $payload
            );

            /*
            |--------------------------------------------------------------------------
            | HTML RESUME
            |--------------------------------------------------------------------------
            */

            $htmlResume = $this->buildResumeHTML($payload);

            return response()->json([
                'success' => true,
                'resume' => $generatedText,
                'html_resume' => $htmlResume,
                'provider' => 'gemini'
            ]);

        } catch (\Throwable $e) {

            Log::error('Resume generation failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Generation failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | ENHANCE UPLOADED RESUME
    |--------------------------------------------------------------------------
    */

    public function enhance(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|max:10240|mimes:pdf,doc,docx,txt',
        ]);

        try {

            /*
            |--------------------------------------------------------------------------
            | API KEY
            |--------------------------------------------------------------------------
            */

            $apiKey = config('services.gemini.api_key');

            if (empty($apiKey)) {
                $apiKey = env('GEMINI_API_KEY');
            }

            if (empty($apiKey)) {

                return response()->json([
                    'error' => 'API key not configured.'
                ], 500);
            }

            /*
            |--------------------------------------------------------------------------
            | FILE
            |--------------------------------------------------------------------------
            */

            $file = $request->file('resume');

            if (!$file || !$file->isValid()) {

                return response()->json([
                    'error' => 'Invalid resume file.'
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | PROMPT
            |--------------------------------------------------------------------------
            */

            $prompt = <<<PROMPT
Review the uploaded resume and create an improved ATS-friendly version.

IMPORTANT RULES:

1. Preserve all truthful information from the original resume.
2. Do not invent companies.
3. Do not invent degrees.
4. Do not invent dates.
5. Do not invent skills.
6. Do not invent achievements or numbers.
7. Improve grammar and professional wording.
8. Organize the resume with clear sections.
9. Keep the resume concise and professional.
10. Return plain text only.
PROMPT;

            /*
            |--------------------------------------------------------------------------
            | FILE DATA
            |--------------------------------------------------------------------------
            */

            $fileData = base64_encode(
                file_get_contents(
                    $file->getRealPath()
                )
            );

            $mimeType =
                $file->getMimeType()
                ?: 'application/octet-stream';

            /*
            |--------------------------------------------------------------------------
            | GEMINI FILE REQUEST
            |--------------------------------------------------------------------------
            */

            $enhancedText = $this->callGeminiWithFile(
                $prompt,
                $fileData,
                $mimeType,
                $apiKey
            );

            return response()->json([
                'success' => true,
                'resume' => $enhancedText,
                'provider' => 'gemini'
            ]);

        } catch (\Throwable $e) {

            Log::error('Resume enhancement failed', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Resume enhancement failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | GEMINI TEXT REQUEST
    |--------------------------------------------------------------------------
    */

    private function callGemini(
        string $prompt,
        string $apiKey
    ): string {

        /*
        |--------------------------------------------------------------------------
        | MODEL
        |--------------------------------------------------------------------------
        |
        | You can change this from .env:
        |
        | GEMINI_MODEL=gemini-3.5-flash
        |
        */

        $model = env(
            'GEMINI_MODEL',
            'gemini-3.5-flash'
        );

        $url =
            'https://generativelanguage.googleapis.com/v1beta/models/'
            . $model
            . ':generateContent';

        Log::info('Calling Gemini API', [
            'model' => $model
        ]);

        try {

            $response = Http::timeout(120)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])
                ->post(
                    $url,
                    [
                        'contents' => [
                            [
                                'parts' => [
                                    [
                                        'text' => $prompt
                                    ]
                                ]
                            ]
                        ],

                        'generationConfig' => [
                            'maxOutputTokens' => 4096,
                        ],
                    ]
                );

        } catch (\Throwable $e) {

            Log::error('Gemini connection error', [
                'message' => $e->getMessage()
            ]);

            throw new \Exception(
                'Could not connect to Gemini API: '
                . $e->getMessage()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RATE LIMIT / QUOTA
        |--------------------------------------------------------------------------
        */

        if ($response->status() === 429) {

            $body = $response->json();

            $message =
                $body['error']['message']
                ?? 'Gemini API quota or rate limit exceeded.';

            throw new \Exception(
                'Gemini quota exceeded. '
                . $message
            );
        }

        /*
        |--------------------------------------------------------------------------
        | OTHER API ERRORS
        |--------------------------------------------------------------------------
        */

        if ($response->failed()) {

            $body = $response->json();

            $message =
                $body['error']['message']
                ?? $response->body();

            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            throw new \Exception(
                'Gemini API error: '
                . $message
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PARSE
        |--------------------------------------------------------------------------
        */

        return $this->parseGeminiResponse(
            $response->json()
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GEMINI FILE REQUEST
    |--------------------------------------------------------------------------
    */

    private function callGeminiWithFile(
        string $prompt,
        string $base64Data,
        string $mimeType,
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

        Log::info('Calling Gemini file API', [
            'model' => $model,
            'mime_type' => $mimeType
        ]);

        try {

            $response = Http::timeout(120)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])
                ->post(
                    $url,
                    [
                        'contents' => [
                            [
                                'parts' => [
                                    [
                                        'text' => $prompt
                                    ],
                                    [
                                        'inline_data' => [
                                            'mime_type' => $mimeType,
                                            'data' => $base64Data,
                                        ]
                                    ]
                                ]
                            ]
                        ],

                        'generationConfig' => [
                            'maxOutputTokens' => 4096,
                        ],
                    ]
                );

        } catch (\Throwable $e) {

            throw new \Exception(
                'Could not connect to Gemini API: '
                . $e->getMessage()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | QUOTA
        |--------------------------------------------------------------------------
        */

        if ($response->status() === 429) {

            $body = $response->json();

            $message =
                $body['error']['message']
                ?? 'Gemini quota exceeded.';

            throw new \Exception(
                'Gemini quota exceeded. '
                . $message
            );
        }

        /*
        |--------------------------------------------------------------------------
        | API ERROR
        |--------------------------------------------------------------------------
        */

        if ($response->failed()) {

            $body = $response->json();

            $message =
                $body['error']['message']
                ?? $response->body();

            throw new \Exception(
                'Gemini API error: '
                . $message
            );
        }

        return $this->parseGeminiResponse(
            $response->json()
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PARSE GEMINI RESPONSE
    |--------------------------------------------------------------------------
    */

    private function parseGeminiResponse(
        array $response
    ): string {

        /*
        |--------------------------------------------------------------------------
        | API ERROR
        |--------------------------------------------------------------------------
        */

        if (isset($response['error'])) {

            $message =
                $response['error']['message']
                ?? 'Unknown Gemini API error';

            throw new \Exception(
                'Gemini API error: '
                . $message
            );
        }


        /*
        |--------------------------------------------------------------------------
        | SAFETY
        |--------------------------------------------------------------------------
        */

        if (
            isset(
                $response['promptFeedback']['blockReason']
            )
        ) {

            $reason =
                $response['promptFeedback']['blockReason'];

            throw new \Exception(
                'Gemini blocked the request: '
                . $reason
            );
        }


        /*
        |--------------------------------------------------------------------------
        | TEXT
        |--------------------------------------------------------------------------
        */

        if (
            isset(
                $response['candidates'][0]
                ['content']
                ['parts']
            )
        ) {

            $text = '';

            foreach (
                $response['candidates'][0]['content']['parts']
                as $part
            ) {

                if (isset($part['text'])) {
                    $text .= $part['text'];
                }
            }

            if (trim($text) !== '') {
                return trim($text);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | FINISH REASON
        |--------------------------------------------------------------------------
        */

        $finishReason =
            $response['candidates'][0]['finishReason']
            ?? null;

        if ($finishReason === 'SAFETY') {

            throw new \Exception(
                'Gemini blocked the generated content.'
            );
        }

        if ($finishReason === 'RECITATION') {

            throw new \Exception(
                'Gemini blocked the response because of recitation concerns.'
            );
        }

        if ($finishReason === 'MAX_TOKENS') {

            throw new \Exception(
                'Gemini response reached the token limit.'
            );
        }


        Log::error(
            'Unexpected Gemini response',
            [
                'response' => $response
            ]
        );

        throw new \Exception(
            'Unexpected response from Gemini API.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | BUILD PROMPT
    |--------------------------------------------------------------------------
    */

    private function buildPrompt(array $p): string
    {
        $parts = [];

        $parts[] = <<<PROMPT
Create a professional ATS-friendly resume using the information below.

IMPORTANT:
- Do not invent facts.
- Do not create fake employers.
- Do not create fake degrees.
- Do not create fake dates.
- Do not create fake achievements.
- Improve wording only where appropriate.
- Keep the resume professional and concise.
- Use clear section headings.
- Use bullet points for experience and projects.
- Return plain text only.
PROMPT;


        /*
        |--------------------------------------------------------------------------
        | PERSONAL INFORMATION
        |--------------------------------------------------------------------------
        */

        $parts[] =
            "\n=== PERSONAL INFORMATION ===";

        $parts[] =
            "Full Name: "
            . ($p['fullName'] ?? 'N/A');

        $parts[] =
            "Email: "
            . ($p['email'] ?? 'N/A');

        $parts[] =
            "Phone: "
            . ($p['phone'] ?? 'N/A');

        $parts[] =
            "Professional Title: "
            . ($p['title'] ?? 'N/A');


        /*
        |--------------------------------------------------------------------------
        | ADDRESS
        |--------------------------------------------------------------------------
        */

        $address = [];

        foreach (
            [
                'street',
                'city',
                'province',
                'postalCode',
                'country'
            ] as $field
        ) {

            if (!empty($p[$field])) {
                $address[] = $p[$field];
            }
        }

        if (!empty($address)) {

            $parts[] =
                "Address: "
                . implode(', ', $address);
        }


        /*
        |--------------------------------------------------------------------------
        | TARGET ROLE
        |--------------------------------------------------------------------------
        */

        if (!empty($p['targetRole'])) {

            $parts[] =
                "Target Role: "
                . $p['targetRole'];
        }


        /*
        |--------------------------------------------------------------------------
        | SUMMARY
        |--------------------------------------------------------------------------
        */

        $parts[] =
            "\n=== PROFESSIONAL SUMMARY ===";

        $parts[] =
            $p['summary']
            ?? 'No summary provided.';


        /*
        |--------------------------------------------------------------------------
        | EXPERIENCE
        |--------------------------------------------------------------------------
        */

        $parts[] =
            "\n=== WORK EXPERIENCE ===";

        $parts[] =
            $p['experience']
            ?? 'No work experience provided.';


        /*
        |--------------------------------------------------------------------------
        | PROJECTS
        |--------------------------------------------------------------------------
        */

        if (!empty($p['projects'])) {

            $parts[] =
                "\n=== PROJECTS ===";

            $parts[] =
                $p['projects'];
        }


        /*
        |--------------------------------------------------------------------------
        | SKILLS
        |--------------------------------------------------------------------------
        */

        $parts[] =
            "\n=== SKILLS ===";

        $parts[] =
            $p['skills']
            ?? 'No skills provided.';


        /*
        |--------------------------------------------------------------------------
        | EDUCATION
        |--------------------------------------------------------------------------
        */

        if (!empty($p['qualification'])) {

            $parts[] =
                "\n=== EDUCATION ===";

            $parts[] =
                $p['qualification'];
        }


        /*
        |--------------------------------------------------------------------------
        | LINKS
        |--------------------------------------------------------------------------
        */

        if (
            !empty($p['linkedin'])
            || !empty($p['github'])
            || !empty($p['portfolio'])
        ) {

            $parts[] =
                "\n=== LINKS ===";

            if (!empty($p['linkedin'])) {

                $parts[] =
                    "LinkedIn: "
                    . $p['linkedin'];
            }

            if (!empty($p['github'])) {

                $parts[] =
                    "GitHub: "
                    . $p['github'];
            }

            if (!empty($p['portfolio'])) {

                $parts[] =
                    "Portfolio: "
                    . $p['portfolio'];
            }
        }


        /*
        |--------------------------------------------------------------------------
        | REFERENCES
        |--------------------------------------------------------------------------
        */

        if (!empty($p['references'])) {

            $parts[] =
                "\n=== REFERENCES ===";

            $parts[] =
                $p['references'];
        }


        /*
        |--------------------------------------------------------------------------
        | FINAL INSTRUCTIONS
        |--------------------------------------------------------------------------
        */

        $parts[] = <<<PROMPT

=== FINAL INSTRUCTIONS ===

Make the resume ATS-friendly.

Use these sections where applicable:

PROFESSIONAL SUMMARY
WORK EXPERIENCE
PROJECTS
SKILLS
EDUCATION
CERTIFICATIONS
LINKS

Use professional language.

Keep the resume concise.

Maximum length: approximately 2 pages.
PROMPT;

        return implode(
            "\n",
            $parts
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CLEAN GENERATED TEXT
    |--------------------------------------------------------------------------
    */

    private function cleanGeneratedText(
        string $text,
        array $originalData
    ): string {

        $text = strip_tags($text);

        /*
        |--------------------------------------------------------------------------
        | Remove markdown code fences
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | Normalize line endings
        |--------------------------------------------------------------------------
        */

        $text = str_replace(
            ["\r\n", "\r"],
            "\n",
            $text
        );


        /*
        |--------------------------------------------------------------------------
        | Remove excessive blank lines
        |--------------------------------------------------------------------------
        */

        $text = preg_replace(
            "/\n{3,}/",
            "\n\n",
            $text
        );


        /*
        |--------------------------------------------------------------------------
        | Format name
        |--------------------------------------------------------------------------
        */

        if (!empty($originalData['fullName'])) {

            $originalName =
                trim(
                    $originalData['fullName']
                );

            $upperName =
                strtoupper($originalName);

            $text = preg_replace(
                '/^'
                . preg_quote(
                    $originalName,
                    '/'
                )
                . '/i',
                $upperName,
                $text
            );
        }

        return trim($text);
    }


    /*
    |--------------------------------------------------------------------------
    | BUILD HTML RESUME
    |--------------------------------------------------------------------------
    */

    private function buildResumeHTML(
        array $data
    ): string {

        $name = strtoupper(
            $data['fullName'] ?? 'YOUR NAME'
        );

        $email =
            $data['email'] ?? '';

        $phone =
            $data['phone'] ?? '';

        $title =
            $data['title']
            ?? 'Professional';


        $targetRole =
            $data['targetRole']
            ?? 'Professional Position';


        /*
        |--------------------------------------------------------------------------
        | ADDRESS
        |--------------------------------------------------------------------------
        */

        $addressParts = [];

        foreach (
            [
                'street',
                'city',
                'province',
                'postalCode',
                'country'
            ] as $field
        ) {

            if (!empty($data[$field])) {

                $addressParts[] =
                    $data[$field];
            }
        }

        $address =
            implode(
                ', ',
                $addressParts
            );


        /*
        |--------------------------------------------------------------------------
        | SKILLS
        |--------------------------------------------------------------------------
        */

        $skills = [];

        if (!empty($data['skills'])) {

            $skills = array_filter(
                array_map(
                    'trim',
                    explode(
                        ',',
                        $data['skills']
                    )
                )
            );
        }


        /*
        |--------------------------------------------------------------------------
        | HTML
        |--------------------------------------------------------------------------
        */

        $html = '<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
>

<title>'
            . htmlspecialchars($name)
            . ' - Resume</title>

<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    background: #f4f7f8;

    color: #263238;

    padding: 30px;

    line-height: 1.6;
}

.resume-container {

    max-width: 1000px;

    margin: auto;

    background: #ffffff;

    box-shadow:
        0 10px 30px rgba(0,0,0,.08);

    overflow: hidden;
}

.header {

    background:
        linear-gradient(
            135deg,
            #043442,
            #0b6174
        );

    color: white;

    padding: 40px;

    text-align: center;
}

.header h1 {

    font-size: 38px;

    margin-bottom: 8px;

    letter-spacing: 1px;
}

.header h2 {

    font-size: 20px;

    font-weight: 400;

    opacity: .9;

    margin-bottom: 20px;
}

.contact-bar {

    display: flex;

    justify-content: center;

    flex-wrap: wrap;

    gap: 18px;

    font-size: 14px;
}

.main-content {

    padding: 40px;
}

.grid-2 {

    display: grid;

    grid-template-columns:
        280px 1fr;

    gap: 35px;
}

.sidebar {

    border-right:
        1px solid #dce3e6;

    padding-right: 25px;
}

.main-area {

    padding-left: 5px;
}

.section {

    margin-bottom: 30px;
}

.section-title {

    color: #043442;

    font-size: 16px;

    font-weight: 700;

    text-transform: uppercase;

    letter-spacing: 1px;

    margin-bottom: 14px;

    padding-bottom: 7px;

    border-bottom:
        2px solid #0b6174;
}

.summary-box {

    background: #f5f8f9;

    padding: 18px;

    border-left:
        4px solid #0b6174;

    color: #455a64;
}

.skill-tags {

    display: flex;

    flex-wrap: wrap;

    gap: 7px;
}

.skill-tag {

    background: #edf4f6;

    color: #043442;

    padding:
        5px 10px;

    border-radius: 5px;

    font-size: 13px;
}

.bullet-list {

    list-style: none;

    padding: 0;
}

.bullet-list li {

    position: relative;

    padding-left: 18px;

    margin-bottom: 8px;

    color: #455a64;
}

.bullet-list li::before {

    content: "•";

    position: absolute;

    left: 0;

    color: #0b6174;

    font-weight: bold;
}

.link-item {

    display: block;

    color: #043442;

    text-decoration: none;

    padding: 7px 0;
}

.target-role {

    color: #0b6174;

    font-weight: 600;

    font-size: 16px;
}

@media(max-width:768px) {

    body {
        padding: 10px;
    }

    .header {
        padding: 25px;
    }

    .header h1 {
        font-size: 28px;
    }

    .grid-2 {
        grid-template-columns: 1fr;
    }

    .sidebar {

        border-right: none;

        border-bottom:
            1px solid #dce3e6;

        padding-right: 0;

        padding-bottom: 25px;
    }

    .main-content {
        padding: 25px;
    }
}

</style>

</head>

<body>

<div class="resume-container">

<div class="header">

<h1>'
            . htmlspecialchars($name)
            . '</h1>

<h2>'
            . htmlspecialchars($title)
            . '</h2>

<div class="contact-bar">';


        if (!empty($email)) {

            $html .= '

<span>
📧 '
                . htmlspecialchars($email)
                . '
</span>';
        }


        if (!empty($phone)) {

            $html .= '

<span>
📱 '
                . htmlspecialchars($phone)
                . '
</span>';
        }


        if (!empty($address)) {

            $html .= '

<span>
📍 '
                . htmlspecialchars($address)
                . '
</span>';
        }


        $html .= '

</div>

</div>

<div class="main-content">

<div class="grid-2">

<div class="sidebar">';


        /*
        |--------------------------------------------------------------------------
        | TARGET ROLE
        |--------------------------------------------------------------------------
        */

        if (!empty($targetRole)) {

            $html .= '

<div class="section">

<h3 class="section-title">
Target Role
</h3>

<div class="target-role">
'
                . htmlspecialchars($targetRole)
                . '
</div>

</div>';
        }


        /*
        |--------------------------------------------------------------------------
        | SKILLS
        |--------------------------------------------------------------------------
        */

        if (!empty($skills)) {

            $html .= '

<div class="section">

<h3 class="section-title">
Skills
</h3>

<div class="skill-tags">';

            foreach ($skills as $skill) {

                $html .= '

<span class="skill-tag">
'
                    . htmlspecialchars($skill)
                    . '
</span>';
            }

            $html .= '

</div>

</div>';
        }


        /*
        |--------------------------------------------------------------------------
        | EDUCATION
        |--------------------------------------------------------------------------
        */

        if (!empty($data['qualification'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
Education
</h3>

<div>'
                . nl2br(
                    htmlspecialchars(
                        $data['qualification']
                    )
                )
                . '</div>

</div>';
        }


        /*
        |--------------------------------------------------------------------------
        | LINKS
        |--------------------------------------------------------------------------
        */

        if (!empty($data['linkedin'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
LinkedIn
</h3>

<a
class="link-item"
href="'
                . htmlspecialchars(
                    $data['linkedin']
                )
                . '"
target="_blank"
>
'
                . htmlspecialchars(
                    $data['linkedin']
                )
                . '
</a>

</div>';
        }


        if (!empty($data['github'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
GitHub
</h3>

<a
class="link-item"
href="'
                . htmlspecialchars(
                    $data['github']
                )
                . '"
target="_blank"
>
'
                . htmlspecialchars(
                    $data['github']
                )
                . '
</a>

</div>';
        }


        if (!empty($data['portfolio'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
Portfolio
</h3>

<a
class="link-item"
href="'
                . htmlspecialchars(
                    $data['portfolio']
                )
                . '"
target="_blank"
>
'
                . htmlspecialchars(
                    $data['portfolio']
                )
                . '
</a>

</div>';
        }


        $html .= '

</div>

<div class="main-area">';


        /*
        |--------------------------------------------------------------------------
        | SUMMARY
        |--------------------------------------------------------------------------
        */

        if (!empty($data['summary'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
Professional Summary
</h3>

<div class="summary-box">
'
                . nl2br(
                    htmlspecialchars(
                        $data['summary']
                    )
                )
                . '
</div>

</div>';
        }


        /*
        |--------------------------------------------------------------------------
        | EXPERIENCE
        |--------------------------------------------------------------------------
        */

        if (!empty($data['experience'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
Work Experience
</h3>

<ul class="bullet-list">';

            $lines = preg_split(
                '/\r\n|\r|\n/',
                $data['experience']
            );

            foreach ($lines as $line) {

                $line = trim($line);

                if ($line !== '') {

                    $html .= '
<li>'
                        . htmlspecialchars($line)
                        . '</li>';
                }
            }

            $html .= '

</ul>

</div>';
        }


        /*
        |--------------------------------------------------------------------------
        | PROJECTS
        |--------------------------------------------------------------------------
        */

        if (!empty($data['projects'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
Projects
</h3>

<ul class="bullet-list">';

            $lines = preg_split(
                '/\r\n|\r|\n/',
                $data['projects']
            );

            foreach ($lines as $line) {

                $line = trim($line);

                if ($line !== '') {

                    $html .= '
<li>'
                        . htmlspecialchars($line)
                        . '</li>';
                }
            }

            $html .= '

</ul>

</div>';
        }


        /*
        |--------------------------------------------------------------------------
        | REFERENCES
        |--------------------------------------------------------------------------
        */

        if (!empty($data['references'])) {

            $html .= '

<div class="section">

<h3 class="section-title">
References
</h3>

<div>'
                . nl2br(
                    htmlspecialchars(
                        $data['references']
                    )
                )
                . '</div>

</div>';
        }


        /*
        |--------------------------------------------------------------------------
        | CLOSE
        |--------------------------------------------------------------------------
        */

        $html .= '

</div>

</div>

</div>

</div>

</body>

</html>';

        return $html;
    }


    /*
    |--------------------------------------------------------------------------
    | RESUME INDEX
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        try {

            $resumes = Resume::with('user')
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'resumes' => $resumes
            ]);

        } catch (\Throwable $e) {

            Log::error(
                'Resume listing failed',
                [
                    'message' => $e->getMessage()
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch resumes',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        try {

            $resume =
                Resume::with('user')
                    ->find($id);

            if (!$resume) {

                return response()->json([
                    'success' => false,
                    'message' => 'Resume not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'resume' => $resume
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch resume',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        try {

            $validated =
                $request->validate([
                    'user_id' =>
                        'nullable|exists:users,id',

                    'title' =>
                        'nullable|string|max:255',

                    'content' =>
                        'nullable|string',

                    'file_name' =>
                        'nullable|string|max:255',

                    'file_path' =>
                        'nullable|string|max:500',

                    'status' =>
                        'nullable|string|max:50',
                ]);

            $resume =
                Resume::create(
                    $validated
                );

            return response()->json([
                'success' => true,
                'message' =>
                    'Resume created successfully',
                'resume' => $resume
            ], 201);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Failed to create resume',
                'details' =>
                    $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        $id
    ) {

        try {

            $resume =
                Resume::find($id);

            if (!$resume) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Resume not found'
                ], 404);
            }

            $validated =
                $request->validate([
                    'title' =>
                        'nullable|string|max:255',

                    'content' =>
                        'nullable|string',

                    'file_name' =>
                        'nullable|string|max:255',

                    'file_path' =>
                        'nullable|string|max:500',

                    'status' =>
                        'nullable|string|max:50',
                ]);

            $resume->update(
                $validated
            );

            return response()->json([
                'success' => true,
                'message' =>
                    'Resume updated successfully',
                'resume' => $resume
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Failed to update resume',
                'details' =>
                    $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        try {

            $resume =
                Resume::find($id);

            if (!$resume) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Resume not found'
                ], 404);
            }

            $resume->delete();

            return response()->json([
                'success' => true,
                'message' =>
                    'Resume deleted successfully'
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Failed to delete resume',
                'details' =>
                    $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | TEST GEMINI
    |--------------------------------------------------------------------------
    */

    public function test(Request $request)
    {
        $apiKey =
            config('services.gemini.api_key')
            ?: env('GEMINI_API_KEY');

        return response()->json([
            'status' => 'ok',

            'api_key_set' =>
                !empty($apiKey),

            'api_key_length' =>
                $apiKey
                    ? strlen($apiKey)
                    : 0,

            'model' =>
                env(
                    'GEMINI_MODEL',
                    'gemini-3.5-flash'
                ),

            'environment' =>
                config('app.env'),

            'debug' =>
                config('app.debug'),

            'time' =>
                now()->toDateTimeString()
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DIRECT GEMINI TEST
    |--------------------------------------------------------------------------
    */

    public function testGeminiDirect(
        Request $request
    ) {

        try {

            $apiKey =
                config('services.gemini.api_key')
                ?: env('GEMINI_API_KEY');

            if (empty($apiKey)) {

                return response()->json([
                    'success' => false,
                    'error' =>
                        'Gemini API key missing.'
                ], 500);
            }

            $text =
                $this->callGemini(
                    'Say hello in one short sentence.',
                    $apiKey
                );

            return response()->json([
                'success' => true,
                'model' =>
                    env(
                        'GEMINI_MODEL',
                        'gemini-3.5-flash'
                    ),
                'text' => $text
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'error' =>
                    $e->getMessage()
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | BACKWARD COMPATIBILITY
    |--------------------------------------------------------------------------
    */

    private function formatResumeAsHTML(
        string $text,
        array $data
    ): string {

        return $this->buildResumeHTML(
            $data
        );
    }
}