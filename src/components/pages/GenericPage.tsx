import { useApp } from '@/contexts/AppContext'
import { findComponent } from '@/types'

export default function GenericPage() {
  const { currentComp } = useApp()
  const comp = currentComp ? findComponent(currentComp) : undefined
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-4xl mb-4">📦</div>
        <div className="text-base font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
          {comp?.name || '组件'}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-3)' }}>即将上线</div>
      </div>
    </div>
  )
}
