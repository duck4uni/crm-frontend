"use client";

import React from "react";
import { JourneyStage } from "@/types/customer-journey";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface JourneyStageCardProps {
  stage: JourneyStage;
  isDragEnabled: boolean;
  onClick?: () => void;
}

export const JourneyStageCard = React.memo(function JourneyStageCard({ stage, isDragEnabled, onClick }: JourneyStageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: stage.id,
    disabled: !isDragEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg p-4 border-l-4 ${stage.color}
        shadow-sm hover:shadow-md transition-all duration-150
        ${isDragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isDragging ? 'z-50 rotate-2 shadow-lg' : ''}
        hover:border-l-[5px]
      `}
      onClick={!isDragEnabled ? onClick : undefined}
      {...(isDragEnabled ? { ...attributes, ...listeners } : {})}
    >
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-800 text-sm">{stage.name}</h4>
        {stage.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {stage.description}
          </p>
        )}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {stage.count.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">({stage.percentage}%)</span>
        </div>
      </div>
    </div>
  );
});

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FiPlus } from "react-icons/fi";
import { JourneyCategory } from "@/types/customer-journey";

interface JourneyCategoryColumnProps {
  title: string;
  categoryId: string;
  stages: JourneyStage[];
  isDragEnabled: boolean;
  onAddStage?: () => void;
}

// Category color themes
const categoryThemes: Record<string, { header: string; bg: string; border: string }> = {
  [JourneyCategory.AWARENESS]: {
    header: "bg-slate-100 border-slate-300",
    bg: "bg-slate-50",
    border: "border-slate-200"
  },
  [JourneyCategory.DISCOVERY]: {
    header: "bg-orange-100 border-orange-300",
    bg: "bg-orange-50",
    border: "border-orange-200"
  },
  [JourneyCategory.CONSIDERATION]: {
    header: "bg-amber-100 border-amber-300",
    bg: "bg-amber-50",
    border: "border-amber-200"
  },
  [JourneyCategory.SUCCESS]: {
    header: "bg-emerald-100 border-emerald-300",
    bg: "bg-emerald-50",
    border: "border-emerald-200"
  },
  [JourneyCategory.POST_SALES]: {
    header: "bg-sky-100 border-sky-300",
    bg: "bg-sky-50",
    border: "border-sky-200"
  },
  [JourneyCategory.POST_SALES_ADVANCED]: {
    header: "bg-purple-100 border-purple-300",
    bg: "bg-purple-50",
    border: "border-purple-200"
  },
};

export const JourneyCategoryColumn = React.memo(function JourneyCategoryColumn({ 
  title, 
  categoryId,
  stages,
  isDragEnabled,
  onAddStage 
}: JourneyCategoryColumnProps) {
  const { setNodeRef } = useDroppable({
    id: categoryId,
  });

  const theme = categoryThemes[categoryId] || categoryThemes[JourneyCategory.AWARENESS];

  return (
    <div className="flex-shrink-0 w-72">
      {/* Category Header */}
      <div className={`${theme.header} border-2 ${theme.border} rounded-t-lg px-4 py-3`}>
        <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
      </div>

      {/* Stages Container */}
      <div 
        ref={setNodeRef}
        className={`${theme.bg} border-2 border-t-0 ${theme.border} rounded-b-lg p-3 min-h-[400px] space-y-3`}
      >
        <SortableContext 
          items={stages.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {stages.map((stage) => (
            <JourneyStageCard
              key={stage.id}
              stage={stage}
              isDragEnabled={isDragEnabled}
              onClick={() => console.log("Clicked stage:", stage)}
            />
          ))}
        </SortableContext>
        
        {/* Add Stage Button */}
        <button
          onClick={onAddStage}
          className="
            w-full py-2.5 border-2 border-dashed border-gray-300 
            rounded-lg text-gray-400 hover:border-gray-400 
            hover:text-gray-600 hover:bg-white/50 transition-colors
            flex items-center justify-center
          "
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
