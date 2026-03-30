"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { mockCustomerJourneyData } from "@/mock-data/customer-journey";
import { CustomerJourneyData, JourneyStage } from "@/types/customer-journey";
import { JourneyCategoryColumn, JourneyStageCard } from "./JourneyStageCard";
import { FiPlus } from "react-icons/fi";
import { Toggle } from "@/components/ui/Toggle";

function getTotalCount(stages: JourneyStage[]): number {
  return stages.reduce((sum, stage) => sum + stage.count, 0);
}

function moveStage(
  data: CustomerJourneyData[],
  activeId: string,
  overId: string
): CustomerJourneyData[] {
  const activeCategoryIndex = data.findIndex((category) =>
    category.stages.some((stage) => stage.id === activeId)
  );

  if (activeCategoryIndex < 0) {
    return data;
  }

  const overCategoryIndexByStage = data.findIndex((category) =>
    category.stages.some((stage) => stage.id === overId)
  );
  const overCategoryIndex = overCategoryIndexByStage >= 0
    ? overCategoryIndexByStage
    : data.findIndex((category) => category.category === overId);

  if (overCategoryIndex < 0) {
    return data;
  }

  const activeStages = data[activeCategoryIndex].stages;
  const activeStageIndex = activeStages.findIndex((stage) => stage.id === activeId);

  if (activeStageIndex < 0) {
    return data;
  }

  if (activeCategoryIndex === overCategoryIndex) {
    const overStageIndex = data[overCategoryIndex].stages.findIndex((stage) => stage.id === overId);

    if (overStageIndex < 0 || activeStageIndex === overStageIndex) {
      return data;
    }

    const reorderedStages = arrayMove(activeStages, activeStageIndex, overStageIndex);
    const nextData = [...data];
    nextData[activeCategoryIndex] = {
      ...nextData[activeCategoryIndex],
      stages: reorderedStages,
    };

    return nextData;
  }

  const sourceStages = [...activeStages];
  const [movedStage] = sourceStages.splice(activeStageIndex, 1);

  if (!movedStage) {
    return data;
  }

  const targetStages = [...data[overCategoryIndex].stages];
  const overStageIndex = targetStages.findIndex((stage) => stage.id === overId);
  const insertIndex = overStageIndex >= 0 ? overStageIndex : targetStages.length;

  targetStages.splice(insertIndex, 0, {
    ...movedStage,
    category: data[overCategoryIndex].category,
  });

  const nextData = [...data];
  nextData[activeCategoryIndex] = {
    ...nextData[activeCategoryIndex],
    stages: sourceStages,
    totalCount: getTotalCount(sourceStages),
  };
  nextData[overCategoryIndex] = {
    ...nextData[overCategoryIndex],
    stages: targetStages,
    totalCount: getTotalCount(targetStages),
  };

  return nextData;
}

export function CustomerJourneyView() {
  const [journeyData, setJourneyData] = useState<CustomerJourneyData[]>(mockCustomerJourneyData);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [showAllCustomers, setShowAllCustomers] = useState(true);
  const [activeStage, setActiveStage] = useState<JourneyStage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findStageById = useCallback((id: string): JourneyStage | null => {
    for (const category of journeyData) {
      const stage = category.stages.find(s => s.id === id);
      if (stage) return stage;
    }
    return null;
  }, [journeyData]);

  const findCategoryByStageId = useCallback((stageId: string): CustomerJourneyData | null => {
    return journeyData.find(c => c.stages.some(s => s.id === stageId)) || null;
  }, [journeyData]);

  const findCategoryById = useCallback((categoryId: string): CustomerJourneyData | null => {
    return journeyData.find(c => c.category === categoryId) || null;
  }, [journeyData]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const stage = findStageById(active.id as string);
    setActiveStage(stage);
  }, [findStageById]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId !== overId) {
        setJourneyData((prev) => moveStage(prev, activeId, overId));
      }
    }

    setActiveStage(null);
  }, []);

  const handleAddCategory = () => {
    console.log("Add new category");
    // TODO: Implement add category modal
  };

  return (
    <DndContext
      key="customer-journey-dnd"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center space-x-6 flex-shrink-0 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <Toggle
            label="Bật / Tất cả đó kéo thả"
            checked={dragEnabled}
            onChange={setDragEnabled}
          />

          <div className="h-6 w-px bg-gray-300" />

          <Toggle
            label="Tất cả"
            checked={showAll}
            onChange={setShowAll}
          />

          <Toggle
            label="Tất cả KH"
            checked={showAllCustomers}
            onChange={setShowAllCustomers}
          />

          <div className="flex-1" />

          <button className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Báo cáo
          </button>
        </div>

        {/* Journey Funnel - Horizontal & Vertical Scroll */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)] bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex space-x-4 pb-2">
            {journeyData.map((categoryData) => (
              <JourneyCategoryColumn
                key={categoryData.category}
                title={categoryData.category}
                categoryId={categoryData.category}
                stages={categoryData.stages}
                isDragEnabled={dragEnabled}
                onAddStage={() => console.log("Add stage to", categoryData.category)}
              />
            ))}

            {/* Add Category Button */}
            <div className="flex-shrink-0 w-72">
              <button
                onClick={handleAddCategory}
                className="
                  w-full h-40 border-2 border-dashed border-gray-300 
                  rounded-lg bg-white text-gray-500 hover:border-gray-400 
                  hover:text-gray-700 hover:bg-gray-50 transition-colors
                  flex flex-col items-center justify-center space-y-2
                "
              >
                <FiPlus className="w-6 h-6" />
                <span className="text-sm font-medium">Thêm mới thư mục</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeStage ? (
          <div className="rotate-3 scale-105">
            <JourneyStageCard
              stage={activeStage}
              isDragEnabled={true}
              onClick={() => { }}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
