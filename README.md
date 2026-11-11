# NTX — Network Text Exchange

**An open protocol for sending text, not video, between apps on a local network.**

NTX lets one app (a lyrics app, a scripture detector, a scoreboard…) send text to other apps
(presentation software, video mixers, streaming tools…). The receiving app shows the text with
**its own templates and styling**, as if someone had typed it in.

> **Status: NTX 0.1 Pre-Draft.** Everything may still change. Feedback is very welcome.

## Read the spec

- **[ntx.md](ntx.md)** — the specification
- [schemas/](schemas/) — JSON Schemas for every message
- [types/](types/) — known message types (`ntx.text`)
- [examples/](examples/) — valid and invalid example messages

## In one minute

```json
{ "op": "update", "channel": "program", "seq": 42, "type": "ntx.text",
  "fields": { "text": "Amazing grace, how sweet the sound" } }
```

- Sources announce themselves on the network (mDNS `_ntxp._tcp`) or are added by IP address.
- Receivers connect over WebSocket and get the **full current state** straight away, then every change.
- Each message has a **type** and free-form JSON **fields**. Receivers wire their text boxes to field
  paths such as `text` or `verses.0.text`.
- Receivers can tell the source "I'm on air" (tally).

## Get involved

- Questions and ideas: open an issue.
- Changes: see [CONTRIBUTING.md](CONTRIBUTING.md). Contributions need a DCO sign-off (`git commit -s`).
- Security problems: see [SECURITY.md](SECURITY.md).
- How decisions are made: [GOVERNANCE.md](GOVERNANCE.md).
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Checks

```bash
npm ci && npm test
```

## Licence

The specification is under the **Community Specification License 1.0**, which includes a
royalty-free patent commitment from contributors. Code in this repository is MIT. Type descriptors
and examples are CC0. See [LICENSE.md](LICENSE.md).

Copyright © 2026 CamelCase Technologies Ltd and the NTX contributors.
