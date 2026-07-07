// Run: node --test worker/scanner/fetch-page.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSpaHost, visibleTextLength, hostOf } from './fetch-page.js'

test('isSpaHost matches known SPA ATS hosts and their subdomains', () => {
  for (const url of [
    'https://mylogically.bamboohr.com/careers',
    'https://jobs.lever.co/navisite',
    'https://evolent.wd1.myworkdayjobs.com/External',
    'https://ats.rippling.com/netrio',
    'https://careers.smartrecruiters.com/MastechDigital',
    'https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html',
    'https://secure7.saashr.com/ta/6196830.careers',
    'https://recruiting.ultipro.com/NTI1000NTVA/JobBoard/abc',
    'https://apply.workable.com/sword-group/',
  ]) {
    assert.equal(isSpaHost(url), true, `expected SPA host: ${url}`)
  }
})

test('isSpaHost does not match server-rendered boards or bad input', () => {
  assert.equal(isSpaHost('https://boards.greenhouse.io/anthropic'), false)
  assert.equal(isSpaHost('https://example.com/careers'), false)
  assert.equal(isSpaHost('not a url'), false)
  // guard against naive substring matches (a host that merely contains the token)
  assert.equal(isSpaHost('https://notbamboohr.com.evil.com/x'), false)
})

test('hostOf lowercases and tolerates bad input', () => {
  assert.equal(hostOf('https://JOBS.Lever.co/x'), 'jobs.lever.co')
  assert.equal(hostOf('garbage'), '')
})

test('visibleTextLength ignores scripts/markup, counts rendered text', () => {
  const shell =
    '<html><head><script>' + 'var a=1;'.repeat(2000) + '</script>' +
    '<style>' + '.x{color:red}'.repeat(500) + '</style></head>' +
    '<body><div id="root"></div></body></html>'
  assert.ok(shell.length > 2000, 'shell is large by raw length')
  assert.ok(visibleTextLength(shell) < 50, `shell has little visible text (got ${visibleTextLength(shell)})`)

  const rendered =
    '<html><body><h1>Open Roles</h1><ul>' +
    '<li>VP of Service Delivery - Remote</li>'.repeat(80) +
    '</ul></body></html>'
  assert.ok(visibleTextLength(rendered) > 800, 'rendered listing has substantial visible text')
})
