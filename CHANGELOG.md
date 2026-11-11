# Changelog

All notable changes to the NTX specification are listed here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

- Clause 5.2: a source must confirm the `ntx` subprotocol when a receiver offers it (found while
  testing the Rust core).
- Clause 9.2: state-on-connect updates carry the `seq` of the item's last change (found while
  building the Rust core).

### Added

- NTX 0.1 Pre-Draft: wire protocol, discovery, pairing, tally, relay publishing, binding rules.
- JSON Schemas for all messages and for type descriptors.
- Known type `ntx.text`.
- Community Specification 1.0 governance and licence files.
