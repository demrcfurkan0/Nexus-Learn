import React, { useState } from 'react';
import { BookOpen, Lightbulb, Target, Zap, Award, Rocket } from 'lucide-react';

interface ConstellationNode {
  id: string;
  title: string;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  icon: React.ReactNode;
  connections: string[];
  completed: boolean;
}

const RoadmapConstellation: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes: ConstellationNode[] = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      x: 15,
      y: 80,
      size: 'large',
      icon: <BookOpen className="w-6 h-6" />,
      connections: ['2', '3'],
      completed: true
    },
    {
      id: '2',
      title: 'DOM Manipulation',
      x: 35,
      y: 60,
      size: 'medium',
      icon: <Lightbulb className="w-5 h-5" />,
      connections: ['4'],
      completed: true
    },
    {
      id: '3',
      title: 'ES6+ Features',
      x: 25,
      y: 40,
      size: 'medium',
      icon: <Target className="w-5 h-5" />,
      connections: ['4', '5'],
      completed: false
    },
    {
      id: '4',
      title: 'React Basics',
      x: 55,
      y: 50,
      size: 'large',
      icon: <Zap className="w-6 h-6" />,
      connections: ['6', '7'],
      completed: false
    },
    {
      id: '5',
      title: 'Async Programming',
      x: 45,
      y: 25,
      size: 'medium',
      icon: <Rocket className="w-5 h-5" />,
      connections: ['6'],
      completed: false
    },
    {
      id: '6',
      title: 'State Management',
      x: 75,
      y: 30,
      size: 'medium',
      icon: <Award className="w-5 h-5" />,
      connections: ['8'],
      completed: false
    },
    {
      id: '7',
      title: 'Component Design',
      x: 65,
      y: 70,
      size: 'small',
      icon: <BookOpen className="w-4 h-4" />,
      connections: ['8'],
      completed: false
    },
    {
      id: '8',
      title: 'Full-Stack Integration',
      x: 85,
      y: 50,
      size: 'large',
      icon: <Target className="w-6 h-6" />,
      connections: [],
      completed: false
    }
  ];

  const getNodeSize = (size: string) => {
    switch (size) {
      case 'small': return 'w-12 h-12';
      case 'medium': return 'w-16 h-16';
      case 'large': return 'w-20 h-20';
      default: return 'w-16 h-16';
    }
  };

  const getNodeGlow = (size: string) => {
    switch (size) {
      case 'small': return '0 0 20px rgba(0, 229, 255, 0.4)';
      case 'medium': return '0 0 30px rgba(0, 229, 255, 0.5)';
      case 'large': return '0 0 40px rgba(0, 229, 255, 0.6)';
      default: return '0 0 30px rgba(0, 229, 255, 0.5)';
    }
  };

  const renderConnections = () => {
    return nodes.map(node => 
      node.connections.map(connectionId => {
        const targetNode = nodes.find(n => n.id === connectionId);
        if (!targetNode) return null;

        const isHighlighted = hoveredNode === node.id || hoveredNode === connectionId;
        const opacity = hoveredNode ? (isHighlighted ? 1 : 0.2) : 0.6;

        return (
          <line
            key={`${node.id}-${connectionId}`}
            x1={`${node.x}%`}
            y1={`${node.y}%`}
            x2={`${targetNode.x}%`}
            y2={`${targetNode.y}%`}
            className="constellation-line"
            style={{ opacity }}
          />
        );
      })
    );
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-bold text-gray-100 mb-4">
          Takımyıldızda <span className="text-nexus-accent glow-text">Gezinin</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
         Her yıldız, öğrenme yolculuğunuzda bir dönüm noktasını temsil eder. Ustalığa giden kozmik yolları takip edin.
        </p>
      </div>

      <div className="relative bg-gradient-to-br from-nexus-surface/50 to-nexus-dark/50 backdrop-blur-sm rounded-3xl p-8 border border-nexus-accent/20">
        <div className="relative w-full h-96 md:h-[500px]">
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {renderConnections()}
          </svg>

          {/* Nodes */}
          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const isConnected = hoveredNode && nodes.find(n => n.id === hoveredNode)?.connections.includes(node.id);
              const shouldHighlight = !hoveredNode || isHovered || isConnected;
              
              return (
                <div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getNodeSize(node.size)} 
                    ${node.completed ? 'bg-nexus-accent' : 'bg-nexus-surface'} 
                    rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 
                    hover:scale-110 border-2 ${node.completed ? 'border-nexus-accent' : 'border-gray-600'}`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    opacity: shouldHighlight ? 1 : 0.3,
                    boxShadow: isHovered ? getNodeGlow(node.size) : 'none'
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div className={`${node.completed ? 'text-nexus-dark' : 'text-nexus-accent'}`}>
                    {node.icon}
                  </div>
                  
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-nexus-surface/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-nexus-accent/30 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">{node.title}</div>
                      <div className="text-xs text-gray-400">
                        {node.completed ? 'Completed' : 'Not started'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-nexus-accent rounded-full"></div>
            <span className="text-sm text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-nexus-surface border border-gray-600 rounded-full"></div>
            <span className="text-sm text-gray-400">Not Started</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-nexus-surface border border-gray-600 rounded-full"></div>
            <span className="text-sm text-gray-400">Major Topic</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapConstellation;