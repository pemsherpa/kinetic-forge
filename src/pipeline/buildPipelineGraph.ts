import { Edge, Node } from '@xyflow/react';
import { ConsensusResult } from '../types';

export function buildPipelineGraph(consensus: ConsensusResult): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const startY = 100;
  let currentY = startY;
  const Y_SPACING = 160;
  const X_SPACING = 280; // horizontal between parallel

  let nodeIndex = 0;

  // Track parallel groups to assign them same Y
  const groupsProcessed = new Set<string>();

  for (let i = 0; i < consensus.nodes.length; i++) {
    const cn = consensus.nodes[i];
    
    // If it's part of a group we already placed, skip (handled in group logic below)
    if (cn.parallelGroup && groupsProcessed.has(cn.parallelGroup)) continue;

    if (cn.parallelGroup) {
      // Find all nodes in this group
      const groupNodes = consensus.nodes.filter(n => n.parallelGroup === cn.parallelGroup);
      groupsProcessed.add(cn.parallelGroup);

      const totalGroupWidth = (groupNodes.length - 1) * X_SPACING;
      const startX = (window.innerWidth / 2) - (totalGroupWidth / 2);

      groupNodes.forEach((gn, gIndex) => {
        nodes.push({
          id: gn.id,
          type: 'pipelineNode',
          position: { x: startX + (gIndex * X_SPACING), y: currentY },
          data: { config: gn },
        });
      });

      // Simple sequential linking for MVP: link all previous items to all group items
      if (i > 0) {
        // Prev item is the one right before the group started
        const prevNodeId = consensus.nodes[i - 1].id;
        groupNodes.forEach(gn => {
          edges.push({
            id: `e-${prevNodeId}-${gn.id}`,
            source: prevNodeId,
            target: gn.id,
            type: 'default',
            animated: true,
          });
        });
      }
      
      currentY += Y_SPACING;
      // Note: connecting OUT of the group handled automatically in the next iteration 
      // if we assume sequential flow after parallel.

    } else {
      // Sequential node
      nodes.push({
        id: cn.id,
        type: 'pipelineNode',
        position: { x: window.innerWidth / 2 - 130, y: currentY },
        data: { config: cn },
      });

      // Link to previous items (could be a group or single)
      if (i > 0) {
        const prevList = consensus.nodes[i-1].parallelGroup 
          ? consensus.nodes.filter(n => n.parallelGroup === consensus.nodes[i-1].parallelGroup)
          : [consensus.nodes[i-1]];
          
        prevList.forEach(pn => {
          edges.push({
            id: `e-${pn.id}-${cn.id}`,
            source: pn.id,
            target: cn.id,
            type: 'default',
            animated: true,
          });
        });
      }

      currentY += Y_SPACING;
    }
  }

  return { nodes, edges };
}
