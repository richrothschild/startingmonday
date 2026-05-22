import Link from 'next/link'

type ContactLite = {
  id: string
  outreach_status: string | null
}

type Props = {
  contacts: ContactLite[]
  prepBriefCount: number
  stage: string
  interviewLogsLength: number
  companyName: string
  companyId: string
}

export function CompanyNextActionBanner(props: Props) {
  const hasContacts = props.contacts.length > 0
  const hasBrief = props.prepBriefCount > 0
  const hasOutreachStarted = props.contacts.some((ct) => ct.outreach_status && ct.outreach_status !== 'prospect')
  const isInterviewing = props.stage === 'interviewing'
  const hasInterviewLogs = props.interviewLogsLength > 0

  if (!hasContacts && !hasBrief) {
    return (
      <div className="mt-6 bg-slate-900 rounded px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-white">Two things move this forward.</p>
          <p className="text-[12px] text-slate-400 mt-0.5">Add a contact at {props.companyName} and run a prep brief before your first conversation.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="#add-contact-form" className="text-[12px] font-semibold text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded transition-colors">
            Add contact
          </Link>
          <Link href={`/dashboard/companies/${props.companyId}/prep`} className="text-[12px] font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded transition-colors border-0">
            Run a brief
          </Link>
        </div>
      </div>
    )
  }

  if (isInterviewing && !hasInterviewLogs) {
    return (
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-[13px] text-slate-700">
          You are in the interview loop. Log what happened so your next brief reflects the actual conversation.
        </p>
        <Link href={`/dashboard/companies/${props.companyId}/prep`} className="shrink-0 text-[12px] font-semibold text-amber-800 border border-amber-300 hover:border-amber-500 bg-white px-3 py-1.5 rounded transition-colors">
          Run interview prep
        </Link>
      </div>
    )
  }

  if (!hasBrief) {
    return (
      <div className="mt-6 bg-slate-900 rounded px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-[13px] text-slate-300">
          {hasContacts ? `You have contacts at ${props.companyName}. Run a brief before your next call.` : `No prep brief for ${props.companyName} yet.`}
        </p>
        <Link href={`/dashboard/companies/${props.companyId}/prep`} className="shrink-0 text-[12px] font-semibold text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded transition-colors">
          Generate brief
        </Link>
      </div>
    )
  }

  if (hasContacts && !hasOutreachStarted && props.stage === 'watching') {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-[13px] text-slate-700">Ready to reach out? You have a contact here.</p>
        <Link
          href={`/dashboard/contacts/${props.contacts[0]?.id}/outreach`}
          className="shrink-0 text-[12px] font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 hover:border-blue-400 bg-white px-3 py-1.5 rounded transition-colors"
        >
          Draft outreach
        </Link>
      </div>
    )
  }

  return null
}
