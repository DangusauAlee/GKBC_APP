export const memberKeys = {
  all: ['members'] as const,
  filtered: (search: string, businessType: string, marketArea: string) =>
    [...memberKeys.all, search, businessType, marketArea] as const,
  detail: (id: string) => [...memberKeys.all, id] as const,
};

export const connectionKeys = {
  all: ['connections'] as const,
  received: () => [...connectionKeys.all, 'received'] as const,
  sent: () => [...connectionKeys.all, 'sent'] as const,
  friends: () => [...connectionKeys.all, 'friends'] as const,
};

export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  detail: (id: string) => [...feedKeys.all, 'detail', id] as const,
};

export const commentKeys = {
  all: ['comments'] as const,
  list: (postId: string) => [...commentKeys.all, 'list', postId] as const,
  detail: (id: string) => [...commentKeys.all, 'detail', id] as const,
};

export const businessKeys = {
  all: ['businesses'] as const,
  lists: () => [...businessKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...businessKeys.lists(), filters] as const,
  details: () => [...businessKeys.all, 'detail'] as const,
  detail: (id: string) => [...businessKeys.details(), id] as const,
  categories: () => [...businessKeys.all, 'categories'] as const,
  locationCounts: () => [...businessKeys.all, 'locationCounts'] as const,
  userStatus: () => [...businessKeys.all, 'userStatus'] as const,
};
