"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
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

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCategory = findCategoryByStageId(activeId);
    const overCategory = findCategoryByStageId(overId) || findCategoryById(overId);

    if (!activeCategory || !overCategory) return;

    setJourneyData((prev) => {
      const newData = [...prev];
      const activeCategoryIndex = newData.findIndex(c => c.category === activeCategory.category);
      const overCategoryIndex = newData.findIndex(c => c.category === overCategory.category);

      const activeStages = [...newData[activeCategoryIndex].stages];
      const overStages = activeCategoryIndex === overCategoryIndex 
        ? activeStages 
        : [...newData[overCategoryIndex].stages];

      const activeIndex = activeStages.findIndex(s => s.id === activeId);
      const overIndex = overStages.findIndex(s => s.id === overId);

      if (activeCategoryIndex === overCategoryIndex) {
        // Same category - reorder
        const reordered = arrayMove(activeStages, activeIndex, overIndex);
        newData[activeCategoryIndex] = {
          ...newData[activeCategoryIndex],
          stages: reordered,
        };
      } else {
        // Different category - move
        const [movedStage] = activeStages.splice(activeIndex, 1);
        const insertIndex = overIndex >= 0 ? overIndex : overStages.length;
        overStages.splice(insertIndex, 0, {
          ...movedStage,
          category: overCategory.category,
        });

        newData[activeCategoryIndex] = {
          ...newData[activeCategoryIndex],
          stages: activeStages,
          totalCount: activeStages.reduce((sum, s) => sum + s.count, 0),
        };
        newData[overCategoryIndex] = {
          ...newData[overCategoryIndex],
          stages: overStages,
          totalCount: overStages.reduce((sum, s) => sum + s.count, 0),
        };
      }

      return newData;
    });
  }, [findCategoryByStageId, findCategoryById]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
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
      onDragOver={handleDragOver}
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
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
