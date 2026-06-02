import { useApp } from '@/contexts/AppContext'
import { COMPONENT_REGISTRY } from '@/types'

export default function GenericPanel() {
  const { currentComp } = useApp()
  const comp = COMPONENT_REGISTRY.find(c => c.id === currentComp)
  return (
    <div className="p-4">
      <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-1)' }}>
        {comp?.label || '组件'}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-3)' }}>配置面板即将上线</div>
    </div>
  )
}
