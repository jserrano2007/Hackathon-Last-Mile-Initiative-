import './TabBar.css'

const TABS = [
  { key: 'find', label: 'Find food' },
  { key: 'sell', label: 'Sell' },
  { key: 'grow', label: 'Grow' },
  { key: 'garden', label: 'My garden' },
]

function TabBar({ activeTab, onSelectTab }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`tab-bar-btn${activeTab === tab.key ? ' active' : ''}`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
          onClick={() => onSelectTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default TabBar
