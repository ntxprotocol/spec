# Contributing to the NTX specification

Thank you for helping. NTX is meant to be used by many different apps, so outside views are
especially welcome: tell us what your app needs.

## The legal part (short version)

- By contributing you agree to the
  [Community Specification Contributor License Agreement](community-specification/00-contributor-license-agreement.md).
  You do not need to sign anything: opening a pull request is the agreement.
- In short: anyone may implement NTX royalty-free, including any patents you hold that the
  specification needs (see the [licence](community-specification/01-community-specification-license-v1.md)).
- Every commit must carry a **Developer Certificate of Origin** sign-off
  ([developercertificate.org](https://developercertificate.org/)). Add it with `git commit -s`:

  ```text
  Signed-off-by: Your Name <you@example.com>
  ```

## How changes happen

We follow the [Community Specification Contribution Policy](community-specification/06-contributing.md).
In practice:

1. **Question or idea?** Open a *Discussion* issue.
2. **Bigger change** (new message, new behaviour, new known type)? Open a *Proposal* issue titled
   `Proposal: ...` first. Explain the problem, who needs it, and how existing apps are affected.
3. **Agreed change?** Open a pull request that edits the spec, the JSON Schemas and the examples
   together. Link the issue.
4. An **Editor** must approve before merge. Decisions are made by consensus, as described in the
   [governance policy](GOVERNANCE.md). Anyone can appeal a decision by opening an issue.

## Rules for spec changes

- Use RFC 2119 words (MUST, SHOULD, MAY) only for real requirements.
- Keep NTX use-case neutral. Features that only one product needs belong in that product's
  own message type (reverse-DNS name), not in the core protocol.
- Every new or changed message needs a JSON Schema update and at least one valid and one invalid
  example in `examples/`.
- Run the checks before pushing:

  ```bash
  npm ci && npm test
  ```

- Add a line to [CHANGELOG.md](CHANGELOG.md) under "Unreleased".
