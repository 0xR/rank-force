import { createRoutePaths } from '@/app/session/[sessionId]/shared/route-paths';
import { redirect } from 'next/navigation';

export default function ({
  params: { sessionId },
}: {
  params: { sessionId: string };
}) {
  redirect(createRoutePaths(sessionId).ranking);
}
