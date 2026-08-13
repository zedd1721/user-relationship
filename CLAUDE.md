# Prompt: User Relationship Graph (Ego Network) — Static UI

Build a React + TypeScript feature that visualizes a single user's relationships
as an interactive 3D force-directed graph, using `react-force-graph-3d`. All data
is static/mocked for now — no backend calls.

## Tech stack
- React + TypeScript
- `react-force-graph-3d` (built on three.js) for the graph rendering
- `three` as a peer dependency
- Tailwind CSS for styling
- No routing/backend needed — everything is client-state and static mock data

## Camera / interaction requirements
`react-force-graph-3d` ships these controls by default — make sure they're
enabled and not accidentally disabled via props:
- **Scroll wheel** → zoom in/out (default OrbitControls behavior)
- **Left-click drag on empty space** → rotate/orbit the camera around the graph
- **Right-click drag (or two-finger drag on trackpad)** → pan the camera
- **Left-click drag on a node** → drag that individual node (this is
  `enableNodeDrag`, true by default — don't disable it)
- Do not lock the camera or override `controlType` — leave it as the default
  trackball/orbit controls so all of the above work out of the box

## Data model (define these types first)

```ts
type NodeType = 'user' | 'group' | 'post' | 'reel' | 'status' | 'follower' | 'minigame';

interface GraphNode {
  id: string;
  type: NodeType;
  label: string;        // e.g. "Fitness Community", "Alex"
  subtitle?: string;     // e.g. "Most active category"
  val?: number;          // node size, derived from relationship strength
}

interface GraphEdge {
  source: string;        // node id
  target: string;        // node id
  strength: number;      // 0–1, drives line thickness (weak vs strong relation)
}

interface UserGraphData {
  userId: string;
  username: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

## Static mock data
Create a `mockUsers.ts` file with 3–4 sample users of varying activity levels:
- One highly active user with all 6 relationship types populated (group,
  post, reel, status, follower, minigame) and a mix of strong/weak edges
- One low-activity user with only 1–2 relationship types (to reflect our
  real user base — this should visually look sparse, not padded with empty
  nodes)
- One mid-activity user for a middle-ground case

Each user's graph data should follow the `UserGraphData` shape above.

## Functional requirements

1. **Search bar**: a text input with a dropdown/list of matching usernames
   as the user types (filter the static mock user list client-side).
2. **Select a user**: clicking a search result loads that user's graph
   below the search bar. Clear the previous graph when a new user is
   selected.
3. **Graph rendering**: use `ForceGraph3D` to render the selected user's
   `nodes` and `edges`.
   - The user node sits at the visual center (pin it via `fx`/`fy`/`fz` or
     let force layout naturally centralize it — either is fine for this
     prototype).
   - Only render nodes that exist in that user's data — no empty/placeholder
     nodes for categories with no activity.
   - Set a reasonable initial camera distance (`cameraPosition` prop) so the
     graph is fully visible on load without the user needing to scroll out
     first.
4. **Edge strength → line thickness**: map `edge.strength` to
   `linkWidth` (e.g. `strength < 0.4` → thin line ~1px, `0.4–0.7` → medium
   ~2.5px, `> 0.7` → bold ~4-5px). Optionally also vary link opacity or color
   intensity with strength for a secondary visual cue.
5. **Node color by type**: each `NodeType` gets a distinct, consistent color
   (e.g. user = purple, group = teal, post = coral, reel = amber, status =
   pink, follower = blue, minigame = green). Add a small legend showing
   type → color mapping.
6. **Filter panel**: a checkbox list (one per `NodeType`, excluding `user`)
   above or beside the graph. Unchecking a type immediately:
   - Hides all nodes of that type
   - Hides all edges connected to those nodes
   - Does this via client-side filtering of the data passed to
     `ForceGraph2D`, not by destroying/remounting the whole graph
7. **Node click**: clicking a node shows its `label` and `subtitle` in a
   small side panel or tooltip (static display is fine, no navigation needed
   yet).

## Component structure (suggested)
- `App.tsx` — layout, holds selected user state
- `UserSearch.tsx` — search input + results dropdown
- `RelationshipGraph3D.tsx` — wraps `ForceGraph3D`, takes filtered
  `UserGraphData` as props
- `GraphFilters.tsx` — checkbox list, lifts filter state up to `App`
- `mockUsers.ts` — static data
- `types.ts` — the interfaces above

## Visual notes
- Keep the graph container responsive (fills available width, fixed
  height ~500-600px)
- Empty state: if a user has no graph data yet, or none selected, show a
  simple placeholder message instead of an empty canvas
- Sparse graphs (low-activity users) should look intentionally minimal —
  don't add visual filler
- Since node-click and node-drag both fire on the same left-click
  interaction, use `onNodeClick` for the info panel and let the library's
  built-in drag handling manage movement — don't build custom drag logic
  that could conflict with it
- Background should be transparent or a single flat dark/light color (no
  gradients) so nodes and edges stay readable while rotating