import { Button } from '@/components/ui/button';
import { BuildStateOptions, buildState } from '@/core/mock-factories';
import { State } from '@/core/State';
import { repo } from '@/lib/repo';
import { useNavigate } from '@tanstack/react-router';

type Scenario = {
  label: string;
  sessionId: string;
  options: BuildStateOptions;
  target: '/session/$sessionId/ranking' | '/session/$sessionId/score';
};

const scenarios: Scenario[] = [
  {
    label: 'Configured (no rankings)',
    sessionId: 'dev-without-ranking',
    options: { users: 3, items: 4, dimensions: 2, ranked: false },
    target: '/session/$sessionId/ranking',
  },
  {
    label: 'Complete with score',
    sessionId: 'dev-with-ranking',
    options: { users: 3, items: 4, dimensions: 2, ranked: true },
    target: '/session/$sessionId/score',
  },
];

const docUrlKey = (sessionId: string) => `rank-force-${sessionId}-doc-url`;
const userIdKey = (sessionId: string) => `rank-force-${sessionId}-userid`;

export default function DevScenariosPage() {
  const navigate = useNavigate();

  async function seed({ sessionId, options, target }: Scenario) {
    localStorage.removeItem(docUrlKey(sessionId));
    localStorage.removeItem(userIdKey(sessionId));

    const state = buildState(options);
    const handle = repo.create<State>(state);
    await handle.whenReady();

    localStorage.setItem(docUrlKey(sessionId), handle.url);
    localStorage.setItem(
      userIdKey(sessionId),
      JSON.stringify(state.users[0].id),
    );

    await navigate({ to: target, params: { sessionId } });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Dev seed</h1>
      <p className="text-sm text-space-6">
        Each click wipes the dev session and re-seeds it.
      </p>
      <div className="flex flex-col gap-2">
        {scenarios.map((scenario) => (
          <Button
            key={scenario.sessionId}
            variant="outline"
            onClick={() => seed(scenario)}
          >
            {scenario.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
