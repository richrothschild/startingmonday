import { addDocument, removeDocument } from './actions'
import { DOC_LABELS } from './company-detail-constants'

type DocumentRow = {
  id: string
  label: string
  content: string
}

type Props = {
  companyId: string
  documents: DocumentRow[]
  previewChars: number
}

export function DocumentsPanel(props: Props) {
  const { companyId, documents, previewChars } = props

  return (
    <>
      {documents.length > 0 && (
        <div className="divide-y divide-slate-50">
          {documents.map((doc) => {
            const dl = DOC_LABELS[doc.label] ?? { label: doc.label, cls: 'bg-slate-100 text-slate-500' }
            return (
              <div key={doc.id} className="px-6 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.04em] ${dl.cls}`}>
                      {dl.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2">
                    {doc.content.slice(0, previewChars)}{doc.content.length > previewChars ? '...' : ''}
                  </p>
                </div>
                <form action={removeDocument.bind(null, doc.id, companyId)}>
                  <button
                    type="submit"
                    className="text-[11px] text-slate-300 hover:text-red-500 cursor-pointer bg-transparent border-0 p-0 shrink-0"
                  >
                    Remove
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      )}

      <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">Add document</div>
        <form action={addDocument.bind(null, companyId)} className="flex flex-col gap-3">
          <div>
            <label htmlFor="doc-label" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Type</label>
            <select
              id="doc-label"
              name="label"
              className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
            >
              <option value="job_description">Job Description</option>
              <option value="news">News & Press</option>
              <option value="annual_report">Annual Report</option>
              <option value="org_notes">Org Notes</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="doc-content" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="doc-content"
              name="content"
              required
              rows={7}
              placeholder="Paste a job description, news article, annual report excerpt, or org notes..."
              className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none bg-white leading-relaxed"
            />
          </div>
          <div>
            <button type="submit" className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2 rounded cursor-pointer border-0">
              Save document
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
