import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Clock, CheckCircle2, XCircle, ExternalLink, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Progress } from "@/components/ui/progress";
import EventCard from "@/components/EventCard";
import { useProfile, useProgress, useEvents, useRefresh } from "@/hooks/useVolunteer";

export default function ModuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { data: profile } = useProfile();
  const { data: progress = [] } = useProgress();
  const { data: events = [] } = useEvents();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { data: module, isLoading } = useQuery({
    queryKey: ["module", id],
    queryFn: () => base44.entities.LearningModule.get(id),
  });

  if (isLoading || !module || !profile) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const record = progress.find((p) => p.module_id === module.id);
  const quiz = module.quiz || [];
  const related = events.filter((e) => e.cause === module.cause).slice(0, 2);
  const correct = quiz.filter((q, i) => answers[i] === q.answer_index).length;

  const markRead = async () => {
    if (record) {
      if (record.progress < 60) await base44.entities.ModuleProgress.update(record.id, { progress: 60 });
    } else {
      await base44.entities.ModuleProgress.create({
        module_id: module.id,
        module_title: module.title,
        cause: module.cause,
        volunteer_email: profile.user_email,
        progress: 60,
      });
    }
    refresh(["progress"]);
  };

  const submitQuiz = async () => {
    setSubmitted(true);
    const payload = {
      progress: 100,
      completed: true,
      quiz_score: correct,
      quiz_total: quiz.length,
    };
    if (record) await base44.entities.ModuleProgress.update(record.id, payload);
    else
      await base44.entities.ModuleProgress.create({
        module_id: module.id,
        module_title: module.title,
        cause: module.cause,
        volunteer_email: profile.user_email,
        ...payload,
      });
    const achievements = new Set(profile.achievements || []);
    achievements.add("first_module");
    if (module.cause === "Child Rights") achievements.add("child_rights_explorer");
    await base44.entities.VolunteerProfile.update(profile.id, {
      learning_score: (profile.learning_score || 0) + 60 + correct * 10,
      achievements: [...achievements],
    });
    refresh(["progress", "profile"]);
  };

  const Block = ({ title, children }) => (
    <section className="mt-6">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );

  return (
    <div className="pb-8">
      <div className="relative h-44 w-full bg-muted">
        {module.image_url && <Image src={module.image_url} alt={module.title} className="h-44 w-full" />}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5">
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-primary">{module.cause}</p>
        <h1 className="mt-1 text-xl font-extrabold leading-snug text-foreground">{module.title}</h1>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {module.read_minutes}-minute learning
        </p>
        <Progress value={submitted ? 100 : record?.progress || 0} className="mt-4 h-2" />

        <div className="mt-5 rounded-3xl bg-accent/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">60-second summary</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{module.summary_60s}</p>
        </div>

        <Block title="Why this matters">{module.why_matters}</Block>
        <Block title="Who is affected">{module.who_affected}</Block>

        <Block title="Related child rights">
          <div className="flex flex-wrap gap-2">
            {(module.child_rights || []).map((r) => (
              <span key={r} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                {r}
              </span>
            ))}
          </div>
        </Block>

        <Block title="Key facts">
          <ul className="space-y-2">
            {(module.key_facts || []).map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-primary">•</span> {f}
              </li>
            ))}
          </ul>
        </Block>

        <section className="mt-6 grid gap-3">
          <div className="rounded-3xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#B45309]">Myth</p>
            <p className="mt-1 text-sm text-foreground">{module.myth}</p>
          </div>
          <div className="rounded-3xl border border-[#16A34A]/30 bg-[#DCFCE7] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#166534]">Fact</p>
            <p className="mt-1 text-sm text-[#166534]">{module.fact}</p>
          </div>
        </section>

        {/* Quiz */}
        {!!quiz.length && (
          <section className="mt-7 rounded-3xl bg-card p-5 soft-shadow">
            <h2 className="text-base font-bold text-foreground">Quick check</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Two short questions — there's no score shown to anyone else.
            </p>
            <div className="mt-4 space-y-5">
              {quiz.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-semibold text-foreground">{q.question}</p>
                  <div className="mt-2 space-y-2">
                    {q.options.map((opt, oi) => {
                      const chosen = answers[qi] === oi;
                      const right = submitted && oi === q.answer_index;
                      const wrong = submitted && chosen && oi !== q.answer_index;
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={`flex min-h-[48px] w-full items-center gap-2 rounded-2xl border px-4 py-2 text-left text-sm ${
                            right
                              ? "border-[#16A34A] bg-[#DCFCE7]"
                              : wrong
                              ? "border-[#EF4444] bg-red-50"
                              : chosen
                              ? "border-primary bg-accent"
                              : "border-border bg-card"
                          }`}
                        >
                          {right && <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />}
                          {wrong && <XCircle className="h-4 w-4 text-[#EF4444]" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {submitted ? (
              <p className="mt-4 text-sm font-semibold text-primary">
                {correct} of {quiz.length} correct — module completed. Nice work.
              </p>
            ) : (
              <Button
                className="mt-5 h-13 h-[52px] w-full rounded-2xl text-base font-semibold"
                disabled={Object.keys(answers).length < quiz.length}
                onClick={submitQuiz}
              >
                Complete module
              </Button>
            )}
          </section>
        )}

        <Block title="What can I do?">
          <ul className="space-y-2">
            {(module.what_can_i_do || []).map((a) => (
              <li key={a} className="flex gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" /> {a}
              </li>
            ))}
          </ul>
        </Block>

        {!!related.length && (
          <section className="mt-7">
            <h2 className="text-base font-bold text-foreground">Turn this into action</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Volunteer opportunities connected to this topic.
            </p>
            <div className="mt-3 space-y-4">
              {related.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-7 rounded-3xl border border-border bg-secondary/60 p-4">
          <p className="text-sm font-bold text-foreground">Verified sources</p>
          <ul className="mt-2 space-y-1.5">
            {(module.sources || []).map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </section>

        {!record?.completed && !submitted && (
          <Button variant="outline" className="mt-6 h-12 w-full rounded-2xl" onClick={markRead}>
            Save my progress
          </Button>
        )}
        <Link to="/learn" className="mt-4 block text-center text-sm font-medium text-primary">
          Back to Learn
        </Link>
      </div>
    </div>
  );
}