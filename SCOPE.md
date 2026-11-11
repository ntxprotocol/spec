# Scope

This Working Group develops the **NTX (Network Text Exchange)** specification: an open protocol for
sending structured text between applications over a local network, so that receiving applications
can display that text with their own templates and styling.

The Scope covers:

1. The wire protocol between NTX sources, receivers, publishers and relays, including the message
   envelope, connection handshake, state delivery, sequencing, tally (on-air) feedback, heartbeats,
   error handling, size limits, versioning and optional pairing.
2. Discovery of NTX sources on a network, including DNS Service Discovery / multicast DNS
   advertisement, manual addressing and discovery servers.
3. The type descriptor format used to describe the fields of a message type, and the rules for
   naming types.
4. Rules by which receivers bind display elements to fields of a message, including field paths,
   text patterns and conversion of values to text.
5. Text handling rules (character encoding, normalisation, line breaks, text direction and light
   formatting).
6. Known message types published by this Working Group (such as `ntx.text`).
7. Conformance requirements and conformance test definitions for the above.

The Scope does not cover the visual presentation of text (fonts, colours, layout, animation), the
transport of audio or video, or any particular application's user interface.

Any changes of Scope are not retroactive.
