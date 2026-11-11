# Changelog

All notable changes to the NTX specification are listed here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

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
