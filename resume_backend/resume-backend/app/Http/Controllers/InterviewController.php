<?php

namespace App\Http\Controllers;

use App\Models\InterviewAnswer;
use App\Models\InterviewQuestion;
use App\Models\InterviewSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InterviewController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | START INTERVIEW
    |--------------------------------------------------------------------------
    */

    public function start(Request $request)
    {
        try {
            $validated = $request->validate([
                'job_role' => 'required|string|max:255',
                'difficulty' => 'nullable|string|in:easy,medium,hard',
                'total_questions' => 'nullable|integer|min:1|max:10',
            ]);

            $jobRole = $validated['job_role'];
            $difficulty = $validated['difficulty'] ?? 'medium';

            /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            | User can request 1-10 questions.
            */

            $totalQuestions = $validated['total_questions'] ?? 5;

            $session = InterviewSession::create([
                'user_id' => auth()->id(),
                'job_role' => $jobRole,
                'difficulty' => $difficulty,
                'total_questions' => $totalQuestions,
                'completed_questions' => 0,
                'overall_score' => null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Get first question
            |--------------------------------------------------------------------------
            */

            $question = $this->getQuestion(
                $jobRole,
                $difficulty
            );

            return response()->json([
                'success' => true,
                'message' => 'Interview started successfully.',
                'session' => $session,
                'question' => [
                    'id' => $question->id,
                    'question' => $question->question,
                    'category' => $question->category,
                    'difficulty' => $question->difficulty,
                ],
            ]);

        } catch (\Throwable $e) {

            Log::error('Interview start error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Unable to start interview.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | SUBMIT ANSWER
    |--------------------------------------------------------------------------
    */

    public function answer(Request $request)
    {
        try {

            $validated = $request->validate([
                'session_id' => 'required|integer',
                'question_id' => 'required|integer',
                'answer' => 'required|string',
            ]);

            $session = InterviewSession::find(
                $validated['session_id']
            );

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'error' => 'Interview session not found.',
                ], 404);
            }

            $question = InterviewQuestion::find(
                $validated['question_id']
            );

            if (!$question) {
                return response()->json([
                    'success' => false,
                    'error' => 'Interview question not found.',
                ], 404);
            }

            /*
            |--------------------------------------------------------------------------
            | Prevent duplicate answer
            |--------------------------------------------------------------------------
            */

            $existingAnswer = InterviewAnswer::where(
                'session_id',
                $session->id
            )
                ->where(
                    'question_id',
                    $question->id
                )
                ->first();

            if ($existingAnswer) {
                return response()->json([
                    'success' => false,
                    'error' => 'This question has already been answered.',
                ], 409);
            }

            /*
            |--------------------------------------------------------------------------
            | Evaluate answer using Gemini
            |--------------------------------------------------------------------------
            */

            $evaluation = $this->evaluateAnswer(
                $question,
                $validated['answer']
            );

            /*
            |--------------------------------------------------------------------------
            | Save answer
            |--------------------------------------------------------------------------
            */

            $answer = InterviewAnswer::create([
                'session_id' => $session->id,
                'question_id' => $question->id,
                'user_answer' => $validated['answer'],
                'ai_feedback' => $evaluation['feedback'],
                'score' => $evaluation['score'],
                'strengths' => $evaluation['strengths'],
                'improvements' => $evaluation['improvements'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | Update completed questions
            |--------------------------------------------------------------------------
            */

            $completedQuestions = InterviewAnswer::where(
                'session_id',
                $session->id
            )->count();

            $session->completed_questions =
                $completedQuestions;

            /*
            |--------------------------------------------------------------------------
            | Check if interview is complete
            |--------------------------------------------------------------------------
            */

            $interviewComplete =
                $completedQuestions >=
                $session->total_questions;

            $nextQuestion = null;

            if ($interviewComplete) {

                /*
                |--------------------------------------------------------------------------
                | Calculate overall score
                |--------------------------------------------------------------------------
                */

                $scores = InterviewAnswer::where(
                    'session_id',
                    $session->id
                )
                    ->pluck('score')
                    ->filter();

                if ($scores->count() > 0) {
                    $session->overall_score =
                        round($scores->avg(), 2);
                }

                $session->save();

            } else {

                /*
                |--------------------------------------------------------------------------
                | Generate next question
                |--------------------------------------------------------------------------
                */

                $nextQuestion = $this->getNextQuestion(
                    $session
                );
            }

            $session->save();

            return response()->json([
                'success' => true,

                'evaluation' => [
                    'score' => $evaluation['score'],
                    'feedback' => $evaluation['feedback'],
                    'strengths' => $evaluation['strengths'],
                    'improvements' => $evaluation['improvements'],
                    'fallback' => $evaluation['fallback'] ?? false,
                ],

                'answer' => $answer,

                'interview_complete' =>
                    $interviewComplete,

                'next_question' =>
                    $nextQuestion,

                'session' => $session,
            ]);

        } catch (\Throwable $e) {

            Log::error('Interview answer error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Unable to process interview answer.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | GET INTERVIEW HISTORY
    |--------------------------------------------------------------------------
    */

    public function history(Request $request)
    {
        try {

            $query = InterviewSession::withCount('answers')
                ->latest();

            if (auth()->check()) {
                $query->where(
                    'user_id',
                    auth()->id()
                );
            }

            $sessions = $query->get();

            return response()->json([
                'success' => true,
                'history' => $sessions,
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'error' => 'Unable to load interview history.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | INTERVIEW RESULT
    |--------------------------------------------------------------------------
    */

    public function result($sessionId)
    {
        try {

            $session = InterviewSession::with([
                'answers.question'
            ])->find($sessionId);

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'error' => 'Interview session not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'session' => $session,
                'answers' => $session->answers,
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'error' => 'Unable to load interview result.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | GET QUESTION
    |--------------------------------------------------------------------------
    */

    private function getQuestion(
        string $jobRole,
        string $difficulty
    ) {

        /*
        |--------------------------------------------------------------------------
        | First try existing database question
        |--------------------------------------------------------------------------
        */

        $question = InterviewQuestion::where(
            'job_role',
            $jobRole
        )
            ->where(
                'difficulty',
                $difficulty
            )
            ->inRandomOrder()
            ->first();

        if ($question) {
            return $question;
        }

        /*
        |--------------------------------------------------------------------------
        | Generate question using Gemini
        |--------------------------------------------------------------------------
        */

        try {

            $generated = $this->generateQuestionWithGemini(
                $jobRole,
                $difficulty
            );

            return InterviewQuestion::create([
                'question' => $generated['question'],
                'category' => $generated['category'],
                'difficulty' => $difficulty,
                'job_role' => $jobRole,
                'ideal_answer' => $generated['ideal_answer'],
                'explanation' => $generated['explanation'],
            ]);

        } catch (\Throwable $e) {

            Log::warning(
                'Gemini question generation failed. Using fallback question.',
                [
                    'message' => $e->getMessage(),
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Fallback question
            |--------------------------------------------------------------------------
            */

            return InterviewQuestion::create([
                'question' =>
                    "Explain the difference between state and props in React. When would you use each one?",

                'category' => 'technical',

                'difficulty' => $difficulty,

                'job_role' => $jobRole,

                'ideal_answer' =>
                    "Props are inputs passed from a parent component, while state is internal data managed by a component. State is used when data changes over time and affects rendering.",

                'explanation' =>
                    "This question evaluates the candidate's understanding of fundamental React concepts.",
            ]);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | GET NEXT QUESTION
    |--------------------------------------------------------------------------
    */

    private function getNextQuestion(
        InterviewSession $session
    ) {

        $answeredQuestionIds =
            InterviewAnswer::where(
                'session_id',
                $session->id
            )
                ->pluck('question_id')
                ->toArray();

        $question = InterviewQuestion::where(
            'job_role',
            $session->job_role
        )
            ->where(
                'difficulty',
                $session->difficulty
            )
            ->whereNotIn(
                'id',
                $answeredQuestionIds
            )
            ->inRandomOrder()
            ->first();

        if (!$question) {

            try {

                $generated =
                    $this->generateQuestionWithGemini(
                        $session->job_role,
                        $session->difficulty
                    );

                $question = InterviewQuestion::create([
                    'question' =>
                        $generated['question'],

                    'category' =>
                        $generated['category'],

                    'difficulty' =>
                        $session->difficulty,

                    'job_role' =>
                        $session->job_role,

                    'ideal_answer' =>
                        $generated['ideal_answer'],

                    'explanation' =>
                        $generated['explanation'],
                ]);

            } catch (\Throwable $e) {

                Log::warning(
                    'Gemini next question failed. Using fallback.',
                    [
                        'message' => $e->getMessage(),
                    ]
                );

                $question = InterviewQuestion::create([
                    'question' =>
                        "How would you optimize the performance of a React application?",

                    'category' => 'technical',

                    'difficulty' =>
                        $session->difficulty,

                    'job_role' =>
                        $session->job_role,

                    'ideal_answer' =>
                        "Use techniques such as memoization, code splitting, lazy loading, virtualization, efficient state management, and avoiding unnecessary renders.",

                    'explanation' =>
                        "This evaluates the candidate's knowledge of frontend performance optimization.",
                ]);
            }
        }

        return [
            'id' => $question->id,
            'question' => $question->question,
            'category' => $question->category,
            'difficulty' => $question->difficulty,
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | EVALUATE ANSWER
    |--------------------------------------------------------------------------
    */

    private function evaluateAnswer(
        InterviewQuestion $question,
        string $userAnswer
    ): array {

        try {

            $apiKey = config(
                'services.gemini.api_key'
            );

            if (!$apiKey) {
                throw new \Exception(
                    'Gemini API key is not configured.'
                );
            }

            $prompt = <<<PROMPT
You are an expert technical interviewer.

Evaluate the candidate's answer.

Question:
{$question->question}

Ideal Answer:
{$question->ideal_answer}

Candidate Answer:
{$userAnswer}

Return ONLY valid JSON in this exact format:

{
    "score": 85,
    "feedback": "Short professional feedback.",
    "strengths": "Main strengths.",
    "improvements": "Specific improvements."
}

Score must be between 0 and 100.
PROMPT;

            $response = Http::timeout(60)
                ->post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' . $apiKey,
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
                            'temperature' => 0.3,
                            'maxOutputTokens' => 1000,
                        ],
                    ]
                );

            /*
            |--------------------------------------------------------------------------
            | Gemini HTTP error
            |--------------------------------------------------------------------------
            */

            if (!$response->successful()) {

                $status = $response->status();

                /*
                |--------------------------------------------------------------------------
                | 429 = quota exceeded
                |--------------------------------------------------------------------------
                */

                if ($status === 429) {

                    Log::warning(
                        'Gemini quota exceeded during interview evaluation.'
                    );

                    return $this->fallbackEvaluation(
                        $userAnswer
                    );
                }

                throw new \Exception(
                    'Gemini API request failed: ' .
                    $response->body()
                );
            }

            $json = $response->json();

            $text =
                $json['candidates'][0]['content']['parts'][0]['text']
                ?? null;

            if (!$text) {
                throw new \Exception(
                    'Gemini returned an empty response.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Clean JSON response
            |--------------------------------------------------------------------------
            */

            $text = trim($text);

            $text = preg_replace(
                '/^```json\s*/i',
                '',
                $text
            );

            $text = preg_replace(
                '/^```\s*/',
                '',
                $text
            );

            $text = preg_replace(
                '/\s*```$/',
                '',
                $text
            );

            $data = json_decode(
                trim($text),
                true
            );

            if (!is_array($data)) {
                throw new \Exception(
                    'Invalid JSON returned by Gemini.'
                );
            }

            return [
                'score' =>
                    max(
                        0,
                        min(
                            100,
                            (int) ($data['score'] ?? 70)
                        )
                    ),

                'feedback' =>
                    $data['feedback']
                    ?? 'Your answer was reviewed successfully.',

                'strengths' =>
                    $data['strengths']
                    ?? 'The candidate attempted the question.',

                'improvements' =>
                    $data['improvements']
                    ?? 'Provide more specific technical examples.',

                'fallback' => false,
            ];

        } catch (\Throwable $e) {

            Log::warning(
                'Gemini evaluation failed. Using fallback evaluation.',
                [
                    'message' => $e->getMessage(),
                ]
            );

            return $this->fallbackEvaluation(
                $userAnswer
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | FALLBACK EVALUATION
    |--------------------------------------------------------------------------
    */

    private function fallbackEvaluation(
        string $answer
    ): array {

        $length = strlen(
            trim($answer)
        );

        /*
        |--------------------------------------------------------------------------
        | Simple fallback scoring
        |--------------------------------------------------------------------------
        */

        if ($length < 50) {
            $score = 55;

            $feedback =
                'Your answer is relevant, but it is too brief. Try to explain the concept with a concrete example.';

            $strengths =
                'The answer attempts to address the question.';

            $improvements =
                'Add more technical details, reasoning, and examples.';
        }

        elseif ($length < 150) {
            $score = 70;

            $feedback =
                'Your answer demonstrates a basic understanding of the topic. More technical detail would strengthen it.';

            $strengths =
                'The answer is relevant and reasonably clear.';

            $improvements =
                'Add specific examples and explain why your approach works.';
        }

        elseif ($length < 300) {
            $score = 80;

            $feedback =
                'Your answer demonstrates a good understanding of the topic and provides useful reasoning.';

            $strengths =
                'Good explanation with relevant technical information.';

            $improvements =
                'Include more concrete examples and discuss potential trade-offs.';
        }

        else {
            $score = 85;

            $feedback =
                'Your answer provides a detailed explanation and demonstrates good technical understanding.';

            $strengths =
                'Detailed, relevant, and technically focused response.';

            $improvements =
                'Make the answer more structured and include concise real-world examples.';
        }

        return [
            'score' => $score,
            'feedback' => $feedback,
            'strengths' => $strengths,
            'improvements' => $improvements,
            'fallback' => true,
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | GENERATE QUESTION WITH GEMINI
    |--------------------------------------------------------------------------
    */

    private function generateQuestionWithGemini(
        string $jobRole,
        string $difficulty
    ): array {

        $apiKey = config(
            'services.gemini.api_key'
        );

        if (!$apiKey) {
            throw new \Exception(
                'Gemini API key is not configured.'
            );
        }

        $prompt = <<<PROMPT
Generate one professional technical interview question.

Job Role:
{$jobRole}

Difficulty:
{$difficulty}

Return ONLY valid JSON:

{
    "question": "Interview question",
    "category": "technical",
    "ideal_answer": "Ideal answer",
    "explanation": "What this question evaluates"
}
PROMPT;

        $response = Http::timeout(60)
            ->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' . $apiKey,
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
                        'temperature' => 0.6,
                        'maxOutputTokens' => 1000,
                    ],
                ]
            );

        if (!$response->successful()) {

            throw new \Exception(
                'Gemini API request failed: ' .
                $response->body()
            );
        }

        $json = $response->json();

        $text =
            $json['candidates'][0]['content']['parts'][0]['text']
            ?? null;

        if (!$text) {
            throw new \Exception(
                'Gemini returned an empty response.'
            );
        }

        $text = trim($text);

        $text = preg_replace(
            '/^```json\s*/i',
            '',
            $text
        );

        $text = preg_replace(
            '/^```\s*/',
            '',
            $text
        );

        $text = preg_replace(
            '/\s*```$/',
            '',
            $text
        );

        $data = json_decode(
            trim($text),
            true
        );

        if (!is_array($data)) {
            throw new \Exception(
                'Invalid JSON returned by Gemini.'
            );
        }

        return [
            'question' =>
                $data['question'] ?? 'Explain an important concept related to your role.',

            'category' =>
                $data['category'] ?? 'technical',

            'ideal_answer' =>
                $data['ideal_answer'] ?? '',

            'explanation' =>
                $data['explanation'] ?? '',
        ];
    }
}