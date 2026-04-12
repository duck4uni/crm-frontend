"use client";

interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-1" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              py-3 px-6 font-semibold text-sm transition-colors border-b-2
              ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }
            `}
          >
            <span className="flex items-center space-x-2">
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`
                    py-0.5 px-2 rounded-full text-xs font-semibold
                    ${
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
