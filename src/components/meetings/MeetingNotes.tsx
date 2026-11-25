/**
 * MeetingNotes — Full meeting recording, transcription, and AI summarization.
 *
 * Like Granola/Wispr Flow, built into AXIVA:
 * - Record meetings via browser microphone
 * - Chunked transcription via OpenAI GPT Transcribe (96% accuracy)
 * - AI-powered structured summary (decisions, action items, follow-ups)
 * - Meeting history with search
 * - Create deck from meeting transcript
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { invokeSignedIn } from "@/lib/supabase-function-client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Square,
  Loader2,
  Sparkles,
  FileText,
  Clock,
  Search,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Users,
  ListTodo,
  MessageSquare,
  Presentation,
  Play,
  Pause,
} from "lucide-react";

/* ── Types ──────────────────────────────────────── */

interface MeetingSummary {
  overview: string;
  decisions: string[];
  action_items: { owner: string; task: string; deadline: string | null }[];
  topics: string[];
  follow_ups: string[];
  key_quotes: string[];
  sentiment: "positive" | "neutral" | "mixed" | "tense";
  duration_estimate: string;
}

interface MeetingNote {
  id: string;
  title: string;
  transcript: string | null;
  summary: MeetingSummary | null;
  duration_seconds: number | null;
  recorded_at: string;
  status: "recording" | "transcribing" | "summarizing" | "complete" | "error";
  error_message: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

/* ── Timer Display ──────────────────────────────── */

function RecordingTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="font-mono text-lg tabular-nums">
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

/* ── Summary Card ───────────────────────────────── */

function SummaryView({ summary }: { summary: MeetingSummary }) {
  const [expanded, setExpanded] = useState<string | null>("overview");

  const sections = [
    {
      key: "overview",
      icon: FileText,
      label: "Overview",
      color: "text-blue-500",
      content: <p className="text-sm leading-relaxed">{summary.overview}</p>,
    },
    {
      key: "decisions",
      icon: CheckCircle2,
      label: `Decisions (${summary.decisions.length})`,
      color: "text-green-500",
      content: summary.decisions.length > 0 ? (
        <ul className="space-y-1.5">
          {summary.decisions.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No decisions recorded</p>
      ),
    },
    {
      key: "action_items",
      icon: ListTodo,
      label: `Action Items (${summary.action_items.length})`,
      color: "text-red-500",
      content: summary.action_items.length > 0 ? (
        <div className="space-y-2">
          {summary.action_items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/20 p-2.5"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{item.task}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {item.owner}
                  </span>
                  {item.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No action items</p>
      ),
    },
    {
      key: "topics",
      icon: MessageSquare,
      label: `Topics (${summary.topics.length})`,
      color: "text-violet-500",
      content: (
        <div className="flex flex-wrap gap-1.5">
          {summary.topics.map((t, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "follow_ups",
      icon: AlertCircle,
      label: `Follow-ups (${summary.follow_ups.length})`,
      color: "text-amber-500",
      content: summary.follow_ups.length > 0 ? (
        <ul className="space-y-1.5">
          {summary.follow_ups.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No follow-ups</p>
      ),
    },
  ];

  return (
    <div className="space-y-1">
      {/* Sentiment badge */}
      <div className="mb-3 flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            summary.sentiment === "positive" && "border-green-500/30 text-green-500",
            summary.sentiment === "tense" && "border-red-500/30 text-red-500",
            summary.sentiment === "mixed" && "border-amber-500/30 text-amber-500",
          )}
        >
          {summary.sentiment} tone
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {summary.duration_estimate}
        </span>
      </div>

      {sections.map(({ key, icon: Icon, label, color, content }) => (
        <div key={key} className="rounded-lg border border-border/30">
          <button
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
            onClick={() => setExpanded(expanded === key ? null : key)}
          >
            <Icon className={cn("h-4 w-4 shrink-0", color)} />
            <span className="text-sm font-medium flex-1">{label}</span>
            {expanded === key ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          {expanded === key && (
            <div className="px-3 pb-3 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
              {content}
            </div>
          )}
        </div>
      ))}

      {/* Key quotes */}
      {summary.key_quotes?.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Key quotes
          </p>
          {summary.key_quotes.map((q, i) => (
            <blockquote
              key={i}
              className="border-l-2 border-accent/30 pl-3 text-sm italic text-muted-foreground"
            >
              "{q}"
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Meeting Card (history list) ────────────────── */

function MeetingCard({
  meeting,
  onSelect,
  onDelete,
  onToggleFavorite,
}: {
  meeting: MeetingNote;
  onSelect: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  const summary = meeting.summary as MeetingSummary | null;
  const statusColors: Record<string, string> = {
    recording: "bg-red-500",
    transcribing: "bg-amber-500",
    summarizing: "bg-blue-500",
    complete: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl border border-border/50 p-4 hover:bg-muted/30 hover:border-accent/30 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                statusColors[meeting.status] || "bg-gray-500",
              )}
            />
            <h3 className="text-sm font-semibold truncate">{meeting.title}</h3>
          </div>
          {summary?.overview && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {summary.overview}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(meeting.recorded_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            {meeting.duration_seconds && (
              <span>
                {Math.round(meeting.duration_seconds / 60)} min
              </span>
            )}
            {summary?.action_items?.length ? (
              <span className="text-red-500 font-medium">
                {summary.action_items.length} action items
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1.5 rounded-md hover:bg-muted"
          >
            {meeting.is_favorite ? (
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            ) : (
              <StarOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
    </button>
  );
}

/* ── Main Component ─────────────────────────────── */

export default function MeetingNotes() {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentTitle, setCurrentTitle] = useState("Untitled Meeting");
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<MeetingSummary | null>(null);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // History state
  const [meetings, setMeetings] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingNote | null>(null);

  // View state
  const [view, setView] = useState<"record" | "detail">("record");

  /* ── Load meeting history ─────────────────────── */

  const loadMeetings = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meeting_notes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("recorded_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMeetings((data as MeetingNote[]) || []);
    } catch (err) {
      console.error("Failed to load meetings:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  /* ── Recording ────────────────────────────────── */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // Record in 30-second intervals for chunked transcription
      recorder.start(30000);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordingStartTime(Date.now());
      setCurrentTranscript("");
      setCurrentSummary(null);
      setCurrentMeetingId(null);

      // Create meeting record in DB
      if (session?.user?.id) {
        const { data } = await supabase
          .from("meeting_notes")
          .insert({
            user_id: session.user.id,
            title: currentTitle || "Untitled Meeting",
            status: "recording",
          })
          .select("id")
          .single();

        if (data) setCurrentMeetingId(data.id);
      }

      // Set up periodic chunk transcription
      chunkIntervalRef.current = setInterval(async () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob([...audioChunksRef.current], {
            type: "audio/webm",
          });
          if (blob.size > 1000) {
            await transcribeChunk(blob);
          }
        }
      }, 35000); // Every 35 seconds (after 30s chunk is ready)

      toast({ title: "Recording started", description: "Speak naturally. We'll capture everything." });
    } catch {
      toast({
        title: "Microphone access denied",
        description: "Allow microphone access in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const transcribeChunk = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "meeting-chunk.webm");
      formData.append("language", "en");
      formData.append("context", `Business meeting transcription. Meeting title: ${currentTitle}`);

      const { data, error } = await invokeSignedIn("transcribe-audio", {
        body: formData,
      });

      if (error) throw error;
      if (data?.text) {
        setCurrentTranscript((prev) => (prev ? prev + " " : "") + data.text);
      }
    } catch (err) {
      console.error("Chunk transcription failed:", err);
    }
  };

  const stopRecording = async () => {
    // Stop the periodic transcription
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

    // Stop the media recorder
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      // Wait for the final ondataavailable
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });

      // Stop all audio tracks
      recorder.stream.getTracks().forEach((t) => t.stop());
    }
    mediaRecorderRef.current = null;
    setRecording(false);

    const duration = recordingStartTime
      ? Math.floor((Date.now() - recordingStartTime) / 1000)
      : 0;
    setRecordingStartTime(null);

    // Transcribe the final chunk
    const finalBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    if (finalBlob.size > 500) {
      setTranscribing(true);

      // Update DB status
      if (currentMeetingId) {
        await supabase
          .from("meeting_notes")
          .update({ status: "transcribing", duration_seconds: duration })
          .eq("id", currentMeetingId);
      }

      try {
        const formData = new FormData();
        formData.append("audio", finalBlob, "meeting-final.webm");
        formData.append("language", "en");
        formData.append(
          "context",
          `Business meeting transcription. Title: ${currentTitle}. This is the complete recording.`,
        );

        const { data, error } = await invokeSignedIn("transcribe-audio", {
          body: formData,
        });

        if (error) throw error;
        if (data?.text) {
          setCurrentTranscript((prev) => {
            const full = (prev ? prev + " " : "") + data.text;
            // Save transcript to DB
            if (currentMeetingId) {
              supabase
                .from("meeting_notes")
                .update({
                  transcript: full,
                  duration_seconds: duration,
                  status: "summarizing",
                })
                .eq("id", currentMeetingId)
                .then(() => {});
            }
            // Start summarization
            summarizeMeeting(full);
            return full;
          });
        }
      } catch (err) {
        console.error("Final transcription failed:", err);
        toast({ title: "Transcription failed", variant: "destructive" });
      } finally {
        setTranscribing(false);
      }
    }
  };

  /* ── Summarization ────────────────────────────── */

  const summarizeMeeting = async (transcript: string) => {
    if (!transcript.trim()) return;
    setSummarizing(true);

    try {
      const { data, error } = await invokeSignedIn("summarize-meeting", {
        body: {
          transcript,
          title: currentTitle,
          meeting_id: currentMeetingId,
        },
      });

      if (error) throw error;
      if (data?.summary) {
        setCurrentSummary(data.summary);
        toast({ title: "Meeting summarized", description: "AI summary ready with action items." });
      }
    } catch (err) {
      console.error("Summarization failed:", err);
      toast({ title: "Summary failed", description: "Transcript saved. You can retry later.", variant: "destructive" });
    } finally {
      setSummarizing(false);
      loadMeetings(); // Refresh the list
    }
  };

  /* ── Actions ──────────────────────────────────── */

  const deleteMeeting = async (id: string) => {
    await supabase.from("meeting_notes").delete().eq("id", id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (selectedMeeting?.id === id) {
      setSelectedMeeting(null);
      setView("record");
    }
    toast({ title: "Meeting deleted" });
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    await supabase
      .from("meeting_notes")
      .update({ is_favorite: !current })
      .eq("id", id);
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_favorite: !current } : m)),
    );
  };

  const createDeckFromMeeting = (transcript: string) => {
    const brief = `Create a presentation based on this meeting transcript. Extract the key points, decisions, and action items into a compelling deck:\n\n${transcript.slice(0, 3000)}`;
    navigate(`/create?prompt=${encodeURIComponent(brief)}`);
  };

  /* ── Filtered meetings ────────────────────────── */

  const filteredMeetings = meetings.filter(
    (m) =>
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.transcript || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /* ── Render ───────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Meeting Notes</h2>
          <p className="text-sm text-muted-foreground">
            Record, transcribe, and summarize your meetings with AI
          </p>
        </div>
        {view === "detail" && (
          <Button variant="outline" size="sm" onClick={() => { setView("record"); setSelectedMeeting(null); }}>
            Back to recorder
          </Button>
        )}
      </div>

      {view === "record" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Recorder */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title input */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Meeting title
              </label>
              <Input
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="Weekly standup, Client call, Board meeting..."
                disabled={recording}
                className="bg-muted/30"
              />
            </div>

            {/* Recording controls */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-6 text-center space-y-4">
              {/* Large mic button */}
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={transcribing || summarizing}
                className={cn(
                  "mx-auto flex h-24 w-24 items-center justify-center rounded-full transition-all",
                  recording
                    ? "bg-red-500 text-white shadow-xl shadow-red-500/30 animate-pulse scale-110"
                    : transcribing || summarizing
                      ? "bg-muted text-muted-foreground cursor-wait"
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:shadow-lg hover:scale-105",
                )}
              >
                {transcribing || summarizing ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : recording ? (
                  <Square className="h-10 w-10" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </button>

              {/* Status */}
              {recording && recordingStartTime && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <RecordingTimer startTime={recordingStartTime} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recording... tap to stop
                  </p>
                </div>
              )}

              {!recording && !transcribing && !summarizing && (
                <div>
                  <p className="text-sm font-medium">Tap to start recording</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    OpenAI transcribes with 96% accuracy
                  </p>
                </div>
              )}

              {transcribing && (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span className="text-sm text-amber-500 font-medium">Transcribing...</span>
                </div>
              )}

              {summarizing && (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse text-accent" />
                  <span className="text-sm text-accent font-medium">AI summarizing...</span>
                </div>
              )}
            </div>

            {/* Live transcript preview */}
            {currentTranscript && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Transcript
                  </p>
                  {currentTranscript && !recording && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => createDeckFromMeeting(currentTranscript)}
                    >
                      <Presentation className="h-3 w-3" /> Create Deck
                    </Button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border/30 bg-muted/20 p-3">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {currentTranscript}
                  </p>
                </div>
              </div>
            )}

            {/* Current summary */}
            {currentSummary && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Summary
                </p>
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <SummaryView summary={currentSummary} />
                </div>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meetings..."
                  className="pl-9 h-9 bg-muted/30"
                />
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {meetings.length} meetings
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Mic className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No meetings match your search"
                    : "No meetings yet. Record your first meeting above."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredMeetings.map((m) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onSelect={() => {
                      setSelectedMeeting(m);
                      setView("detail");
                    }}
                    onDelete={() => deleteMeeting(m.id)}
                    onToggleFavorite={() => toggleFavorite(m.id, m.is_favorite)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : selectedMeeting ? (
        /* Detail view */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Transcript */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedMeeting.title}</h3>
              <Button
                size="sm"
                className="gap-1"
                onClick={() =>
                  selectedMeeting.transcript &&
                  createDeckFromMeeting(selectedMeeting.transcript)
                }
                disabled={!selectedMeeting.transcript}
              >
                <Presentation className="h-3.5 w-3.5" /> Create Deck from This
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {new Date(selectedMeeting.recorded_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {selectedMeeting.duration_seconds && (
                <span>{Math.round(selectedMeeting.duration_seconds / 60)} min</span>
              )}
            </div>

            <div className="rounded-lg border border-border/30 bg-muted/10 p-4 max-h-[500px] overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedMeeting.transcript || "No transcript available"}
              </p>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> AI Summary
            </h3>

            {selectedMeeting.summary ? (
              <SummaryView summary={selectedMeeting.summary as MeetingSummary} />
            ) : (
              <div className="text-center py-12 space-y-3">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No summary yet
                </p>
                {selectedMeeting.transcript && (
                  <Button
                    size="sm"
                    onClick={() => summarizeMeeting(selectedMeeting.transcript!)}
                    disabled={summarizing}
                    className="gap-1"
                  >
                    {summarizing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Generate Summary
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
