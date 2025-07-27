import React from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
// YENİ: Tipleri merkezi dosyadan import ediyoruz
import { ApiNode } from '../types';

// ARTIK GEREKLİ DEĞİL: Buradaki yerel interface tanımını siliyoruz.
// interface ApiNode { ... }

// Props tanımı artık merkezi 'ApiNode' tipini kullanıyor
interface HierarchicalRoadmapProps {
  apiNodes: ApiNode[];
  onNodeClick: (node: ApiNode) => void;
}

// Layout Algoritması (değişiklik yok)
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 200;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });
  return { nodes, edges };
};

const LayoutFlow: React.FC<HierarchicalRoadmapProps> = ({ apiNodes, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();
  
  React.useEffect(() => {
    if (apiNodes && apiNodes.length > 0) {
      const initialNodes: Node[] = apiNodes.map(node => ({
        id: node.nodeId,
        data: { label: node.title },
        position: { x: 0, y: 0 },
        style: { 
            background: node.status === 'completed' ? '#00E5FF' : '#1a2238',
            color: node.status === 'completed' ? '#1a2238' : '#f0f0f0',
            border: '1px solid #00E5FF',
            cursor: 'pointer'
        },
      }));
      const initialEdges: Edge[] = [];
      apiNodes.forEach(node => {
        if (node.dependencies) {
          node.dependencies.forEach(depId => {
            initialEdges.push({
              id: `e-${depId}-${node.nodeId}`,
              source: depId,
              target: node.nodeId,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#00E5FF' }
            });
          });
        }
      });
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setTimeout(() => { fitView(); }, 100);
    }
  }, [apiNodes, fitView, setNodes, setEdges]);
  
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    const fullNodeData = apiNodes.find(n => n.nodeId === node.id);
    if (fullNodeData) {
      onNodeClick(fullNodeData);
    }
  };

  return (
    <div style={{ height: '80vh', width: '100%' }} className="bg-nexus-surface/50 rounded-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Panel position="top-right">
          <p className="text-white">Roadmap</p>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const HierarchicalRoadmap: React.FC<HierarchicalRoadmapProps> = ({ apiNodes, onNodeClick }) => {
  if (!apiNodes || apiNodes.length === 0) {
    return <div className="text-white">No roadmap data available.</div>;
  }
  
  return (
    <ReactFlowProvider>
      <LayoutFlow apiNodes={apiNodes} onNodeClick={onNodeClick} />
    </ReactFlowProvider>
  );
};

export default HierarchicalRoadmap;