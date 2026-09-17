import re

with open('src/components/GlobalHeader.tsx', 'r') as f:
    content = f.read()

mobile_menu_section = """
              <div className="px-2 space-y-1">
                {coreNavItems.map(tab => {
                  const isActive = activeArea === 'RESEARCH' && researchTab === tab.id;
                  
                  if (tab.id === 'wizard') {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveArea('RESEARCH');
                          setResearchTab(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        <Plus className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                        {tab.label}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveArea('RESEARCH');
                        setResearchTab(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
"""

old_mobile_menu_section = """
              <div className="px-2 space-y-1">
                {coreNavItems.map(tab => {
                  const isActive = activeArea === 'RESEARCH' && researchTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveArea('RESEARCH');
                        setResearchTab(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
"""

content = content.replace(old_mobile_menu_section.strip(), mobile_menu_section.strip())

with open('src/components/GlobalHeader.tsx', 'w') as f:
    f.write(content)
