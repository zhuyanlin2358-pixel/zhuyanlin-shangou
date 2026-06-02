import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import N4Panel from '@/components/N4Panel'
import N2Panel from '@/components/N2Panel'

export type ComponentId = 'n4' | 'n2'

const COMPONENTS: { id: ComponentId; label: string; desc: string }[] = [
  { id: 'n4', label: 'N4 文字标签', desc: '240×156 透明底文字标签' },
  { id: 'n2', label: 'N2 品牌/活动Logo', desc: '圆形 Logo 有底色/无底色' },
]

export default function App() {
  const [activeId, setActiveId] = useState<ComponentId>('n4')

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar
        components={COMPONENTS}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <main className="flex-1 overflow-auto">
        {activeId === 'n4' && <N4Panel />}
        {activeId === 'n2' && <N2Panel />}
      </main>
    </div>
  )
}
