'use client'

import Script from 'next/script'
import { createElement, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Tony - the adhouse "creative department" voice agent (ElevenLabs ConvAI).
// Public agent, so the embed needs no token; origins are allowlisted on the
// agent. Rendered site-wide via the root layout.
//
// Tier-B agentic tools: Tony can DRIVE the product. We register client-tool
// handlers on the widget by listening for `elevenlabs-convai:call` and
// attaching them to the call config - they run as same-tab JS:
//   • navigate    → take the visitor to a page / the worked example
//   • start_brief → drop them onto the brief, pre-filled (brief form reads
//                   ?brand & ?domain), where their first brief is on the house
const AGENT_ID = process.env.NEXT_PUBLIC_TONY_AGENT_ID ?? ''

const DESTINATIONS: Record<string, string> = {
  demo: '/ideas/malt-coast',
  brief: '/brief',
  pricing: '/credits',
  method: '/method',
  home: '/',
}

export default function TonyWidget() {
  const router = useRouter()
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onCall = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (!detail?.config) return
      detail.config.clientTools = {
        navigate: ({ destination }: { destination?: string }) => {
          router.push(DESTINATIONS[destination ?? 'home'] ?? '/')
          return 'Taking them there now.'
        },
        start_brief: ({ brand, website }: { brand?: string; website?: string }) => {
          const params = new URLSearchParams()
          if (brand) params.set('brand', brand)
          if (website) params.set('domain', website)
          const qs = params.toString()
          router.push(qs ? `/brief?${qs}` : '/brief')
          return 'Brief started - their details are filled in.'
        },
      }
    }

    el.addEventListener('elevenlabs-convai:call', onCall)
    return () => el.removeEventListener('elevenlabs-convai:call', onCall)
  }, [router])

  return (
    <>
      {/* Custom element rendered via createElement to avoid JSX intrinsic typing. */}
      {createElement('elevenlabs-convai', { 'agent-id': AGENT_ID, ref })}
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  )
}
