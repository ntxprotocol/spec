# Security

NTX runs on local networks, often at live events, so security problems in the protocol design
matter even before there is much code.

## Reporting a problem

Please **do not open a public issue** for a security problem. Instead, use
[GitHub private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository, or email **security@ntxprotocol.com**.

We aim to reply within 7 days.

## What counts

- A way for someone on the network to change what is shown on screen without permission.
- A way to bypass pairing or the browser relay's per-website permission.
- Messages that can crash or hang a conforming implementation.
- Anything in the spec that makes implementations unsafe when followed correctly.

## Known limits (by design, in version 0.1)

- Connections are unencrypted by default (`ws://`). Anyone on the same network can read the text.
- The optional pairing code stops casual or accidental connections. It does not protect against a
  determined attacker who can watch network traffic.
