import { Route } from '@/routes/~session/~$documentId.tsx';
import { useUserId } from '@/routes/~session/~$documentId/shared/useUser';
import { useMemo } from 'react';

export function useMqttToken() {
  const { documentId } = Route.useParams();
  const [userId] = useUserId();

  return useMemo(() => {
    if (!userId) {
      return undefined;
    }
    const documentIdString = Array.isArray(documentId)
      ? documentId[0]
      : documentId;
    if (!documentIdString) {
      return undefined;
    }
    return {
      documentId: documentIdString,
      userId,
    };
  }, [documentId, userId]);
}
