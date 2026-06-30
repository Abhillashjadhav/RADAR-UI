import type { SubTierFullNode } from '../data/subtierMockData';

/** Maps each node id → array of parent node ids (choke points have >1). */
export function buildParentMap(root: SubTierFullNode): Map<string, string[]> {
  const parentMap = new Map<string, string[]>();
  const seen = new Set<string>();

  const traverse = (node: SubTierFullNode) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    for (const child of node.children) {
      const parents = parentMap.get(child.id) ?? [];
      if (!parents.includes(node.id)) parents.push(node.id);
      parentMap.set(child.id, parents);
      traverse(child);
    }
  };

  traverse(root);
  return parentMap;
}

/** Returns the path from root → node as an array of node ids (inclusive). */
export function pathToRoot(
  nodeId: string,
  parentMap: Map<string, string[]>,
  nodeById: Map<string, SubTierFullNode>,
): SubTierFullNode[] {
  const path: SubTierFullNode[] = [];
  let current: string | undefined = nodeId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const n = nodeById.get(current);
    if (n) path.unshift(n);
    current = parentMap.get(current)?.[0]; // follow first parent for display
  }
  return path;
}
