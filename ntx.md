# NTX — Network Text Exchange

**Version:** 0.1
**Status:** Pre-Draft (open for discussion; anything may change)
**Editor:** Temitayo, CamelCase Technologies Ltd

© 2026 CamelCase Technologies Ltd and the NTX contributors.

This specification is subject to the Community Specification License 1.0, available at
<https://github.com/CommunitySpecification/1.0>.

## Foreword

Attention is drawn to the possibility that some of the elements of this document may be the subject
of patent rights. No party shall be held responsible for identifying any or all such patent rights.
Known patent licensing exclusions are listed in the repository's `NOTICES.md` file.

Any trade name used in this document is information given for the convenience of users and does
not constitute an endorsement.

This document was prepared by the NTX Working Group. Feedback goes to
<https://github.com/ntxprotocol/spec>.

THESE MATERIALS ARE PROVIDED "AS IS." The Contributors and Licensees expressly disclaim any
warranties (express, implied, or otherwise), including implied warranties of merchantability,
non-infringement, fitness for a particular purpose, or title, related to the materials. The entire
risk as to implementing or otherwise using the materials is assumed by the implementer and user.
IN NO EVENT WILL THE CONTRIBUTORS OR LICENSEES BE LIABLE TO ANY OTHER PARTY FOR LOST PROFITS OR ANY
FORM OF INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY CHARACTER FROM ANY CAUSES OF
ACTION OF ANY KIND WITH RESPECT TO THIS DELIVERABLE OR ITS GOVERNING AGREEMENT, WHETHER BASED ON
BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, AND WHETHER OR NOT THE OTHER MEMBER
HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## Introduction

NTX carries **text, not pictures of text**, between applications on a local network.

A *source* (for example a lyrics app, a scripture detector, or a scoreboard) publishes
messages. Each message has a *type* name and a set of *fields*. A *receiver* (for example
presentation software, a video mixer, or a streaming app) connects to the source and wires its own
text elements to those fields. The receiver keeps full control of how the text looks: its own
templates, fonts, sizes, transitions and auto-sizing keep working, exactly as if the text had been
typed into the receiver.

NTX does not care what the text is for. The core protocol never inspects fields; sources and
receivers agree on field structures through published *type descriptors*.

## Contents

1. Scope
2. Normative references
3. Terms and definitions
4. Overview
5. Transport
6. Discovery
7. Message envelope
8. Connection handshake
9. State delivery
10. Tally
11. Heartbeats and reconnection
12. Errors
13. Pairing
14. Publishing through a relay
15. Message types and type descriptors
16. Binding fields to display elements
17. Text rules
18. Limits
19. Versioning
20. Security considerations
21. Conformance

Annex A — Example session (informative)
Annex B — Open questions (informative)

---

## 1 Scope

This document specifies the NTX wire protocol, discovery, the type descriptor format, receiver
binding rules and text rules. It does not specify how text is styled or laid out.

## 2 Normative references

The following documents are referred to in the text in such a way that some or all of their content
constitutes requirements of this document. For undated references, the latest edition applies.

- RFC 2119 / RFC 8174, *Key words for use in RFCs to Indicate Requirement Levels*
- RFC 6455, *The WebSocket Protocol*
- RFC 8259, *The JavaScript Object Notation (JSON) Data Interchange Format*
- RFC 6762, *Multicast DNS*
- RFC 6763, *DNS-Based Service Discovery*
- RFC 2104, *HMAC: Keyed-Hashing for Message Authentication*
- RFC 4648, *The Base16, Base32, and Base64 Data Encodings*
- RFC 9562, *Universally Unique IDentifiers (UUIDs)*
- *JSON Schema: A Media Type for Describing JSON Documents*, draft 2020-12
- Unicode Standard Annex #15, *Unicode Normalization Forms*

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT",
"RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as
described in BCP 14 (RFC 2119, RFC 8174) when, and only when, they appear in all capitals.

## 3 Terms and definitions

**3.1 source** — an endpoint that holds current text and serves it to receivers. A source accepts
WebSocket connections.

**3.2 receiver** — an endpoint that connects to a source and displays or forwards its text.

**3.3 publisher** — an endpoint that cannot accept connections (for example a web page) and instead
connects to a relay to have its text served as a source.

**3.4 relay** — an endpoint that accepts connections from publishers and serves each one to
receivers as a source.

**3.5 channel** — one of the named slots of a source's state: `program` (on air) and, optionally,
`preview` (next up).

**3.6 item** — the current content of a channel: a type name plus a fields object.

**3.7 type** — the name of a field structure, such as `ntx.text`. See clause 15.

**3.8 fields** — a JSON object carrying the text and related data of an item.

**3.9 field path** — a string that selects one value inside a fields object. See clause 16.

**3.10 type descriptor** — a JSON document that describes the fields of a type. See clause 15.

**3.11 session** — the lifetime of a source process (or of a publisher's connection to a relay)
during which its sequence numbers are comparable.

**3.12 tally** — information sent from a receiver to a source saying whether the receiver is
currently showing the source on air (program) or in preview.

## 4 Overview

```text
 ┌──────────┐   discovery (mDNS)    ┌──────────┐
 │ receiver │ ◀──────────────────── │  source  │
 │          │ ── WebSocket connect ▶│          │
 │          │ ◀── hello ─────────── │          │
 │          │ ── subscribe ───────▶ │          │
 │          │ ◀── announce (opt.) ─ │          │
 │          │ ◀── update × N ────── │  (full state on connect,
 │          │ ── tally ───────────▶ │   then every change)
 └──────────┘                       └──────────┘
```

1. A source advertises itself on the network (clause 6).
2. A receiver opens a WebSocket connection to it (clause 5).
3. The source sends `hello`; the receiver answers with `subscribe` (clause 8).
4. The source sends the **full current state** of every subscribed channel, then sends every
   change as it happens (clause 9).
5. The receiver tells the source when it is on air (clause 10).

Each `update` replaces the whole item of a channel. There are no partial updates, so a receiver
that misses messages is always corrected by the next one.

## 5 Transport

5.1 NTX runs over WebSocket (RFC 6455). A source MUST accept WebSocket connections. A receiver
connects as a WebSocket client.

5.2 The WebSocket subprotocol name is `ntx`. A receiver SHOULD offer it in the
`Sec-WebSocket-Protocol` header; a source MUST accept connections that offer it, and MUST then
include `ntx` in the `Sec-WebSocket-Protocol` header of its response (WebSocket clients reject a
server that drops a subprotocol they offered). A source SHOULD accept connections that offer no
subprotocol (for simple tools).

5.3 Every NTX message is one JSON object (RFC 8259) sent as one WebSocket **text** frame (or one
fragmented text message). Binary frames MUST NOT be sent; a receiving endpoint MUST ignore them.

5.4 A source MAY serve several sources on one port by using different URL paths. The default path
is `/`.

5.5 Connections are unencrypted (`ws://`) by default. A source MAY also offer `wss://`. See
clause 20.

5.6 The default TCP port for a source is **7686**. A source MAY use any port; discovery (clause 6)
always carries the real port.

> Note: port 7686 is currently unassigned by IANA. Registration is planned before version 1.0.

## 6 Discovery

6.1 A source SHOULD advertise itself with DNS-Based Service Discovery over multicast DNS
(RFC 6762, RFC 6763), using service type **`_ntxp._tcp`**.

> Note: the shorter service name `ntx` is already registered with IANA by another party, so it
> MUST NOT be used.

6.2 The service instance name SHOULD be the source's display name (clause 8.2), for example
`CHURCH-PC (Cueword)`. A DNS label holds at most 63 bytes of UTF-8 (RFC 6763, section 4.1.1), so
a longer name MUST be shortened to 63 bytes without splitting a character. The full name is
still sent in `hello`.

6.3 The TXT record MUST contain these keys:

| Key | Value |
| --- | --- |
| `txtvers` | `1` |
| `ntx` | Protocol version, for example `0.1` |
| `id` | The source id (clause 8.2) |

And MAY contain:

| Key | Value |
| --- | --- |
| `path` | WebSocket path, if not `/` |
| `pair` | `1` if pairing is required (clause 13) |
| `tls` | `1` if the source only accepts `wss://` |

6.4 Receivers MUST also allow the user to enter a source manually as a WebSocket URL
(`ws://host:port/path`) or as `host[:port]`, because multicast DNS does not cross subnets, VLANs
or isolated Wi-Fi networks.

6.5 Discovery servers (a central list of sources for networks without multicast) are planned for a
later version.

## 7 Message envelope

7.1 Every message is a JSON object with an `op` member naming the operation:

```json
{ "op": "update", "...": "..." }
```

7.2 An endpoint MUST ignore messages whose `op` it does not know, and MUST ignore members it does
not know. This keeps old implementations working when new optional features are added.

7.3 Operations in this version:

| `op` | Sent by | Purpose |
| --- | --- | --- |
| `hello` | source, relay | First message on every connection |
| `subscribe` | receiver | Answer to `hello`: who I am, what I want |
| `publish` | publisher | Answer to a relay's `hello`: what I will publish |
| `announce` | source, publisher | Optional list of type descriptors |
| `update` | source, publisher | Full new item for one channel |
| `tally` | receiver, relay | On-air / preview status |
| `ping` | any | Heartbeat request |
| `pong` | any | Heartbeat answer |
| `error` | any | Something went wrong |

Each operation has a JSON Schema in `schemas/`.

## 8 Connection handshake

8.1 As soon as the WebSocket connection is open, the source MUST send `hello`:

```json
{
  "op": "hello",
  "ntx": "0.1",
  "source": { "id": "6f1c2a8e-3b7d-4f0a-9a51-2c4e8b7d1f90", "name": "CHURCH-PC (Cueword)" },
  "channels": ["program", "preview"],
  "session": "b4f0d1",
  "pairing": { "nonce": "q7cJ9mV2xL0aR4tY" }
}
```

8.2 Members of `hello`:

- `ntx` (REQUIRED): the protocol version (clause 19).
- `source.id` (REQUIRED): a stable identifier for the source. It SHOULD be a UUID (RFC 9562) that
  stays the same across restarts and IP address changes, so receivers can find a source again.
- `source.name` (REQUIRED): a human-readable name. It SHOULD have the form
  `MACHINE (Source name)`.
- `channels` (REQUIRED): the channels this source has. It MUST include `program`.
- `session` (REQUIRED): an opaque string that changes every time the source restarts (clause 9.4).
- `pairing` (OPTIONAL): present only if pairing is required (clause 13).

8.3 The receiver MUST answer with `subscribe`:

```json
{
  "op": "subscribe",
  "ntx": "0.1",
  "receiver": { "id": "0b8d4c6e-1a2f-4e3d-8c7b-6a5f4e3d2c1b", "name": "MEDIA-PC (FreeShow)" },
  "channels": ["program"]
}
```

- `receiver.id` and `receiver.name` follow the same rules as for sources. They let monitoring tools
  show who is connected.
- `channels` (OPTIONAL): which channels to receive. Default `["program"]`. A source MUST ignore
  names it does not have.
- `pairing` (REQUIRED only if the source asked for it): see clause 13.

8.4 If the versions are incompatible (clause 19), or pairing fails, the source MUST send `error` and
close the connection (clause 12).

8.5 A source MUST NOT send `announce` or `update` before it has received a valid `subscribe`.

8.6 If a receiver does not send `subscribe` within 10 seconds, the source MAY close the connection.

## 9 State delivery

9.1 An `update` carries the complete new item for one channel:

```json
{
  "op": "update",
  "channel": "program",
  "seq": 42,
  "type": "ntx.text",
  "fields": { "text": "Amazing grace, how sweet the sound" }
}
```

9.2 **State on connect.** Immediately after a valid `subscribe` (and after `announce`, if sent),
the source MUST send one `update` for each subscribed channel that it has, carrying that channel's
current item. If nothing has been sent on a channel yet, the item is `"type": "ntx.text"` with
`"fields": {}`. These state updates carry the `seq` of the item's last change (`0` if the channel
was never set), so they are the only case where a source repeats a `seq` it has already used; a
receiver that already applied that `seq` correctly ignores the repeat.

9.3 **Changes.** Whenever the item of a channel changes, the source MUST send an `update` for that
channel to every receiver subscribed to it. Each `update` replaces the previous item completely.

9.4 **Sequence numbers.** `seq` is a non-negative integer, no larger than 2^53 − 1. Within one
`session`, a source MUST give every `update` a larger `seq` than any `update` it sent before, on any
channel. A receiver MUST ignore an `update` whose `seq` is less than or equal to the last `seq` it
applied for that channel in the same session. When the `session` value changes (the source
restarted), the receiver MUST forget previous `seq` values.

9.5 **Clearing.** To clear a channel, a source sends an `update` whose `fields` is an empty object.
Receivers MUST then show every element bound to that channel as empty (clause 16).

9.6 The `type` MAY change from one update to the next (for example from scripture to lyrics).

9.7 A source MUST NOT require receivers to understand `fields`. The core protocol never validates
the contents of `fields` beyond it being a JSON object.

## 10 Tally

10.1 A receiver SHOULD tell the source whether it is currently showing that source:

```json
{ "op": "tally", "program": true, "preview": false }
```

- `program`: the receiver is showing this source's text on air.
- `preview`: the receiver is showing this source's text in a preview or "next" position.

10.2 A receiver that sends tally MUST send it after `subscribe` and again whenever either value
changes.

10.3 A source MAY combine tally from all receivers (for example "on air if any receiver says
program") and show it to its user. Tally is information only; a source MUST keep sending updates
regardless of tally.

## 11 Heartbeats and reconnection

11.1 Any endpoint MAY send `ping`; the other side MUST answer with `pong` carrying the same `id`:

```json
{ "op": "ping", "id": "17" }
{ "op": "pong", "id": "17" }
```

Heartbeats are application messages because web browsers cannot send WebSocket ping frames.

11.2 A source SHOULD send `ping` when it has sent nothing for 5 seconds. Either side SHOULD close the
connection if it has received nothing for 15 seconds.

11.3 When a connection is lost, a receiver SHOULD reconnect automatically, waiting 1 second before
the first attempt and doubling the wait up to a maximum of 10 seconds. It SHOULD keep showing the
last text it received until the connection is back or the user changes it.

11.4 If the source's address has changed, a receiver SHOULD find it again through discovery by its
`source.id`.

## 12 Errors

12.1 An endpoint reports a problem with `error`:

```json
{ "op": "error", "code": "pairing_failed", "message": "Wrong pairing code" }
```

12.2 Error codes in this version:

| `code` | Meaning | Closes the connection? | WebSocket close code |
| --- | --- | --- | --- |
| `unsupported_version` | Versions are not compatible | Yes | 4001 |
| `pairing_required` | Pairing proof missing | Yes | 4003 |
| `pairing_failed` | Pairing proof wrong | Yes | 4003 |
| `too_large` | Message exceeds a limit (clause 18) | Yes | 4009 |
| `bad_message` | Not valid JSON, or a required member is missing or wrong | MAY | 4000 |
| `not_allowed` | A relay refused a publisher (clause 14) | Yes | 4003 |

12.3 `message` is OPTIONAL human-readable text for logs. Implementations MUST NOT depend on it.

12.4 An endpoint that receives an unknown `code` MUST treat it as `bad_message`.

## 13 Pairing

13.1 A source MAY require a pairing code: a short secret (RECOMMENDED: 6 digits) that the user
reads from the source and types into the receiver. Pairing stops accidental or casual connections.
It does not encrypt anything (see clause 20).

13.2 When pairing is required, `hello` MUST include `pairing.nonce`: a new random string of at
least 16 characters for every connection.

13.3 The receiver MUST then include in `subscribe`:

```json
"pairing": { "proof": "<base64 of HMAC-SHA256(key = pairing code, message = nonce)>" }
```

The pairing code and the nonce are encoded as UTF-8. The proof is standard Base64 (RFC 4648,
section 4) with padding.

13.4 The source MUST compare the proof in constant time. If it is missing it MUST reply
`pairing_required`; if it is wrong, `pairing_failed`. A source SHOULD slow down repeated failures
from the same address (for example by waiting 1 second before replying).

13.5 Receivers SHOULD remember a working pairing code per `source.id`.

## 14 Publishing through a relay

14.1 Some producers cannot accept connections or use multicast DNS (for example web pages). They
connect as **publishers** to a **relay**, normally the NTX client application on the same computer
(`ws://localhost:7686/publish`). The relay serves each publisher to the network as an ordinary
source.

14.2 The relay sends `hello` (with its own identity in `source`, and `pairing` if required). Its
`channels` lists the channels the relay can serve; a relay SHOULD serve any channel a publisher
lists. The publisher answers with `publish`:

```json
{
  "op": "publish",
  "ntx": "0.1",
  "source": { "id": "c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f", "name": "Song Board" },
  "channels": ["program"]
}
```

14.3 After `publish`, the publisher sends `announce` (optional) and `update` messages exactly as a
source would. It first sends its full current state, as a source does on connect (clause 9.2),
because every connection starts a new session (clause 14.4). The relay MUST forward the messages to
receivers subscribed to that published source, and MUST forward combined tally from those receivers
to the publisher.

14.4 The relay advertises the published source with the publisher's `source.name`. It SHOULD
prefix the machine name (`MACHINE (Song Board)`). Sequence numbers keep working because the relay
uses the publisher's connection as the session: the relay generates a new `session` value each
time a publisher connects. The relay MAY renumber `seq`, as long as the updates it sends follow
clause 9.4. When the publisher's connection ends, the relay stops serving the published source.
It SHOULD serve it on the same port when the publisher connects again, so that receivers which
connected by address find it again.

14.5 **Web page publishers.** A relay MUST check the HTTP `Origin` header of publisher connections.
It MUST refuse (`not_allowed`) any origin the user has not allowed: instead of `hello`, it sends
`error` with code `not_allowed` and closes the connection (clause 12). It SHOULD ask the user the
first time an origin connects ("example.com wants to send text — Allow?"), remember the answer, and
let the user withdraw it later; withdrawing closes that origin's publisher connections. A
connection without an `Origin` header comes from a program, not a web page, and is not subject to
this check. The relay's publishing feature MUST be off until the user turns it on.

## 15 Message types and type descriptors

15.1 Every item has a `type`: a string that names the structure of its `fields`.

15.2 **Names.**

- `ntx.*` names are reserved for types published by the NTX Working Group.
- Everyone else MUST use reverse-DNS names based on a domain they control, for example
  `com.example.announcement`.
- Type names MUST match `^[a-z0-9]+(\.[a-z0-9-]+)+$` (lowercase letters, digits, hyphens; at least
  two dot-separated parts).

15.3 **Known types** are published as separate documents in the `types/` folder of the
specification repository. This version publishes one: `ntx.text` (a single `text` field). Every
receiver MUST support binding to `ntx.text`.

15.4 **Type descriptors.** A type descriptor is a JSON object:

```json
{
  "ntxType": "com.example.scripture",
  "title": "Scripture",
  "description": "A Bible passage with its reference.",
  "schema": {
    "type": "object",
    "properties": {
      "reference": { "type": "string", "title": "Reference" },
      "version":   { "type": "string", "title": "Version" },
      "verses": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": { "number": { "type": "integer" }, "text": { "type": "string" } }
        }
      }
    }
  }
}
```

- `ntxType` (REQUIRED): the type name.
- `title`, `description` (OPTIONAL): for people.
- `schema` (REQUIRED): a JSON Schema (draft 2020-12) using only this subset of keywords:
  `type`, `title`, `description`, `properties`, `required`, `items`, `enum`, `default`,
  `examples`, `maxLength`. The schema of type descriptors is `schemas/type-descriptor.schema.json`.

The same format is used for announcements (15.5), for the type editor of tools, and for
import/export files (file extension `.ntxtype.json`).

15.5 **Announcements.** A source MAY tell receivers which types it sends, so receivers can offer a
list of field paths to bind:

```json
{ "op": "announce", "types": [ { "ntxType": "ntx.text", "schema": { "...": "..." } } ] }
```

A source that sends `announce` MUST send it after `subscribe` and before the first `update`, and
again whenever its list changes. Announcements are hints: receivers MUST NOT reject updates whose
fields do not match.

## 16 Binding fields to display elements

This clause describes how receivers turn fields into text. It is normative for receivers.

16.1 A receiver lets the user wire a text element (text box, title, slide item…) to a **source**,
a **channel** (default `program`) and either a **field path** or a **pattern**.

16.2 **Field paths** are dot-separated: each part is an object member name, or a decimal array
index. Examples: `text`, `reference`, `verses.0.text`. Member names containing `.` cannot be
addressed; type authors SHOULD use names made of letters, digits and `_`.

16.3 **Patterns** mix fixed text and field paths in braces:
`{reference} · {version}`. `{{` and `}}` produce literal `{` and `}`.

16.4 **Converting values to text.**

| Value | Text |
| --- | --- |
| string | as is |
| number | its JSON text (`3`, `2.5`) |
| `true` / `false` | `true` / `false` |
| `null`, or path not found | empty text |
| array | each element converted by these rules, joined with a line break (`\n`) |
| object | empty text |

16.5 When the channel is cleared (`fields` is `{}`), every bound element shows empty text.

16.6 A receiver SHOULD otherwise treat bound text exactly like text the user typed: the element
keeps its template, font, size, auto-sizing and transitions.

## 17 Text rules

17.1 All text is Unicode, sent as JSON strings (which are UTF-8 on the wire).

17.2 Sources SHOULD send text in Unicode Normalization Form C (NFC). Receivers SHOULD normalise
to NFC before display. (This matters for languages with stacked accents, such as Yorùbá.)

17.3 A line break is `\n` (U+000A). Sources MUST NOT send `\r\n`; receivers MUST treat `\r\n` and
a lone `\r` as `\n`.

17.4 Right-to-left text is allowed. Sources MAY include Unicode bidirectional control characters.
Receivers SHOULD apply the Unicode Bidirectional Algorithm.

17.5 Text is plain. NTX 0.1 has no bold, italic, font, colour or size markup. Characters such as
`*` or `<` are shown literally. (Light formatting is an open question; see Annex B.)

## 18 Limits

18.1 A message MUST NOT be larger than **65 536 bytes** of UTF-8. An endpoint that receives a
larger message MUST reply `too_large` and close the connection.

18.2 JSON nesting inside `fields` SHOULD NOT exceed 16 levels.

18.3 A source SHOULD NOT send more than 30 updates per second per channel. Receivers MAY skip
intermediate updates and show only the newest one.

## 19 Versioning

19.1 The protocol version has the form `MAJOR.MINOR`, sent in `ntx` of `hello`, `subscribe` and
`publish`, and in the `ntx` TXT key.

19.2 From version 1.0: endpoints with the same MAJOR version MUST work together. A new MINOR
version only adds optional features, which older endpoints ignore (clause 7.2).

19.3 Before version 1.0, every MINOR version may break compatibility. Endpoints MUST only
connect when MAJOR and MINOR are both equal.

19.4 A source that does not support the receiver's version MUST reply `unsupported_version`.

## 20 Security considerations

20.1 Without `wss://`, anyone on the same network can read NTX text. Do not send secrets over NTX.

20.2 Without pairing, anyone on the same network can connect to a source and read it. Anyone who
can reach a relay's publishing endpoint could publish text. This is why relays check origins
(clause 14.5) and publishing is off by default.

20.3 A captured pairing nonce and proof can be used to guess a 6-digit code offline. Pairing is
protection against accidents and casual misuse, not against a skilled attacker on the network.
Stronger security (`wss://` with certificate pinning, longer secrets) is planned.

20.4 Implementations MUST treat all received text as untrusted data: never as markup, code or a
file path.

20.5 Implementations MUST enforce the limits in clause 18 before parsing large inputs.

## 21 Conformance

21.1 This version defines four conformance classes: **Source**, **Receiver**, **Publisher** and
**Relay**. An implementation conforms to a class if it meets every MUST in the clauses that apply to
that class.

21.2 The NTX conformance suite (<https://github.com/ntxprotocol/conformance>) will test these
classes. Only implementations that pass it may be described as "NTX compatible".

---

## Annex A — Example session (informative)

```text
receiver connects to ws://192.168.1.20:7686/

S → R  {"op":"hello","ntx":"0.1","source":{"id":"6f1c…","name":"CHURCH-PC (Cueword)"},"channels":["program"],"session":"b4f0d1"}
R → S  {"op":"subscribe","ntx":"0.1","receiver":{"id":"0b8d…","name":"MEDIA-PC (FreeShow)"}}
S → R  {"op":"update","channel":"program","seq":7,"type":"ntx.text","fields":{"text":"Welcome"}}
R → S  {"op":"tally","program":true,"preview":false}
S → R  {"op":"update","channel":"program","seq":8,"type":"ntx.text","fields":{"text":"Let us pray"}}
S → R  {"op":"ping","id":"1"}
R → S  {"op":"pong","id":"1"}
S → R  {"op":"update","channel":"program","seq":9,"type":"ntx.text","fields":{}}
```

## Annex B — Open questions (informative)

1. **Light formatting.** Should 0.2 add optional bold/italic? Options: a small markup in strings,
   or a parallel "spans" field. Plain text stays the default either way.
2. **Field paths vs JSON Pointer.** Dot paths are easy to type but cannot address names containing
   dots. JSON Pointer (`/verses/0/text`) can, but is less friendly.
3. **Discovery server** protocol for networks without multicast.
4. **Port and service registration** with IANA (`7686`, `_ntxp._tcp`).
5. **Several items per source.** Today one source has one item per channel; a producer with several
   independent texts uses several sources. Is that enough?
