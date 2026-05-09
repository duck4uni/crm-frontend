"use client";

import { useState } from "react";
import { AutomationTabBar } from "./components/AutomationTabBar";
import { AutomationListView } from "./components/AutomationListView";
import { WorkflowBuilder } from "./components/WorkflowBuilder";
import { TemplatePicker } from "./components/TemplatePicker";
import { useMarketingAutomation } from "./_hooks/useMarketingAutomation";
import { MarketingSection } from "../components/sections/MarketingSection";

export default function ZaloOaAutomationPage() {
  const [mainTab, setMainTab] = useState<"automation" | "campaigns">("automation");
  const hook = useMarketingAutomation();

  return (
    <div className="p-6">
      <AutomationTabBar active={mainTab} onChange={setMainTab} />

      {mainTab === "automation" && (
        <>
          {hook.editingFlow
            ? <WorkflowBuilder hook={hook} />
            : <AutomationListView hook={hook} />}
          {hook.showTemplatePicker && <TemplatePicker hook={hook} />}
        </>
      )}

      {mainTab === "campaigns" && <MarketingSection />}
    </div>
  );
}
