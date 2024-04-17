import { Store } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { UserRanking } from '@/core/UserRanking';
import * as Y from 'yjs';
import create from 'zustand';

// Create a Y Doc to place our store in.
const ydoc = new Y.Doc();

// Create the Zustand store.
export const useSharedStore = create<Store>()(
  // Wrap the store creator with the Yjs middleware.
  // Create the store as you would normally.
  (set) => ({
    items: [],
    dimensions: [],
    rankingsByUser: new Map(),
    addItems: (...items) =>
      set((state) => ({ items: [...state.items, ...items] })),
    addDimension: (...dimensions) =>
      set((state) => ({ dimensions: [...state.dimensions, ...dimensions] })),
    removeDimensions: (...dimensions) =>
      set((state) => ({
        dimensions: state.dimensions.filter((d) => !dimensions.includes(d)),
      })),
    removeItems: (...items) =>
      set((state) => ({
        items: state.items.filter((i) => !items.includes(i)),
      })),
    setUserRanking: (user: User, userRanking: UserRanking) =>
      set((state) => {
        const rankingsByUser = new Map(state.rankingsByUser);
        rankingsByUser.set(user, userRanking);
        return { rankingsByUser: new Map(rankingsByUser) };
      }),
  }),
);
