import React, { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Lightbulb,
  AlertCircle,
  Clock,
  History,
} from "lucide-react";

import { apiUrl, authHeaders } from "../config/api";

export default function InterviewPreparation() {
  // =========================================================
  // SETUP
  // =========================================================

  const [jobRole, setJobRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("medium");
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [answer, setAnswer] = useState("");

  const [evaluation, setEvaluation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [error, setError] = useState("");

  const [finished, setFinished] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // =========================================================
  // START INTERVIEW
  // =========================================================

  async function startInterview() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        apiUrl("interview/start"),
        {
          method: "POST",
          headers: {
            ...authHeaders({
              "Content-Type": "application/json",
            }),
          },
          body: JSON.stringify({
            job_role: jobRole,
            difficulty,
            total_questions: Number(totalQuestions),
          }),
        }
      );

      const data = await response.json();

      console.log("Interview start response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            data.details ||
            "Unable to start interview."
        );
      }

      setSession(data.session);
      setCurrentQuestion(data.question);

      setAnswer("");
      setEvaluation(null);
      setFinished(false);
      setFinalResult(null);
    } catch (err) {
      console.error("Start interview error:", err);

      setError(
        err.message ||
          "Unable to start interview."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // SUBMIT ANSWER
  // =========================================================

  async function submitAnswer() {
    if (!answer.trim()) {
      setError("Please write your answer first.");
      return;
    }

    if (!session || !currentQuestion) {
      return;
    }

    setError("");
    setEvaluating(true);

    try {
      const response = await fetch(
        apiUrl("interview/answer"),
        {
          method: "POST",
          headers: {
            ...authHeaders({
              "Content-Type": "application/json",
            }),
          },
          body: JSON.stringify({
            session_id: session.id,
            question_id: currentQuestion.id,
            answer: answer.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log("Interview answer response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            data.details ||
            "Unable to evaluate answer."
        );
      }

      setEvaluation(data.evaluation);

      setSession(data.session);

      /*
       * If interview is complete,
       * get final result.
       */

      if (data.interview_complete) {
        await loadFinalResult(session.id);
        setFinished(true);
        return;
      }

      /*
       * Otherwise show next question.
       */

      if (data.next_question) {
        setCurrentQuestion(data.next_question);
      }
    } catch (err) {
      console.error(
        "Answer evaluation error:",
        err
      );

      setError(
        err.message ||
          "Unable to evaluate your answer."
      );
    } finally {
      setEvaluating(false);
    }
  }

  // =========================================================
  // FINAL RESULT
  // =========================================================

  async function loadFinalResult(sessionId) {
    try {
      const response = await fetch(
        apiUrl(`interview/result/${sessionId}`),
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      console.log("Final interview result:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to load interview result."
        );
      }

      setFinalResult(
        data.result ||
          data.session ||
          data
      );
    } catch (err) {
      console.error(
        "Final result error:",
        err
      );

      /*
       * Don't break the interview if
       * result endpoint has an issue.
       */

      setFinalResult({
        overall_score:
          session?.overall_score || 0,
      });
    }
  }

  // =========================================================
  // HISTORY
  // =========================================================

  async function loadHistory() {
    try {
      setError("");

      const response = await fetch(
        apiUrl("interview/history"),
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      console.log("Interview history:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to load history."
        );
      }

      setHistory(
        data.history ||
          data.sessions ||
          []
      );

      setShowHistory(true);
    } catch (err) {
      console.error(
        "History error:",
        err
      );

      setError(
        err.message ||
          "Unable to load interview history."
      );
    }
  }

  // =========================================================
  // RETRY
  // =========================================================

  function retryInterview() {
    setSession(null);
    setCurrentQuestion(null);
    setAnswer("");
    setEvaluation(null);
    setFinished(false);
    setFinalResult(null);
    setError("");
  }

  // =========================================================
  // PROGRESS
  // =========================================================

  function getProgress() {
    if (!session) return 0;

    const completed =
      Number(
        session.completed_questions || 0
      );

    const total =
      Number(
        session.total_questions || totalQuestions
      );

    if (!total) return 0;

    return Math.min(
      100,
      Math.round(
        (completed / total) * 100
      )
    );
  }

  // =========================================================
  // SCORE COLOR
  // =========================================================

  function scoreClass(score) {
    const value = Number(score || 0);

    if (value >= 80) {
      return "text-green-600";
    }

    if (value >= 60) {
      return "text-yellow-600";
    }

    return "text-red-600";
  }

  // =========================================================
  // START SCREEN
  // =========================================================

  if (!session && !finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 p-4 md:p-8">

        <div className="max-w-5xl mx-auto">

          {/* HEADER */}

          <div className="text-center mb-10">

            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center shadow-lg">

              <Brain className="w-10 h-10 text-white" />

            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#043442]">
              AI Interview Preparation
            </h1>

            <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
              Practice realistic interview questions and get
              instant AI-powered feedback on your answers.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">

              <div className="flex gap-3 items-start">

                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

                <p className="text-red-700">
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* CARD */}

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Start Your Mock Interview
            </h2>

            {/* JOB ROLE */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Role
              </label>

              <select
                value={jobRole}
                onChange={(e) =>
                  setJobRole(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option>
                  Frontend Developer
                </option>

                <option>
                  Backend Developer
                </option>

                <option>
                  Full Stack Developer
                </option>

                <option>
                  React Developer
                </option>

                <option>
                  Laravel Developer
                </option>

                <option>
                  Software Engineer
                </option>

                <option>
                  UI/UX Designer
                </option>

                <option>
                  Data Analyst
                </option>
              </select>

            </div>

            {/* DIFFICULTY */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>
              </select>

            </div>

            {/* QUESTIONS */}

            <div className="mb-7">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Questions
              </label>

              <select
                value={totalQuestions}
                onChange={(e) =>
                  setTotalQuestions(
                    Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value={3}>
                  3 Questions
                </option>

                <option value={5}>
                  5 Questions
                </option>

                <option value={10}>
                  10 Questions
                </option>
              </select>

            </div>

            {/* START */}

            <button
              type="button"
              onClick={startInterview}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-teal-700 hover:to-cyan-700 transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-3"
            >

              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />

                  Starting Interview...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />

                  Start AI Interview

                  <ChevronRight className="w-5 h-5" />
                </>
              )}

            </button>

            {/* HISTORY */}

            <button
              type="button"
              onClick={loadHistory}
              className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />

              View Interview History
            </button>

          </div>

          {/* HISTORY */}

          {showHistory && (
            <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-6">

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-xl font-bold text-gray-800">
                  Interview History
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowHistory(false)
                  }
                  className="text-gray-500 hover:text-gray-800"
                >
                  Close
                </button>

              </div>

              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No interview history found.
                </p>
              ) : (
                <div className="space-y-3">

                  {history.map(
                    (item, index) => (
                      <div
                        key={
                          item.id ||
                          index
                        }
                        className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >

                        <div>

                          <h3 className="font-bold text-[#043442]">
                            {item.job_role ||
                              "Interview"}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Difficulty:{" "}
                            {item.difficulty ||
                              "N/A"}
                          </p>

                        </div>

                        <div className="text-right">

                          <p
                            className={`text-xl font-bold ${scoreClass(
                              item.overall_score
                            )}`}
                          >
                            {item.overall_score ??
                              "Pending"}
                          </p>

                          <p className="text-xs text-gray-500">
                            Score
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    );
  }

  // =========================================================
  // FINAL RESULT SCREEN
  // =========================================================

  if (finished) {
    const score =
      finalResult?.overall_score ??
      session?.overall_score ??
      evaluation?.score ??
      0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 p-4 md:p-8">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center">

            <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-yellow-100 flex items-center justify-center">

              <Trophy className="w-12 h-12 text-yellow-600" />

            </div>

            <h1 className="text-4xl font-bold text-[#043442]">
              Interview Complete!
            </h1>

            <p className="text-gray-600 mt-3">
              Great job! Here is your AI interview performance.
            </p>

            {/* SCORE */}

            <div className="my-10">

              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Overall Score
              </p>

              <div
                className={`text-7xl font-bold mt-2 ${scoreClass(
                  score
                )}`}
              >
                {score}
              </div>

              <p className="text-gray-500 mt-1">
                out of 100
              </p>

            </div>

            {/* SESSION INFO */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

              <div className="bg-gray-50 rounded-xl p-4">

                <Target className="w-6 h-6 mx-auto text-teal-600 mb-2" />

                <p className="text-sm text-gray-500">
                  Job Role
                </p>

                <p className="font-bold text-gray-800">
                  {session?.job_role}
                </p>

              </div>

              <div className="bg-gray-50 rounded-xl p-4">

                <Brain className="w-6 h-6 mx-auto text-blue-600 mb-2" />

                <p className="text-sm text-gray-500">
                  Difficulty
                </p>

                <p className="font-bold text-gray-800 capitalize">
                  {session?.difficulty}
                </p>

              </div>

              <div className="bg-gray-50 rounded-xl p-4">

                <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-2" />

                <p className="text-sm text-gray-500">
                  Questions
                </p>

                <p className="font-bold text-gray-800">
                  {session?.completed_questions}/
                  {session?.total_questions}
                </p>

              </div>

            </div>

            {/* LAST FEEDBACK */}

            {evaluation && (
              <div className="text-left bg-gray-50 rounded-2xl p-6 mb-8">

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  AI Feedback
                </h2>

                {evaluation.feedback && (
                  <p className="text-gray-700 leading-relaxed">
                    {evaluation.feedback}
                  </p>
                )}

                {evaluation.strengths && (
                  <div className="mt-5">

                    <h3 className="font-bold text-green-700 mb-2">
                      Strengths
                    </h3>

                    <p className="text-gray-700">
                      {evaluation.strengths}
                    </p>

                  </div>
                )}

                {evaluation.improvements && (
                  <div className="mt-5">

                    <h3 className="font-bold text-orange-700 mb-2">
                      Areas to Improve
                    </h3>

                    <p className="text-gray-700">
                      {evaluation.improvements}
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* RETRY */}

            <button
              type="button"
              onClick={retryInterview}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold hover:from-teal-700 hover:to-cyan-700 transition shadow-lg inline-flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />

              Start New Interview
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // INTERVIEW SCREEN
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 p-4 md:p-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center">

                <Brain className="w-6 h-6 text-white" />

              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold text-[#043442]">
                  AI Mock Interview
                </h1>

                <p className="text-gray-500">
                  {session?.job_role}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-xl shadow-sm px-5 py-3">

            <p className="text-xs text-gray-500">
              Progress
            </p>

            <p className="font-bold text-[#043442]">
              {session?.completed_questions || 0} /{" "}
              {session?.total_questions}
            </p>

          </div>

        </div>

        {/* PROGRESS BAR */}

        <div className="bg-white rounded-full h-3 mb-8 shadow-inner overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
            style={{
              width: `${getProgress()}%`,
            }}
          />

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* QUESTION CARD */}

        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            <div className="p-6 md:p-8">

              {/* QUESTION NUMBER */}

              <div className="flex items-center justify-between mb-6">

                <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">

                  <Target className="w-4 h-4" />

                  Question{" "}
                  {(session?.completed_questions || 0) + 1}
                  {" "}
                  of{" "}
                  {session?.total_questions}

                </span>

                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm capitalize">
                  {currentQuestion.difficulty}
                </span>

              </div>

              {/* QUESTION */}

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed mb-8">
                {currentQuestion.question}
              </h2>

              {/* ANSWER */}

              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Answer
              </label>

              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                placeholder="Type your answer here. Explain your approach clearly and include examples where possible..."
                rows={10}
                disabled={evaluating}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none resize-none text-gray-700 leading-relaxed"
              />

              <div className="flex items-center justify-between mt-3">

                <p className="text-xs text-gray-500">
                  Tip: Give a clear explanation and mention
                  practical examples.
                </p>

                <span className="text-xs text-gray-400">
                  {answer.length} characters
                </span>

              </div>

              {/* SUBMIT */}

              <button
                type="button"
                onClick={submitAnswer}
                disabled={
                  evaluating ||
                  !answer.trim()
                }
                className="w-full mt-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-teal-700 hover:to-cyan-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
              >

                {evaluating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />

                    AI is evaluating your answer...
                  </>
                ) : (
                  <>
                    Submit Answer

                    <ChevronRight className="w-5 h-5" />
                  </>
                )}

              </button>

            </div>

            {/* EVALUATION */}

            {evaluation && (
              <div className="border-t border-gray-200 bg-gray-50 p-6 md:p-8">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                  <h2 className="text-2xl font-bold text-gray-800">
                    AI Evaluation
                  </h2>

                  <div className="bg-white rounded-xl px-6 py-3 shadow-sm text-center">

                    <p className="text-xs text-gray-500">
                      Score
                    </p>

                    <p
                      className={`text-3xl font-bold ${scoreClass(
                        evaluation.score
                      )}`}
                    >
                      {evaluation.score}/100
                    </p>

                  </div>

                </div>

                {/* FEEDBACK */}

                {evaluation.feedback && (
                  <div className="bg-white rounded-xl p-5 mb-4">

                    <div className="flex gap-3">

                      <Brain className="w-5 h-5 text-teal-600 mt-1" />

                      <div>

                        <h3 className="font-bold text-gray-800 mb-2">
                          AI Feedback
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                          {evaluation.feedback}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* STRENGTHS */}

                  {evaluation.strengths && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-5">

                      <div className="flex gap-3">

                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />

                        <div>

                          <h3 className="font-bold text-green-800 mb-2">
                            Strengths
                          </h3>

                          <p className="text-green-700 text-sm leading-relaxed">
                            {evaluation.strengths}
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* IMPROVEMENTS */}

                  {evaluation.improvements && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">

                      <div className="flex gap-3">

                        <Lightbulb className="w-5 h-5 text-yellow-600 mt-1" />

                        <div>

                          <h3 className="font-bold text-yellow-800 mb-2">
                            Improve
                          </h3>

                          <p className="text-yellow-700 text-sm leading-relaxed">
                            {evaluation.improvements}
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

                {/* NEXT QUESTION */}

                {!finished &&
                  currentQuestion && (
                    <div className="mt-6">

                      <button
                        type="button"
                        onClick={() => {
                          setAnswer("");
                          setEvaluation(null);
                        }}
                        className="w-full py-4 bg-[#043442] text-white rounded-xl font-bold hover:bg-[#032c36] transition flex items-center justify-center gap-2"
                      >

                        Continue to Next Question

                        <ChevronRight className="w-5 h-5" />

                      </button>

                    </div>
                  )}

              </div>
            )}

          </div>
        )}

        {/* FOOTER TIP */}

        <div className="mt-6 bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">

          <Clock className="w-5 h-5 text-teal-600 mt-0.5" />

          <div>

            <p className="font-semibold text-gray-700">
              Interview Tip
            </p>

            <p className="text-sm text-gray-500">
              Take your time. Structure your answer clearly
              and provide real-world examples from your projects
              or experience.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}