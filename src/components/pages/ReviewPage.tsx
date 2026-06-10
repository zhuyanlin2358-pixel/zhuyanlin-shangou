import { useState, useRef, useCallback } from 'react'
import { ClipboardCheck, Upload, X, CheckCircle, XCircle, Clock, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react'
import type { Submission, SubmissionAsset, ReviewStatus } from '@/types'

const LS_KEY = 'review_submissions'

function loadSubmissions(): Submission[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveSubmissions(list: Submission[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

// 压缩图片到缩略图（max 400px，quality 0.7）
function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 400
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = url
  })
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: '待审核', color: '#F59E0B', icon: <Clock size={12} /> },
  approved: { label: '已通过', color: '#10B981', icon: <CheckCircle size={12} /> },
  rejected: { label: '已拒绝', color: '#EF4444', icon: <XCircle size={12} /> },
}

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(loadSubmissions)
  const [submitter, setSubmitter] = useState('')
  const [projectName, setProjectName] = useState('')
  const [notes, setNotes] = useState('')
  const [assets, setAssets] = useState<SubmissionAsset[]>([])
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const persist = useCallback((list: Submission[]) => {
    setSubmissions(list)
    saveSubmissions(list)
  }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    const newAssets: SubmissionAsset[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const dataUrl = await compressImage(file)
      newAssets.push({ name: file.name.replace(/\.[^.]+$/, ''), dataUrl })
    }
    setAssets(prev => [...prev, ...newAssets])
  }, [])

  const handleSubmit = () => {
    if (!submitter.trim() || !projectName.trim()) return
    setSubmitting(true)
    const submission: Submission = {
      id: `sub_${Date.now()}`,
      createdAt: Date.now(),
      submitter: submitter.trim(),
      projectName: projectName.trim(),
      notes: notes.trim(),
      assets,
      status: 'pending',
      webhookSent: false,
    }
    const next = [submission, ...submissions]
    persist(next)
    setProjectName('')
    setNotes('')
    setAssets([])
    setSubmitting(false)
    setExpandedId(submission.id)
  }

  const updateStatus = (id: string, status: ReviewStatus) => {
    persist(submissions.map(s => s.id === id ? { ...s, status } : s))
  }

  const deleteSubmission = (id: string) => {
    persist(submissions.filter(s => s.id !== id))
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 860, margin: '0 auto' }}>

      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <ClipboardCheck size={22} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>提交审核</h1>
      </div>

      {/* 统计 */}
      {stats.total > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[
            { label: '全部', value: stats.total, color: 'var(--text-2)' },
            { label: '待审核', value: stats.pending, color: '#F59E0B' },
            { label: '已通过', value: stats.approved, color: '#10B981' },
            { label: '已拒绝', value: stats.rejected, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 提交表单 */}
      <div style={{
        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 24, marginBottom: 28,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>新建提交</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <FormField label="活动 / 项目名称 *">
            <input
              value={projectName} onChange={e => setProjectName(e.target.value)}
              placeholder="如：618大促老虎机"
              style={inputStyle}
            />
          </FormField>
          <FormField label="提交人 *">
            <input
              value={submitter} onChange={e => setSubmitter(e.target.value)}
              placeholder="你的名字"
              style={inputStyle}
            />
          </FormField>
        </div>

        <FormField label="备注说明" style={{ marginBottom: 12 }}>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="素材用途、尺寸要求、特殊说明..."
            rows={2}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </FormField>

        {/* 上传素材 */}
        <FormField label="上传素材截图">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
            style={{
              border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', transition: 'border-color 0.15s',
              background: dragging ? 'var(--accent-soft)' : 'var(--bg)',
            }}
          >
            <Upload size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              点击或拖拽上传 PNG / JPG，支持多张
            </span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
        </FormField>

        {/* 已选素材预览 */}
        {assets.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {assets.map((a, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={a.dataUrl} alt={a.name}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                <button
                  onClick={() => setAssets(prev => prev.filter((_, j) => j !== i))}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#ef4444', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={10} color="#fff" />
                </button>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* 提交按钮 */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSubmit}
            disabled={!submitter.trim() || !projectName.trim() || submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 20px', borderRadius: 8,
              background: (!submitter.trim() || !projectName.trim()) ? 'var(--border)' : 'var(--accent)',
              color: (!submitter.trim() || !projectName.trim()) ? 'var(--text-3)' : '#fff',
              border: 'none', cursor: (!submitter.trim() || !projectName.trim()) ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            }}
          >
            <Send size={13} />
            提交审核
          </button>
        </div>
      </div>

      {/* 历史记录 */}
      {submissions.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>
            历史记录 · {submissions.length} 条
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.map(sub => {
              const cfg = STATUS_CONFIG[sub.status]
              const expanded = expandedId === sub.id
              return (
                <div key={sub.id} style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 10, overflow: 'hidden',
                }}>
                  {/* 卡片头部 */}
                  <div
                    onClick={() => setExpandedId(expanded ? null : sub.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', cursor: 'pointer',
                    }}
                  >
                    {/* 状态点 */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />

                    {/* 项目名 + 提交人 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.projectName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        {sub.submitter} · {new Date(sub.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {sub.assets.length > 0 && ` · ${sub.assets.length} 张素材`}
                      </div>
                    </div>

                    {/* 状态 badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '3px 9px', borderRadius: 99,
                      background: cfg.color + '18', color: cfg.color,
                      fontSize: 11, fontWeight: 600, flexShrink: 0,
                    }}>
                      {cfg.icon}{cfg.label}
                    </div>

                    {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                  </div>

                  {/* 展开详情 */}
                  {expanded && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--bg-subtle)' }}>

                      {sub.notes && (
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
                          <span style={{ color: 'var(--text-3)', marginRight: 6 }}>备注:</span>{sub.notes}
                        </div>
                      )}

                      {/* 素材缩略图 */}
                      {sub.assets.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                          {sub.assets.map((a, i) => (
                            <div key={i}>
                              <img src={a.dataUrl} alt={a.name}
                                style={{ height: 56, width: 'auto', maxWidth: 120, borderRadius: 5, border: '1px solid var(--border)', objectFit: 'contain', background: '#fff' }} />
                              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 4 }}>标记为:</span>
                        {(['pending', 'approved', 'rejected'] as ReviewStatus[]).map(s => {
                          const c = STATUS_CONFIG[s]
                          return (
                            <button key={s} onClick={() => updateStatus(sub.id, s)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 10px', borderRadius: 6, border: '1px solid',
                                borderColor: sub.status === s ? c.color : 'var(--border)',
                                background: sub.status === s ? c.color + '18' : 'transparent',
                                color: sub.status === s ? c.color : 'var(--text-2)',
                                fontSize: 11, cursor: 'pointer', transition: 'all 0.12s',
                              }}
                            >
                              {c.icon}{c.label}
                            </button>
                          )
                        })}
                        <div style={{ flex: 1 }} />
                        {!sub.webhookSent && (
                          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                            大象通知待配置
                          </span>
                        )}
                        <button onClick={() => deleteSubmission(sub.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 6,
                            border: '1px solid var(--border)', background: 'transparent',
                            color: '#ef4444', fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={11} />删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 空态 */}
      {submissions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
          <ClipboardCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <div style={{ fontSize: 13 }}>暂无提交记录</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>填写表单后点击「提交审核」</div>
        </div>
      )}
    </div>
  )
}

// ── 小工具 ───────────────────────────────────────────────────────────────────
function FormField({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-3)', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '8px 10px', borderRadius: 7,
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text-1)', fontSize: 12, outline: 'none',
}
