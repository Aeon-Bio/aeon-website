"""
Collect the INDRA statements a journey's model could draw on, with a bounded
sample of their evidence, for the belief model to read.

Run in the indra_agent environment (it talks to CoGEx):

  cd ~/workspace/indra_agent && set -a && . ./.env && set +a && \\
  uv run python ~/Documents/aeon-website/scripts/collect_statements.py [--among] > statements.jsonl

Round 1 (default): every Activation/Inhibition relation between MeSH terms
that touches a said term, an emerged term, or a lifestyle node, for every
journey. Round 2 (--among): the relations among the variables the resolver
actually selected (concerns.json → causal.nodes), so the factors between
them are read too.

Evidence count never enters: each statement gets the same bounded read —
up to EVIDENCE_PER_STATEMENT sentences, spread across distinct papers, chosen
deterministically — and what the belief model makes of those sentences is the
statement's belief. Statements already scored (src/lib/data/beliefs.json) are
skipped, so the file only ever holds new reading.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from journey_scripts import JOURNEYS  # noqa: E402
from resolve_journeys import GENERIC, LIFESTYLE, LIFESTYLE_PROXY, cid_of, cypher  # noqa: E402

EVIDENCE_PER_STATEMENT = 3

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "src", "lib", "data")


def sample_evidence(hashes):
    """For each statement, up to EVIDENCE_PER_STATEMENT evidence records — one per
    paper first — in a fixed order. Fetched in batches; hash -> list."""
    out = {}
    hashes = list(hashes)
    for i in range(0, len(hashes), 400):
        chunk = [int(h) for h in hashes[i : i + 400]]
        rows = cypher(
            "MATCH (v:Evidence) WHERE v.stmt_hash IN $hs RETURN v.stmt_hash AS h, collect(v.evidence)[0..60] AS js",
            hs=chunk,
        )
        for r in rows:
            evs = []
            for j in r["js"]:
                try:
                    e = json.loads(j)
                except (TypeError, ValueError):
                    continue
                if e.get("text"):
                    evs.append(e)
            evs.sort(key=lambda e: (str(e.get("pmid") or ""), str(e.get("source_hash") or "")))
            picked, seen = [], set()
            for e in evs:
                if e.get("pmid") in seen:
                    continue
                seen.add(e.get("pmid"))
                picked.append(e)
                if len(picked) == EVIDENCE_PER_STATEMENT:
                    break
            for e in evs:
                if len(picked) == EVIDENCE_PER_STATEMENT:
                    break
                if e not in picked:
                    picked.append(e)
            out[str(r["h"])] = picked
        print(f"   evidence for {min(i + 400, len(hashes))}/{len(hashes)}", file=sys.stderr)
    return out


def touching(ids):
    return cypher(
        """
        MATCH (a:BioEntity)-[r:indra_rel]-(b:BioEntity)
        WHERE a.id IN $ids AND b.id STARTS WITH 'mesh:' AND a.id <> b.id
          AND NOT b.id IN $generic AND r.stmt_type IN ['Activation','Inhibition']
        RETURN DISTINCT r.stmt_hash AS h, r.stmt_json AS j
        """,
        ids=list(ids),
        generic=list(GENERIC),
    )


def among(ids):
    return cypher(
        """
        MATCH (a:BioEntity)-[r:indra_rel]->(b:BioEntity)
        WHERE a.id IN $ids AND b.id IN $ids AND a.id <> b.id AND r.stmt_type IN ['Activation','Inhibition']
        RETURN DISTINCT r.stmt_hash AS h, r.stmt_json AS j
        """,
        ids=list(ids),
    )


def lifestyle_into(targets):
    return cypher(
        """
        MATCH (a:BioEntity)-[r:indra_rel]->(b:BioEntity)
        WHERE a.id IN $life AND b.id IN $targets AND r.stmt_type IN ['Activation','Inhibition']
        RETURN DISTINCT r.stmt_hash AS h, r.stmt_json AS j
        """,
        life=list(LIFESTYLE),
        targets=list(targets) + list(LIFESTYLE_PROXY),
    )


def main():
    round2 = "--among" in sys.argv
    try:
        scored = set(json.load(open(os.path.join(DATA, "beliefs.json"))).keys())
    except FileNotFoundError:
        scored = set()
    journeys = json.load(open(os.path.join(DATA, "journeys.json")))["journeys"]
    concerns = {c["id"]: c for c in json.load(open(os.path.join(DATA, "concerns.json")))}

    wanted = {}  # hash -> stmt_json, in priority order
    for j in JOURNEYS:
        said = [cid_of(g["id"]) for t in journeys[j["id"]]["dialogue"] for g in t.get("grounds", [])]
        c = concerns[j["id"]]
        emerged = [cid_of(n["id"]) for n in c["nodes"] if n["level"] == "body"]
        if round2:
            ids = [cid_of(n["id"]) for n in c["causal"]["nodes"] if not n["id"].lower().startswith("drugs:")]
            batches = [among(ids)]
        else:
            # what the person said first, then what can be done, then what emerged
            batches = [touching(said), lifestyle_into(said + emerged), touching(emerged)]
        for rows in batches:
            for r in rows:
                wanted.setdefault(str(r["h"]), r["j"])
        print(f"{j['id']}: {len(wanted)} statements so far", file=sys.stderr)

    todo = [h for h in wanted if h not in scored]
    evidence = sample_evidence(todo)
    n = 0
    for h in todo:
        evs = evidence.get(h)
        if not evs:
            continue
        stmt = json.loads(wanted[h])
        stmt["evidence"] = evs
        print(json.dumps({"hash": h, "stmt": stmt}, ensure_ascii=False))
        n += 1
    print(f"{n} statements to read ({len(wanted) - n} already scored or without text)", file=sys.stderr)


if __name__ == "__main__":
    main()
