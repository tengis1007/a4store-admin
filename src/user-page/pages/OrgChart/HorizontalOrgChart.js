import React, { useState } from "react";
import { FiChevronDown, FiChevronRight, FiUser, FiPhone } from "react-icons/fi";

const OrganizationChart = () => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const sampleData = {
    name: "John Smith",
    title: "CEO",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    children: [
      {
        name: "Sarah Johnson",
        title: "CTO",
        phone: "+1 (555) 234-5678",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        children: [
          {
            name: "Tech Team A",
            title: "Development",
            phone: "+1 (555) 345-6789",
            children: [
              {
                name: "Michael Chen",
                title: "Lead Developer",
                phone: "+1 (555) 456-7890",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
              }
            ]
          }
        ]
      },
      {
        name: "Robert Wilson",
        title: "CFO",
        phone: "+1 (555) 567-8901",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
        children: [
          {
            name: "Finance Team",
            title: "Accounting",
            phone: "+1 (555) 678-9012",
            children: []
          }
        ]
      }
    ]
  };

  const toggleNode = (nodeName) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeName)) {
        next.delete(nodeName);
      } else {
        next.add(nodeName);
      }
      return next;
    });
  };

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.name);
    const teamCount = hasChildren ? node.children.length : 0;

    return (
      <div key={node.name} className="flex flex-col items-center">
        <div
          className="flex items-center p-3 my-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer min-w-[280px]"
          onClick={() => hasChildren && toggleNode(node.name)}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`${node.name}, ${node.title}`}
        >
          {hasChildren && (
            <span className="mr-2">
              {isExpanded ? (
                <FiChevronDown className="text-gray-600" />
              ) : (
                <FiChevronRight className="text-gray-600" />
              )}
            </span>
          )}
          {node.avatar ? (
            <img
              src={node.avatar}
              alt={node.name}
              className="w-8 h-8 rounded-full mr-3 object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1633332755192-727a05c4013d";
              }}
            />
          ) : (
            <FiUser className="w-8 h-8 p-1 rounded-full mr-3 bg-gray-100 text-gray-600" />
          )}
          <div className="flex-grow">
            <h3 className="font-medium text-gray-900">{node.name}</h3>
            <p className="text-sm text-gray-500">{node.title}</p>
            <div className="flex items-center mt-1 text-sm text-gray-400">
              <FiPhone className="mr-1" />
              <span>{node.phone}</span>
            </div>
          </div>
          {hasChildren && (
            <div className="ml-4 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              {teamCount} {teamCount === 1 ? "member" : "members"}
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="flex flex-row gap-8 mt-4">
            {node.children.map((child) => (
              <div key={child.name} className="relative">
                <div className="w-[2px] h-8 bg-gray-200 absolute left-1/2 -top-4 transform -translate-x-1/2"></div>
                {renderNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto p-4 bg-gray-50 min-h-screen overflow-x-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Organization Structure</h1>
      <div className="flex justify-center min-w-fit pb-8">
        {renderNode(sampleData)}
      </div>
    </div>
  );
};

export default OrganizationChart;