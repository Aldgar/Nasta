"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../../lib/api";

interface SurveyTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  name?: string;
  email?: string;
  createdAt: string;
}

function parseSurveyMessage(message: string) {
  const lines = message.split("\n").filter((line) => line.trim());
  const questions: { question: string; answer: string }[] = [];
  lines.forEach((line) => {
    const match = line.match(/^(\d+)\.\s*(.+?):\s*(.+)$/);
    if (match) {
      questions.push({ question: match[2].trim(), answer: match[3].trim() });
    } else if (line.includes(":")) {
      const [question, ...answerParts] = line.split(":");
      questions.push({
        question: question.trim(),
        answer: answerParts.join(":").trim() || "N/A",
      });
    }
  });
  return questions;
}

export default function AdminSurveysPage() {
  const [activeTab, setActiveTab] = useState<"employer" | "provider">(
    "employer",
  );
  const [employerSurveys, setEmployerSurveys] = useState<SurveyTicket[]>([]);
  const [providerSurveys, setProviderSurveys] = useState<SurveyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyTicket | null>(
    null,
  );

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    const [empRes, provRes] = await Promise.all([
      api<{ tickets: SurveyTicket[] }>(
        "/support/admin/tickets?category=EMPLOYER_SURVEY&scope=all",
      ),
      api<{ tickets: SurveyTicket[] }>(
        "/support/admin/tickets?category=PROVIDER_SURVEY&scope=all",
      ),
    ]);
    if (empRes.data) setEmployerSurveys(empRes.data.tickets || []);
    if (provRes.data) setProviderSurveys(provRes.data.tickets || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const currentSurveys =
    activeTab === "employer" ? employerSurveys : providerSurveys;

  const getUserName = (s: SurveyTicket) =>
    s.user ? `${s.user.firstName} ${s.user.lastName}` : s.name || "Anonymous";
  const getUserEmail = (s: SurveyTicket) =>
    s.user?.email || s.email || "No email";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Surveys
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            View user feedback and survey responses.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-[var(--border-color)] bg-[var(--surface)] overflow-hidden w-fit">
        <button
          onClick={() => setActiveTab("employer")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === "employer" ? "bg-[var(--primary)] text-white" : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"}`}
        >
          Employer Surveys ({employerSurveys.length})
        </button>
        <button
          onClick={() => setActiveTab("provider")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === "provider" ? "bg-[var(--primary)] text-white" : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"}`}
        >
          Provider Surveys ({providerSurveys.length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : currentSurveys.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-[var(--muted-text)]">
            No {activeTab === "employer" ? "employer" : "provider"} surveys yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentSurveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => setSelectedSurvey(survey)}
              className="cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--primary)]/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {survey.category === "EMPLOYER_SURVEY"
                        ? "Employer Survey"
                        : "Service Provider Survey"}
                    </h3>
                    <p className="text-xs text-[var(--muted-text)]">
                      {new Date(survey.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[var(--muted-text)]">View →</span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted-text)]">
                <span>👤 {getUserName(survey)}</span>
                <span>✉️ {getUserEmail(survey)}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--foreground)]/70 line-clamp-2">
                {survey.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Survey detail modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  Survey Details
                </h2>
                <p className="text-sm text-[var(--muted-text)]">
                  {selectedSurvey.category === "EMPLOYER_SURVEY"
                    ? "Employer Survey"
                    : "Service Provider Survey"}
                </p>
              </div>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {/* Survey Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-[var(--background)] p-3">
                <p className="text-[10px] uppercase text-[var(--muted-text)]">
                  Survey Type
                </p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {selectedSurvey.category === "EMPLOYER_SURVEY"
                    ? "Employer"
                    : "Service Provider"}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--background)] p-3">
                <p className="text-[10px] uppercase text-[var(--muted-text)]">
                  Submitted
                </p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {new Date(selectedSurvey.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-4 rounded-lg bg-[var(--background)] p-4">
              <p className="text-xs font-semibold text-[var(--foreground)] mb-2">
                Contact Information
              </p>
              <div className="space-y-1.5 text-sm text-[var(--muted-text)]">
                <p>👤 {getUserName(selectedSurvey)}</p>
                <p>✉️ {getUserEmail(selectedSurvey)}</p>
                {selectedSurvey.user?.phone && (
                  <p>📱 {selectedSurvey.user.phone}</p>
                )}
              </div>
            </div>

            {/* Survey Responses */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[var(--foreground)] mb-3">
                Survey Responses
              </p>
              <div className="space-y-3">
                {parseSurveyMessage(selectedSurvey.message).map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-[var(--background)] p-3 border-l-2 border-[var(--primary)]"
                    >
                      <p className="text-xs font-semibold text-[var(--foreground)]">
                        {item.question}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted-text)]">
                        {item.answer}
                      </p>
                    </div>
                  ),
                )}
                {parseSurveyMessage(selectedSurvey.message).length === 0 && (
                  <div className="rounded-lg bg-[var(--background)] p-4">
                    <p className="text-sm text-[var(--foreground)]/80 whitespace-pre-wrap">
                      {selectedSurvey.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSurvey(null)}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
