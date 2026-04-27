import { describe, expect, it } from 'vitest';
import { RankTemplate, rankTemplates } from './RankTemplate';
import { TestStore } from './TestStore';

describe('RankTemplate', () => {
  it('every template has a non-empty name, description, and at least one dimension', () => {
    expect(rankTemplates.length).toBeGreaterThan(0);
    for (const template of rankTemplates) {
      expect(template.id).toMatch(/^[a-z0-9-]+$/);
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
      expect(template.dimensions.length).toBeGreaterThan(0);
    }
  });

  it('every template dimension has both labels, a name, and a valid direction', () => {
    for (const template of rankTemplates) {
      for (const dimension of template.dimensions) {
        expect(dimension.name.length).toBeGreaterThan(0);
        expect(dimension.labelStart.length).toBeGreaterThan(0);
        expect(dimension.labelEnd.length).toBeGreaterThan(0);
        expect(['ascending', 'descending']).toContain(dimension.direction);
      }
    }
  });

  it('template ids are unique', () => {
    const ids = rankTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toDimensions mints fresh ulids on each call', () => {
    const [template] = rankTemplates;
    const a = RankTemplate.toDimensions(template!);
    const b = RankTemplate.toDimensions(template!);
    expect(a.map((d) => d.id)).not.toEqual(b.map((d) => d.id));
    expect(a[0]!.name).toBe(template!.dimensions[0]!.name);
  });

  it('applying a template via addDimension inserts criteria with equal weights', () => {
    for (const template of rankTemplates) {
      const store = new TestStore();
      store.rankAssignment.addDimension(...RankTemplate.toDimensions(template));

      expect(store.dimensions).toHaveLength(template.dimensions.length);
      const weights = Object.values(store.dimensionWeights);
      expect(weights).toHaveLength(template.dimensions.length);
      const expected = 1 / template.dimensions.length;
      for (const w of weights) {
        expect(w).toBeCloseTo(expected, 8);
      }
    }
  });
});
