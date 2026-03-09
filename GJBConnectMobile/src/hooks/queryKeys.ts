export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  list: (filters: string) => [...feedKeys.lists(), filters] as const,
  details: () => [...feedKeys.all, 'detail'] as const,
  detail: (id: string) => [...feedKeys.details(), id] as const,
};

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (postId: string) => [...commentKeys.lists(), postId] as const,
};

export const profileKeys = {
  all: ['profiles'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
};
