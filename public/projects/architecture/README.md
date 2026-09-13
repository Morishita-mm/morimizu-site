# Architecture Sandbox logical diagram

The Japanese and English SVGs show three logical components at the same level:

- **Design workspace:** captures requirements and system diagrams.
- **Application:** coordinates conversations and evaluations.
- **AI service:** generates replies and design evaluations.

The first two components belong to Architecture Sandbox. The AI service is
external, and all communication with it passes through the application.
Labeled arrows distinguish outgoing requests from returning results.

The visual design follows the published Lissue diagram: a large serif title,
monospaced section labels, white space, fine outlines, blue request paths,
an oval application enclosure and a dark external-service capsule. Its blue
and white palette matches the supplied Lissue reference on the project page.
The two central outlines emphasize one application component. They do not
introduce additional architectural layers or a Clean Architecture claim.

This is a logical view, not a deployment or operations diagram. Product logos,
frameworks, hosting providers, secret management, persistence, sharing and
deployment paths are intentionally omitted to keep the abstraction consistent.
Implementation details, JSON persistence, X sharing and the public app / Qiita
links remain in the project page's text.

The SVGs are self-contained, use the same layout and contain no external assets.
Their title, description and page alt text describe the same logical view.

The responsibilities reflect the current
[application source](https://github.com/Morishita-mm/architecture-sandbox):
`frontend/src/components/EvaluationPanel.tsx` and `backend/src/main.rs`.
