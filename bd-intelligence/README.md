# Essential Resourcing BD Intelligence MVP

Lean, human-in-the-loop business development intelligence for Essential Resourcing.

This is not a spam tool. It stores signals, scores opportunities, drafts messages in David Walsh's tone and leaves the decision with a human.

## What It Does

- Imports companies and contacts from CSV exports.
- Stores hiring, growth, RSS/news and careers-page signals.
- Scores companies out of 100 using the agreed Essential Resourcing market fit model.
- Stores decision-makers and relationship context.
- Drafts LinkedIn, Sales Navigator, email, follow-up and call opener messages.
- Tracks statuses: New, Reviewed, Contacted, Replied, Not relevant, Follow-up, Won, Lost.
- Produces a dashboard view and a plain text daily digest.

## Setup

From this folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m src.cli init-db
```

## API Keys

Required for the local MVP: none.

Optional:

- `OPENAI_API_KEY` for AI-drafted summaries and outreach. Without it, the app uses a local fallback writer.
- `OPENAI_MODEL` to choose the model used by the OpenAI Responses API.
- `SERPAPI_API_KEY` for live Google-style search.
- `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_ID` if you already have access to Google's older Custom Search JSON API.
- `BING_SEARCH_API_KEY` for Bing Search API.
- `GMAIL_IMAP_EMAIL`, `GMAIL_APP_PASSWORD` and `GMAIL_IMAP_FOLDER` to read LinkedIn job-alert emails from a Gmail label.

Keep keys in `.env`. Do not commit `.env`.

## Try It With Sample Data

```bash
python -m src.cli demo-load --score
python -m src.cli daily-digest
streamlit run app.py
```

The sample data uses fictional companies and `.example` domains.

## CLI Commands

Initialise the database:

```bash
python -m src.cli init-db
```

Import company CSV:

```bash
python -m src.cli import-companies --csv data/sample_companies.csv
```

Import contact CSV:

```bash
python -m src.cli import-contacts --csv data/sample_contacts.csv
```

Run signal search:

```bash
python -m src.cli run-search
```

With no search API keys, this falls back to `data/sample_search_results.csv`.

For the scheduled morning run, search uses `data/search_queries.txt` and does not load sample results.

Ingest RSS:

```bash
python -m src.cli ingest-rss --feed https://example.com/feed.xml
```

Monitor careers pages:

```bash
python -m src.cli monitor-careers --csv data/sample_careers_pages.csv
```

Import Gmail job-alert emails:

```bash
python -m src.cli import-gmail-alerts
```

Generate scores:

```bash
python -m src.cli score-leads
```

Generate outreach:

```bash
python -m src.cli generate-outreach --company-id 1 --channel linkedin_connection
python -m src.cli generate-outreach --company-id 1 --channel email
```

Use local drafting only:

```bash
python -m src.cli generate-outreach --company-id 1 --channel email --no-ai
```

Produce a daily digest:

```bash
python -m src.cli daily-digest --limit 10
```

Launch the dashboard:

```bash
streamlit run app.py
```

Run the full morning workflow manually:

```bash
python -m src.cli daily-run
```

The scheduled version runs the same command at 7:00 every morning using macOS LaunchAgent.

## CSV Columns

Company imports accept:

- `name`, `company`, `company_name` or `account name`
- `website`, `domain` or `company_website`
- `sector` or `industry`
- `location`, `city` or `region`
- `linkedin_url`, `company_linkedin` or `linkedin`
- `source`

Contact imports accept:

- `company_name`, `company` or `account name`
- `first_name`, `last_name`
- `job_title`
- `email`
- `linkedin_url`
- `relationship_type`
- `source`

## Database

SQLite is used initially at `data/bd_intelligence.sqlite3`.

The schema is deliberately simple and can move to Postgres later:

- `companies`
- `contacts`
- `signals`
- `lead_scores`
- `outreach_messages`
- `interactions`
- `source_snapshots`

## Manual Work Still Needed

- Add real target company lists, CRM exports or Sales Navigator CSVs.
- Add approved RSS feeds to `data/rss_feeds.txt`.
- Add careers page URLs to `data/careers_pages.csv`.
- Add live SerpAPI or Bing Search API keys if you want automated search.
- Add Gmail settings if you want LinkedIn job-alert emails pulled in automatically.
- Review every generated message before sending it.
- Keep LinkedIn data to manual exports/imports. Do not scrape aggressively.

## Morning Schedule

The repository includes:

- `scripts/run_daily.sh`
- `launchd/com.essentialresourcing.bd-intelligence.plist`

The scheduled job:

1. Runs at 7:00 every morning if the Mac is on and awake.
2. Reads search queries from `data/search_queries.txt`.
3. Reads RSS feeds from `data/rss_feeds.txt`.
4. Reads careers pages from `data/careers_pages.csv`.
5. Reads Gmail alerts if Gmail settings are present in `.env`.
6. Scores leads and writes a digest into `exports/`.

Logs are written into `logs/`.

## Next Improvements

- Postgres adapter once volume justifies it.
- Scheduled daily run via cron or GitHub Actions.
- Better contact enrichment from compliant sources.
- Export reviewed drafts into your CRM.
- Add an audit log for message approvals.
