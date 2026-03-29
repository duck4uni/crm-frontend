"use client";

import { useState } from "react";
import { mockConversionRateData } from "@/mock-data/conversion-rate";
import { ConversionStage, ConversionMetricItem } from "@/types/conversion-rate";
import { Toggle } from "@/components/ui/Toggle";
import { FiDownload } from "react-icons/fi";

// Funnel Stage Card Component
function FunnelStageCard({ stage, isLast }: { stage: ConversionStage; isLast: boolean }) {
  const formatNumber = (num: number, isRevenue: boolean = false) => {
    if (isRevenue) {
      return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
    return num.toLocaleString('vi-VN');
  };

  const handleItemClick = (item: ConversionMetricItem) => {
    console.log("Clicked item:", item);
    // TODO: Implement drill-down or detail view
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Stage Card */}
      <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className={`
          px-4 py-4
          ${stage.isRevenue 
            ? 'bg-blue-900' 
            : 'bg-blue-100'
          }
        `}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
              ${stage.isRevenue 
                ? 'bg-white/20 text-white' 
                : 'bg-white text-blue-900'
              }
            `}>
              {stage.order}
            </div>
            <h3 className={`text-sm font-semibold ${stage.isRevenue ? 'text-white' : 'text-blue-900'}`}>
              {stage.title}
            </h3>
          </div>
          <div className={`text-3xl font-bold ${stage.isRevenue ? 'text-white' : 'text-blue-900'}`}>
            {formatNumber(stage.total, stage.isRevenue)}
          </div>
        </div>

        {/* Metrics List */}
        <div className="flex-1 bg-white">
          {stage.items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              className={`
                group w-full px-4 py-2.5 text-left transition-colors
                hover:bg-gray-50
                ${item.indent === 1 ? 'pl-8' : item.indent === 2 ? 'pl-12' : ''}
                ${idx < stage.items.length - 1 ? 'border-b border-gray-100' : ''}
                flex items-center justify-between gap-3
              `}
            >
              <span className="text-sm text-gray-700 flex-1">
                {item.label}
              </span>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-sm font-semibold text-gray-900">
                  {typeof item.value === 'number' && !Number.isInteger(item.value)
                    ? item.value.toFixed(2)
                    : formatNumber(item.value, stage.isRevenue)}
                </div>
                {item.percentage !== undefined && (
                  <span className="text-xs text-gray-500 min-w-[45px] text-right">
                    ({item.percentage}%)
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConversionRateView() {
  const [reportType, setReportType] = useState("all");
  const [assignee, setAssignee] = useState("");
  const [relationship, setRelationship] = useState("");
  const [timePeriod, setTimePeriod] = useState("this-month");
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const { stages } = mockConversionRateData;

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 flex-wrap">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="all">Loại bảo cáo</option>
        </select>

        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="">Người phụ trách</option>
        </select>

        <select
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="">Mối quan hệ</option>
        </select>

        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="this-month">Tháng này</option>
          <option value="last-month">Tháng trước</option>
          <option value="this-quarter">Quý này</option>
          <option value="this-year">Năm nay</option>
        </select>

        <Toggle
          label="Tất cả KH"
          checked={showAllCustomers}
          onChange={setShowAllCustomers}
        />

        <div className="flex-1" />

        <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Báo cáo
        </button>
      </div>

      {/* Funnel Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Section Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Tỷ lệ chuyển đổi</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <FiDownload className="w-4 h-4" />
          </button>
        </div>

        {/* Funnel Flow */}
        <div className="p-6">
          <div className="flex gap-4">
            {stages.map((stage, index) => (
              <FunnelStageCard
                key={stage.id}
                stage={stage}
                isLast={index === stages.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
