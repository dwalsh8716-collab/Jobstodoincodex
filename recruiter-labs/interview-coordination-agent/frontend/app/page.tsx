"use client";

import {
  AlertTriangle,
  CalendarCheck,
  Check,
  Clock,
  Copy,
  Inbox,
  LogOut,
  MailCheck,
  MessageSquare,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";

type Section =
  | "new"
  | "today"
  | "awaiting"
  | "approval"
  | "upcoming"
  | "reschedules"
  | "completed"
  | "alerts"
  | "activity";

type InterviewListItem = {
  id: string;
  workflow_public_id: string;
  state: string;
  candidate_name: string;
  client_name: string;
  company_name: string;
  job_title: string;
  stage: string;
  format: string;
  scheduled_start_at: string | null;
  updated_at: string;
};

type WorkflowEvent = {
  id: string;
  event_type: string;
  from_state: string | null;
  to_state: string | null;
  actor_type: string;
  actor_id: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

type Dashboard = {
  counts: Record<string, number>;
  today: InterviewListItem[];
  awaiting_responses: InterviewListItem[];
  needs_approval: InterviewListItem[];
  upcoming: InterviewListItem[];
  reschedule_requests: InterviewListItem[];
  completed: InterviewListItem[];
  operational_alerts: InterviewListItem[];
  activity_log: WorkflowEvent[];
};

type IntegrationStatus = {
  google: {
    configured: boolean;
    connected: boolean;
    status: string;
    account_email: string | null;
    missing_env: string[];
    scopes: string[];
    required_scopes: string[];
    missing_scopes: string[];
    workspace_posture: string;
    last_error: string | null;
  };
  email: {
    provider: string;
    configured: boolean;
    delivers_real_email: boolean;
    status: string;
    missing_env: string[];
    production_recommendation: string;
  };
  calendar: {
    provider: string;
    configured: boolean;
    creates_real_calendar_events: boolean;
    status: string;
    recruiter_conflict_checks: boolean;
  };
  automation: {
    enabled: boolean;
    gmail_reply_sync_enabled: boolean;
    due_work_interval_seconds: number;
    gmail_sync_interval_seconds: number;
  };
  crm: {
    connector: string;
    loxo_dependency: boolean;
    status: string;
  };
};

type AvailabilityWindow = {
  id: string;
  participant_type: string;
  participant_name: string;
  start_at: string;
  end_at: string;
  timezone: string;
  interpretation: string;
  confidence: number;
  requires_clarification: boolean;
};

type Message = {
  id: string;
  direction: string;
  sender_email: string | null;
  recipient_emails: string[];
  subject: string | null;
  body_plain: string | null;
  body_excerpt: string | null;
  intent: string | null;
  status: string;
  provider_error: string | null;
  requires_approval: boolean;
  created_at: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  timezone: string;
  meeting_url: string | null;
  location: string | null;
  status: string;
};

type Reminder = {
  id: string;
  reminder_type: string;
  scheduled_for: string;
  status: string;
};

type CRMExport = {
  id: string;
  connector_name: string;
  summary_text: string;
  note_text: string;
};

type InterviewDetail = {
  id: string;
  workflow_public_id: string;
  state: string;
  state_reason: string | null;
  candidate: Record<string, string | null>;
  client: Record<string, string | null>;
  company: Record<string, string>;
  job: Record<string, string>;
  stage: string;
  duration_minutes: number;
  format: string;
  office_location: string | null;
  proposed_slots: Array<{
    start_at: string;
    end_at: string;
    timezone: string;
    score: number;
    reasons: string[];
  }>;
  scheduled_start_at: string | null;
  availability_windows: AvailabilityWindow[];
  messages: Message[];
  calendar_events: CalendarEvent[];
  reminders: Reminder[];
  workflow_events: WorkflowEvent[];
  crm_export: CRMExport | null;
};

type InterviewForm = {
  candidate: {
    full_name: string;
    email: string;
    mobile: string;
    timezone: string;
    current_location: string;
  };
  client: {
    contact_name: string;
    email: string;
    company: string;
    timezone: string;
  };
  role: {
    job_title: string;
    company: string;
    interview_stage: string;
    interview_duration: number;
    interview_format: string;
  };
  office_location: string;
  client_availability_text: string;
  candidate_availability_text: string;
  notes: string;
  candidate_preparation_notes: string;
  recruiter_instructions: string;
};

function emptyForm(): InterviewForm {
  return {
    candidate: {
      full_name: "",
      email: "",
      mobile: "",
      timezone: "Europe/London",
      current_location: "",
    },
    client: {
      contact_name: "",
      email: "",
      company: "",
      timezone: "Europe/London",
    },
    role: {
      job_title: "",
      company: "",
      interview_stage: "First Interview",
      interview_duration: 45,
      interview_format: "Google Meet",
    },
    office_location: "",
    client_availability_text: "",
    candidate_availability_text: "",
    notes: "",
    candidate_preparation_notes: "",
    recruiter_instructions: "",
  };
}

function sampleForm(): InterviewForm {
  return {
    candidate: {
      full_name: "Sarah Jones",
      email: "sarah@example.com",
      mobile: "07700 900123",
      timezone: "Europe/London",
      current_location: "Manchester",
    },
    client: {
      contact_name: "Greg Smith",
      email: "greg@example.com",
      company: "WPP",
      timezone: "Europe/London",
    },
    role: {
      job_title: "PPC Account Director",
      company: "WPP",
      interview_stage: "First Interview",
      interview_duration: 45,
      interview_format: "Google Meet",
    },
    office_location: "",
    client_availability_text: "Wednesday after 2 or Thursday morning.",
    candidate_availability_text: "Wednesday works any time after 3.",
    notes: "Client wants to meet Sarah.",
    candidate_preparation_notes: "Remind Sarah to have campaign examples ready.",
    recruiter_instructions: "Keep it tight and confirm before anything goes out.",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Not booked";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function statusClass(state: string) {
  if (state.includes("REQUESTED") || state.includes("ESCALATED")) return "status danger";
  if (state.includes("AWAITING") || state.includes("MATCHING")) return "status warn";
  return "status";
}

export default function Home() {
  const [token, setToken] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [selected, setSelected] = useState<InterviewDetail | null>(null);
  const [active, setActive] = useState<Section>("new");
  const [form, setForm] = useState<InterviewForm>(emptyForm);
  const [candidateReply, setCandidateReply] = useState("Wednesday works any time after 3.");
  const [clientReply, setClientReply] = useState("Wednesday after 2 or Thursday morning.");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const api = useCallback(async <T,>(path: string, init: RequestInit = {}, authToken = token): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string> | undefined) || {}),
    };
    if (authToken && authToken !== "cookie") {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { detail?: string } | null;
      throw new Error(body?.detail || `Request failed with ${response.status}`);
    }
    return (await response.json()) as T;
  }, [token]);

  const refreshAll = useCallback(async (authToken = token) => {
    setError("");
    const [dash, list] = await Promise.all([
      api<Dashboard>("/api/dashboard", {}, authToken),
      api<InterviewListItem[]>("/api/interviews", {}, authToken),
    ]);
    const integrationStatus = await api<IntegrationStatus>("/api/integrations", {}, authToken);
    setDashboard(dash);
    setInterviews(list);
    setIntegrations(integrationStatus);
  }, [api, token]);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          setToken("cookie");
        }
      } finally {
        setCheckingSession(false);
      }
    }
    void checkSession();
  }, []);

  useEffect(() => {
    if (token) {
      const refreshTimer = window.setTimeout(() => {
        void refreshAll(token);
      }, 0);
      return () => window.clearTimeout(refreshTimer);
    }
    return undefined;
  }, [refreshAll, token]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(body?.detail || "Login failed");
      }
      await response.json();
      setToken("cookie");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function startInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        role: {
          ...form.role,
          company: form.role.company || form.client.company,
          interview_duration: Number(form.role.interview_duration),
        },
      };
      const created = await api<InterviewDetail>("/api/interviews", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSelected(created);
      setActive("approval");
      await refreshAll();
      setForm(emptyForm());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start interview");
    } finally {
      setBusy(false);
    }
  }

  async function openInterview(id: string) {
    setBusy(true);
    setError("");
    try {
      setSelected(await api<InterviewDetail>(`/api/interviews/${id}`));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open interview");
    } finally {
      setBusy(false);
    }
  }

  async function sendMockReply(participantType: "candidate" | "client") {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const body = participantType === "candidate" ? candidateReply : clientReply;
      const updated = await api<InterviewDetail>(`/api/interviews/${selected.id}/mock-reply`, {
        method: "POST",
        body: JSON.stringify({ participant_type: participantType, body }),
      });
      setSelected(updated);
      await refreshAll();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not record reply");
    } finally {
      setBusy(false);
    }
  }

  async function approveSlot(slotIndex: number) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api<InterviewDetail>(`/api/interviews/${selected.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ slot_index: slotIndex }),
      });
      setSelected(updated);
      await refreshAll();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not approve slot");
    } finally {
      setBusy(false);
    }
  }

  async function requestMoreAvailability() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await api<InterviewDetail>(`/api/interviews/${selected.id}/request-more-availability`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setSelected(updated);
      setActive("awaiting");
      setNotice("Fresh availability requests have been sent.");
      await refreshAll();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not request more availability");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancellation() {
    if (!selected) return;
    if (!window.confirm("Cancel this interview workflow and notify the candidate and client?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await api<InterviewDetail>(`/api/interviews/${selected.id}/confirm-cancellation`, {
        method: "POST",
        body: JSON.stringify({ reason: "Cancelled by recruiter" }),
      });
      setSelected(updated);
      setActive("completed");
      setNotice("Interview cancelled and the workflow has been updated.");
      await refreshAll();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not cancel interview");
    } finally {
      setBusy(false);
    }
  }

  async function processDueWork() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ reminders_sent: number; chases_sent: number; failures: string[] }>("/api/interviews/process-due", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setNotice(`Due work checked. Reminders: ${result.reminders_sent}. Chases: ${result.chases_sent}.`);
      if (result.failures.length) {
        setError(result.failures.join(" "));
      }
      await refreshAll();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not process due work");
    } finally {
      setBusy(false);
    }
  }

  async function connectGoogle() {
    setError("");
    setNotice("");
    if (!integrations?.google.configured) {
      const missing = integrations?.google.missing_env.length
        ? integrations.google.missing_env.join(", ")
        : "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET";
      setError(
        `Google is not configured yet. Missing: ${missing}. Add those Google OAuth settings, restart the backend, then click Connect Google again.`,
      );
      return;
    }
    setBusy(true);
    try {
      const response = await api<{ auth_url: string }>("/api/integrations/google/start");
      window.location.assign(response.auth_url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start Google connection");
      setBusy(false);
    }
  }

  async function syncGmailReplies() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{
        synced: number;
        skipped_duplicate: number;
        skipped_unmatched: number;
        skipped_own_mail: number;
      }>("/api/integrations/gmail/sync", { method: "POST" });
      setNotice(
        `Gmail sync complete: ${result.synced} replies matched, ${result.skipped_duplicate} duplicates skipped, ${result.skipped_unmatched} unmatched.`,
      );
      await refreshAll();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sync Gmail replies");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    setToken("");
    setDashboard(null);
    setSelected(null);
  }

  const filteredInterviews = useMemo(() => {
    const needle = search.toLowerCase().trim();
    if (!needle) return interviews;
    return interviews.filter((item) =>
      [
        item.candidate_name,
        item.client_name,
        item.company_name,
        item.job_title,
        item.state,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [interviews, search]);

  if (checkingSession) {
    return (
      <main className="loginScreen">
        <section className="loginBox">
          <p className="status">
            <ShieldCheck size={14} /> Private internal app
          </p>
          <h1>Checking session</h1>
          <p className="lede">One second, just making sure you are still signed in.</p>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="loginScreen">
        <form className="loginBox form" onSubmit={login}>
          <div>
            <p className="status">
              <ShieldCheck size={14} /> Private internal app
            </p>
            <h1>Interview Coordination Agent</h1>
            <p className="lede">
              Log in to start and track interview scheduling without touching Loxo.
            </p>
          </div>
          {error ? <div className="error">{error}</div> : null}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            <ShieldCheck size={18} /> {busy ? "Checking" : "Log In"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>Interview Coordination Agent</strong>
          <span>Private Recruiter Labs MVP. Manual entry, approval gates, Gmail and Google Calendar once connected.</span>
        </div>
        <nav className="nav" aria-label="Dashboard sections">
          <NavButton active={active === "new"} icon={<UserPlus size={17} />} label="New Interview" onClick={() => setActive("new")} />
          <NavButton active={active === "today"} icon={<Clock size={17} />} label="Today" onClick={() => setActive("today")} />
          <NavButton active={active === "awaiting"} icon={<Inbox size={17} />} label="Awaiting Responses" onClick={() => setActive("awaiting")} />
          <NavButton active={active === "approval"} icon={<Check size={17} />} label="Needs Approval" onClick={() => setActive("approval")} />
          <NavButton active={active === "upcoming"} icon={<CalendarCheck size={17} />} label="Upcoming" onClick={() => setActive("upcoming")} />
          <NavButton active={active === "reschedules"} icon={<RefreshCcw size={17} />} label="Reschedules" onClick={() => setActive("reschedules")} />
          <NavButton active={active === "completed"} icon={<Check size={17} />} label="Completed" onClick={() => setActive("completed")} />
          <NavButton active={active === "alerts"} icon={<AlertTriangle size={17} />} label="Alerts" onClick={() => setActive("alerts")} />
          <NavButton active={active === "activity"} icon={<MessageSquare size={17} />} label="Activity Log" onClick={() => setActive("activity")} />
        </nav>
        <button className="logout" type="button" onClick={logout}>
          <LogOut size={17} /> Log out
        </button>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <p className="status">
              <ShieldCheck size={14} /> Standalone, no CRM dependency
            </p>
            <h1>Quietly handle the interview admin.</h1>
            <p className="lede">
              Enter the details once, let the agent gather availability, approve the slot, then track confirmations,
              reminders and the manual CRM note.
            </p>
          </div>
          <button className="btn secondary" type="button" onClick={() => void refreshAll()} disabled={busy}>
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {notice ? <div className="notice">{notice}</div> : null}

        <section className="grid stats" aria-label="Dashboard totals">
          <Stat label="Today" value={dashboard?.counts.today ?? 0} />
          <Stat label="Awaiting" value={dashboard?.counts.awaiting_responses ?? 0} />
          <Stat label="Approval" value={dashboard?.counts.needs_approval ?? 0} />
          <Stat label="Upcoming" value={dashboard?.counts.upcoming ?? 0} />
          <Stat label="Reschedules" value={dashboard?.counts.reschedule_requests ?? 0} />
          <Stat label="Completed" value={dashboard?.counts.completed ?? 0} />
          <Stat label="Alerts" value={dashboard?.counts.operational_alerts ?? 0} />
        </section>

        <IntegrationPanel
          integrations={integrations}
          onConnectGoogle={connectGoogle}
          onSyncGmail={syncGmailReplies}
          onProcessDueWork={processDueWork}
          busy={busy}
        />

        <div className="columns" style={{ marginTop: 16 }}>
          <section className="panel">
            {active === "new" ? (
              <NewInterviewForm form={form} setForm={setForm} onSubmit={startInterview} onSample={() => setForm(sampleForm())} busy={busy} />
            ) : (
              <DashboardSection
                active={active as Exclude<Section, "new">}
                dashboard={dashboard}
                interviews={filteredInterviews}
                search={search}
                setSearch={setSearch}
                openInterview={(id) => void openInterview(id)}
              />
            )}
          </section>

          <section className="panel">
            {selected ? (
              <InterviewDetailPanel
                interview={selected}
                candidateReply={candidateReply}
                clientReply={clientReply}
                setCandidateReply={setCandidateReply}
                setClientReply={setClientReply}
                sendMockReply={sendMockReply}
                approveSlot={approveSlot}
                requestMoreAvailability={requestMoreAvailability}
                confirmCancellation={confirmCancellation}
                busy={busy}
              />
            ) : (
              <div>
                <h2>Workflow Detail</h2>
                <p className="muted">Open an interview to see messages, availability, proposed slots, calendar events and audit history.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function IntegrationPanel({
  integrations,
  onConnectGoogle,
  onSyncGmail,
  onProcessDueWork,
  busy,
}: {
  integrations: IntegrationStatus | null;
  onConnectGoogle: () => void;
  onSyncGmail: () => void;
  onProcessDueWork: () => void;
  busy: boolean;
}) {
  if (!integrations) return null;

  const emailReal = integrations.email.delivers_real_email;
  const calendarReal = integrations.calendar.creates_real_calendar_events;
  const googleReady = integrations.google.configured && integrations.google.connected;
  return (
    <section className={emailReal && calendarReal ? "panel" : "approval"} style={{ marginTop: 16 }}>
      <div className="integrationHeader">
        <div>
          <h3>Email And Calendar Status</h3>
          <p className="muted">
            Google: <strong>{googleReady ? `Connected as ${integrations.google.account_email}` : integrations.google.status.replaceAll("_", " ")}</strong>
          </p>
        </div>
        <div className="actions">
          <button className="btn secondary" type="button" onClick={onConnectGoogle} disabled={busy}>
            <CalendarCheck size={18} /> {googleReady ? "Reconnect Google" : "Connect Google"}
          </button>
          <button className="btn secondary" type="button" onClick={onSyncGmail} disabled={busy || !googleReady}>
            <MailCheck size={18} /> Sync Gmail Replies
          </button>
          <button className="btn secondary" type="button" onClick={onProcessDueWork} disabled={busy}>
            <Clock size={18} /> Run Due Work
          </button>
        </div>
      </div>
      <div className="statusGrid">
        <p className="muted">
          Email: <strong>{emailReal ? "Real delivery enabled" : "Mock only, no inbox delivery"}</strong>
          <br />
          Provider: {integrations.email.provider}
        </p>
        <p className="muted">
          Calendar: <strong>{calendarReal ? "Real Google Calendar and Meet enabled" : "Mock calendar only"}</strong>
          <br />
          Provider: {integrations.calendar.provider}
          <br />
          Recruiter diary blocks slots: {integrations.calendar.recruiter_conflict_checks ? "yes" : "no"}
        </p>
        <p className="muted">
          Automation: <strong>{integrations.automation.enabled ? "Running with backend" : "Off"}</strong>
          <br />
          Gmail replies: {integrations.automation.gmail_reply_sync_enabled ? "auto sync enabled" : "manual only"}
        </p>
      </div>
      {!integrations.google.configured ? (
        <p className="muted">Add the Google OAuth client ID and secret before connecting Google.</p>
      ) : null}
      {integrations.google.missing_env.length ? <p className="muted">Missing Google settings: {integrations.google.missing_env.join(", ")}</p> : null}
      {integrations.google.missing_scopes.length ? (
        <p className="error">Google needs reconnecting for updated permissions: {integrations.google.missing_scopes.join(", ")}</p>
      ) : null}
      {integrations.google.last_error ? <p className="error">{integrations.google.last_error}</p> : null}
    </section>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} type="button" onClick={onClick}>
      {icon} {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DashboardSection({
  active,
  dashboard,
  interviews,
  search,
  setSearch,
  openInterview,
}: {
  active: Exclude<Section, "new">;
  dashboard: Dashboard | null;
  interviews: InterviewListItem[];
  search: string;
  setSearch: (value: string) => void;
  openInterview: (id: string) => void;
}) {
  const map: Record<Exclude<Section, "new">, { title: string; items: InterviewListItem[] }> = {
    today: { title: "Today", items: dashboard?.today ?? [] },
    awaiting: { title: "Awaiting Responses", items: dashboard?.awaiting_responses ?? [] },
    approval: { title: "Needs Approval", items: dashboard?.needs_approval ?? [] },
    upcoming: { title: "Upcoming", items: dashboard?.upcoming ?? [] },
    reschedules: { title: "Reschedule Requests", items: dashboard?.reschedule_requests ?? [] },
    completed: { title: "Completed", items: dashboard?.completed ?? [] },
    alerts: { title: "Alerts", items: dashboard?.operational_alerts ?? [] },
    activity: { title: "Activity Log", items: [] },
  };

  if (active === "activity") {
    return (
      <div>
        <h2>Activity Log</h2>
        <div className="timeline">
          {(dashboard?.activity_log ?? []).map((event) => (
            <div className="timelineItem" key={event.id}>
              <strong>{event.event_type.replaceAll("_", " ")}</strong>
              <p className="muted">
                {event.from_state || "new"} to {event.to_state || "unchanged"} · {formatDate(event.created_at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const section = map[active];
  const items = search.trim() ? interviews : section.items;

  return (
    <div className="grid">
      <div className="topbar">
        <h2>{search.trim() ? "Search results" : section.title}</h2>
      </div>
      <div className="field">
        <label htmlFor="search">Search history</label>
        <div style={{ position: "relative" }}>
          <Search size={17} style={{ left: 12, position: "absolute", top: 13 }} />
          <input
            id="search"
            style={{ paddingLeft: 38 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Candidate, client, company, job or status"
          />
        </div>
      </div>
      <div className="list">
        {items.length ? (
          items.map((item: InterviewListItem) => (
            <InterviewItem key={item.id} item={item} openInterview={openInterview} />
          ))
        ) : (
          <p className="muted">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}

function InterviewItem({
  item,
  openInterview,
}: {
  item: InterviewListItem;
  openInterview: (id: string) => void;
}) {
  return (
    <article className="item">
      <span className={statusClass(item.state)}>{item.state.replaceAll("_", " ")}</span>
      <div>
        <strong>{item.candidate_name}</strong>
        <p className="muted">
          {item.job_title} · {item.company_name} · {item.stage}
        </p>
      </div>
      <p className="muted">{formatDate(item.scheduled_start_at)}</p>
      <button className="btn secondary" type="button" onClick={() => openInterview(item.id)}>
        Open
      </button>
    </article>
  );
}

function NewInterviewForm({
  form,
  setForm,
  onSubmit,
  onSample,
  busy,
}: {
  form: InterviewForm;
  setForm: React.Dispatch<React.SetStateAction<InterviewForm>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSample: () => void;
  busy: boolean;
}) {
  function update<Group extends keyof InterviewForm, Field extends keyof InterviewForm[Group]>(
    group: Group,
    field: Field,
    value: InterviewForm[Group][Field],
  ) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...(current[group] as Record<string, unknown>),
        [field]: value,
      },
    }));
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div>
        <p className="status warn">Start interview coordination</p>
        <h2>Start Interview Coordination</h2>
      </div>

      <h3>Candidate</h3>
      <div className="formSection">
        <Field label="Full name" value={form.candidate.full_name} onChange={(value) => update("candidate", "full_name", value)} required />
        <Field label="Email address" type="email" value={form.candidate.email} onChange={(value) => update("candidate", "email", value)} required />
        <Field label="Mobile number" value={form.candidate.mobile} onChange={(value) => update("candidate", "mobile", value)} />
        <Field label="Timezone" value={form.candidate.timezone} onChange={(value) => update("candidate", "timezone", value)} required />
        <Field label="Current location" value={form.candidate.current_location} onChange={(value) => update("candidate", "current_location", value)} />
      </div>

      <h3>Client</h3>
      <div className="formSection">
        <Field label="Contact name" value={form.client.contact_name} onChange={(value) => update("client", "contact_name", value)} required />
        <Field label="Email address" type="email" value={form.client.email} onChange={(value) => update("client", "email", value)} required />
        <Field label="Company" value={form.client.company} onChange={(value) => update("client", "company", value)} required />
        <Field label="Timezone" value={form.client.timezone} onChange={(value) => update("client", "timezone", value)} required />
      </div>

      <h3>Role</h3>
      <div className="formSection">
        <Field label="Job title" value={form.role.job_title} onChange={(value) => update("role", "job_title", value)} required />
        <Field label="Company" value={form.role.company} onChange={(value) => update("role", "company", value)} />
        <Field label="Interview stage" value={form.role.interview_stage} onChange={(value) => update("role", "interview_stage", value)} required />
        <Field
          label="Interview duration"
          type="number"
          value={String(form.role.interview_duration)}
          onChange={(value) => update("role", "interview_duration", Number(value))}
          required
        />
        <div className="field">
          <label htmlFor="format">Interview format</label>
          <select id="format" value={form.role.interview_format} onChange={(event) => update("role", "interview_format", event.target.value)}>
            <option>Microsoft Teams</option>
            <option>Google Meet</option>
            <option>Zoom</option>
            <option>Telephone</option>
            <option>In person</option>
            <option>Other</option>
          </select>
        </div>
        <Field label="Office location" value={form.office_location} onChange={(value) => setForm((current) => ({ ...current, office_location: value }))} />
      </div>

      <div className="formSection">
        <TextField label="Client availability if already known" value={form.client_availability_text} onChange={(value) => setForm((current) => ({ ...current, client_availability_text: value }))} />
        <TextField label="Candidate availability if already known" value={form.candidate_availability_text} onChange={(value) => setForm((current) => ({ ...current, candidate_availability_text: value }))} />
        <TextField label="Notes" value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
        <TextField label="Candidate preparation notes" value={form.candidate_preparation_notes} onChange={(value) => setForm((current) => ({ ...current, candidate_preparation_notes: value }))} />
        <TextField label="Recruiter instructions" value={form.recruiter_instructions} onChange={(value) => setForm((current) => ({ ...current, recruiter_instructions: value }))} />
      </div>

      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          <Send size={18} /> {busy ? "Starting" : "Start Coordination"}
        </button>
        <button className="btn secondary" type="button" onClick={onSample}>
          Load sample
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="field full">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function InterviewDetailPanel({
  interview,
  candidateReply,
  clientReply,
  setCandidateReply,
  setClientReply,
  sendMockReply,
  approveSlot,
  requestMoreAvailability,
  confirmCancellation,
  busy,
}: {
  interview: InterviewDetail;
  candidateReply: string;
  clientReply: string;
  setCandidateReply: (value: string) => void;
  setClientReply: (value: string) => void;
  sendMockReply: (participantType: "candidate" | "client") => Promise<void>;
  approveSlot: (slotIndex: number) => Promise<void>;
  requestMoreAvailability: () => Promise<void>;
  confirmCancellation: () => Promise<void>;
  busy: boolean;
}) {
  return (
    <div className="detail">
      <div>
        <span className={statusClass(interview.state)}>{interview.state.replaceAll("_", " ")}</span>
        <h2 style={{ marginTop: 10 }}>{interview.candidate.full_name}</h2>
        <p className="muted">
          {interview.job.title} · {interview.company.name} · {interview.stage} · {interview.format}
        </p>
      </div>

      {(interview.state === "AWAITING_RECRUITER_APPROVAL" || (interview.state === "ERROR" && interview.proposed_slots.length > 0)) ? (
        <div className="approval">
          <h3>{interview.state === "ERROR" ? "Retry Slot Approval" : "Recommended Slot"}</h3>
          <div className="slotList">
            {interview.proposed_slots.map((slot, index) => (
              <div className="slot" key={`${slot.start_at}-${slot.end_at}`}>
                <div>
                  <strong>{index === 0 ? "Recommended" : "Alternative"}</strong>
                  <p className="muted">
                    {formatDate(slot.start_at)} to {formatDate(slot.end_at)}
                  </p>
                </div>
                <button className="btn" type="button" onClick={() => void approveSlot(index)} disabled={busy}>
                  <Check size={18} /> Approve
                </button>
              </div>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn warning" type="button" onClick={() => void requestMoreAvailability()} disabled={busy}>
              <RefreshCcw size={18} />
              Request More Availability
            </button>
            <button className="btn danger" type="button" onClick={() => void confirmCancellation()} disabled={busy}>
              <XCircle size={18} />
              Cancel Workflow
            </button>
          </div>
        </div>
      ) : null}

      {interview.state === "RESCHEDULE_REQUESTED" ? (
        <div className="approval">
          <h3>Reschedule Requested</h3>
          <p className="muted">Ask both sides for fresh availability, then approve the new slot. The existing calendar event will be updated, not duplicated.</p>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn warning" type="button" onClick={() => void requestMoreAvailability()} disabled={busy}>
              <RefreshCcw size={18} />
              Request Fresh Availability
            </button>
            <button className="btn danger" type="button" onClick={() => void confirmCancellation()} disabled={busy}>
              <XCircle size={18} />
              Cancel Instead
            </button>
          </div>
        </div>
      ) : null}

      {interview.state === "CANCELLATION_REQUESTED" ? (
        <div className="approval">
          <h3>Cancellation Needs Approval</h3>
          <p className="muted">Nothing will be cancelled until you confirm it here.</p>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn danger" type="button" onClick={() => void confirmCancellation()} disabled={busy}>
              <XCircle size={18} />
              Confirm Cancellation
            </button>
            <button className="btn warning" type="button" onClick={() => void requestMoreAvailability()} disabled={busy}>
              <RefreshCcw size={18} />
              Reschedule Instead
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid">
        <h3>Mock Inbox</h3>
        <div className="formSection">
          <div className="field">
            <label htmlFor="candidate-reply">Candidate reply</label>
            <textarea id="candidate-reply" value={candidateReply} onChange={(event) => setCandidateReply(event.target.value)} />
            <button className="btn secondary" type="button" onClick={() => void sendMockReply("candidate")} disabled={busy}>
              <MessageSquare size={18} /> Record Candidate Reply
            </button>
          </div>
          <div className="field">
            <label htmlFor="client-reply">Client reply</label>
            <textarea id="client-reply" value={clientReply} onChange={(event) => setClientReply(event.target.value)} />
            <button className="btn secondary" type="button" onClick={() => void sendMockReply("client")} disabled={busy}>
              <MessageSquare size={18} /> Record Client Reply
            </button>
          </div>
        </div>
      </div>

      <InfoGrid interview={interview} />
      <Messages messages={interview.messages} />
      <Timeline events={interview.workflow_events} />
    </div>
  );
}

function InfoGrid({ interview }: { interview: InterviewDetail }) {
  return (
    <div className="grid">
      <div className="item">
        <h3>Availability</h3>
        {interview.availability_windows.length ? (
          interview.availability_windows.map((window) => (
            <p key={window.id} className="muted">
              <strong>{window.participant_name}</strong>: {window.interpretation} Confidence {Math.round(window.confidence * 100)}%
            </p>
          ))
        ) : (
          <p className="muted">No availability captured yet.</p>
        )}
      </div>

      <div className="item">
        <h3>Calendar</h3>
        {interview.calendar_events.length ? (
          interview.calendar_events.map((event) => (
            <p key={event.id} className="muted">
              <strong>{event.title}</strong>
              <br />
              {formatDate(event.start_at)} · {event.meeting_url || event.location || "Location to confirm"}
            </p>
          ))
        ) : (
          <p className="muted">No calendar event has been created. Good. Approval comes first.</p>
        )}
      </div>

      <div className="item">
        <h3>Reminders</h3>
        {interview.reminders.length ? (
          interview.reminders.map((reminder) => (
            <p key={reminder.id} className="muted">
              {reminder.reminder_type.replaceAll("_", " ")} · {formatDate(reminder.scheduled_for)} · {reminder.status}
            </p>
          ))
        ) : (
          <p className="muted">No reminders scheduled yet.</p>
        )}
      </div>

      {interview.crm_export ? (
        <div className="item">
          <h3>Manual CRM Output</h3>
          <pre className="message">{interview.crm_export.summary_text}</pre>
          <div className="actions">
            <button className="btn secondary" type="button" onClick={() => void navigator.clipboard.writeText(interview.crm_export?.summary_text || "")}>
              <Copy size={18} /> Copy for CRM
            </button>
            <button className="btn secondary" type="button" onClick={() => void navigator.clipboard.writeText(interview.crm_export?.note_text || "")}>
              <Copy size={18} /> Copy Note
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Messages({ messages }: { messages: Message[] }) {
  return (
    <div className="grid">
      <h3>Messages</h3>
      {messages.length ? (
        messages.map((message) => (
          <article className="message" key={message.id}>
            <strong>
              {message.direction} · {message.status === "mock_sent" ? "mock sent, not delivered" : message.status}
            </strong>
            <p className="muted">{message.subject}</p>
            {message.provider_error ? <p className="error">{message.provider_error}</p> : null}
            {message.body_plain}
          </article>
        ))
      ) : (
        <p className="muted">No messages yet.</p>
      )}
    </div>
  );
}

function Timeline({ events }: { events: WorkflowEvent[] }) {
  return (
    <div className="grid">
      <h3>Audit History</h3>
      <div className="timeline">
        {events.map((event) => (
          <div className="timelineItem" key={event.id}>
            <strong>{event.event_type.replaceAll("_", " ")}</strong>
            <p className="muted">
              {event.from_state || "new"} to {event.to_state || "unchanged"} · {formatDate(event.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
