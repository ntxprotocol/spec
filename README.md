<!-- markdownlint-disable-file MD041 -- the logo comes before the title -->
<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/ntx-wordmark-reverse.svg">
    <img src="assets/ntx-wordmark.svg" alt="NTX" height="56">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

# NTX — Network Text Exchange

[![validate](https://github.com/ntxprotocol/spec/actions/workflows/validate.yml/badge.svg)](https://github.com/ntxprotocol/spec/actions/workflows/validate.yml)
[![Spec: 0.1 Pre-Draft](https://img.shields.io/badge/spec-0.1%20pre--draft-0B7A72)](ntx.md)
[![Licence: Community Specification 1.0](https://img.shields.io/badge/licence-CSL%201.0-0B7A72)](LICENSE.md)

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

The NTX name and wordmark (`assets/`) are trademarks and are not covered by these licences; see the
[NTX trademark policy](https://github.com/ntxprotocol/.github/blob/main/TRADEMARKS.md).
