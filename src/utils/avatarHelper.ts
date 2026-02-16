// Helper to get avatar image URL from ID (1-12)
export const getAvatarUrl = (id: number): string => {
  return `/avatars/${id}.png`;
};
