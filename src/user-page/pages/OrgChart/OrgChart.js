import React, { useState } from "react";
import { FiChevronDown, FiChevronRight, FiUser, FiPhone, FiArrowLeft } from "react-icons/fi";
import { FaWallet } from "react-icons/fa"; // Import wallet icon from Font Awesome
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import { Box, IconButton, Typography } from "@mui/material";

const OrganizationChart = () => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const navigate = useNavigate(); // Initialize useNavigate

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
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
              },
            ],
          },
        ],
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
            children: [],
          },
        ],
      },
    ],
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

    // Dynamic indentation scaling
    const indent = Math.min(level * 24, 120); // Limit indentation to avoid excessive width

    return (
      <div key={node.name} className="relative" style={{ paddingLeft: `${indent}px` }}>
        <div
          className="flex items-center p-3 my-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
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
            <div
              className={`ml-4 px-3 py-1 rounded-full text-sm text-white ${
                isExpanded ? "bg-[#1976d2]" : "bg-gray-200"
              }`}
            >
              {/* Responsive Members Count */}
              <span className="hidden sm:inline">
                {teamCount} {teamCount === 1 ? "member" : "members"}
              </span>
              <span className="sm:hidden">{teamCount}</span>
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="pl-4 border-l-2 border-[#1976d2]">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Box className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header with Back Button and Wallet Icon */}
      <Box className="flex justify-between items-center mb-6">
        <IconButton onClick={() => navigate(-1)} size="large" aria-label="Back">
          <FiArrowLeft className="text-[#1976d2]" size={24} />
        </IconButton>
        <Typography variant="h5" className="text-xl font-bold text-[#1976d2]">
          Organization Structure
        </Typography>
        <IconButton onClick={() => navigate("/wallet")} size="large" aria-label="Wallet">
          <FaWallet className="text-[#1976d2]" size={24} />
        </IconButton>
      </Box>
      {/* Organization Chart Content */}
      <Box className="overflow-x-auto">
        <Box className="w-full">{renderNode(sampleData)}</Box>
      </Box>
    </Box>
  );
};

export default OrganizationChart;