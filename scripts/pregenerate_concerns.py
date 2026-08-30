#!/usr/bin/env python3
"""
Pregenerate the concern graphs for the landing page from public INDRA services.
No LLM. Every node and edge carries the identifier it came from.

    python3 scripts/pregenerate_concerns.py > src/lib/data/concerns.json

Sources:
  Gilda   https://grounding.indra.bio/ground          text -> ontology term
  CoGEx   https://discovery.indra.bio/api/*           phenotype/disease -> genes, gene -> pathways,
                                                     INDRA statements among a gene set
"""

import json
import sys
import time
import urllib.request
from collections import Counter, defaultdict

GILDA = "https://grounding.indra.bio/ground"
OLS = "https://www.ebi.ac.uk/ols4/api/search"
COGEX = "https://discovery.indra.bio/api"

TOP_GENES = 18
# curated disease-gene associations count fully; HPO phenotype annotations (rare-syndrome heavy) lightly
EDGE_WEIGHT = {"disease": 1.0, "phenotype": 0.34}
TOP_PATHWAYS = 6
MAX_EDGES = 48
POOL = 60

# Reactome/WikiPathways buckets too broad to say anything about a concern.
GENERIC_PATHWAYS = {
    "Disease", "Metabolism", "Signal Transduction", "Immune System", "Innate Immune System",
    "Adaptive Immune System", "Metabolism of proteins", "Metabolism of lipids",
    "Generic Transcription Pathway", "Gene expression (Transcription)", "Developmental Biology",
    "Hemostasis", "Cell Cycle", "Programmed Cell Death", "Cellular responses to stimuli",
    "Cellular responses to stress", "Vesicle-mediated transport", "Transport of small molecules",
    "Signaling by Receptor Tyrosine Kinases", "Cytokine Signaling in Immune system",
    "RNA Polymerase II Transcription", "Post-translational protein modification",
    "Neuronal System", "Extracellular matrix organization", "Muscle contraction",
    "Sensory Perception", "Organelle biogenesis and maintenance", "DNA Repair",
    "Infectious disease", "Diseases of signal transduction by growth factor receptors and second messengers",
    "Pleural mesothelioma", "Protein-protein interactions at synapses", "Axon guidance",
    "Nervous system development", "Metabolism of RNA", "Autophagy", "Cell-Cell communication",
    "Circadian Clock", "Chromatin organization", "Digestion and absorption", "Drug ADME",
    "Reproduction", "DNA Replication", "Mitophagy", "Metabolism of carbohydrates",
    "GPCR ligand binding", "GPCR downstream signalling", "Signaling by GPCR",
    "Metabolism of vitamins and cofactors", "Class A/1 (Rhodopsin-like receptors)",
    "Platelet activation, signaling and aggregation", "Immunoregulatory interactions between a Lymphoid and a non-Lymphoid cell",
    "Interferon Signaling", "Cytokine Signaling in Immune system", "Signaling by Interleukins",
}

# The words a person says, and the terms a clinician would ground them to.
# The grounding step is the only hand-made part; every id below is looked up.
# Body terms are what the prior-knowledge network *raised* from what was said
# (see src/lib/data/journeys.ts for the groundings and the relations that landed).
CONCERNS = [
    {
        "id": "tired",
        "said": "I’m tired all the time.",
        "terms": [
            "anemia",
            "iron deficiency anemia",
            "sleep deprivation",
            "obstructive sleep apnea",
            "hypothyroidism",
            "obesity",
        ],
        "wearable": ["sleep deprivation", "obstructive sleep apnea"],
    },
    {
        "id": "heart",
        "said": "My father had a heart attack at 52.",
        "terms": [
            "atherosclerosis",
            "thrombosis",
            "hypertension",
            "coronary artery disease",
            "hypercholesterolemia",
            "familial hypercholesterolemia",
        ],
        "wearable": ["hypertension"],
    },
    {
        "id": "ninety",
        "said": "I want to stay sharp at ninety.",
        "terms": [
            "Alzheimer disease",
            "stroke",
            "hypertension",
            "hearing loss",
            "sleep deprivation",
            "dementia",
        ],
        "wearable": ["sleep deprivation", "hypertension"],
    },
]

# Genes whose protein product is measured directly on an ordinary clinical panel.
# Presence here means "a blood draw observes this node", nothing more.
ANALYTE_GENES = {
    "TSHB": "TSH", "TG": "thyroglobulin", "TPO": "TPO antibodies",
    "FTL": "ferritin", "FTH1": "ferritin", "TF": "transferrin", "TFRC": "sTfR",
    "HAMP": "hepcidin", "HBB": "hemoglobin", "HBA1": "hemoglobin",
    "CRP": "CRP", "IL6": "IL-6", "TNF": "TNF-α", "ALB": "albumin",
    "APOB": "ApoB", "APOA1": "ApoA1", "LPA": "Lp(a)", "APOE": "ApoE",
    "INS": "insulin", "IGF1": "IGF-1", "PRL": "prolactin",
    "CST3": "cystatin C", "HP": "haptoglobin", "CP": "ceruloplasmin",
    "F2": "prothrombin", "FGA": "fibrinogen", "FGB": "fibrinogen", "FGG": "fibrinogen",
    "SERPINA1": "α1-antitrypsin", "TTR": "transthyretin", "NPPB": "BNP",
    "TNNT2": "troponin T", "TNNI3": "troponin I", "CKM": "CK", "MB": "myoglobin",
    "GPT": "ALT", "GOT1": "AST", "ALPL": "ALP", "GGT1": "GGT", "LDHA": "LDH",
    "EPO": "erythropoietin", "SHBG": "SHBG",
    "LEP": "leptin", "ADIPOQ": "adiponectin", "APOC3": "ApoC-III",
    "MAPT": "tau (CSF/plasma)", "APP": "Aβ (plasma)", "NEFL": "NfL", "GFAP": "GFAP",
}
ANALYTE_GENES = {k: v for k, v in ANALYTE_GENES.items() if v}


def post(url, payload, retries=3):
    body = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=body, headers={"content-type": "application/json"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode())
        except Exception as e:  # noqa: BLE001
            if attempt == retries - 1:
                print(f"!! {url} {payload} -> {e}", file=sys.stderr)
                return None
            time.sleep(2 * (attempt + 1))


def ground(text):
    res = post(GILDA, {"text": text})
    if not res:
        return None
    best = res[0]
    t = best["term"]
    return {
        "text": text,
        "db": t["db"],
        "id": t["id"],
        "name": t["entry_name"],
        "score": round(best["score"], 3),
        "url": best.get("url"),
    }


def doid_for(label):
    """DOID id for a disease label, via EBI OLS. None if no exact-ish match."""
    import urllib.parse

    q = urllib.parse.urlencode({"q": label, "ontology": "doid", "rows": 5, "exact": "false"})
    try:
        with urllib.request.urlopen(f"{OLS}?{q}", timeout=60) as r:
            docs = json.loads(r.read().decode()).get("response", {}).get("docs", [])
    except Exception as e:  # noqa: BLE001
        print(f"!! OLS {label}: {e}", file=sys.stderr)
        return None
    low = label.lower()
    for d in docs:
        if d.get("label", "").lower() == low and d.get("obo_id", "").startswith("DOID:"):
            return d["obo_id"]
    for d in docs:
        if d.get("obo_id", "").startswith("DOID:"):
            return d["obo_id"]
    return None


def genes_for_term(term):
    """Genes tied to a grounded term, with the kind of edge that tied them.
    Phenotype edges are keyed by MESH; disease edges accept MESH for some terms
    and DOID for others, so both are tried. A gene reached by both keeps 'disease'."""
    mesh = [term["db"].lower(), term["id"]]
    out = {}

    def take(res, kind):
        for row in res or []:
            d = row.get("data", {})
            if d.get("db_ns") == "HGNC" and not d.get("obsolete"):
                prev = out.get(d["name"])
                if prev is None or kind == "disease":
                    out[d["name"]] = (d["db_id"], kind)

    take(post(f"{COGEX}/get_genes_for_phenotype", {"phenotype": mesh}), "phenotype")
    take(post(f"{COGEX}/get_genes_for_disease", {"disease": mesh}), "disease")
    doid = doid_for(term["name"]) or doid_for(term["text"])
    if doid:
        term["doid"] = doid
        take(post(f"{COGEX}/get_genes_for_disease", {"disease": ["doid", doid]}), "disease")
    return out


def drugs_for_term(term, limit=8):
    """Interventions the literature/databases tie to a term as an indication."""
    res = post(f"{COGEX}/get_drugs_for_indication", {"indication": [term["db"].lower(), term["id"]]}) or []
    seen, out = set(), []
    for row in res:
        d = row.get("data", {})
        name = (d.get("name") or "").strip()
        key = name.lower()
        if not name or key in seen or len(name) > 34:
            continue
        seen.add(key)
        out.append({"name": name.title() if name.isupper() else name, "id": f"{d.get('db_ns')}:{d.get('db_id')}"})
    return {"count": len(seen), "sample": out[:limit]}


def clean_name(name):
    """Pathway names arrive with HTML entities stripped to their digits ("Alzheimer 39 s")."""
    import html
    import re

    name = html.unescape(name)
    name = re.sub(r"(\w) 39 s\b", r"\1's", name)
    return name


def pathways_for_gene(hgnc_id):
    res = post(f"{COGEX}/get_pathways_for_gene", {"gene": ["hgnc", hgnc_id]}) or []
    out = []
    for row in res:
        d = row.get("data", {})
        if d.get("name"):
            out.append((d["db_ns"], d["db_id"], clean_name(d["name"])))
    return out


def statements_among(hgnc_ids):
    res = post(f"{COGEX}/indra_subnetwork_relations", {"nodes": [["HGNC", i] for i in hgnc_ids]}) or []
    edges = []
    for row in res:
        d = row.get("data", {})
        try:
            sj = json.loads(d["stmt_json"])
        except Exception:  # noqa: BLE001
            continue
        subj = sj.get("subj") or (sj.get("members") or [{}])[0]
        obj = sj.get("obj") or (sj.get("members") or [{}, {}])[1] if sj.get("members") else sj.get("obj")
        if not subj or not obj:
            continue
        edges.append(
            {
                "source": subj.get("name"),
                "target": obj.get("name"),
                "type": sj.get("type"),
                "belief": round(d.get("belief", 0), 3),
                "evidence": d.get("evidence_count", 0),
                "hash": d.get("stmt_hash"),
            }
        )
    return edges


def build(concern):
    print(f"== {concern['id']}", file=sys.stderr)
    terms = [g for g in (ground(t) for t in concern["terms"]) if g]
    for t in terms:
        print(f"   {t['text']} -> {t['db']}:{t['id']} {t['name']} ({t['score']})", file=sys.stderr)

    hits = Counter()
    raw_hits = Counter()
    hgnc = {}
    term_genes = {}
    for t in terms:
        g = genes_for_term(t)
        term_genes[t["text"]] = set(g)
        for name, (hid, kind) in g.items():
            hits[name] += EDGE_WEIGHT[kind]
            raw_hits[name] += 1
            hgnc[name] = hid
        print(f"   {t['text']}: {len(g)} genes", file=sys.stderr)

    total = len(hits)
    # candidate pool: how many grounded terms the gene is tied to, analytes first among ties
    pool = sorted(hits, key=lambda n: (-hits[n], n not in ANALYTE_GENES, n))[:POOL]
    # INDRA statements among the pool; a gene the literature connects to the others ranks up
    pool_stmts = statements_among([hgnc[n] for n in pool])
    degree = Counter()
    for e in pool_stmts:
        if e["source"] in hits and e["target"] in hits and e["source"] != e["target"]:
            degree[e["source"]] += e["evidence"]
            degree[e["target"]] += e["evidence"]
    import math

    def score(n):
        return hits[n] * 3 + (2.5 if n in ANALYTE_GENES else 0) + min(1.0, math.log1p(degree[n]) / 4)

    ranked = sorted(pool, key=lambda n: (-score(n), n))
    top = ranked[:TOP_GENES]
    print(f"   {total} genes total, top {len(top)}: {', '.join(top)}", file=sys.stderr)

    # pathways over the top genes
    pw_count = Counter()
    pw_meta = {}
    gene_pw = defaultdict(set)
    for name in top:
        for ns, pid, pname in pathways_for_gene(hgnc[name]):
            # Reactome only: curated, hierarchical, and named for a mechanism rather than a disease
            if ns != "REACTOME" or pname in GENERIC_PATHWAYS:
                continue
            key = f"{ns}:{pid}"
            pw_count[key] += 1
            pw_meta[key] = pname
            gene_pw[name].add(key)
    top_pw = [k for k, _ in pw_count.most_common(TOP_PATHWAYS) if pw_count[k] >= 2]
    print(f"   pathways: {[pw_meta[k] for k in top_pw]}", file=sys.stderr)

    # INDRA statements among the top genes (already fetched over the pool)
    stmts = [e for e in pool_stmts if e["source"] in top and e["target"] in top and e["source"] != e["target"]]
    stmts.sort(key=lambda e: (-e["evidence"], -e["belief"]))
    seen = set()
    edges = []
    for e in stmts:
        k = (e["source"], e["target"], e["type"])
        if k in seen:
            continue
        seen.add(k)
        edges.append(e)
        if len(edges) >= MAX_EDGES:
            break
    print(f"   statements: {len(stmts)} kept {len(edges)}", file=sys.stderr)

    nodes = []
    for t in terms:
        rx = drugs_for_term(t)
        print(f"   {t['text']}: {rx['count']} interventions", file=sys.stderr)
        nodes.append(
            {
                "id": f"{t['db']}:{t['id']}",
                "label": t["name"],
                "level": "body",
                "said": t["text"],
                "url": t["url"],
                "observable": {"words": True, "wearable": t["text"] in concern["wearable"]},
                "interventions": rx,
            }
        )
    for k in top_pw:
        nodes.append({"id": k, "label": pw_meta[k], "level": "pathway", "observable": {}})
    for name in top:
        nodes.append(
            {
                "id": f"HGNC:{hgnc[name]}",
                "label": name,
                "level": "molecule",
                "hits": raw_hits[name],
                "terms": [t for t in term_genes if name in term_genes[t]],
                "observable": {
                    "blood": ANALYTE_GENES.get(name),
                    "methylation": True,
                    "genome": True,
                },
            }
        )

    membership = []
    for t in terms:
        for name in top:
            if name in term_genes[t["text"]]:
                membership.append({"source": f"HGNC:{hgnc[name]}", "target": f"{t['db']}:{t['id']}"})
    for name in top:
        for k in gene_pw[name]:
            if k in top_pw:
                membership.append({"source": f"HGNC:{hgnc[name]}", "target": k})

    by_name = {n: f"HGNC:{hgnc[n]}" for n in top}
    statements = [
        {**e, "source": by_name[e["source"]], "target": by_name[e["target"]]} for e in edges
    ]

    return {
        "id": concern["id"],
        "said": concern["said"],
        "counts": {"genes": total, "shown": len(top), "statements": len(stmts)},
        "nodes": nodes,
        "membership": membership,
        "statements": statements,
        "generated": time.strftime("%Y-%m-%d"),
        "sources": {
            "grounding": "Gilda, grounding.indra.bio",
            "graph": "INDRA CoGEx, discovery.indra.bio",
        },
    }


if __name__ == "__main__":
    out = [build(c) for c in CONCERNS]
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
