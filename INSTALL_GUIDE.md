# Complete Chrome Extension Installation & User Guide (21 Steps)

This guide walks non-technical users step-by-step through downloading, installing, running, exporting from, updating, and troubleshooting the **Meta Ad Library Lead Scraper** Chrome Extension on Windows, macOS, and Linux.

---

> ### ⚠️ CRITICAL INSTALLATION RULE
> **DO NOT select the ZIP file in Chrome's "Load unpacked" dialog.**
> Google Chrome cannot read a compressed `.zip` file directly. You **MUST extract / unzip** the file first into a normal folder on your computer. Then, in Chrome, select the extracted folder that directly contains `manifest.json`.

---

## Part 1: Download & Installation (Steps 1 – 10)

### STEP 1: How to Download the ZIP from GitHub
1. Navigate to the GitHub repository page in your web browser.
2. Click the green **Code** button near the top right of the file list.
3. Click **Download ZIP** from the dropdown menu (or download the pre-built `extension.zip` from the latest GitHub Release).
4. Save the file to your computer (e.g. in your `Downloads` folder).

### STEP 2: How to Extract / Unzip It
- **Windows**: Right-click the downloaded `.zip` file, click **Extract All...**, choose a destination folder (e.g. `C:\tools\meta-lead-scraper`), and click **Extract**.
- **macOS**: Double-click the downloaded `.zip` file in Finder. macOS will automatically extract it into a regular folder.
- **Linux**: Right-click and choose **Extract Here**, or run:
  ```bash
  unzip extension.zip -d ./extension-folder
  ```

### STEP 3: Which Extracted Folder Contains the Extension
1. Open the folder you just extracted.
2. Locate the folder named **`extension`** (or the root folder that directly contains the file **`manifest.json`** alongside `service-worker.js`, `content-script.js`, `app.js`, `styles.css`, and the `icons/` folder).
3. **Verify**: When you look inside this folder, you should see `manifest.json` right there—not nested inside another subfolder.

### STEP 4: How to Open Chrome
1. Launch **Google Chrome** on your computer.
2. Ensure Chrome is up to date (Chrome 116 or higher is recommended for Manifest V3 side panel support).

### STEP 5: How to Enter `chrome://extensions`
1. Click on the address/URL bar at the very top of Google Chrome.
2. Type or paste:
   ```text
   chrome://extensions
   ```
3. Press **Enter** on your keyboard.
*(Alternatively: Click the 3 dots in the top-right corner of Chrome → Extensions → Manage Extensions).*

### STEP 6: How to Enable Developer Mode
1. Look at the **top-right corner** of the `chrome://extensions` page.
2. Find the toggle switch labeled **Developer mode**.
3. Click the toggle switch to turn it **ON** (it will turn blue and show additional action buttons).

### STEP 7: How to Click "Load unpacked"
1. In the top-left area under the "Extensions" header, you will see three buttons appear:
   - **Load unpacked**
   - **Pack extension**
   - **Update**
2. Click the **Load unpacked** button.

### STEP 8: Which Exact Folder to Select
1. A file picker dialog window will open.
2. Navigate to and click on the **`extension`** folder you identified in Step 3 (the one containing `manifest.json`).
3. Click **Select Folder** (on Windows) or **Open** (on macOS).
4. *Remember: Never select the `.zip` file here; always select the unzipped folder.*

### STEP 9: How to Verify the Extension Installed
1. On the `chrome://extensions` page, look for a new card titled **Meta Ad Library Lead Scraper**.
2. Verify:
   - **Version**: `1.0.0`
   - **Description**: "Local standalone Meta Ad Library scraper Chrome extension for public lead research."
   - **Toggle**: The switch at the bottom right of the card is **ON** (blue).
   - **Errors**: No red "Errors" badge is present.

### STEP 10: How to Pin and Open the Extension
1. In the top-right toolbar of Google Chrome (to the right of your address bar), click the **Puzzle piece** icon (Extensions menu).
2. Scroll to find **Meta Ad Library Lead Scraper**.
3. Click the **Pin** icon next to it so it turns blue. The blue scraper icon will now stay permanently visible in your toolbar.
4. Click the blue scraper icon to open the extension popup!

---

## Part 2: Operating the Scraper (Steps 11 – 18)

### STEP 11: How to Run Preset Research
1. Open the extension and ensure the **New Research** tab is selected.
2. Under "Research Mode", click **Preset**.
3. Click the **Target Industry Preset** dropdown to choose your desired business niche (e.g. *Gyms & Fitness Centers*, *Real Estate Agencies*, *E-commerce Brands*, *Home Services & Roofing*, *Clean Energy & Solar*, *B2B Tech & SaaS*).
4. The system automatically loads pre-calibrated commercial keywords and domain negative filters.

### STEP 12: How to Run Custom Research
1. Under "Research Mode", click **Custom**.
2. In the "Target Search Keywords" text area, enter one or more keywords separated by commas or new lines (e.g. `Furniture, Office Furniture, Living Room Sofas`).
3. The scraper will query Meta Ad Library for each keyword in sequence and merge duplicate advertisers across queries.

### STEP 13: How to Select Location
1. Click the **Target Location (Country)** dropdown.
2. Select your target market (e.g. `United States (US)`, `United Kingdom (GB)`, `Canada (CA)`, `Bangladesh (BD)`, `Australia (AU)`, or `Worldwide (ALL)`).
3. The scraper navigates directly to the Meta Ad Library page specifically filtered for active ads in that country.

### STEP 14: How Maximum Leads Works
1. Set the **Maximum Leads** field (e.g. `5`, `10`, `25`, `50`, or `100`).
2. **Important**: This number controls **FINAL UNIQUE LEADS**, NOT the raw number of ads or raw cards.
   - For example: If 1 advertiser runs 4 active ad cards, the scraper collects all 4 ads, merges them, and counts that advertiser as **1 unique lead**.
   - If an advertiser is irrelevant (e.g. an online casino or healthcare clinic when searching for furniture), the relevance engine rejects it and does **not** consume a quota slot.

### STEP 15: How to Start Research
1. Review your settings (Mode, Keywords/Preset, Location, Maximum Leads).
2. Click the blue **Start Research** button.
3. The extension service worker will launch an automated background research tab navigating to Meta Ad Library.

### STEP 16: How to Wait for Completion
1. Watch the real-time status banner:
   - **NAVIGATING**: Opening Meta Ad Library search URL.
   - **COLLECTING**: Scanning rendered ad cards, extracting advertiser data, checking commercial relevance, and scrolling.
   - **NORMALIZING**: Deduplicating multiple cards and verifying website/page URLs.
   - **COMPLETED**: Reached your target quota (`TARGET_REACHED`) or finished the available public catalog (`SOURCE_EXHAUSTED`).
2. *Tip*: You can close the popup or switch tabs; the background service worker continues running until completion.

### STEP 17: How to View Results
1. Click on the **Results** tab at the top of the extension.
2. Each qualified lead displays:
   - **Business / Advertiser Name**
   - **Relevance Badge**: (e.g. `RELEVANT (72%)` or `HIGH Confidence`)
   - **Facebook Page Status**: (`found` with direct link, or `not_found`)
   - **Website Status**: (`found` with root domain, or `not_found`)
   - **Active Ads Count**: Number of ads currently active in Meta Ad Library
   - **Matched Keywords**: Which queries this business matched
3. Click any lead card to open the **Lead Inspector Drawer** for full details, including sample ad copy, ad library IDs, and the exact deterministic relevance explanation.

### STEP 18: How to Export Leads
1. Above the lead list, click **CSV**.
   - A formula-safe, RFC-4180 compliant CSV file (`meta_ad_library_leads_<timestamp>.csv`) will download to your computer.
   - Fully protected against spreadsheet formula injection (`=`, `+`, `-`, `@` characters sanitized).
   - Opens seamlessly in Microsoft Excel, Google Sheets, or CRM importers (HubSpot, Salesforce).
2. Click **JSON** to export the full technical payload including raw timestamps, run metadata, and ad card candidate details.

---

## Part 3: Maintenance & Troubleshooting (Steps 19 – 21)

### STEP 19: How to Update the Extension
When an updated version of the extension is released on GitHub:
1. Download the new release `.zip` file from GitHub.
2. Extract the `.zip` file into your local folder, overwriting the previous files (or extract into a new folder).
3. Open Google Chrome and go to `chrome://extensions`.
4. Locate the **Meta Ad Library Lead Scraper** card.
5. Click the circular **Reload** icon button on the card.
6. The extension is instantly updated to the latest build with all saved settings and history intact!

### STEP 20: How to Remove / Uninstall the Extension
1. Open Google Chrome and go to `chrome://extensions`.
2. Find **Meta Ad Library Lead Scraper**.
3. Click the **Remove** button on the card.
4. Click **Remove** again in the confirmation prompt. The extension is completely removed from your browser.

---

### STEP 21: Troubleshooting Common Questions

#### Q1: "Manifest file is missing or unreadable" error when clicking Load Unpacked
- **Cause**: You selected the wrong folder (e.g. the outer container folder or the `.zip` file).
- **Fix**: Make sure you select the exact folder that directly contains `manifest.json`. When you open that folder on your computer, `manifest.json` must be sitting right inside it.

#### Q2: What does `SOURCE_EXHAUSTED` mean?
- **Answer**: If you requested 50 leads but Meta Ad Library only had 18 relevant active advertisers running ads for your query in that country, the scraper honestly stops and reports `SOURCE_EXHAUSTED`. It will **never** fabricate fake leads or add irrelevant businesses to artificially fill your quota.

#### Q3: Meta returned a security verification / challenge
- **Cause**: Meta's public servers occasionally present a standard rate-limit verification prompt if many searches are performed rapidly.
- **Fix**: The scraper will gracefully halt with status `BLOCKED` and reason `CHALLENGE_DETECTED`. Simply open a regular Chrome tab to `facebook.com/ads/library`, complete the prompt, and wait a few minutes before starting another run.

#### Q4: Why are some leads marked `not_found` for Website?
- **Answer**: Some advertisers run "Engagement" or "Lead Form" ads directly on Facebook/Instagram without linking to an external website. The extension accurately records `websiteState: not_found` rather than inventing a URL.

#### Q5: Can I close the extension popup while research is running?
- **Answer**: Yes! The extension runs inside a background Service Worker. Your research will continue running uninterrupted in the background. Reopening the popup will instantly reconnect to the active run.
