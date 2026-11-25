export async function authenticatedMeetingUser(
  authorization: string | null,
  getUser: (token: string) => Promise<{ data: { user: { id: string } | null }; error: unknown }>,
): Promise<string | null> {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) return null;
  const { data, error } = await getUser(match[1]);
  return error ? null : data.user?.id ?? null;
}