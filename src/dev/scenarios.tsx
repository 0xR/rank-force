import { Button } from '@/components/ui/button';
import { BuildStateOptions, buildState } from '@/core/mock-factories';
import { State } from '@/core/State';
import { repo } from '@/lib/repo';
import { useNavigate } from '@tanstack/react-router';

type Scenario = {
  label: string;
  options: BuildStateOptions;
  target: '/session/$documentId/ranking' | '/session/$documentId/score';
};

const scenarios: Scenario[] = [
  {
    label: 'Configured (no rankings)',
    options: { users: 3, items: 4, dimensions: 2, ranked: false },
    target: '/session/$documentId/ranking',
  },
  {
    label: 'Complete with score',
    options: { users: 3, items: 4, dimensions: 2, ranked: true },
    target: '/session/$documentId/score',
  },
];

const userIdKey = (documentId: string) => `rank-force-${documentId}-userid`;

export default function DevScenariosPage() {
  const navigate = useNavigate();

  async function seed({ options, target }: Scenario) {
    const state = buildState(options);
    const handle = repo.create<State>(state);
    await handle.whenReady();
    const documentId = handle.documentId;

    localStorage.setItem(
      userIdKey(documentId),
      JSON.stringify(state.users[0]!.id),
    );

    await navigate({ to: target, params: { documentId } });
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
            key={scenario.label}
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
