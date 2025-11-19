# Installing Stripe CLI on Windows

## Option 1: Download from GitHub (Easiest)

1. **Go to Stripe CLI Releases:**
   - Visit: https://github.com/stripe/stripe-cli/releases/latest
   - Or directly: https://github.com/stripe/stripe-cli/releases

2. **Download the Windows version:**
   - Look for `stripe_X.X.X_windows_x86_64.zip` (latest version)
   - Click to download the ZIP file

3. **Extract the ZIP:**
   - Extract the ZIP file to a folder (e.g., `C:\stripe-cli\`)
   - You'll find `stripe.exe` inside

4. **Add to PATH (Optional but Recommended):**
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add the folder path (e.g., `C:\stripe-cli`)
   - Click OK on all windows

5. **Test the installation:**
   - Open PowerShell or Command Prompt
   - Type: `stripe --version`
   - You should see the version number

## Option 2: Using Scoop (Package Manager)

If you have Scoop installed:

```powershell
scoop install stripe
```

If you don't have Scoop, install it first:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

Then install Stripe CLI:
```powershell
scoop install stripe
```

## Option 3: Using Chocolatey (Package Manager)

If you have Chocolatey installed:

```powershell
choco install stripe-cli
```

## After Installation

1. **Login to Stripe:**
   ```bash
   stripe login
   ```
   This will open your browser to authenticate.

2. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3006/api/webhooks/stripe
   ```

3. **Copy the webhook signing secret:**
   - The CLI will display: `Ready! Your webhook signing secret is whsec_xxxxx`
   - Copy this secret

4. **Add to your .env.local:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

5. **Restart your dev server**

## Troubleshooting

### "stripe is not recognized"
- Make sure you added Stripe CLI to your PATH
- Or use the full path: `C:\stripe-cli\stripe.exe --version`
- Restart your terminal after adding to PATH

### "Permission denied"
- Run PowerShell/Command Prompt as Administrator
- Or check your PATH environment variable settings

### Can't find the executable
- Make sure you extracted the ZIP file
- The executable is named `stripe.exe` (not just `stripe`)

## Quick Start Commands

```bash
# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3006/api/webhooks/stripe

# View webhook events
stripe events list

# Trigger a test webhook
stripe trigger checkout.session.completed
```

