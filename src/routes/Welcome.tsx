import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wordmark } from '@/components/brand/Logo';
import { StarField } from '@/components/brand/StarField';
import { createSession } from '@/lib/repo';
import { useNavigatorName } from '@/shared/useNavigator';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Compass, Layers, Telescope } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function Welcome() {
  const navigate = useNavigate();
  const [navName, setNavName] = useNavigatorName();
  const [draftName, setDraftName] = useState(navName);

  function commitName() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== navName) {
      setNavName(trimmed);
    }
    return trimmed;
  }

  async function handleBegin(e: FormEvent) {
    e.preventDefault();
    if (!commitName()) return;
    const documentId = await createSession();
    navigate({ to: '/session/$documentId', params: { documentId } });
  }

  const nameValid = draftName.trim().length > 0;

  return (
    <div className="relative min-h-dvh bg-twilight-wash overflow-hidden">
      <StarField />

      <header className="relative z-10 px-8 pt-8 flex justify-between items-center">
        <Wordmark size="md" />
        <span className="text-2xs font-mono uppercase tracking-coord text-space-6">
          v0
        </span>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pt-20 pb-24">
        <div className="animate-fade-up">
          <p className="text-2xs font-mono uppercase tracking-coord text-plasma mb-6">
            ⟢ Forced ranking · For group decisions
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-cream text-balance leading-[0.95]">
            Force a ranking.
            <br />
            <span className="text-space-6">Get the signal.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-space-6 leading-relaxed">
            List your options. Pick the criteria. Everyone ranks, no ties. The
            weighted score is your answer.
          </p>
        </div>

        <form
          onSubmit={handleBegin}
          className="mt-14 animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          <label className="block">
            <span className="text-2xs font-mono uppercase tracking-coord text-space-6">
              Your name
            </span>
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitName}
              placeholder="Your name"
              className="mt-2 h-14 text-lg px-4 bg-space-1/70 backdrop-blur-sm"
              autoFocus
              maxLength={40}
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="submit"
              size="xl"
              disabled={!nameValid}
              className="group"
            >
              Start a session
              <ArrowRight className="h-5 w-5 transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5" />
            </Button>
          </div>
        </form>

        <div
          className="mt-24 grid gap-px bg-space-3 rounded-lg overflow-hidden border border-space-4 sm:grid-cols-3 animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          <BriefingStep
            index="01"
            icon={Layers}
            title="List the items"
            body="Add what your group is choosing between."
          />
          <BriefingStep
            index="02"
            icon={Compass}
            title="Pick the criteria"
            body="Add the dimensions that matter. Weight by importance."
          />
          <BriefingStep
            index="03"
            icon={Telescope}
            title="Rank and score"
            body="Everyone ranks, no ties. The weighted score reveals the call."
          />
        </div>
      </main>
    </div>
  );
}

function BriefingStep({
  index,
  icon: Icon,
  title,
  body,
}: {
  index: string;
  icon: typeof Compass;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-space-1 p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-mono tracking-coord text-space-6">
          {index}
        </span>
        <Icon className="h-4 w-4 text-space-6" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-cream tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-space-6 leading-relaxed">{body}</p>
    </div>
  );
}
