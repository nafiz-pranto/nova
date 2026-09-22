# LeadNoria (Chrome Extension)

> **Discover. Verify. Connect.**

A standalone **Manifest V3 Chrome Extension** that operates as a **local-only browser research tool** for the public Meta Ad Library.

LeadNoria researches publicly accessible Meta Ad Library information and organizes the results into verified business lead records.

---

## 💡 What LeadNoria Does

LeadNoria discovers and qualifies business advertisers running active campaigns on the public Meta Ad Library.

It operates **100% locally** inside your Google Chrome browser. It requires **no remote servers**, no backend databases, no paid scraping subscriptions, and no external AI APIs. All data processing and relevance classification happen right inside your browser.

---

## 🚀 How to Use LeadNoria

LeadNoria uses an **Auto-Discovery** engine. You do not need to enter a maximum lead count or guess quotas—LeadNoria automatically searches and collects active advertisers for your query.

### Option A: Preset Mode
1. **Choose an Industry Preset** from the curated catalog (e.g. *Gyms & Fitness*, *Real Estate*, *E-commerce Brands*, *Home Services*, *Clean Energy & Solar*, *B2B Tech & SaaS*).
2. **Select Location** (e.g. `United States`, `United Kingdom`, `Bangladesh`, `Australia`, or `Worldwide`).
3. Click **Start Research**.

### Option B: Custom Mode
1. **Enter Keywords** separated by commas or new lines (e.g. `Furniture, Office Chairs, Living Room Decor`).
2. **Select Location** for your target market.
3. Click **Start Research**.

---

## 🔍 How Auto-Discovery Works

LeadNoria automatically discovers publicly accessible results while new results are available. You do not need to enter a lead count.

During research, LeadNoria searches the public Meta Ad Library, evaluates ad relevance in real-time, deduplicates multiple ads from the same advertiser, and stores unique leads directly in your browser.

Research will finish or stop when:
- **Search Results Exhausted**: Meta Ad Library has returned all available public ads for your query and location.
- **No New Ads Observed**: No additional ads were found for the specified search terms.
- **User Cancelled**: You clicked **Stop Research**.
- **Tab Closed**: The active research tab was closed.
- **Security Check / Rate Limit**: Meta presented an interactive security verification or temporary access limit.
- **Safety Limit Reached**: The session reached the built-in system safety limit (5,000 unique leads) to protect browser memory.

---

## 📖 Key Concepts Explained (In Simple Terms)

- **Lead**: A business advertiser discovered through public advertisements in the Meta Ad Library.
- **Unique Lead**: One distinct business entity. If an advertiser runs 5 different ad cards across multiple keywords, all 5 ads are combined into **one single unique lead** with an active ad count of 5.
- **Website (`found` / `not_found`)**:
  - `found`: The advertiser's ad cards include a direct link to their official business website or online store.
  - `not_found`: The advertiser runs ads directly on Facebook or Instagram (such as Messenger or lead forms) without an external website link.
- **Facebook Page (`found` / `not_found`)**:
  - `found`: The advertiser's public Facebook Page URL was identified.
  - `not_found`: The ad card did not display a direct public Page URL.
- **Matched Keywords**: The search terms for which this advertiser's ads appeared during your research session.
- **Relevance Confidence**: The deterministic relevance engine evaluates ad copy and entity names to filter out unrelated businesses (e.g., sports teams or clinics when searching for furniture).

---

## ⚡ Technical Highlights

- **100% Local Browser Execution**: Uses Chrome Extensions Manifest V3 APIs (`chrome.tabs`, `chrome.scripting`, `chrome.storage.local`, `chrome.sidePanel`).
- **No Remote Dependencies**: Zero external API keys, zero external database calls, zero telemetry tracking.
- **Deterministic Strict Relevance Gate v2**: Evaluates commercial domain alignment locally using explainable scoring, catalog terms, and exclusion filters to reject irrelevant entities.
- **Formula-Safe CSV & JSON Export**: Exports lead lists with RFC-4180 compliance and protection against spreadsheet formula injection (`=`, `+`, `-`, `@`).
- **Bulk IndexedDB Storage**: Uses an isolated browser database for storing thousands of entity records, raw ad cards, and progress checkpoints.

---

## 📦 How to Install the Extension (Summary)

For the complete step-by-step installation walkthrough, see [INSTALL_GUIDE.md](INSTALL_GUIDE.md).

1. Download the release package (`dist/leadnoria-v1.0.0.zip` or `extension.zip`).
2. **Extract / unzip the ZIP file**. (*Important: Never select the `.zip` file in Chrome!*).
3. Open Google Chrome and navigate to `chrome://extensions`.
4. Turn **ON** the **Developer mode** toggle in the top-right corner.
5. Click **Load unpacked** in the top-left corner.
6. Select the extracted folder named **`extension`** (the folder that directly contains `manifest.json`).
7. Click the **Puzzle piece** icon in your Chrome toolbar and **Pin** LeadNoria.

---

## 🔄 How to Update the Extension

When a new version is released:
1. Download the latest release ZIP.
2. Extract the ZIP and replace your existing local extension files.
3. Open `chrome://extensions` in Chrome.
4. Click the circular **Reload** icon on the **LeadNoria** card.
5. LeadNoria updates immediately with your research data preserved.

---

## 🏗️ Building from Source

```bash
# Install dependencies
npm install

# Compile web app, server, and Chrome extension bundle
npm run build

# Run the test suite
node tests/test-prompt57-final-system-acceptance.mjs
node tests/test-strict-gate-v2.mjs
node tests/test-final-validation-e2e.mjs
```

