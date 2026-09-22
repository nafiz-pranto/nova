# LeadNoria — Installation & Quick Start Guide

> **Discover. Verify. Connect.**

A simple, beginner-friendly guide to installing and using **LeadNoria** on Google Chrome (Windows, Mac, or Linux).

---

> ## ⚠️ CRITICAL INSTALLATION RULE
> **DO NOT select the ZIP file in Chrome's "Load unpacked" dialog.**
> 
> Google Chrome cannot read a `.zip` file directly. You **must extract (unzip) the file first** on your computer. Then, in Chrome, select the extracted folder that contains `manifest.json`.

---

## 📥 Part 1: How to Install LeadNoria (9 Simple Steps)

### STEP 1 — Download the Extension ZIP
Download `dist/leadnoria-v1.0.0.zip` (or `extension.zip`) from the release files to your computer (e.g. into your `Downloads` folder).

### STEP 2 — Extract / Unzip the ZIP File
Before doing anything in Chrome, unzip the downloaded file:
- **Windows**: Right-click the `.zip` file → click **Extract All...** → click **Extract**.
- **Mac**: Double-click the `.zip` file. Mac will instantly create an unzipped folder.
- **Linux**: Right-click the `.zip` file → click **Extract Here**.

### STEP 3 — Open Google Chrome
Open your Chrome browser on your computer.

### STEP 4 — Go to `chrome://extensions`
1. Click on the address bar at the very top of Chrome.
2. Type `chrome://extensions` and press **Enter**.
*(Or click the 3 dots menu in Chrome's top-right corner → **Extensions** → **Manage Extensions**).*

### STEP 5 — Turn On "Developer mode"
Look in the **top-right corner** of the Extensions page. Find the toggle switch labeled **Developer mode** and turn it **ON** (the toggle turns blue).

### STEP 6 — Click "Load unpacked"
In the **top-left corner** of the page, three buttons will appear. Click the **Load unpacked** button.

### STEP 7 — Select the Extracted Folder
1. A folder selection window will open.
2. Browse to the unzipped folder from Step 2.
3. Select the folder named **`extension`** (the folder that directly contains `manifest.json`).
4. Click **Select Folder** (Windows) or **Open** (Mac).
*(Remember: Never select the `.zip` file here; select the normal unzipped folder).*

### STEP 8 — Pin LeadNoria to Your Toolbar
1. Click the **Puzzle piece icon** (Extensions) in the top-right toolbar of Chrome.
2. Find **LeadNoria** in the list.
3. Click the **Pin icon** next to LeadNoria so it stays visible in your toolbar.

### STEP 9 — Confirm LeadNoria is Ready
You will see the LeadNoria icon in your Chrome toolbar. Click it to open the extension side panel or popup!

---

## 🚀 Part 2: How to Start Your First Research

LeadNoria uses **Auto-Discovery**. It automatically finds and organizes active advertisers for your query without needing a manual lead quota.

1. **Open LeadNoria**: Click the LeadNoria icon in your Chrome toolbar.
2. **Choose Your Mode**:
   - **Preset**: Pick an industry from the list (e.g. *Gyms & Fitness*, *Real Estate*, *E-commerce Brands*, *Home Services*).
   - **Custom**: Type your own keywords (e.g. `Furniture, Office Chairs`).
3. **Choose Location**: Select the target country from the dropdown (e.g. `United States`, `United Kingdom`, `Bangladesh`, etc.).
4. **Click Start Research**: LeadNoria opens a background tab to search the public Meta Ad Library.
5. **Auto-Discovery Runs**: Watch real-time progress as ad cards are discovered, verified, and deduplicated.
6. **Review Results**: Click the **Results** tab to see discovered business leads, active ad counts, website links, and Facebook page links.
7. **Export**: Click the **CSV** button to download an Excel-ready spreadsheet, or click **JSON** for raw data.

---

## ❓ Frequently Asked Questions (Beginner FAQ)

### Where is the ZIP file?
The release file is named `leadnoria-v1.0.0.zip` (or `extension.zip`) in the release downloads or project `dist/` directory.

### How do I unzip it?
- On **Windows**: Right-click the `.zip` file and select **Extract All...**.
- On **Mac**: Double-click the `.zip` file.
- On **Linux**: Right-click and choose **Extract Here**.

### Which folder do I choose in Chrome?
Choose the extracted folder that directly contains the file `manifest.json`. When you open this folder on your computer, `manifest.json`, `app.js`, and `service-worker.js` are inside it.

### Where is the "Load unpacked" button?
It is in the top-left corner of `chrome://extensions`. You will only see it after turning ON the **Developer mode** toggle in the top-right corner.

### Why can't I select the ZIP file in Chrome?
Chrome requires an extracted (unzipped) folder to load extensions in Developer mode. It cannot read a compressed `.zip` file directly.

### How do I know LeadNoria loaded correctly?
You will see a card titled **LeadNoria** (Version 1.0.0) on your `chrome://extensions` page with an active blue toggle switch and no red error badges.

### How do I start research?
Open LeadNoria from your toolbar, select an industry preset or enter keywords, select a country, and click the blue **Start Research** button.

### What happens when research finishes?
The status will show **Search Results Exhausted** (all public ads for your query were reviewed) or **System Safety Limit Reached**. You can immediately browse your verified leads or export them.

### How do I export the results?
On the **Results** tab, click the **CSV** button. A spreadsheet file will download to your computer, fully formatted and protected against spreadsheet formula injection.

---

## 🔄 How to Update LeadNoria

When an updated version is released:
1. Download the new release `.zip` file.
2. Extract the new `.zip` to your computer.
3. Open `chrome://extensions` in Chrome.
4. Click the circular **Reload** icon on the **LeadNoria** card.
5. LeadNoria will reload with all your stored research history intact.
