# Google Sheet workflow for catalog updates

To get **notified when official pages change**, see the weekly GitHub Action in `docs/url-watch.md`.

You can’t automate “create a sheet inside your Google Drive” from this repo, but you **can** generate CSV files, import them into Google Sheets, edit in the browser, export CSV again, and merge back into JSON for `PUT /api/catalog`.

## 1) Generate CSVs from your downloaded catalog

From the project root (after you have `catalog-before.json` or pass any catalog export):

```bash
npm run catalog:sheet:generate -- catalog-before.json
```

This writes:

- `data/catalog-sheet-export/services.csv`
- `data/catalog-sheet-export/options.csv`

## 2) Create the Google Sheet (one-time)

1. Go to [Google Sheets](https://sheets.google.com) → **Blank** spreadsheet.
2. Name it something like **StreamWise catalog**.
3. **Services tab**
   - **File → Import → Upload** → pick `services.csv`.
   - Import location: **Replace current sheet** (or “Insert new sheet” if you prefer).
4. **Options tab**
   - Click **+** at the bottom to add a second sheet; rename it to `options`.
   - With `options` selected: **File → Import → Upload** → pick `options.csv`.
   - Import location: **Replace spreadsheet** is wrong here—choose **Replace current sheet** so it fills the `options` tab only.

You now have two tabs: one row per **service** and one row per **option**.

## 3) Format tips (avoid Google “helping” you)

- Select the **`lastChecked`** column → **Format → Number → Plain text** (prevents date auto-format).
- Same for **`expiresAt`** / **`effectiveDate`** if you use them.
- **`covers`** and **`requires`** use **pipe** separators, e.g. `Netflix|Hulu` or `verizon`.

## 4) Editing rules

- **Empty cell** = “don’t change this field” when you merge back.
- Only change rows for **`id`s that already exist** in your catalog (new rows in the sheet are ignored with a warning in the terminal).
- After editing, **download each tab as CSV**:
  - Open the `services` tab → **File → Download → Comma Separated Values (.csv)** → save as `services.csv` (replace the file in `data/catalog-sheet-export/` or save somewhere and copy over).
  - Open the `options` tab → download the same way → `options.csv`.

Keep the **header row** exactly as exported (first row of the CSV).

## 5) Merge CSVs back into JSON

From project root:

```bash
npm run catalog:sheet:apply -- catalog-before.json data/catalog-sheet-export/services.csv data/catalog-sheet-export/options.csv catalog-merged.json
```

Then review changes:

```bash
npm run catalog:diff -- catalog-before.json catalog-merged.json
```

If the diff looks correct, upload `catalog-merged.json` with `PUT /api/catalog` (see `docs/pricing-data-process.md`).

## 6) Regenerate the sheet after a big catalog change

If the live catalog gained new options/services, re-run **generate** from a fresh `GET /api/catalog` export, then re-import or copy/paste new rows into your sheet so **`id` list stays in sync**.
