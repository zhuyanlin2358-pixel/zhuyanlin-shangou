import { useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { AssetRecord } from '@/types'
import { findComponent } from '@/types'

const STATUS_LABELS = {
  pending:  { label: '待送审', color: '#f59e0b' },
  approved: { label: '已通过', color: '#10b981' },
  rejected: { label: '已拒绝', color: '#ef4444' },
}

export default function AssetsPage() {
  const [records, setRecords] = useLocalStorage<AssetRecord[]>('shangou_asset_records', [])
  const [tab, setTab] = useState<'all' | AssetRecord['status']>('all')

  const filtered = tab === 'all' ? records : records.filter(r => r.status === tab)

  const updateStatus = (id: string, status: AssetRecord['status']) =>
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r))

  const deleteRecord = (id: string) =>
    setRecords(prev => prev.filter(r => r.id !== id))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>我的资产</h2>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>导出历史 · 送审状态流转</p>
      </div>

      {/* Tab */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px"
            style={{
              borderColor: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-3)',
            }}
          >
            {t === 'all' ? '全部' : STATUS_LABELS[t].label}
            <span className="ml-1 px-1.5 py-0.5 rounded text-xs"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)' }}>
              {t === 'all' ? records.length : records.filter(r => r.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40"
          style={{ color: 'var(--text-3)', fontSize: 13 }}>
          <div className="text-3xl mb-3">📭</div>
          <div>暂无导出记录</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
            导出素材后自动记录到这里
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {[...filtered].reverse().map(record => {
            const comp = findComponent(record.compId)
            const statusMeta = STATUS_LABELS[record.status]
            return (
              <div
                key={record.id}
                className="p-4 rounded-xl border"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                        {comp?.name || record.compLabel}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${statusMeta.color}18`, color: statusMeta.color }}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </div>
                    {record.files.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {record.files.map(f => (
                          <span key={f} className="text-xs px-2 py-0.5 rounded"
                            style={{ background: 'var(--bg-subtle)', color: 'var(--text-2)' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ color: 'var(--text-3)' }}
                  >
                    删除
                  </button>
                </div>
                {record.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateStatus(record.id, 'approved')}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors"
                      style={{ borderColor: '#10b981', color: '#10b981' }}
                    >
                      标记通过
                    </button>
                    <button
                      onClick={() => updateStatus(record.id, 'rejected')}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors"
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      标记拒绝
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
