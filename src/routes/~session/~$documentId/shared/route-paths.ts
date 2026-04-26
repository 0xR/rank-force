export function createRoutePaths(documentId: string | string[]) {
  return {
    session: `/session/${documentId}`,
    user: `/session/${documentId}/user`,
    ranking: `/session/${documentId}/ranking`,
    configure: `/session/${documentId}/configure`,
    score: `/session/${documentId}/score`,
  };
}
