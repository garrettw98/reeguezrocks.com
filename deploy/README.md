Reeguez Rocks 2026 — AWS Hosting
================================

This folder contains Infrastructure-as-Code and deployment notes to host the static site on AWS (S3 + CloudFront), while keeping Cloudflare as the domain registrar/DNS (recommended for simplicity). You can optionally migrate DNS to Route 53 later.

Architecture
-----------
- S3 private bucket stores the site assets.
- CloudFront serves the site over HTTPS using your ACM certificate.
- Origin Access Identity (OAI) restricts S3 access to CloudFront only.

What you’ll need
----------------
- AWS account with permissions for CloudFormation, S3, CloudFront, and ACM.
- An ACM certificate in us-east-1 that covers:
  - `reeguezrocks.com`
  - `www.reeguezrocks.com` (optional)
- Cloudflare DNS access for the domain.

Steps
-----
1) Create/validate the ACM certificate (us-east-1)
   - In AWS Certificate Manager (N. Virginia), request a public certificate for the hostnames you need.
   - Choose DNS validation and add the TXT/CNAME records in Cloudflare.
   - Wait for the certificate to be issued; copy its ARN.

2) Deploy the CloudFormation stack
   - Open the template `deploy/cloudformation/website.yaml` in CloudFormation (Console or CLI).
   - Provide parameters:
     - `BucketName`: globally unique bucket name (e.g., `reeguezrocks-com-site`)
     - `DomainName`: `reeguezrocks.com`
     - `AlternateDomainNames`: `www.reeguezrocks.com` (optional; comma-separated)
     - `CertificateArn`: the ACM ARN from step 1 (must be us-east-1)
     - `PriceClass`: optional; default is `PriceClass_100`
     - `EnableLogging` / `LogBucketName`: optional
   - After creation, note the outputs: `BucketNameOut`, `DistributionId`, and `DistributionDomainName`.

3) Point DNS to CloudFront (Cloudflare)
   - In Cloudflare DNS:
     - Create a CNAME for `reeguezrocks.com` to the `DistributionDomainName` from the stack.
       - If Cloudflare won’t allow apex CNAME, use an “ANAME/ALIAS” or Cloudflare’s CNAME Flattening.
     - (Optional) Create a CNAME for `www` to the same CloudFront domain.
   - Set Cloudflare proxy to DNS-only (grey cloud) to avoid TLS conflicts unless you specifically configure Full (strict) with end-to-end TLS.

4) Set up GitHub Actions deployment (optional but recommended)
   - In your GitHub repo settings:
     - Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (with permissions to write to S3 and invalidate CloudFront)
     - Repository variables:
       - `S3_BUCKET` = the bucket name from the stack output
       - `CF_DISTRIBUTION_ID` = the distribution ID from the stack output
   - On push to `main`/`master`, the workflow `.github/workflows/deploy.yml` will:
     - Sync the repo to the S3 bucket
     - Invalidate CloudFront

5) First deploy manually (optional)
   - With the AWS CLI configured locally:
     ```bash
     aws s3 sync . s3://<S3_BUCKET> --delete --exclude ".git/*" --exclude ".github/*" --exclude "deploy/*"
     aws cloudfront create-invalidation --distribution-id <CF_DISTRIBUTION_ID> --paths "/*"
     ```

Notes
-----
- Keep Cloudflare proxy off (DNS-only) initially to simplify TLS. If you want Cloudflare proxy later, ensure SSL mode is “Full (strict)” and your ACM certs remain valid.
- The template returns `index.html` on 404 to support client-side routing gracefully.
- If you prefer Origin Access Control (OAC) over OAI, we can swap it in a later iteration.

