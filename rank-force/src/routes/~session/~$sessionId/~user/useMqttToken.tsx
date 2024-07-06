import { useUserId } from '@/routes/~session/~$sessionId/shared/useUser';
import { useMemo } from 'react';

export function useMqttToken() {
  // @ts-expect-error TS2304
  const { sessionId } = useParams();
  const [userId] = useUserId();

  return useMemo(() => {
    if (!userId) {
      return undefined;
    }
    const sessionIdString = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    if (!sessionIdString) {
      return undefined;
    }
    return {
      sessionId: sessionIdString,
      userId,
    };
  }, [sessionId, userId]);
}
