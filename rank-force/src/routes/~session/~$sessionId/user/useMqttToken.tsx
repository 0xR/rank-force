import { useUserId } from '@/routes/~session/~$sessionId/shared/useUser';
// import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export function useMqttToken() {
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
