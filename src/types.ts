export type NodeType =
  | 'user'
  | 'group'
  | 'post'
  | 'reel'
  | 'status'
  | 'follower'
  | 'minigame';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  subtitle?: string;
  val?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
}

export interface UserGraphData {
  userId: string;
  username: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
