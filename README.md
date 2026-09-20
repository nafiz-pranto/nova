# Meta Ad Library Lead Scraper (Chrome Extension)

A standalone **Manifest V3 Chrome Extension** that runs as a **local browser scraper** for the public Meta Ad Library.

This Chrome extension researches publicly accessible Meta Ad Library information and organizes the results into lead records.

---

## 💡 What This Tool Does

This Chrome extension researches publicly accessible Meta Ad Library information and organizes the results into lead records.

It operates **100% locally** inside your Google Chrome browser. It requires **no remote servers**, no Vercel backends, no paid scraping services, and no external AI APIs.

### How To Use:

#### Option A: Preset Mode
1. **Choose a preset** from the curated industry list (e.g. *Gyms & Fitness*, *Real Estate*, *E-commerce Brands*, *Home Services*).
2. **Choose Location** (e.g. `United States`, `United Kingdom`, `Bangladesh`, etc.).
3. **Choose Maximum Leads** (e.g. `5`, `10`, `25`, `50`).
4. Click **Start Research**.

#### Option B: Custom Mode
1. **Enter keywords** (e.g. `Furniture, Office Furniture, Interior Decor`).
2. **Choose Location** (e.g. `Bangladesh`, `United States`, etc.).
3. **Choose Maximum Leads** (e.g. `10`).
4. Click **Start Research**.

---

## 📖 Key Concepts Explained (In Simple Terms)

- **Lead**: A business advertiser discovered through public advertisements in the Meta Ad Library.
- **Unique Lead**: One distinct business entity. If an advertiser is running 5 different ad cards across multiple keywords, all 5 ads are combined into **one single unique lead** with an active ad count of 5.
- **Website (found / not_found / unknown)**:
  - `found`: The advertiser's ad cards include a direct link to their official business website or online store.
  - `not_found`: The advertiser runs ads directly on Facebook/Instagram (e.g. Messenger or lead forms) without an external website.
  - `unknown`: The ad card has not been fully inspected or could not be determined.
- **Facebook Page (found / not_found / unknown)**:
  - `found`: The advertiser's public Facebook Page link was successfully identified.
  - `not_found`: The ad card did not display a direct public Page URL.
- **Matched Keywords**: The search terms for which this advertiser's ads appeared during your research session.
- **Maximum Leads**: The target number of **unique, relevant leads** to collect. Quota counts unique business entities, not raw ad cards or cards on screen.
- **Source Exhausted**: An honest status meaning the scraper searched all available public ads returned by Meta for your query, and no further relevant advertisers exist. The scraper will **never** invent fake leads or include irrelevant companies to fill a quota.

---

## ⚡ Technical Highlights

- **100% Local Browser Execution**: Uses Chrome Extensions Manifest V3 APIs (`chrome.tabs`, `chrome.scripting`, `chrome.storage.local`, `chrome.sidePanel`).
- **No Remote Dependencies**: Zero API keys, zero external database calls, zero telemetry tracking.
- **Deterministic Relevance Engine**: Evaluates commercial domain alignment locally using explainable scoring, catalog terms, and exclusion filters to reject irrelevant entities (e.g. sports clubs, healthcare clinics, gaming ads returned by broad search).
- **Formula-Safe CSV & JSON Export**: Exports lead lists with RFC-4180 compliance and protection against spreadsheet formula injection (`=`, `+`, `-`, `@`).
- **Local Persistence**: Saves all research runs and discovered leads locally in `chrome.storage.local` across browser restarts.

---

## 📦 How to Install the Extension (Summary)

For the detailed 21-step guide, please see [INSTALL_GUIDE.md](INSTALL_GUIDE.md).

1. Download the release `extension.zip` or clone this repository.
2. **Extract / unzip the ZIP file**. (*Important: Never select the `.zip` file in Chrome!*).
3. Open Google Chrome and go to `chrome://extensions`.
4. Turn **ON** the **Developer mode** toggle in the top-right corner.
5. Click **Load unpacked** in the top-left corner.
6. Select the extracted folder named **`extension`** (the one that directly contains `manifest.json`).
7. Click the **Puzzle piece** icon in your Chrome toolbar and **Pin** the Meta Ad Library Lead Scraper.

---

## 🔄 How to Update the Extension

When a new version is released:
1. Go to GitHub and download the new release ZIP.
2. Extract the ZIP and replace your old local extension folder with the new one.
3. Open `chrome://extensions` in Chrome.
4. Click the circular **Reload** icon on the **Meta Ad Library Lead Scraper** card.
5. The extension is updated immediately with your previous research history preserved!

---

## 🏗️ Building from Source

```bash
# Install dependencies
npm install

# Compile web app, server, and Chrome extension bundle
npm run build

# Run the full regression test suite
node tests/test-final-validation-e2e.mjs
node tests/test-relevance-engine.mjs
node tests/test-live-research-run.mjs
```
