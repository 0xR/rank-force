export function createRoutePaths(sessionId: string | string[]) {
  return {
    session: `/session/${sessionId}`,
    user: `/session/${sessionId}/user`,
    ranking: `/session/${sessionId}/ranking`,
    configure: `/session/${sessionId}/configure`,
    score: `/session/${sessionId}/score`,
  };
}
