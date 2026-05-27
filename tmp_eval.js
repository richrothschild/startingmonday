const { evaluateEmailCouncilQuality } = require('./src/lib/email-council')
const te = require('./src/lib/outreach/template-engine.cjs')
const drafts = [
  { name: 'exec2', input: { channel: 'executives', firstName: 'Riley', company: 'Northstar', roleLabel: 'CIO', focus: 'CIO', step: 'followup_2' } },
  { name: 'coachLong', input: { channel: 'coaches', firstName: 'Marshall', company: 'Marshall Goldsmith Stakeholder Centered Coaching', roleLabel: 'Executive Coach', focus: 'CEO-to-Board', step: 'followup_1' } },
  { name: 'execDyn', input: { channel: 'executives', firstName: 'Alex', company: 'Acme', roleLabel: 'CFO', focus: 'CFO', newsTrigger: 'new CFO search announced after earnings reset' } },
]
for (const d of drafts) {
  const draft = te.buildLatestTemplateDraft(d.input)
  const html = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">' + draft.body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') + '</div>'
  const evalResult = evaluateEmailCouncilQuality({ channel: d.input.channel, subject: draft.subject, html, minEjes: 90 })
  console.log('---' + d.name + '---')
  console.log('subject:', draft.subject)
  console.log('score:', evalResult.scores.ejes)
  console.log('blockers:', JSON.stringify(evalResult.blockers))
  console.log('warnings:', JSON.stringify(evalResult.warnings))
}
