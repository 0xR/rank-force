import { RankDimension, RankDimensionDirection } from './RankDimension';

type RankTemplateDimension = {
  readonly name: string;
  readonly labelStart: string;
  readonly labelEnd: string;
  readonly direction: RankDimensionDirection;
};

export type RankTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dimensions: readonly RankTemplateDimension[];
};

export const RankTemplate = {
  toDimensions(template: RankTemplate): RankDimension[] {
    return template.dimensions.map((d) =>
      RankDimension.make(d.name, d.labelStart, d.labelEnd, d.direction),
    );
  },
};

export const rankTemplates: readonly RankTemplate[] = [
  {
    id: 'eisenhower',
    name: 'Eisenhower',
    description:
      'Sort items by urgency and importance. Best when deciding what to do next.',
    dimensions: [
      {
        name: 'Urgency',
        labelStart: 'Not urgent',
        labelEnd: 'Urgent',
        direction: 'ascending',
      },
      {
        name: 'Importance',
        labelStart: 'Not important',
        labelEnd: 'Important',
        direction: 'ascending',
      },
    ],
  },
  {
    id: 'impact-effort',
    name: 'Impact / Effort',
    description:
      'Quick wins versus big bets. Useful for backlog grooming and roadmap calls.',
    dimensions: [
      {
        name: 'Impact',
        labelStart: 'Low',
        labelEnd: 'High',
        direction: 'ascending',
      },
      {
        name: 'Effort',
        labelStart: 'Low',
        labelEnd: 'High',
        direction: 'descending',
      },
    ],
  },
  {
    id: 'risk-matrix',
    name: 'Risk Matrix',
    description:
      'Score risks by probability and impact. Standard for risk registers and incident triage.',
    dimensions: [
      {
        name: 'Probability',
        labelStart: 'Unlikely',
        labelEnd: 'Likely',
        direction: 'ascending',
      },
      {
        name: 'Impact',
        labelStart: 'Minor',
        labelEnd: 'Severe',
        direction: 'ascending',
      },
    ],
  },
  {
    id: 'rice',
    name: 'RICE',
    description:
      'Product prioritization by Reach, Impact, Confidence, and Effort. Approximated as a weighted average.',
    dimensions: [
      {
        name: 'Reach',
        labelStart: 'Few',
        labelEnd: 'Many',
        direction: 'ascending',
      },
      {
        name: 'Impact',
        labelStart: 'Low',
        labelEnd: 'High',
        direction: 'ascending',
      },
      {
        name: 'Confidence',
        labelStart: 'Low',
        labelEnd: 'High',
        direction: 'ascending',
      },
      {
        name: 'Effort',
        labelStart: 'Low',
        labelEnd: 'High',
        direction: 'descending',
      },
    ],
  },
  {
    id: 'ice',
    name: 'ICE',
    description:
      'Light prioritization by Impact, Confidence, and Ease. Good for fast triage when RICE feels heavy.',
    dimensions: [
      {
        name: 'Impact',
        labelStart: 'Low',
        labelEnd: 'High',
        direction: 'ascending',
      },
      {
        name: 'Confidence',
        labelStart: 'Low',
        labelEnd: 'High',
        direction: 'ascending',
      },
      {
        name: 'Ease',
        labelStart: 'Hard',
        labelEnd: 'Easy',
        direction: 'ascending',
      },
    ],
  },
];
