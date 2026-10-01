# Database keys illustrated lesson

Goal: A Chinese, scrollable visual explanation at /learn/database-keys, linked from home.
Architecture: Lazy-loaded React page and scoped CSS, with semantic static tables. No database, persistence, or animation dependency.

- Build six illustrated sections: table/record/field; identity and primary key; candidate and secondary keys; foreign-key relationship; composite key; recap.
- Adapt the school scenario; label invented records and the guaranteed unique school-email rule. Follow the consulted Hodder and CUP definition of secondary key as an unselected candidate key.
- Use short everyday analogies with explicit boundaries: identity card, alternative identifiers, directory reference, cinema seat identified by row and seat.
- Check TypeScript/build and existing unit tests. Inspect rendered desktop/mobile pages, anchors, overflow, and console errors. Static copy needs no implementation-mirroring unit tests.
