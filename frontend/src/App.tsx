import { useState } from 'react'
import { NavTabs } from './components/NavTabs'
import type { Tab } from './components/NavTabs'
import { WaitlistPage } from './pages/WaitlistPage'
import { TablesPage } from './pages/TablesPage'
import { HistoryPage } from './pages/HistoryPage'
import { PartiesProvider } from './state/PartiesContext'
import { TablesProvider } from './state/TablesContext'

function App() {
  const [tab, setTab] = useState<Tab>('waitlist')

  return (
    <PartiesProvider>
      <TablesProvider>
        <NavTabs active={tab} onChange={setTab} />
        {tab === 'waitlist' && <WaitlistPage />}
        {tab === 'tables' && <TablesPage />}
        {tab === 'history' && <HistoryPage />}
      </TablesProvider>
    </PartiesProvider>
  )
}

export default App
