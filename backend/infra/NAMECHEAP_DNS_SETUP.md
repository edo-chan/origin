# Namecheap DNS Configuration for AWS SES with chanbros.xyz

## Overview
This guide will help you configure your domain `chanbros.xyz` in Namecheap to work with AWS SES for sending emails.

## Step 1: Deploy Pulumi to Get SES Values

First, deploy your Pulumi infrastructure to get the required DNS records:

```bash
cd backend/infra
pulumi up
```

After deployment, you'll see outputs with:
- `sesDomainVerificationToken` - for domain verification
- `sesDkimTokens` - for DKIM authentication (usually 3 tokens)

## Step 2: Log into Namecheap

1. Go to [Namecheap.com](https://www.namecheap.com)
2. Sign in to your account
3. Go to "Domain List"
4. Find `chanbros.xyz` and click "Manage"

## Step 3: Configure DNS Records

In the Namecheap DNS management page, click on "Advanced DNS" tab and add these records:

### A. Domain Verification Record

**Record Type:** TXT Record
- **Host:** `_amazonses`
- **Value:** `[Your verification token from Pulumi output]`
- **TTL:** Automatic

Example:
- Host: `_amazonses`
- Value: `AbCdEfGhIjKlMnOpQrStUvWxYz123456789=`

### B. DKIM Records (3 records)

You'll need to add 3 CNAME records for DKIM. The Pulumi output will give you 3 tokens.

For each DKIM token, add a CNAME record:

**Record Type:** CNAME Record
1. **Host:** `[token1]._domainkey`
   **Value:** `[token1].dkim.amazonses.com`
   **TTL:** Automatic

2. **Host:** `[token2]._domainkey`
   **Value:** `[token2].dkim.amazonses.com`
   **TTL:** Automatic

3. **Host:** `[token3]._domainkey`
   **Value:** `[token3].dkim.amazonses.com`
   **TTL:** Automatic

Example:
- Host: `abc123def456._domainkey`
- Value: `abc123def456.dkim.amazonses.com`

### C. SPF Record (Optional but Recommended)

**Record Type:** TXT Record
- **Host:** `@`
- **Value:** `v=spf1 include:amazonses.com ~all`
- **TTL:** Automatic

If you already have an SPF record, modify it to include `include:amazonses.com`:
- Existing: `v=spf1 include:otherprovider.com ~all`
- Updated: `v=spf1 include:otherprovider.com include:amazonses.com ~all`

### D. DMARC Record (Optional but Recommended)

**Record Type:** TXT Record
- **Host:** `_dmarc`
- **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@chanbros.xyz; pct=100; sp=none; aspf=r;`
- **TTL:** Automatic

This sets up basic DMARC reporting. Adjust the email address for where you want reports sent.

### E. MX Records (If you want to receive emails)

If you want to receive emails at @chanbros.xyz addresses, you'll need MX records. For example, using Namecheap's email service:

**Record Type:** MX Record
- **Host:** `@`
- **Value:** `mx1.privateemail.com`
- **Priority:** 10
- **TTL:** Automatic

And:
- **Host:** `@`
- **Value:** `mx2.privateemail.com`
- **Priority:** 10
- **TTL:** Automatic

## Step 4: Save DNS Changes

Click "Save All Changes" at the bottom of the Namecheap DNS page.

## Step 5: Verify in AWS SES Console

1. Go to AWS SES Console: https://console.aws.amazon.com/ses/
2. Select your region (make sure it matches your Pulumi config)
3. Go to "Verified identities" in the left menu
4. You should see `chanbros.xyz` - it may take 15-30 minutes for DNS to propagate
5. Once verified, you'll see green checkmarks for:
   - Domain verification
   - DKIM verification

## Step 6: Move Out of SES Sandbox (Production Only)

By default, SES is in sandbox mode. To send to any email address:

1. In AWS SES Console, go to "Account dashboard"
2. Look for "Your account is in the sandbox" message
3. Click "Request production access"
4. Fill out the form with:
   - Use case: Transactional emails (invoices, receipts)
   - Website URL: https://app.chanbros.xyz
   - How you handle bounces/complaints
   - Expected sending volume

## Step 7: Update GitHub Secrets

Update your GitHub secrets:
- `PRODUCTION_DOMAIN`: `chanbros.xyz`

## Email Addresses You Can Use

Once configured, you can send from these addresses:
- `noreply@chanbros.xyz` - General notifications
- `invoices@chanbros.xyz` - Invoice emails
- `support@chanbros.xyz` - Support emails
- `hello@chanbros.xyz` - Welcome emails

Any email address with @chanbros.xyz domain will work once the domain is verified.

## Troubleshooting

### DNS Not Verifying
- Wait 15-30 minutes for DNS propagation
- Check records are exactly as shown (no extra spaces)
- Ensure you didn't add `.chanbros.xyz` to the host field (Namecheap adds it automatically)

### Can't Send Emails
- Check you're not in SES sandbox
- Verify the from address matches @chanbros.xyz
- Check AWS CloudWatch logs for SES errors

### DKIM Failing
- Make sure all 3 DKIM CNAME records are added
- Don't include the domain in the host field (use `token._domainkey` not `token._domainkey.chanbros.xyz`)

## Testing

Once everything is set up, test sending an email:

```bash
aws ses send-email \
  --from "noreply@chanbros.xyz" \
  --to "your-email@example.com" \
  --subject "Test Email from chanbros.xyz" \
  --text "This is a test email from AWS SES with chanbros.xyz"
```

## Important Notes

1. **DNS Propagation**: Changes can take up to 48 hours to fully propagate, but usually work within 15-30 minutes
2. **Sandbox Limits**: While in sandbox, you can only send to verified email addresses
3. **Sending Limits**: Start with low limits (200 emails/day), increases automatically with good reputation
4. **Bounce Handling**: Set up SNS topics to handle bounces and complaints programmatically
5. **Email Authentication**: DKIM + SPF + DMARC provide the best deliverability