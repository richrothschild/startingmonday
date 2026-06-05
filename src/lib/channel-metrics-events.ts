export const CHANNELS = [
  'executives',
  'coaches',
  'outplacement',
  'search_firms',
] as const

export type Channel = (typeof CHANNELS)[number]

export const EVENT_NAMES = {
  channelEntryClicked: 'channel_entry_clicked',
  personaRouteSelected: 'persona_route_selected',
  trustBlockViewed: 'trust_block_viewed',
  trustBlockInteracted: 'trust_block_interacted',
  microProductBoundaryViewed: 'micro_product_boundary_viewed',
} as const

export type ChannelEventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES]

export type ChannelEntryClickedProps = {
  channel: Channel
  cta_label: string
  source_page: string
  variant_key?: string
  session_id?: string
}

export type PersonaRouteSelectedProps = {
  channel: Channel
  persona: string
  source_route: string
  target_route: string
  variant_key?: string
  session_id?: string
}

export type TrustBlockViewedProps = {
  channel: Channel
  route: string
  block_id: string
  session_id?: string
}

export type TrustBlockInteractedProps = {
  channel: Channel
  route: string
  block_id: string
  action: string
  session_id?: string
}

export type MicroProductBoundaryViewedProps = {
  product_name: string
  route: string
  audience_type: string
  session_id?: string
}
