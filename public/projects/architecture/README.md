# Architecture Sandbox diagram assets

The Japanese and English Architecture Sandbox SVGs embed the following official
assets, retrieved on 2026-09-13. Embedded images keep their original brand colors
when the site's diagram palette changes and require no third-party requests.

| Asset | Official source | Selected file |
| --- | --- | --- |
| Google Cloud logo | https://cloud.google.com/icons | https://www.gstatic.com/cgc/google-cloud-logo-fullcolor.svg |
| Cloud Run | https://services.google.com/fh/files/misc/core-products-icons.zip | `Unique Icons/Cloud Run/SVG/CloudRun-512-color-rgb.svg` |
| Secret Manager category | https://services.google.com/fh/files/misc/category-icons.zip | `Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg` |
| Gemini | https://gemini.google/about/ | https://gemini.google/images/spark_4c.png |
| Cloudflare | https://www.cloudflare.com/press/press-kit/ | `CF-Logo 1.png` in the linked `Logos.zip` |

Google Cloud's [product icon guide](https://services.google.com/fh/files/misc/google-cloud-product-icons.pdf)
(updated May 2026) assigns the **Security and Identity** category icon to Secret
Manager. Cloud Run uses its own four-color core product icon. The older blue
console icons are not used. All brand marks identify the services in this project;
they are not project logos or endorsements.

The diagram separates static delivery, the user's device, the Google Cloud
runtime, and the external Gemini API. Labeled request and response arrows show
the main AI flow. Dashed arrows identify delivery, local persistence, and secret
injection. Sharing and deployment are separate supporting flows at the bottom.
The interface silhouette, distinct runtime group, and labeled paths take cues
from the Rust Log Analyzer diagram; this diagram uses its own layout and palette.

Architecture is based on the current
[application source](https://github.com/Morishita-mm/architecture-sandbox):
`frontend/wrangler.jsonc`, `frontend/src/components/EvaluationPanel.tsx`,
`backend/src/main.rs`, `terraform/gcp/main.tf`, and `.github/workflows/deploy.yml`.
Secret Manager supplies the Cloud Run environment variable at container startup.
Sharing calls the Rust API to shorten the challenge URL through TinyURL, then
opens an X post composer in the browser with the score and URL. It does not post
automatically or attach a screenshot. The deployment flow sends the frontend to
Cloudflare and the API image through Artifact Registry to Cloud Run.
