# Apex Detailing Business Card

## Important: use your real logo file

Your logos live at: https://github.com/apexwebworxusa-svg/logos

That repo is currently **private**, so the cloud agent cannot download from it unless you either:

1. **Make the repo public temporarily**, then run:

   ```bash
   python3 attached_assets/generate-business-card.py --from-github
   ```

2. **Copy your hex logo PNG** into this project as:

   `attached_assets/apex-hex-logo.png`

   then run:

   ```bash
   python3 attached_assets/generate-business-card.py
   ```

3. Open the results:

   - `attached_assets/apex-business-card-front.png`
   - `attached_assets/apex-business-card-back.png`
   - `attached_assets/apex-business-card-preview.png`
   - `attached_assets/business-card-preview.html`

The generator removes a white background from the logo and places it on a black business card.
