import type { NodeType } from './types';

export const NODE_COLORS: Record<NodeType, string> = {
  user: '#a855f7',
  group: '#14b8a6',
  post: '#fb7185',
  reel: '#f59e0b',
  status: '#ec4899',
  follower: '#3b82f6',
  minigame: '#22c55e',
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  user: 'User',
  group: 'Group',
  post: 'Post',
  reel: 'Reel',
  status: 'Status',
  follower: 'Follower',
  minigame: 'Minigame',
};

export const FILTERABLE_NODE_TYPES: NodeType[] = [
  'group',
  'post',
  'reel',
  'status',
  'follower',
  'minigame',
];
