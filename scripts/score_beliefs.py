"""
Read statements with the belief model and write each one's belief.

Run in the indra-belief-model environment, against the local Gemma 4 26B
served by MLX (scripts/serve_mlx.sh there; logprobs on):

  ~/Documents/indra-belief-model/.venv/bin/python scripts/score_beliefs.py statements.jsonl

Each (statement, sentence) pair is read once by the calibrated verdict-only
probe — the reader's own logit at the verdict position, calibrated on curator
gold — and the sentence reads roll up through statement_belief with the fitted
profile for this exact reader and prompt. A statement's belief is what the
model made of its sentences; how many sentences there were never enters.

Output, merged into src/lib/data/beliefs.json keyed by stmt_hash:
  belief    calibrated probability the statement is right, or null if nothing
            could be read
  route     "correct" | "review" | "incorrect"
  read      sentences read; correct / incorrect: how each was judged
Per-sentence rows go to the audit file beside the input (…rows.jsonl).
Resume-safe: statements already in beliefs.json are skipped.
"""

import concurrent.futures as cf
import hashlib
import json
import os
import sys
import threading
import time

BELIEF_REPO = os.path.expanduser("~/Documents/indra-belief-model")
sys.path.insert(0, os.path.join(BELIEF_REPO, "src"))

from indra.statements import Statement  # noqa: E402
from indra_belief.calibration_constants import VERDICT_ONLY_PROMPT_SHA256, calibration_for  # noqa: E402
from indra_belief.data.scoring_record import ScoringRecord  # noqa: E402
from indra_belief.model_client import ModelClient  # noqa: E402
from indra_belief.scorers.monolithic import scorer as SC  # noqa: E402
from indra_belief.statement_belief import statement_belief  # noqa: E402

READER = "local-gemma-4-26b"
WORKERS = 4  # the MLX server batches; measured 0.44 s per sentence at 4 against 3.3 s alone
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "src", "lib", "data", "beliefs.json")


def verdict_only_variant():
    for v in SC.VARIANTS.values():
        if hashlib.sha256(v.system_prompt.encode()).hexdigest() == VERDICT_ONLY_PROMPT_SHA256:
            return v
    raise SystemExit("the verdict-only prompt is not in this checkout of indra-belief-model")


def main():
    src = sys.argv[1]
    audit = os.path.splitext(src)[0] + ".rows.jsonl"
    variant = verdict_only_variant()
    profile = calibration_for(READER, prompt_sha256=VERDICT_ONLY_PROMPT_SHA256)
    if profile is None:
        raise SystemExit("no ship-approved calibration for this reader and prompt")
    client = ModelClient(READER)
    print(f"reader {READER} · {client.config['model_id']} · profile {profile['profile_id']}", file=sys.stderr)

    try:
        beliefs = json.load(open(OUT))
    except FileNotFoundError:
        beliefs = {}

    todo = [json.loads(line) for line in open(src) if line.strip()]
    todo = [t for t in todo if t["hash"] not in beliefs]
    print(f"{len(todo)} statements to read", file=sys.stderr)
    t0 = time.time()
    lock = threading.Lock()
    done = 0

    def read(item):
        st = Statement._from_json(item["stmt"])
        rows, audit_rows = [], []
        for ev in st.evidence:
            row = SC.score(client, ScoringRecord(statement=st, evidence=ev), variant=variant)
            row["source_api"] = ev.source_api
            row["evidence_text"] = ev.text
            rows.append(row)
            audit_rows.append({
                "hash": item["hash"], "pmid": ev.pmid, "source": ev.source_api,
                "verdict": row.get("verdict"), "p": row.get("score"),
                "weight": row.get("weight_of_evidence"), "text": ev.text,
            })
        b = statement_belief(rows, soft=profile)
        return item["hash"], st, audit_rows, {
            "belief": None if b.belief is None else round(float(b.belief), 4),
            "route": b.verdict_statement,
            "read": b.n_evidence,
            "correct": b.n_correct,
            "incorrect": b.n_incorrect,
            "weighting": b.weighting,
        }

    fresh = {}  # this run's results; merged into the file, never replacing it

    def save():
        """Merge onto whatever is on disk — another scorer may be writing too."""
        try:
            current = json.load(open(OUT))
        except FileNotFoundError:
            current = {}
        current.update(fresh)
        tmp = OUT + ".tmp"
        json.dump(current, open(tmp, "w"), indent=0, sort_keys=True)
        os.replace(tmp, OUT)
        return len(current)

    with open(audit, "a") as rows_out, cf.ThreadPoolExecutor(WORKERS) as pool:
        for h, st, audit_rows, result in pool.map(read, todo):
            with lock:
                fresh[h] = result
                for r in audit_rows:
                    rows_out.write(json.dumps(r, ensure_ascii=False) + "\n")
                done += 1
                if done % 20 == 0 or done == len(todo):
                    save()
                    rows_out.flush()
                    rate = (time.time() - t0) / done
                    print(f"{done}/{len(todo)} · {rate:.2f}s per statement · {st}", file=sys.stderr)
    print(f"done: {save()} beliefs in {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
