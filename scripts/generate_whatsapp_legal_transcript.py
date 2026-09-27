#!/usr/bin/env python3
"""Generate a print-ready, single-file HTML transcript from a WhatsApp export.

The parser reads the source line-by-line, identifies the two participants from
the export itself, preserves message text and internal line breaks, and emits
only self-contained HTML/CSS/JavaScript.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path


TIMESTAMP = (
    r"[\u200e\u200f]?"
    r"\d{1,2}[./-]\d{1,2}[./-]\d{2,4},"
    r"[ \u00a0\u202f]+\d{1,2}:\d{2}(?::\d{2})?"
    r"(?:[ \u00a0\u202f]*[AaPp]\.?[Mm]\.?)?"
)

HEADER_PATTERNS = (
    re.compile(
        rf"^(?P<timestamp>{TIMESTAMP})"
        rf"[ \u00a0\u202f]+-[ \u00a0\u202f]+(?P<payload>.*)$"
    ),
    re.compile(
        rf"^\[(?P<timestamp>{TIMESTAMP})\]"
        rf"[ \u00a0\u202f]+(?P<payload>.*)$"
    ),
)

SENDER_PATTERN = re.compile(
    r"^(?P<sender>[^:\r\n]{1,160}):(?P<separator>[ \t]?)(?P<body>.*)$"
)

ATTACHMENT_MARKERS = {"<media omitted>", "(file attached)"}
DIRECTION_MARKS = "\u200e\u200f\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069"


@dataclass
class Entry:
    timestamp: str
    payload: str
    source_start: int
    source_end: int
    continuation_lines: list[str] = field(default_factory=list)
    sender: str | None = None
    body: str = ""
    participant_key: str | None = None

    @property
    def complete_payload(self) -> str:
        if not self.continuation_lines:
            return self.payload
        return self.payload + "\n" + "\n".join(self.continuation_lines)

    @property
    def source_reference(self) -> str:
        if self.source_start == self.source_end:
            return f"source line {self.source_start:,}"
        return f"source lines {self.source_start:,}–{self.source_end:,}"


def normalise_participant_key(sender: str) -> str:
    """Normalise invisible direction marks only; never change displayed names."""
    return sender.translate(str.maketrans("", "", DIRECTION_MARKS)).strip()


def match_header(line: str) -> re.Match[str] | None:
    for pattern in HEADER_PATTERNS:
        match = pattern.match(line)
        if match:
            return match
    return None


def read_and_parse(path: Path) -> tuple[list[Entry], list[str], int, str]:
    """Read line-by-line and split the export into timestamped entries."""
    entries: list[Entry] = []
    preamble: list[str] = []
    decoded_lines: list[str] = []
    current: Entry | None = None

    source_bytes = path.read_bytes()
    source_sha256 = hashlib.sha256(source_bytes).hexdigest()

    # utf-8-sig consumes a BOM if present while preserving all actual chat text.
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        for line_number, raw_line in enumerate(source, start=1):
            decoded_lines.append(raw_line)
            line = raw_line.rstrip("\r\n")
            header = match_header(line)

            if header:
                if current is not None:
                    entries.append(current)
                current = Entry(
                    timestamp=header.group("timestamp"),
                    payload=header.group("payload"),
                    source_start=line_number,
                    source_end=line_number,
                )
                continue

            if current is None:
                preamble.append(line)
            else:
                current.continuation_lines.append(line)
                current.source_end = line_number

    if current is not None:
        entries.append(current)

    if not entries:
        raise ValueError("No WhatsApp timestamped entries were found in the source file.")

    # Prove the line-by-line read covered the complete decoded file.
    decoded_text = "".join(decoded_lines)
    expected_text = source_bytes.decode("utf-8-sig")
    if decoded_text != expected_text:
        raise RuntimeError("Integrity check failed: the source read was incomplete.")

    return entries, preamble, len(decoded_lines), source_sha256


def identify_participants(entries: list[Entry]) -> tuple[list[str], dict[str, str]]:
    """Identify the two recurring sender identities in first-appearance order."""
    counts: Counter[str] = Counter()
    exact_forms: dict[str, Counter[str]] = defaultdict(Counter)
    first_seen: dict[str, int] = {}

    for index, entry in enumerate(entries):
        sender_match = SENDER_PATTERN.match(entry.payload)
        if not sender_match:
            continue
        exact_sender = sender_match.group("sender")
        key = normalise_participant_key(exact_sender)
        if not key:
            continue
        counts[key] += 1
        exact_forms[key][exact_sender] += 1
        first_seen.setdefault(key, index)

    if len(counts) < 2:
        raise ValueError(
            "Could not identify two distinct participant names or numbers in the export."
        )

    ranked = sorted(counts, key=lambda key: (-counts[key], first_seen[key]))
    selected = ranked[:2]

    # A third frequent colon-prefixed identity likely means this is a group chat,
    # so fail rather than make a legally consequential guess.
    if len(ranked) > 2:
        third_count = counts[ranked[2]]
        second_count = counts[selected[1]]
        if third_count >= max(10, int(second_count * 0.05)):
            raise ValueError(
                "More than two recurring sender identities were detected; "
                "the script will not guess which participants to omit."
            )

    selected.sort(key=lambda key: first_seen[key])
    display_names = {
        key: exact_forms[key].most_common(1)[0][0]
        for key in selected
    }
    return selected, display_names


def classify_entries(entries: list[Entry], participant_keys: list[str]) -> None:
    selected = set(participant_keys)
    for entry in entries:
        sender_match = SENDER_PATTERN.match(entry.payload)
        if sender_match:
            exact_sender = sender_match.group("sender")
            key = normalise_participant_key(exact_sender)
            if key in selected:
                entry.sender = exact_sender
                entry.participant_key = key
                first_line = sender_match.group("body")
                entry.body = first_line
                if entry.continuation_lines:
                    entry.body += "\n" + "\n".join(entry.continuation_lines)
                continue

        # Non-message WhatsApp notices are retained as timestamped system entries.
        entry.body = entry.complete_payload


def escaped(value: str) -> str:
    return html.escape(value, quote=True)


def render_body(value: str) -> str:
    """Escape body text while styling only exact attachment-marker lines."""
    rendered_lines: list[str] = []
    for line in value.split("\n"):
        probe = line.translate(str.maketrans("", "", DIRECTION_MARKS)).strip().casefold()
        safe_line = escaped(line)
        if probe in ATTACHMENT_MARKERS:
            rendered_lines.append(
                f'<span class="attachment-marker">{safe_line}</span>'
            )
        else:
            rendered_lines.append(safe_line)
    return "\n".join(rendered_lines)


def line_range(start: int, end: int) -> str:
    if start == end:
        return f"Line {start:,}"
    return f"Lines {start:,}–{end:,}"


def build_entry_html(
    entry: Entry,
    ordinal: int,
    participant_keys: list[str],
) -> str:
    ref = f"Entry {ordinal:06d}"
    source_ref = line_range(entry.source_start, entry.source_end)
    timestamp = escaped(entry.timestamp)
    body = render_body(entry.body)
    long_class = " long-message" if len(entry.body) > 1200 else ""

    if entry.sender is None or entry.participant_key is None:
        return f"""
        <section class="system-entry{long_class}" id="entry-{ordinal:06d}" aria-label="{escaped(ref)}">
          <div class="system-reference">{escaped(ref)} · {escaped(source_ref)}</div>
          <div class="system-timestamp">{timestamp}</div>
          <div class="system-body">{body}</div>
        </section>"""

    side = "left" if entry.participant_key == participant_keys[0] else "right"
    sender = escaped(entry.sender)
    return f"""
        <section class="message-row {side}{long_class}" id="entry-{ordinal:06d}" aria-label="{escaped(ref)}, {sender}, {timestamp}">
          <div class="message-bubble">
            <div class="message-reference">{escaped(ref)} · {escaped(source_ref)}</div>
            <div class="message-sender">{sender}</div>
            <div class="message-text">{body}</div>
            <div class="message-timestamp">{timestamp}</div>
          </div>
        </section>"""


def build_preamble_html(preamble: list[str]) -> str:
    if not preamble:
        return ""
    body = render_body("\n".join(preamble))
    return f"""
        <section class="preamble-entry" aria-label="Untimestamped export preamble">
          <div class="system-reference">Untimestamped export preamble · Lines 1–{len(preamble):,}</div>
          <div class="system-body">{body}</div>
        </section>"""


def build_html(
    source_path: Path,
    entries: list[Entry],
    preamble: list[str],
    source_line_count: int,
    source_sha256: str,
    participant_keys: list[str],
    display_names: dict[str, str],
) -> str:
    participant_a = display_names[participant_keys[0]]
    participant_b = display_names[participant_keys[1]]
    message_count = sum(1 for entry in entries if entry.sender is not None)
    system_count = len(entries) - message_count
    attachment_count = sum(
        1
        for entry in entries
        for line in entry.body.split("\n")
        if line.translate(str.maketrans("", "", DIRECTION_MARKS)).strip().casefold()
        in ATTACHMENT_MARKERS
    )
    generated_at = datetime.now().astimezone().strftime("%d/%m/%Y, %H:%M:%S %Z")

    content_parts: list[str] = [build_preamble_html(preamble)]
    previous_date: str | None = None
    for ordinal, entry in enumerate(entries, start=1):
        raw_date = entry.timestamp.split(",", 1)[0]
        if raw_date != previous_date:
            content_parts.append(
                f'<div class="date-divider"><span>{escaped(raw_date)}</span></div>'
            )
            previous_date = raw_date
        content_parts.append(build_entry_html(entry, ordinal, participant_keys))
    transcript_content = "".join(content_parts)

    title = f"{source_path.stem} — Complete WhatsApp Transcript"
    return f"""<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>{escaped(title)}</title>
  <style>
    :root {{
      --page-bg: #F0F2F5;
      --paper: #FFFFFF;
      --text: #303030;
      --muted: #667781;
      --subtle: #8A949A;
      --line: #E1E1E1;
      --recipient-a: #FFFFFF;
      --recipient-b: #DCF8C6;
      --whatsapp: #128C7E;
      --whatsapp-dark: #075E54;
      --shadow: 0 12px 38px rgba(17, 27, 33, 0.10);
    }}
    * {{ box-sizing: border-box; }}
    html {{ background: var(--page-bg); }}
    body {{
      margin: 0;
      background: var(--page-bg);
      color: var(--text);
      font-family: Arial, "Segoe UI", Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }}
    .screen-toolbar {{
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: min(760px, calc(100% - 24px));
      margin: 12px auto 0;
      padding: 11px 14px;
      color: #FFFFFF;
      background: var(--whatsapp-dark);
      border-radius: 12px;
      box-shadow: 0 6px 22px rgba(7, 94, 84, 0.22);
    }}
    .screen-toolbar strong {{ font-size: 13px; }}
    .screen-toolbar span {{ color: rgba(255,255,255,.78); font-size: 12px; }}
    .print-button {{
      flex: 0 0 auto;
      padding: 9px 13px;
      border: 1px solid rgba(255,255,255,.45);
      border-radius: 8px;
      color: var(--whatsapp-dark);
      background: #FFFFFF;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }}
    .print-button:focus-visible {{ outline: 3px solid #F9D65C; outline-offset: 2px; }}
    .transcript {{
      width: min(760px, calc(100% - 24px));
      margin: 12px auto 36px;
      background: var(--page-bg);
      box-shadow: var(--shadow);
      border: 1px solid #D8DDE0;
      border-radius: 16px;
      overflow: clip;
    }}
    .document-header {{
      padding: 28px 30px 24px;
      color: #FFFFFF;
      background: linear-gradient(145deg, var(--whatsapp-dark), var(--whatsapp));
    }}
    .eyebrow {{
      margin: 0 0 7px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .14em;
      text-transform: uppercase;
      opacity: .82;
    }}
    h1 {{ margin: 0; font-size: 25px; line-height: 1.16; letter-spacing: -.025em; }}
    .header-note {{ margin: 10px 0 0; max-width: 62ch; color: rgba(255,255,255,.86); font-size: 12px; }}
    .evidence-panel {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 18px;
      padding: 20px 30px;
      background: var(--paper);
      border-bottom: 1px solid var(--line);
    }}
    .evidence-item {{ min-width: 0; }}
    .evidence-item.hash {{ grid-column: 1 / -1; }}
    .label {{ display: block; margin-bottom: 2px; color: var(--muted); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }}
    .value {{ display: block; font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }}
    .hash .value {{ font-family: "Courier New", monospace; font-size: 10px; font-weight: 400; }}
    .participant-key {{
      display: flex;
      gap: 12px;
      padding: 15px 30px;
      background: #FAFBFC;
      border-bottom: 1px solid var(--line);
    }}
    .participant {{
      flex: 1 1 0;
      min-width: 0;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      overflow-wrap: anywhere;
    }}
    .participant.a {{ background: var(--recipient-a); }}
    .participant.b {{ background: var(--recipient-b); }}
    .participant b {{ display: block; margin-bottom: 2px; font-size: 12px; }}
    .participant small {{ color: var(--muted); font-size: 10px; }}
    .chat {{ padding: 20px 22px 30px; }}
    .date-divider {{
      display: flex;
      justify-content: center;
      margin: 12px 0 16px;
      break-after: avoid;
    }}
    .date-divider span {{
      padding: 5px 12px;
      border: 1px solid #D6DEE1;
      border-radius: 999px;
      color: #53646C;
      background: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .04em;
    }}
    .message-row {{ display: flex; width: 100%; margin: 0 0 9px; break-inside: avoid; page-break-inside: avoid; }}
    .message-row.left {{ justify-content: flex-start; padding-right: 16%; }}
    .message-row.right {{ justify-content: flex-end; padding-left: 16%; }}
    .message-bubble {{
      position: relative;
      min-width: 180px;
      max-width: 100%;
      padding: 9px 11px 7px;
      color: var(--text);
      border-radius: 10px;
      box-shadow: 0 1px 1px rgba(17,27,33,.07);
      overflow-wrap: anywhere;
    }}
    .left .message-bubble {{ background: var(--recipient-a); border: 1px solid var(--line); border-top-left-radius: 3px; }}
    .right .message-bubble {{ background: var(--recipient-b); border: 1px solid rgba(151,189,126,.48); border-top-right-radius: 3px; }}
    .message-reference {{
      padding-bottom: 4px;
      color: var(--subtle);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .03em;
      border-bottom: 1px solid rgba(48,48,48,.08);
    }}
    .message-sender {{ margin-top: 5px; color: var(--whatsapp-dark); font-size: 11px; font-weight: 800; overflow-wrap: anywhere; }}
    .message-text, .system-body {{
      margin-top: 3px;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      unicode-bidi: plaintext;
    }}
    .message-timestamp {{ margin-top: 5px; color: #59686F; font-size: 10px; font-weight: 700; text-align: right; white-space: nowrap; }}
    .attachment-marker {{ color: #7B858A; font-style: italic; }}
    .system-entry, .preamble-entry {{
      width: 82%;
      margin: 15px auto;
      padding: 9px 12px;
      color: #53646C;
      background: #E6EEF1;
      border: 1px solid #D2DEE2;
      border-radius: 9px;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
      overflow-wrap: anywhere;
    }}
    .system-reference {{ color: #79878D; font-size: 9px; font-weight: 700; letter-spacing: .03em; }}
    .system-timestamp {{ margin-top: 3px; color: #53646C; font-size: 10px; font-weight: 800; }}
    .system-body {{ font-size: 11px; }}
    .long-message, .long-message .message-bubble {{ break-inside: auto; page-break-inside: auto; }}
    .document-footer {{
      padding: 18px 30px 22px;
      color: var(--muted);
      background: var(--paper);
      border-top: 1px solid var(--line);
      font-size: 10px;
    }}
    .document-footer p {{ margin: 0 0 5px; }}
    .document-footer p:last-child {{ margin-bottom: 0; }}
    @media (max-width: 560px) {{
      .screen-toolbar {{ align-items: flex-start; }}
      .screen-toolbar span {{ display: none; }}
      .transcript {{ width: 100%; margin: 0; border: 0; border-radius: 0; box-shadow: none; }}
      .document-header, .evidence-panel, .participant-key {{ padding-left: 18px; padding-right: 18px; }}
      .evidence-panel {{ grid-template-columns: 1fr; }}
      .evidence-item.hash {{ grid-column: auto; }}
      .participant-key {{ flex-direction: column; }}
      .chat {{ padding-left: 10px; padding-right: 10px; }}
      .message-row.left {{ padding-right: 8%; }}
      .message-row.right {{ padding-left: 8%; }}
    }}
    @page {{ size: A4 portrait; margin: 13mm 11mm 15mm; }}
    @media print {{
      html, body {{ background: var(--page-bg) !important; }}
      body {{ font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
      .screen-toolbar {{ display: none !important; }}
      .transcript {{ width: 100%; max-width: none; margin: 0; border: 0; border-radius: 0; box-shadow: none; overflow: visible; }}
      .document-header {{ padding: 18px 20px 16px; }}
      h1 {{ font-size: 20pt; }}
      .evidence-panel {{ padding: 14px 20px; }}
      .participant-key {{ padding: 11px 20px; }}
      .chat {{ padding: 14px 12px 22px; }}
      .message-row {{ margin-bottom: 7px; }}
      .message-bubble {{ box-shadow: none; }}
      .message-text {{ font-size: 9.5pt; }}
      .date-divider {{ margin: 9px 0 11px; }}
      .document-footer {{ padding: 14px 20px 18px; }}
      a {{ color: inherit; text-decoration: none; }}
    }}
  </style>
</head>
<body>
  <div class="screen-toolbar" role="region" aria-label="Print controls">
    <div><strong>Complete WhatsApp transcript</strong><br><span>For PDF: enable “Background graphics” in the print window.</span></div>
    <button class="print-button" type="button" onclick="window.print()">Print / Save PDF</button>
  </div>
  <main class="transcript">
    <header class="document-header">
      <p class="eyebrow">Complete exported conversation</p>
      <h1>WhatsApp Conversation Transcript</h1>
      <p class="header-note">Each timestamp and message body is presented from the source export. Entry and source-line references have been added solely for navigation and citation.</p>
    </header>
    <section class="evidence-panel" aria-label="Transcript details">
      <div class="evidence-item"><span class="label">Source file</span><span class="value">{escaped(source_path.name)}</span></div>
      <div class="evidence-item"><span class="label">Generated</span><span class="value">{escaped(generated_at)}</span></div>
      <div class="evidence-item"><span class="label">First timestamp</span><span class="value">{escaped(entries[0].timestamp)}</span></div>
      <div class="evidence-item"><span class="label">Last timestamp</span><span class="value">{escaped(entries[-1].timestamp)}</span></div>
      <div class="evidence-item"><span class="label">Export coverage</span><span class="value">{source_line_count:,} source lines · {len(entries):,} timestamped entries</span></div>
      <div class="evidence-item"><span class="label">Content count</span><span class="value">{message_count:,} messages · {system_count:,} system entries · {attachment_count:,} attachment markers</span></div>
      <div class="evidence-item hash"><span class="label">Source SHA-256</span><span class="value">{source_sha256}</span></div>
    </section>
    <section class="participant-key" aria-label="Participant alignment key">
      <div class="participant a"><b>{escaped(participant_a)}</b><small>Recipient A · left · white bubble</small></div>
      <div class="participant b"><b>{escaped(participant_b)}</b><small>Recipient B · right · green bubble</small></div>
    </section>
    <article class="chat" aria-label="WhatsApp messages">{transcript_content}
    </article>
    <footer class="document-footer">
      <p><strong>Presentation note:</strong> Message wording, sender labels, timestamps and internal line breaks are rendered from the export. HTML escaping is used only so the original text displays safely in a browser.</p>
      <p><strong>Verification:</strong> Compare the source file against the SHA-256 value above. Attachment markers indicate references in the text export; this document does not embed omitted media or attached files.</p>
    </footer>
  </main>
</body>
</html>
"""


def verify_output(
    output_path: Path,
    html_text: str,
    entries: list[Entry],
    participant_keys: list[str],
) -> None:
    """Check every complete rendered entry reached HTML in source order."""
    if html_text.count('id="entry-') != len(entries):
        raise RuntimeError("Output verification failed: entry count mismatch.")

    cursor = 0
    for ordinal, entry in enumerate(entries, start=1):
        complete_entry = build_entry_html(entry, ordinal, participant_keys)
        position = html_text.find(complete_entry, cursor)
        if position == -1:
            raise RuntimeError(
                f"Output verification failed: missing or altered {entry.source_reference}."
            )
        cursor = position + len(complete_entry)

    for key in participant_keys:
        if not any(entry.participant_key == key for entry in entries):
            raise RuntimeError(f"Output verification failed: participant {key!r} has no messages.")

    written = output_path.read_text(encoding="utf-8")
    if written != html_text:
        raise RuntimeError("Output verification failed: written HTML differs from generated HTML.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a complete court-friendly HTML transcript from a WhatsApp export."
    )
    parser.add_argument("input", type=Path, help="WhatsApp export .txt path")
    parser.add_argument("output", type=Path, help="Destination .html path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_path = args.input.expanduser().resolve()
    output_path = args.output.expanduser().resolve()

    if not source_path.is_file():
        print(f"Error: source file not found: {source_path}", file=sys.stderr)
        return 2
    if source_path == output_path:
        print("Error: input and output paths must differ.", file=sys.stderr)
        return 2

    try:
        entries, preamble, source_line_count, source_sha256 = read_and_parse(source_path)
        participant_keys, display_names = identify_participants(entries)
        classify_entries(entries, participant_keys)
        html_text = build_html(
            source_path=source_path,
            entries=entries,
            preamble=preamble,
            source_line_count=source_line_count,
            source_sha256=source_sha256,
            participant_keys=participant_keys,
            display_names=display_names,
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", encoding="utf-8", newline="\n") as output:
            output.write(html_text)
        verify_output(output_path, html_text, entries, participant_keys)
    except (OSError, UnicodeError, ValueError, RuntimeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    message_count = sum(1 for entry in entries if entry.sender is not None)
    system_count = len(entries) - message_count
    print(f"Participant A (left): {display_names[participant_keys[0]]}")
    print(f"Participant B (right): {display_names[participant_keys[1]]}")
    print(f"Messages: {message_count:,}")
    print(f"System entries: {system_count:,}")
    print(f"Source lines: {source_line_count:,}")
    print(f"Source SHA-256: {source_sha256}")
    print(f"HTML written: {output_path}")
    print(f"HTML size: {output_path.stat().st_size:,} bytes")
    print("Verification: passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
