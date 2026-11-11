# Known type: `ntx.text`

**Status:** Pre-Draft, part of NTX 0.1
**Descriptor:** [`ntx.text.ntxtype.json`](ntx.text.ntxtype.json)
**Licence:** CC0 1.0 (this folder only; see `../LICENSE.md`)

## Purpose

One piece of plain text, for anything: a lyric line, a caption, a name, an announcement.
Every NTX receiver MUST support it.

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `text` | string | The text to show. Line breaks are `\n`. |

A missing `text`, or `fields` equal to `{}`, means "show nothing".

## Example

```json
{ "op": "update", "channel": "program", "seq": 1, "type": "ntx.text",
  "fields": { "text": "Welcome to the service" } }
```

## Binding

Bind the element to field path `text`.
