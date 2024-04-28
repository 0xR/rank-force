import { State, Store } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { UserRanking } from '@/core/UserRanking';
import { useMemo } from 'react';
import * as Y from 'yjs';
import { create } from 'zustand';
import yjs from 'zustand-middleware-yjs';

export const useSharedStore = (
  defaultValue?: Uint8Array,
  onChange?: (update: Uint8Array) => void,
) => {
  const yDoc = useMemo(() => {
    const doc = new Y.Doc();

    if (defaultValue) {
      Y.applyUpdate(doc, defaultValue);
    }

    if (onChange) {
      doc.on('update', (update) => {
        onChange(update);
      });
    }

    return doc;
  }, [defaultValue, onChange]);

  const useStore = useMemo(() => {
    let ydocData = yDoc.getMap('shared');
    const defaultValues: State = ydocData.size
      ? (ydocData.toJSON() as State)
      : {
          items: [],
          users: [],
          dimensions: [],
          rankingsByUser: {},
        };
    return create<Store>()(
      // Wrap the store creator with the Yjs middleware.
      // Create the store as you would normally.
      yjs(yDoc, 'shared', (set) => ({
        ...defaultValues,
        addItems: (...items) =>
          set((state) => {
            return { items: [...state.items, ...items] };
          }),
        addDimension: (...dimensions) =>
          set((state) => ({
            dimensions: [...state.dimensions, ...dimensions],
          })),
        removeDimensions: (...dimensions) =>
          set((state) => ({
            dimensions: state.dimensions.filter((d) => !dimensions.includes(d)),
          })),
        removeItems: (...items) =>
          set((state) => ({
            items: state.items.filter((i) => !items.includes(i)),
          })),
        setUserRanking: (user: User, userRanking: UserRanking) =>
          set(({ users, rankingsByUser }) => {
            return {
              rankingsByUser: {
                ...rankingsByUser,
                [user.id]: userRanking,
              },
              users: users.includes(user) ? users : [...users, user],
            };
          }),
      })),
    );
  }, [yDoc]);
  return useStore();
};
