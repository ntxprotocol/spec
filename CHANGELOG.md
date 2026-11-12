# Changelog

All notable changes to the NTX specification are listed here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed (review proposals #4–#9)

Decided after an independent review of the spec and the reference implementation:

- Clause 13.4 (#4): a `pairing` that is not an object, or a `proof` that is not a string, is
  `bad_message`, as the schema says; only a wrong proof string is `pairing_failed`. Slowing down
  repeated failures must not stop a correct proof from pairing.
- Clauses 9.2, 9.4 (#5): state updates are exempt from "every `seq` larger than before".
- Clause 14.3 (#6): a publisher sends `announce` (if any) before its state, as a source does.
- Clarifications (#7): versions have no leading zeros and compare as strings (19.1, schema);
  a second `subscribe` is ignored (8.3); invalid patterns are refused when entered (16.3); array
  indexes have no leading zeros (16.2); an unknown error code is handled as `bad_message` without
  a reply (12.4); a published source's channel is set once the publisher sent an update for it
  (14.4).
- New clause 8.7 (#8): sources SHOULD refuse web pages from internet origins unless the user
  allowed them, and accept programs, local pages and local files (`null`). Clause 20.2 explains
  why.
- Clause 14.4 (#9): a relay replaces a published source only for a connection from the same origin
  or address; it refuses the same `source.id` from another one.

### Changed

Found by an interoperability review of the Rust core, the TypeScript SDK, the Python bindings and
the conformance suite:

- Clause 7.3 (**new rule**): the JSON Schemas are normative; a message that does not match its
  schema is `bad_message`. New clause 18.4 lists the limits the schemas set.
- Clause 11.2 (**changed**): each endpoint pings when it has *received* nothing for 5 seconds,
  and closes with 4008 after 15 seconds of silence.
- Clauses 8.6, 11.2 and new 12.5: timeouts close with 4008. Browsers cannot send 1001 or 1008.
- Clause 11.3 (**new rule**): no automatic reconnect after `unsupported_version`,
  `pairing_required`, `pairing_failed` or `not_allowed`; the back-off resets only after an
  `update`.
- Clause 8.3: the first `update` confirms a subscription; a receiver without a pairing code may
  close with 4003; receivers should ask only for channels listed in `hello`.
- Clause 9.2: a channel not set since the session began is sent as `ntx.text`, `{}`, `seq` 0.
- Clauses 9.5 and 16.5: a cleared channel also hides the fixed text of a pattern.
- Clause 16.3: spaces and tabs around a field path inside braces are ignored.
- Clause 16.4 (**changed**): numbers become text as ECMAScript `Number.prototype.toString` gives
  them (`3.0` → `3`); integers above 2^53 − 1 should be sent as strings.
- Clause 13.3: the pairing code is normalised to NFC before UTF-8; codes should be ASCII digits.
- Clause 13.4 and `subscribe.schema.json`: a missing proof is `pairing_required` and a malformed
  proof is `pairing_failed`; the schema no longer checks the proof, so it no longer turns these
  into `bad_message`.
- Clause 6.2: instance names are cut at a Unicode scalar value boundary and should not split a
  grapheme cluster; `source.name` in `hello` is at most 256 characters.
- New examples for these rules.
- Clause 14.5 and 20.2 (**new rule**): a publisher connection without an `Origin` header is
  accepted only from a loopback address unless the user allowed that address; the origin `null`
  is always refused; the publishing endpoint should listen on loopback by default, and should
  require pairing when it listens beyond loopback.
- Clauses 7.3, 8.1 and 14 (clarified, found while building the Rust relay): a relay refuses with
  `error` / `not_allowed` and close code 4003 instead of `hello`, and a publisher must accept that;
  a publisher must send its full state after a valid `publish`; version and pairing failures close
  as in 8.4; the relay may renumber `seq`, must stop serving (close receivers, withdraw the
  advertisement) when its publisher leaves, and should keep the same address; the newest connection
  for a `source.id` wins; withdrawing an origin sends `not_allowed` and closes with 4003;
  `channels` in a relay's `hello` does not limit `publish`.
- Clause 6.2: instance names longer than 63 bytes must be shortened (found when a long host name
  made a source impossible to discover).
- Clause 5.2: a source must confirm the `ntx` subprotocol when a receiver offers it (found while
  testing the Rust core).
- Clause 9.2: state-on-connect updates carry the `seq` of the item's last change (found while
  building the Rust core).

### Added

- NTX 0.1 Pre-Draft: wire protocol, discovery, pairing, tally, relay publishing, binding rules.
- JSON Schemas for all messages and for type descriptors.
- Known type `ntx.text`.
- Community Specification 1.0 governance and licence files.
