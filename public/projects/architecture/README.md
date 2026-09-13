# Architecture Sandbox logical diagram

The Japanese and English SVGs show the user, application and Gemini, with two
functional components inside the application:

- **User:** creates a design and reviews the results to refine it.
- **Application:** contains architecture design and design evaluation.
- **Architecture design:** clarifies requirements through dialogue with Gemini
  and lets the user draw a system.
- **Design evaluation:** receives the diagram and rationale, then displays
  feedback across six dimensions and improvement suggestions from Gemini.
- **Gemini:** generates dialogue replies and design evaluations.

The two internal components are capabilities of one application, not separate
services or infrastructure layers. The downward arrow passes the diagram and
rationale from design to evaluation. Two-way arrows represent the application's
request/response exchanges with Gemini. The returning result connects evaluation
to the user, who can revise the design.

The visual design follows the published Lissue diagram: a large serif title,
monospaced section labels, white space, fine outlines, blue request paths,
an oval application enclosure and a dark external-service capsule. Its blue
and white palette matches the supplied Lissue reference on the project page.
The central outlines group the two internal capabilities within one application.
They do not introduce deployment boundaries or a Clean Architecture claim.

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
