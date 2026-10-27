# Tony: a voice agent that drives the website

Tony was the voice of adhouse.ai: a London creative director you could talk to, built on the **ElevenLabs Agents** platform. He explained how the product turned a brief into ad ideas, talked through why famous campaigns worked, and could act on the site while he talked: taking a visitor to the worked example, or opening the brief form with their details already filled in.

He ran on adhouse.ai in summer 2026. The site has since been rebuilt, so he is no longer live. This repo holds the parts worth reusing: the embed, the client tools, the prompt and the knowledge-base setup.

## What he did

- **Talked, with a point of view.** A confident, plain-spoken creative director, British English, one brand voice. The prompt is in [`agent/system-prompt.md`](agent/system-prompt.md).
- **Knew the subject.** Retrieval over 7 knowledge-base documents: principles, strategy, a taxonomy of ad types and around 45 case studies, compiled from my own ad-craft notes.
- **Drove the site.** Two client tools let the agent act in the visitor's browser tab:
  - `navigate` - takes the visitor to the worked example, the brief form, pricing, the method page or home, while Tony keeps talking.
  - `start_brief` - opens the brief form with the brand and website filled in, handing the visitor from conversation to product.
- **Knew where to stop.** He would not write ads in the chat (that was the paid product) and would not reveal how the product worked.

## How it works

The ElevenLabs widget (`<elevenlabs-convai>`) fires an `elevenlabs-convai:call` event when a conversation starts. The component in [`src/tony-widget.tsx`](src/tony-widget.tsx) listens for it and attaches handlers for the agent's client tools, so a tool call from the agent runs as ordinary JavaScript in the page and uses the Next.js router to move the visitor.

The tool schemas registered on the agent are in [`agent/client-tools.json`](agent/client-tools.json), and a summary of the agent's settings (model, voice, retrieval) is in [`agent/agent-config.json`](agent/agent-config.json).

## Setting up the knowledge base

Done through the ElevenLabs REST API, because the MCP tool for attaching documents failed at the time:

1. Upload each document: `POST /v1/convai/knowledge-base/file`
2. Index it for retrieval: `POST /v1/convai/knowledge-base/{id}/rag-index`
3. Wait until every document's index status is `succeeded` (attaching earlier returns `rag_index_not_ready`)
4. Attach them to the agent: `PATCH /v1/convai/agents/{id}` with `conversation_config.agent.prompt.knowledge_base` and `rag.enabled = true`

Lessons learned:

- Indexing failed on a document of about 1MB. Split into four files of about 290KB, all four indexed.
- Client tools have to be created through the REST API (`POST /v1/convai/tools`) and attached by `tool_ids`. Creating the agent through the MCP server does not configure tools.
- An avatar image set by external URL did not show. It needs an uploaded file.
- Make the agent public and allowlist your own domain, so the embed needs no token and nobody else can use it.

The knowledge-base documents themselves are not included, because they quote published advertising case studies.

## Use it

1. Create an agent in ElevenLabs, add the two tools from `agent/client-tools.json` and attach them.
2. Set `NEXT_PUBLIC_TONY_AGENT_ID` (see `.env.example`).
3. Render `<TonyWidget />` in your root layout and change `DESTINATIONS` to your own routes.

Built by [James Harrop](https://jamesharrop.co), June 2026.
