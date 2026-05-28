import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import {
  addBundleItem,
  assignBundleToPartner,
  createBundleTemplate,
  createCatalogPrice,
  createCatalogProduct,
  setCatalogProductStatus,
} from './actions'

function createOpsClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

export const metadata = { title: 'Micro-Product Catalog - Admin' }

export default async function AdminMicroProductCatalogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const isReadOnly = staff.role === 'viewer'

  const ops = createOpsClient()

  const [productsResult, pricesResult, bundlesResult, bundleItemsResult, entitlementsResult] = await Promise.all([
    ops.from('micro_products').select('id, slug, name, summary, channel, persona, product_status, billing_type, default_interval, display_order').order('display_order', { ascending: true }),
    ops.from('micro_product_prices').select('id, micro_product_id, stripe_product_id, stripe_price_id, stripe_coupon_id, interval, unit_amount_cents, is_active, created_at').order('created_at', { ascending: false }),
    ops.from('micro_product_bundles').select('id, slug, name, audience, bundle_status, seat_min, stripe_product_id, stripe_price_id, stripe_coupon_id').order('created_at', { ascending: false }),
    ops.from('micro_product_bundle_items').select('id, bundle_id, micro_product_id, entitlement_key, included, created_at').order('created_at', { ascending: false }),
    ops.from('account_entitlements').select('id, user_id, partner_id, micro_product_id, source_bundle_id, entitlement_key, seat_limit, status, starts_at, ends_at').order('created_at', { ascending: false }).limit(20),
  ])

  const products = (productsResult.data ?? []) as Array<{
    id: string
    slug: string
    name: string
    summary: string
    channel: string
    persona: string | null
    product_status: string
    billing_type: string
    default_interval: string
    display_order: number
  }>

  const prices = (pricesResult.data ?? []) as Array<{
    id: string
    micro_product_id: string
    stripe_product_id: string
    stripe_price_id: string
    stripe_coupon_id: string | null
    interval: string
    unit_amount_cents: number
    is_active: boolean
    created_at: string
  }>

  const bundles = (bundlesResult.data ?? []) as Array<{
    id: string
    slug: string
    name: string
    audience: string
    bundle_status: string
    seat_min: number
    stripe_product_id: string | null
    stripe_price_id: string | null
    stripe_coupon_id: string | null
  }>

  const bundleItems = (bundleItemsResult.data ?? []) as Array<{
    id: string
    bundle_id: string
    micro_product_id: string
    entitlement_key: string
    included: boolean
  }>

  const entitlements = (entitlementsResult.data ?? []) as Array<{
    id: string
    user_id: string | null
    partner_id: string | null
    micro_product_id: string
    source_bundle_id: string | null
    entitlement_key: string
    seat_limit: number
    status: string
    starts_at: string
    ends_at: string | null
  }>

  const productNameById = new Map(products.map((p) => [p.id, p.name]))
  const bundleNameById = new Map(bundles.map((b) => [b.id, b.name]))

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/product" className="text-[12px] font-semibold text-slate-300 hover:text-white">Product Hub</Link>
            <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200">Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <section className="mb-6 border border-slate-200 rounded-lg bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">Quick navigation</h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">Use the section headers on this page to scan fast and jump to what matters first.</p>
        </section>
        <details className="mb-6 border border-slate-200 rounded-lg bg-white px-4 py-3">
          <summary className="cursor-pointer text-[12px] font-semibold text-slate-800">TL;DR</summary>
          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">This page is organized for quick scanning. Start with the first major section, then use headings to move directly to the next action.</p>
        </details>
<h1 className="text-[26px] font-bold text-slate-900">Micro-Product Catalog</h1>
        <p className="text-[13px] text-slate-500 mt-1.5 mb-6">
          Sprint 4 back office for micro-product pricing, bundle templates, and entitlement mapping.
        </p>

        <section className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded p-4">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Products</p>
            <p className="text-[22px] font-bold text-slate-900 mt-1">{products.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Active prices</p>
            <p className="text-[22px] font-bold text-slate-900 mt-1">{prices.filter((p) => p.is_active).length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Bundles</p>
            <p className="text-[22px] font-bold text-slate-900 mt-1">{bundles.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Entitlements</p>
            <p className="text-[22px] font-bold text-slate-900 mt-1">{entitlements.length}</p>
          </div>
        </section>

        {!isReadOnly && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <form action={createCatalogProduct} className="bg-white border border-slate-200 rounded p-5 grid grid-cols-1 gap-2">
              <h2 className="text-[12px] font-semibold text-slate-900 mb-1">Create micro-product</h2>
              <input name="slug" placeholder="slug" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
              <input name="name" placeholder="name" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
              <textarea name="summary" placeholder="summary" className="border border-slate-300 rounded px-3 py-2 text-[13px]" rows={3} required />
              <div className="grid grid-cols-2 gap-2">
                <select name="channel" title="Product channel" className="border border-slate-300 rounded px-3 py-2 text-[13px]">
                  <option value="executives">executives</option>
                  <option value="coaches">coaches</option>
                  <option value="outplacement">outplacement</option>
                  <option value="search_firms">search_firms</option>
                </select>
                <input name="persona" placeholder="persona" className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select name="product_status" title="Product status" className="border border-slate-300 rounded px-3 py-2 text-[13px]">
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="retired">retired</option>
                </select>
                <select name="billing_type" title="Billing type" className="border border-slate-300 rounded px-3 py-2 text-[13px]">
                  <option value="one_time">one_time</option>
                  <option value="subscription">subscription</option>
                </select>
                <select name="default_interval" title="Default billing interval" className="border border-slate-300 rounded px-3 py-2 text-[13px]">
                  <option value="one_time">one_time</option>
                  <option value="month">month</option>
                  <option value="year">year</option>
                </select>
              </div>
              <input name="display_order" type="number" placeholder="display order" defaultValue={100} className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
              <button className="mt-1 bg-slate-900 text-white text-[13px] font-semibold rounded px-4 py-2">Create product</button>
            </form>

            <form action={createCatalogPrice} className="bg-white border border-slate-200 rounded p-5 grid grid-cols-1 gap-2">
              <h2 className="text-[12px] font-semibold text-slate-900 mb-1">Attach Stripe price</h2>
              <select name="micro_product_id" title="Micro-product" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required>
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <input name="stripe_product_id" placeholder="stripe product id" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
              <input name="stripe_price_id" placeholder="stripe price id" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
              <input name="stripe_coupon_id" placeholder="stripe coupon id (optional)" className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
              <div className="grid grid-cols-2 gap-2">
                <select name="interval" title="Price interval" className="border border-slate-300 rounded px-3 py-2 text-[13px]">
                  <option value="one_time">one_time</option>
                  <option value="month">month</option>
                  <option value="year">year</option>
                </select>
                <input name="unit_amount_cents" type="number" min={1} placeholder="unit amount cents" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
              </div>
              <button className="mt-1 bg-slate-900 text-white text-[13px] font-semibold rounded px-4 py-2">Attach price</button>
            </form>
          </section>
        )}

        {!isReadOnly && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <form action={createBundleTemplate} className="bg-white border border-slate-200 rounded p-5 grid grid-cols-1 gap-2">
              <h2 className="text-[12px] font-semibold text-slate-900 mb-1">Create bundle template</h2>
              <input name="slug" placeholder="bundle slug" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
              <input name="name" placeholder="bundle name" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
              <div className="grid grid-cols-3 gap-2">
                <select name="audience" title="Bundle audience" className="border border-slate-300 rounded px-3 py-2 text-[13px]">
                  <option value="b2b">b2b</option>
                  <option value="b2c">b2c</option>
                </select>
                <select name="bundle_status" title="Bundle status" className="border border-slate-300 rounded px-3 py-2 text-[13px]">
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="retired">retired</option>
                </select>
                <input name="seat_min" type="number" min={1} defaultValue={1} placeholder="minimum seats" className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
              </div>
              <input name="stripe_product_id" placeholder="stripe product id" className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
              <input name="stripe_price_id" placeholder="stripe price id" className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
              <input name="stripe_coupon_id" placeholder="stripe coupon id" className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
              <button className="mt-1 bg-slate-900 text-white text-[13px] font-semibold rounded px-4 py-2">Create bundle</button>
            </form>

            <div className="space-y-4">
              <form action={addBundleItem} className="bg-white border border-slate-200 rounded p-5 grid grid-cols-1 gap-2">
                <h2 className="text-[12px] font-semibold text-slate-900 mb-1">Add bundle item</h2>
                <select name="bundle_id" title="Bundle template" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required>
                  <option value="">Select bundle</option>
                  {bundles.map((bundle) => (
                    <option key={bundle.id} value={bundle.id}>{bundle.name}</option>
                  ))}
                </select>
                <select name="micro_product_id" title="Bundle micro-product" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required>
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <input name="entitlement_key" placeholder="entitlement key" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
                <button className="mt-1 bg-slate-900 text-white text-[13px] font-semibold rounded px-4 py-2">Attach to bundle</button>
              </form>

              <form action={assignBundleToPartner} className="bg-white border border-slate-200 rounded p-5 grid grid-cols-1 gap-2">
                <h2 className="text-[12px] font-semibold text-slate-900 mb-1">Assign bundle to partner</h2>
                <input name="partner_email" placeholder="partner email" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required />
                <select name="bundle_id" title="Assign bundle template" className="border border-slate-300 rounded px-3 py-2 text-[13px]" required>
                  <option value="">Select bundle</option>
                  {bundles.map((bundle) => (
                    <option key={bundle.id} value={bundle.id}>{bundle.name}</option>
                  ))}
                </select>
                <input name="seat_limit" type="number" min={1} defaultValue={5} placeholder="seat limit" className="border border-slate-300 rounded px-3 py-2 text-[13px]" />
                <button className="mt-1 bg-slate-900 text-white text-[13px] font-semibold rounded px-4 py-2">Assign entitlements</button>
              </form>
            </div>
          </section>
        )}

        <section className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-[12px] font-semibold text-slate-900">Catalog products</h2>
          </div>
          <table className="w-full text-[12px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Channel</th>
                <th className="px-4 py-2 text-left">Billing</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-5 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 text-slate-800">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-slate-500">{product.slug}</p>
                  </td>
                  <td className="px-4 py-2 text-slate-700">{product.channel}</td>
                  <td className="px-4 py-2 text-slate-700">{product.billing_type} / {product.default_interval}</td>
                  <td className="px-4 py-2 text-slate-700">{product.product_status}</td>
                  <td className="px-5 py-2 text-right">
                    {!isReadOnly && (
                      <form action={setCatalogProductStatus} className="inline-flex items-center gap-2">
                        <input type="hidden" name="id" value={product.id} />
                        <select name="product_status" title="Update product status" defaultValue={product.product_status} className="border border-slate-300 rounded px-2 py-1 text-[12px]">
                          <option value="draft">draft</option>
                          <option value="active">active</option>
                          <option value="retired">retired</option>
                        </select>
                        <button className="text-[12px] font-semibold text-slate-800 border border-slate-300 rounded px-2 py-1">Save</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Active Stripe prices</h2>
            <div className="space-y-2 text-[12px]">
              {prices.length === 0 && <p className="text-slate-500">No pricing records yet.</p>}
              {prices.slice(0, 12).map((price) => (
                <div key={price.id} className="border-b border-slate-100 pb-2">
                  <p className="font-semibold text-slate-800">{productNameById.get(price.micro_product_id) ?? price.micro_product_id}</p>
                  <p className="text-slate-500">{price.stripe_price_id}</p>
                  <p className="text-slate-600">{formatMoney(price.unit_amount_cents)} / {price.interval}{price.stripe_coupon_id ? ` (${price.stripe_coupon_id})` : ''}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Bundle items</h2>
            <div className="space-y-2 text-[12px]">
              {bundleItems.length === 0 && <p className="text-slate-500">No bundle items yet.</p>}
              {bundleItems.slice(0, 16).map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-2">
                  <p className="font-semibold text-slate-800">{bundleNameById.get(item.bundle_id) ?? item.bundle_id}</p>
                  <p className="text-slate-600">{productNameById.get(item.micro_product_id) ?? item.micro_product_id}</p>
                  <p className="text-slate-500">{item.entitlement_key}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded p-5">
          <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Recent entitlement assignments</h2>
          <div className="space-y-2 text-[12px]">
            {entitlements.length === 0 && <p className="text-slate-500">No entitlement rows yet.</p>}
            {entitlements.map((entitlement) => (
              <div key={entitlement.id} className="border-b border-slate-100 pb-2">
                <p className="font-semibold text-slate-800">
                  {productNameById.get(entitlement.micro_product_id) ?? entitlement.micro_product_id}
                </p>
                <p className="text-slate-600">
                  {entitlement.partner_id ? `partner:${entitlement.partner_id}` : `user:${entitlement.user_id}`}
                  {entitlement.source_bundle_id ? ` via ${bundleNameById.get(entitlement.source_bundle_id) ?? entitlement.source_bundle_id}` : ''}
                </p>
                <p className="text-slate-500">{entitlement.entitlement_key} • seats {entitlement.seat_limit} • {entitlement.status}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
