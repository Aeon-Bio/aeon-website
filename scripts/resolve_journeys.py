"""
Drive INDRA CoGEx end to end for each authored journey.

    cd ~/workspace/indra_agent && set -a && . ./.env && set +a && \
      uv run python ~/Documents/aeon-website/scripts/resolve_journeys.py \
      > ~/Documents/aeon-website/src/lib/data/journeys.json

Per journey:
  ground   Gilda on the authored phrases (score kept; failures kept as words)
  land     indra_rel neighbours of each grounding, top by belief, arriving two
           turns later; the best-believed outgoing edge is followed one hop
           (Weight Gain → Obesity → OSA is how apnea earns its line)
  emerge   the disease nodes that landed, ranked by belief: the system-level
           terms; genes / pathways / statements come from pregenerate_concerns.build

Belief is the belief model's reading of each statement's sentences
(src/lib/data/beliefs.json, written by score_beliefs.py). Evidence count never
enters: a relation the model has not read is not in the record; one it has
read carries its belief and nothing else.
  safe     lifestyle nodes with an edge into an emerged or said term (Inhibition
           = do; Activation = avoid)
  measure  analyte genes tied to emerged terms; wearable-observable terms
  indexed  has_indication drugs per emerged term
  reply    assembled from the above, then the authored follow-up
"""

import json
import os
import sys
import time
from collections import Counter, defaultdict

import neo4j

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pregenerate_concerns as pg  # noqa: E402
from journey_scripts import JOURNEYS, QUESTIONS  # noqa: E402

LANDS_PER_GROUND = 4

HERE = os.path.dirname(os.path.abspath(__file__))
try:
    BELIEFS = json.load(open(os.path.join(HERE, "..", "src", "lib", "data", "beliefs.json")))
except FileNotFoundError:
    BELIEFS = {}
SIDE_EFFECT_BELIEF = 0.9  # has_side_effect is curated (SIDER); the belief model reads sentences, not labels


def belief_for(stmt_hash):
    """The belief model's number for a statement, or None if it has not been read."""
    b = BELIEFS.get(str(stmt_hash))
    return None if b is None else b["belief"]


def read(rows):
    """Keep the rows the belief model has read, each carrying its belief, best first."""
    out = []
    for r in rows:
        b = belief_for(r["h"])
        if b is None:
            continue
        r["belief"] = b
        out.append(r)
    return sorted(out, key=lambda r: -r["belief"])


EMERGED = 6
DELAY = 2  # turns between a grounding and its landing

# nodes the text-mining layer produces that carry no meaning for a person
GENERIC = {
    "mesh:D051379", "mesh:D004194", "mesh:D013577", "mesh:D003643", "mesh:D012306",
    "mesh:D006262", "mesh:D014024", "mesh:D000375", "mesh:D012421", "mesh:D007239",
    "mesh:D001835", "mesh:D015431", "mesh:D010146", "mesh:D009369", "mesh:D002908",
    "mesh:D008659", "mesh:D006963", "mesh:D001066", "mesh:D002318", "mesh:D019636",
}

# symptom-level nodes: co-mentioned in trials with everything, causes of nothing
SYMPTOMS = {
    "mesh:D010146", "mesh:D003967", "mesh:D009325", "mesh:D003681", "mesh:D005334",
    "mesh:D006261", "mesh:D003248", "mesh:D004417", "mesh:D014839", "mesh:D001066",
    "mesh:D015431", "mesh:D007239", "mesh:D006930", "mesh:D005222", "mesh:D015746",
    "mesh:D015444", "mesh:D007249", "mesh:D017382", "mesh:D000077260", "mesh:D012421",
    "mesh:D015427", "mesh:D007511", "mesh:D010195", "mesh:D000860",
}

# lifestyle nodes and how the agent would say them
LIFESTYLE = {
    "mesh:D015444": ("Exercise", {"Inhibition": "walk, daily"}),
    "mesh:D008460": ("Meat", {"Activation": "iron on the plate, not in a pill"}),
    "mesh:D012907": ("Smoking", {"Activation": "no smoking, if you do"}),
    "mesh:D000428": ("Alcohol Drinking", {"Activation": "less alcohol, if you drink"}),
}
# lifestyle → chemical targets that stand in for a term
LIFESTYLE_PROXY = {"chebi:18248": ["mesh:D018798", "mesh:D000740"]}  # iron atom → the anemias

# what an ordinary panel measures first; lower is sooner
PANEL = [
    "hemoglobin", "ferritin", "TSH", "ApoB", "Lp(a)", "CRP", "HbA1c", "insulin", "IGF-1",
    "cystatin C", "albumin", "transferrin", "sTfR", "BNP", "troponin T", "troponin I",
]

# terms a wearable or a home device observes
WEARABLE = {
    "mesh:D020181": "a night’s recording",
    "mesh:D012892": "a night’s recording",
    "mesh:D006973": "a cuff at home",
}

driver = neo4j.GraphDatabase.driver(
    os.environ["INDRA_NEO4J_URL"],
    auth=(os.environ["INDRA_NEO4J_USER"], os.environ["INDRA_NEO4J_PASSWORD"]),
)


def cypher(q, **params):
    with driver.session() as s:
        return [dict(r) for r in s.run(q, **params)]


def log(*a):
    print(*a, file=sys.stderr)


def curie(g):
    gid = g["id"].split(":")[-1]
    return f"{g['db'].lower()}:{gid}"


def cid_of(id_):
    """Graph ids are case-sensitive after the prefix: MESH:D006973 → mesh:D006973."""
    ns, _, rest = id_.partition(":")
    return f"{ns.lower()}:{rest}"


def node_type(cid):
    rows = cypher("MATCH (b:BioEntity {id:$id}) RETURN b.type AS t", id=cid)
    return rows[0]["t"] if rows else None


def neighbours(cid):
    rows = cypher(
        """
        MATCH (a:BioEntity {id:$id})-[r:indra_rel]-(b:BioEntity)
        WHERE r.stmt_type IN ['Activation','Inhibition']
          AND b.id STARTS WITH 'mesh:'
          AND NOT b.id IN $generic AND b.id <> $id
        RETURN b.id AS id, b.name AS name, b.type AS type, r.stmt_type AS type_,
               r.stmt_hash AS h, startNode(r).id = $id AS out
        """,
        id=cid,
        generic=list(GENERIC),
    )
    rows = read(rows)
    seen, out = set(), []
    for r in rows:
        if r["id"] in seen:
            continue
        seen.add(r["id"])
        out.append(r)
    return out


def landed(from_id, r):
    return {
        "from": from_id.upper() if from_id.startswith("hgnc") else from_id.upper(),
        "id": r["id"].upper(),
        "label": r["name"],
        "dir": "out" if r["out"] else "in",
        "type": r["type_"],
        "belief": r["belief"],
        "kind": r["type"],
    }


def indexed(term_id):
    rows = cypher(
        "MATCH (d:BioEntity)-[:has_indication]->(t:BioEntity {id:$id}) RETURN DISTINCT d.name AS name",
        id=term_id,
    )
    names = []
    seen = set()
    for r in rows:
        n = (r["name"] or "").strip()
        if not n or n.lower() in seen or len(n) > 34:
            continue
        seen.add(n.lower())
        names.append(n.title() if n.isupper() else n)
    return {"count": len(seen), "sample": names[:6]}


def lifestyle(term_ids):
    targets = list(term_ids) + list(LIFESTYLE_PROXY)
    rows = cypher(
        """
        MATCH (a:BioEntity)-[r:indra_rel]->(b:BioEntity)
        WHERE a.id IN $life AND b.id IN $targets AND r.stmt_type IN ['Activation','Inhibition']
        RETURN a.id AS a, b.id AS b, b.name AS bname, r.stmt_type AS t, r.stmt_hash AS h
        """,
        life=list(LIFESTYLE),
        targets=targets,
    )
    rows = read(rows)
    best = {}
    for r in rows:
        name, phrases = LIFESTYLE[r["a"]]
        phrase = phrases.get(r["t"])
        if not phrase:
            continue
        targets_ = LIFESTYLE_PROXY.get(r["b"], [r["b"]])
        if not any(t in term_ids for t in targets_):
            continue
        cur = best.get(phrase)
        glyph = "⊣" if r["t"] == "Inhibition" else "→"
        edge = f"{name} {glyph} {r['bname']} {r['belief']:.2f}"
        if cur is None:
            best[phrase] = {"do": phrase, "edges": [edge], "belief": r["belief"]}
        else:
            cur["edges"].append(edge)
            cur["belief"] = max(cur["belief"], r["belief"])
    return sorted(best.values(), key=lambda x: -x["belief"])


def measures(term_nodes):
    """What a blood draw or a device would observe for each emerged term:
    the panel analyte, in panel order, among *all* genes the record ties to it."""
    out = []
    seen = set()
    for t in term_nodes:
        tid = cid_of(t["id"])
        if tid in WEARABLE:
            if WEARABLE[tid] not in seen:
                seen.add(WEARABLE[tid])
                out.append({"do": WEARABLE[tid], "for": t["label"], "via": "device"})
            continue
        genes = pg.genes_for_term({"db": t["id"].split(":")[0], "id": t["id"].split(":")[1], "name": t["label"], "text": t["said"]})
        cands = []
        for gene, (_, kind) in genes.items():
            an = pg.ANALYTE_GENES.get(gene)
            if an and kind == "disease":
                cands.append((PANEL.index(an) if an in PANEL else len(PANEL), an, gene))
        for _, an, gene in sorted(cands)[:1]:
            if an.lower() in seen:
                continue
            seen.add(an.lower())
            out.append({"do": an, "for": t["label"], "via": gene})
    return out




def causal(said_ids, emerged_ids):
    """The factor graph among what was said and what emerged, plus one bounded
    hop upstream of each emerged term and downstream of each said term.
    Variables are MeSH nodes; factors are indra_rel relations with their evidence."""
    ids = list(dict.fromkeys([*said_ids, *emerged_ids]))
    labels = {}
    levels = {i: 0 for i in said_ids}
    for i in emerged_ids:
        levels.setdefault(i, 1)
    block = GENERIC | SYMPTOMS
    # one hop upstream of each emerged term
    for e in emerged_ids:
        for r in neighbours(e):
            if not r["out"] and r["type_"] == "Activation" and r["type"] == "disease" and r["id"] not in ids and r["id"] not in block:
                ids.append(r["id"]); levels[r["id"]] = 2; labels[r["id"]] = r["name"]
                break
    # one hop downstream of each said term
    for sd in said_ids:
        for r in neighbours(sd):
            if r["out"] and r["type_"] == "Activation" and r["type"] == "disease" and r["id"] not in ids and r["id"] not in block:
                ids.append(r["id"]); levels[r["id"]] = -1; labels[r["id"]] = r["name"]
                break
    # a said term keeps everything the record says about it, except the truly generic:
    # thin as each relation is, together they are the whole account of the person's word
    SAID_PER_DIRECTION = 3  # a rank, not a floor
    for sd in said_ids:
        taken = {"in": 0, "out": 0}
        for r in neighbours(sd):  # already ordered by belief
            if r["id"] in ids or r["id"] in GENERIC or r["type"] not in ("disease", "phenotype", "other", "biological_process"):
                continue
            if r["id"] in LIFESTYLE:
                continue  # lifestyle nodes are handled as actions
            d = "out" if r["out"] else "in"
            if d == "out" and r["id"] in SYMPTOMS:
                continue  # co-mentioned symptoms cluster downstream; they are not consequences
            if taken[d] >= SAID_PER_DIRECTION:
                continue
            taken[d] += 1
            ids.append(r["id"])
            levels[r["id"]] = 1 if not r["out"] else -1
            labels[r["id"]] = r["name"]
    # medications with a said term as a known side effect: an upstream cause the agent can ask about
    drug_nodes = {}
    for sd in said_ids:
        rows_ = cypher(
            "MATCH (d:BioEntity)-[:has_side_effect]->(p:BioEntity {id:$id}) RETURN DISTINCT d.name AS name",
            id=sd,
        )
        names = sorted({(r["name"] or "").strip() for r in rows_ if r["name"]})
        if not names:
            continue
        did = f"drugs:{sd}"
        ids.append(did)
        levels[did] = 2
        labels[did] = f"a medication — {len(names)} known"
        drug_nodes[did] = {"target": sd, "count": len(names), "names": names[:12]}
    rows = cypher(
        """
        MATCH (a:BioEntity)-[r:indra_rel]->(b:BioEntity)
        WHERE a.id IN $ids AND b.id IN $ids AND a.id <> b.id AND r.stmt_type IN ['Activation','Inhibition']
        RETURN a.id AS s, a.name AS sn, b.id AS t, b.name AS tn, r.stmt_type AS type, r.stmt_hash AS h
        """,
        ids=ids,
    )
    best = {}
    for r in read(rows):
        labels.setdefault(r["s"], r["sn"]); labels.setdefault(r["t"], r["tn"])
        k = (r["s"], r["t"], r["type"])
        if k not in best or r["belief"] > best[k]["belief"]:
            best[k] = {"source": r["s"].upper(), "target": r["t"].upper(), "type": r["type"], "belief": r["belief"]}
    for i in ids:
        if i not in labels:
            rows_ = cypher("MATCH (b:BioEntity {id:$id}) RETURN b.name AS name", id=i)
            labels[i] = rows_[0]["name"] if rows_ else i
    for did, d in drug_nodes.items():
        best[(did, d["target"], "Activation")] = {"source": did.upper(), "target": d["target"].upper(), "type": "Activation", "belief": SIDE_EFFECT_BELIEF, "drugs": d["names"]}
    nodes = []
    for i in ids:
        n = {"id": i.upper(), "label": labels[i], "level": levels[i], "said": i in said_ids}
        if i in drug_nodes:
            n["drugs"] = drug_nodes[i]["names"]
        nodes.append(n)
    edges = sorted(best.values(), key=lambda e: -e["belief"])
    return {"nodes": nodes, "edges": edges}


# ---------------------------------------------------------------------------
# The model: a binary factor graph over the variables the conversation built,
# grown under the data the person brings, with posteriors by Gibbs sampling.
#   variables  what was said, what emerged, one hop up/down (from causal()),
#              plus, per depth, the observations beneath the terms they observe
#   factors    indra_rel Activation as noisy-OR parents, Inhibition as noisy-AND-NOT;
#              belief is the belief model's reading of the statement, strength =
#              belief · s₀, capped — a literature prior, not an effect size
#   base rate  every variable leaks at BASE; nothing is certain from words
#   pruning    a closed observation drops its term; anything that reaches the
#              said terms only through a dropped node leaves the model
# ---------------------------------------------------------------------------
import random  # noqa: E402

BASE = 0.08
W_CAP = 0.9
OBS_W = 0.85  # how strongly a term shows in its observation
SWEEPS = 4000
BURN = 800
DEPTH_OF = {"wearable": "wearable", "blood": "blood", "genome": "genome", "methylation": "genome"}


S0 = 0.35  # assumed conditional strength of a relation the record is certain of


def strength(belief):
    """factor strength = belief · s₀ — existence times an assumed link strength.
    belief says the relation is real; s₀ says how much a real relation moves its effect."""
    return min(W_CAP, belief * S0)


def gibbs(nodes, parents, clamped, seed=7):
    """nodes: list of ids; parents: id -> [(pid, w, sign)] (+1 activation, -1 inhibition);
    clamped: id -> 0/1. Returns marginal P(x=1) for every node."""
    rng = random.Random(seed)
    x = {n: clamped.get(n, 1 if rng.random() < 0.3 else 0) for n in nodes}
    children = {n: [] for n in nodes}
    for c, ps in parents.items():
        for pid, w, sign in ps:
            children[pid].append((c, w, sign))

    def p_on(n, state):
        act = 1.0
        inh = 1.0
        for pid, w, sign in parents.get(n, []):
            if state[pid]:
                if sign > 0:
                    act *= 1 - w
                else:
                    inh *= 1 - w
        return (1 - (1 - BASE) * act) * inh

    def lik(n, val, state):
        # P(n=val | parents) · ∏ P(child | parents incl. n=val)
        s = dict(state)
        s[n] = val
        pr = p_on(n, s)
        l = pr if val else 1 - pr
        for c, _, _ in children[n]:
            pc = p_on(c, s)
            l *= pc if s[c] else 1 - pc
        return l

    counts = {n: 0 for n in nodes}
    free = [n for n in nodes if n not in clamped]
    for t in range(SWEEPS):
        for n in free:
            l1 = lik(n, 1, x)
            l0 = lik(n, 0, x)
            x[n] = 1 if rng.random() < l1 / (l1 + l0 + 1e-12) else 0
        if t >= BURN:
            for n in nodes:
                counts[n] += x[n]
    return {n: counts[n] / (SWEEPS - BURN) for n in nodes}


def reachable_to_said(nodes, edges, said, dropped):
    """nodes that reach a said node along any edge direction without passing through dropped."""
    adj = {n: set() for n in nodes}
    for e in edges:
        if e["source"] in adj and e["target"] in adj:
            adj[e["source"]].add(e["target"])
            adj[e["target"]].add(e["source"])
    seen = set(s for s in said if s not in dropped)
    stack = list(seen)
    while stack:
        n = stack.pop()
        for m in adj[n]:
            if m not in seen and m not in dropped:
                seen.add(m)
                stack.append(m)
    return seen


def edges_among(ids):
    rows = cypher(
        """
        MATCH (a:BioEntity)-[r:indra_rel]->(b:BioEntity)
        WHERE a.id IN $ids AND b.id IN $ids AND a.id <> b.id AND r.stmt_type IN ['Activation','Inhibition']
        RETURN a.id AS s, b.id AS t, r.stmt_type AS type, r.stmt_hash AS h
        """,
        ids=ids,
    )
    best = {}
    for r in read(rows):
        k = (r["s"], r["t"], r["type"])
        if k not in best or r["belief"] > best[k]["belief"]:
            best[k] = {"source": r["s"].upper(), "target": r["t"].upper(), "type": r["type"], "belief": r["belief"]}
    return list(best.values())


def one_sign_per_pair(edges):
    """One edge per unordered pair (the strongest sign and direction), then a DAG:
    edges admitted strongest-first, skipping any that would close a cycle.
    Text mining gives both signs and both directions for a pair; inference needs one."""
    best = {}
    for e in edges:
        k = frozenset((e["source"], e["target"]))
        if k not in best or e["belief"] > best[k]["belief"]:
            best[k] = e
    kept = []
    reach = {}  # node -> set of nodes reachable from it

    def reaches(a, b):
        seen, stack = set(), [a]
        while stack:
            n = stack.pop()
            if n == b:
                return True
            for m in reach.get(n, ()):
                if m not in seen:
                    seen.add(m)
                    stack.append(m)
        return False

    for e in sorted(best.values(), key=lambda e: -e["belief"]):
        if reaches(e["target"], e["source"]):
            continue
        kept.append(e)
        reach.setdefault(e["source"], set()).add(e["target"])
    return kept


def build_model(causal_, deeper_script):
    """Per depth: scope, observations, pruning, posteriors."""
    vars_ = {n["id"]: dict(n, kind="var") for n in causal_["nodes"]}
    edges = one_sign_per_pair(causal_["edges"])
    said = [n["id"] for n in causal_["nodes"] if n["said"]]
    depths = []
    clamped = {sid: 1 for sid in said}  # what was said is observed, not hypothesised
    dropped = set()
    obs_nodes = {}

    def snapshot(depth):
        ids = [i for i in vars_ if i not in dropped] + [i for i in obs_nodes if obs_nodes[i]["parent"] not in dropped]
        parents = {i: [] for i in ids}
        for e in edges:
            if e["source"] in parents and e["target"] in parents:
                parents[e["target"]].append((e["source"], strength(e["belief"]), 1 if e["type"] == "Activation" else -1))
        for oid, o in obs_nodes.items():
            if oid in parents:
                parents[oid].append((o["parent"], OBS_W, 1))
        post = gibbs(ids, parents, {k: v for k, v in clamped.items() if k in parents})
        out_nodes = []
        for i in ids:
            if i in vars_:
                n = vars_[i]
                state = "observed" if i in clamped and clamped[i] == 1 else ("closed" if i in clamped else "inferred")
                out_nodes.append({"id": i, "label": n["label"], "level": n["level"], "said": n["said"], "kind": "var", "state": state, "p": round(post[i], 3)})
            else:
                o = obs_nodes[i]
                out_nodes.append({"id": i, "label": o["label"], "value": o["value"], "parent": o["parent"], "kind": "obs",
                                  "state": "observed" if o["present"] else "closed", "p": 1.0 if o["present"] else 0.0})
        for i in list(dropped):
            n = vars_.get(i)
            if n:
                out_nodes.append({"id": i, "label": n["label"], "level": n["level"], "said": n["said"], "kind": "var", "state": "pruned", "p": 0.0})
        # a closed observation prunes its term, but the evidence that closed it stays drawn
        for oid, o in obs_nodes.items():
            if o["parent"] in dropped:
                out_nodes.append({"id": oid, "label": o["label"], "value": o["value"], "parent": o["parent"], "kind": "obs",
                                  "state": "closed", "p": 0.0})
        out_edges = [dict(e, w=round(strength(e["belief"]), 3)) for e in edges if e["source"] in parents and e["target"] in parents]
        out_edges += [{"source": o["parent"], "target": oid, "type": "Observation", "belief": 1.0, "w": OBS_W} for oid, o in obs_nodes.items() if oid in parents or o["parent"] in dropped]
        # the question that narrows each phrase: its highest-posterior cause the data has not touched
        asks = []
        for sid in said:
            cands = []
            for e in out_edges:
                if e["target"] != sid or e["type"] == "Observation":
                    continue
                src = e["source"]
                n = next((x for x in out_nodes if x["id"] == src), None)
                if not n or n["state"] != "inferred":
                    continue
                key = "drugs" if src.startswith("DRUGS:") else cid_of(src)
                text = QUESTIONS.get(key)
                if not text:
                    continue
                cands.append((n["p"], src, text))
            cands.sort(key=lambda c: -c[0])
            asks += [{"for": sid, "about": src, "text": text, "p": round(pp, 3)} for pp, src, text in cands[:2]]
        depths.append({"depth": depth, "nodes": out_nodes, "edges": out_edges, "asks": asks})

    snapshot("words")
    for d in deeper_script:
        depth = DEPTH_OF[d["brings"][0]]
        for f in d["finds"]:
            tid = f["term"].upper()
            if tid not in vars_:
                rows = cypher("MATCH (b:BioEntity {id:$id}) RETURN b.name AS name", id=f["term"])
                vars_[tid] = {"id": tid, "label": rows[0]["name"] if rows else tid, "level": 1, "said": False, "kind": "var"}
                # its factors to what is already in the model
                edges = one_sign_per_pair(edges + [e for e in edges_among([cid_of(i) for i in vars_]) if tid in (e["source"], e["target"])])
            for k, (label, value, present) in enumerate(f.get("obs", [])):
                oid = f"OBS:{tid}:{k}"
                obs_nodes[oid] = {"label": label, "value": value, "present": bool(present), "parent": tid}
                clamped[oid] = 1 if present else 0
            if f["state"] == "closed":
                clamped[tid] = 0
            elif f["state"] == "open":
                clamped[tid] = 1
        # prune: closed terms and whatever reaches the said terms only through them
        closed = {i for i, v in clamped.items() if v == 0 and i in vars_}
        keep = reachable_to_said(list(vars_), edges, said, closed)
        for i in list(vars_):
            if i not in keep and not vars_[i]["said"]:
                dropped.add(i)
        snapshot(depth)
    return {"depths": depths, "notes": {"base": BASE, "belief": "ev/(ev+10), placeholder for the belief model", "strength": "belief · s₀ (0.35), cap 0.9", "sampler": f"Gibbs, {SWEEPS} sweeps, {BURN} burn-in"}}


def posterior_line(model_depth, prev_depth):
    """A sentence the replies can carry: the most probable open branch, and what closed."""
    now = {n["id"]: n for n in model_depth["nodes"] if n["kind"] == "var"}
    before = {n["id"]: n for n in prev_depth["nodes"] if n["kind"] == "var"} if prev_depth else {}
    live = sorted([n for n in now.values() if n["state"] != "pruned" and not n["said"] and n["level"] == 1], key=lambda n: -n["p"])
    closed = [n["label"].lower() for n in now.values() if n["state"] == "pruned" and before.get(n["id"], {}).get("state") != "pruned"]
    parts = []
    if live:
        top = live[0]
        parts.append(f"{top['label']} is now the most likely branch, {int(round(top['p'] * 100))} in a hundred")
    if closed:
        parts.append(f"{join(closed)} {'is' if len(closed) == 1 else 'are'} off the table")
    return ("; ".join(parts) + ".") if parts else ""


def join(items):
    items = list(items)
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " and " + items[-1]


def article(m):
    if m.startswith("a ") or m.startswith("an "):
        return m
    return f"an {m}" if m[0].lower() in "aeiou" else f"a {m}"


def resolve(j):
    log(f"== {j['id']}")
    turns = []
    pending = defaultdict(list)  # turn index -> lands
    grounded = {}  # curie -> grounding
    said_ids = []

    for i, t in enumerate(j["dialogue"]):
        if "you" in t:
            grounds, none = [], list(t.get("none", []))
            for said, query in t.get("ground", []):
                g = pg.ground(query)
                if not g:
                    none.append(said)
                    log(f"   ✗ {query!r}")
                    continue
                cid = curie(g)
                grounds.append({"id": cid.upper(), "label": g["name"], "score": g["score"], "said": said})
                grounded[cid] = g
                said_ids.append(cid)
                log(f"   {said!r} → {cid} {g['name']} {g['score']}")
                nb = [r for r in neighbours(cid) if r["id"] not in SYMPTOMS]
                # hypotheses are what causes this: incoming Activation, diseases only —
                # genes, devices and trial co-mentions never land in the person's gloss
                top = [r for r in nb if not r["out"] and r["type_"] == "Activation" and r["type"] == "disease"][:LANDS_PER_GROUND]
                lands = [landed(cid, r) for r in top]
                # the best-believed outgoing edge is followed one hop to a disease
                for r in nb:
                    if r["out"] and r["type_"] == "Activation" and r["type"] == "disease":
                        lands.append(landed(cid, r))
                        hop = [
                            x for x in neighbours(r["id"])
                            if x["out"] and x["type"] == "disease" and x["type_"] == "Activation" and x["id"] not in SYMPTOMS
                        ][:1]
                        lands += [landed(r["id"], x) for x in hop]
                        break
                pending[i + DELAY] += lands
            turns.append({"who": "you", "text": t["you"], "grounds": grounds, "ungrounded": none})
        elif "agent" in t:
            turns.append({"who": "agent", "text": t["agent"]})
    # deliver landings; anything past the end lands on the last 'you' turn
    last_you = max(k for k, t in enumerate(turns) if t["who"] == "you")
    for k, lands in sorted(pending.items()):
        turns[min(k, last_you)].setdefault("lands", []).extend(lands)

    # emerged: disease nodes that landed, ranked by belief
    weight = Counter()
    label = {}
    for t in turns:
        for l in t.get("lands", []):
            if l["kind"] == "disease" and cid_of(l["id"]) not in grounded and cid_of(l["id"]) not in SYMPTOMS:
                weight[l["id"]] += l["belief"]
                label[l["id"]] = l["label"]
    emerged = [k for k, _ in weight.most_common(EMERGED)]
    log(f"   emerged: {[label[k] for k in emerged]}")

    # the graph beneath them, via the existing generator
    concern = pg.build(
        {"id": j["id"], "said": j["said"], "terms": [label[k] for k in emerged], "wearable": [label[k] for k in emerged if cid_of(k) in WEARABLE]}
    )
    term_nodes = [n for n in concern["nodes"] if n["level"] == "body"]
    concern["causal"] = causal(said_ids, [cid_of(n["id"]) for n in term_nodes])
    log(f"   causal: {len(concern['causal']['nodes'])} variables, {len(concern['causal']['edges'])} factors")
    concern["model"] = build_model(concern["causal"], j["deeper"])
    for dpt in concern["model"]["depths"]:
        top = sorted([n for n in dpt["nodes"] if n["kind"] == "var" and n["state"] != "pruned"], key=lambda n: -n["p"])[:3]
        log(f"   model {dpt['depth']}: {len(dpt['nodes'])} nodes; top {[(n['label'], n['p']) for n in top]}")
    for n in term_nodes:
        n["interventions"] = indexed(cid_of(n["id"]))

    term_ids = {cid_of(n["id"]) for n in term_nodes} | set(said_ids)
    safe = lifestyle(term_ids)
    meas = measures(term_nodes)
    log(f"   safe: {[s['do'] for s in safe]}")
    log(f"   measure: {[m['do'] for m in meas]}")

    # the reply, assembled
    ask = next(t["ask"] for t in j["dialogue"] if "ask" in t)
    parts = []
    if safe:
        if len(safe) == 1:
            parts.append(f"One thing you can start now, and it’s safe: {safe[0]['do']}.")
        else:
            n = {2: "Two things", 3: "Three things"}.get(len(safe), "A few things")
            parts.append(f"{n} you can start now, and they’re safe: {'; '.join(s['do'] for s in safe)}.")
    if meas:
        parts.append(f"Before guessing further I’d want {join(article(m['do']) for m in meas)}.")
    parts.append(ask)
    thinks = "; ".join([*(", ".join(s["edges"]) for s in safe), *(f"{m['do']} via {m['via']} ({m['for']})" for m in meas)])
    turns.append({"who": "agent", "text": " ".join(parts), "thinks": thinks})

    ledgers = [
        {"depth": "system", "items": [{"do": s["do"]} for s in safe] + [{"do": m["do"]} for m in meas]},
    ]

    # deeper: authored findings, computed treatments
    deeper = []
    lines = {}  # term/action key -> current line
    for sfe in safe:
        lines[sfe["do"]] = sfe["do"]
    node_by = {cid_of(n["id"]): n for n in term_nodes}
    for t in turns:
        for l in t.get("lands", []):
            node_by.setdefault(cid_of(l["id"]), {"id": cid_of(l["id"]), "label": l["label"], "interventions": None})
    for cid, g in grounded.items():
        node_by.setdefault(cid, {"id": cid, "label": g["name"], "interventions": None})

    def lookup(cid):
        if cid not in node_by:
            rows = cypher("MATCH (b:BioEntity {id:$id}) RETURN b.name AS name", id=cid)
            node_by[cid] = {"id": cid, "label": rows[0]["name"] if rows else cid, "interventions": None}
        n = node_by[cid]
        if n["interventions"] is None:
            n["interventions"] = indexed(n["id"] if ":" in n["id"] and n["id"][:5] == "mesh:" else cid_of(n["id"]))
        return n

    depth_of = {"wearable": None, "blood": "blood", "genome": "genome", "methylation": "genome"}
    for d in j["deeper"]:
        deeper.append({"who": "you", "text": d["you"], "brings": d["brings"]})
        # what the person hears: what their data showed, and the next step. what the
        # agent holds — posteriors, what the index carries — goes to `thinks`.
        sentences, held, changes = [], [], {}
        for f in d["finds"]:
            n = lookup(f["term"])
            name = n["label"]
            sentences.append(f["showed"][0].upper() + f["showed"][1:] + ".")
            changes[name] = f["showed"] if f["state"] == "open" else f"{f['showed']} — closed"
            if f["state"] == "open":
                rx = n["interventions"]
                held.append(f"{name.lower()}: {join(x.lower() for x in rx['sample'][:2]) or 'nothing indexed'}, {rx['count']} indexed" if rx["sample"] else f"{name.lower()}: nothing indexed")
            else:
                held.append(f"{name.lower()}: closed")
        dpts = concern["model"]["depths"]
        di = len(deeper) // 2  # this deeper exchange index (you+agent pairs)
        if di + 1 < len(dpts):
            pl = posterior_line(dpts[di + 1], dpts[di])
            if pl:
                held.append(pl.rstrip("."))
        reply = " ".join(sentences) + " " + d["ask"]
        deeper.append({"who": "agent", "text": reply, "thinks": "; ".join(held)})
        depth = depth_of[d["brings"][0]]
        items = []
        for key, line in changes.items():
            it = {"do": line}
            if key in lines and lines[key] != line:
                it["was"] = lines[key]
            items.append(it)
            lines[key] = line
        if depth:
            carried = [{"do": v} for k, v in lines.items() if k not in changes and k in {sfe["do"] for sfe in safe}]
            ledgers.append({"depth": depth, "items": items + carried})
    ledgers.append({"depth": "dish", "items": [{"do": j["dish"]}]})

    return {"journey": {"dialogue": turns, "deeper": deeper, "ledgers": ledgers}, "concern": concern}


if __name__ == "__main__" and "--model-only" in sys.argv:
    here = os.path.dirname(os.path.abspath(__file__))
    cpath = os.path.join(here, "..", "src", "lib", "data", "concerns.json")
    jpath = os.path.join(here, "..", "src", "lib", "data", "journeys.json")
    concerns = json.load(open(cpath))
    jdoc = json.load(open(jpath))
    scripts = {j["id"]: j for j in JOURNEYS}
    for c in concerns:
        c["model"] = build_model(c["causal"], scripts[c["id"]]["deeper"])
        dpts = c["model"]["depths"]
        for dpt in dpts:
            top = sorted([n for n in dpt["nodes"] if n["kind"] == "var" and n["state"] != "pruned"], key=lambda n: -n["p"])[:3]
            log(f"{c['id']} {dpt['depth']}: {len(dpt['nodes'])} nodes; top {[(n['label'], n['p']) for n in top]}")
        # the posterior into what the agent holds, never into what it says
        deeper = jdoc["journeys"][c["id"]]["deeper"]
        agents = [t for t in deeper if t["who"] == "agent"]
        for k, t in enumerate(agents):
            if k + 1 < len(dpts):
                pl = posterior_line(dpts[k + 1], dpts[k])
                if pl:
                    kept = [h for h in t.get("thinks", "").split("; ") if h and "most likely branch" not in h and "off the table" not in h]
                    t["thinks"] = "; ".join(kept + [pl.rstrip(".")])
    json.dump(concerns, open(cpath, "w"), ensure_ascii=False, indent=1)
    json.dump(jdoc, open(jpath, "w"), ensure_ascii=False, indent=1)
    sys.exit(0)

if __name__ == "__main__" and "--causal-only" in sys.argv:
    here = os.path.dirname(os.path.abspath(__file__))
    cpath = os.path.join(here, "..", "src", "lib", "data", "concerns.json")
    jpath = os.path.join(here, "..", "src", "lib", "data", "journeys.json")
    concerns = json.load(open(cpath))
    journeys = json.load(open(jpath))["journeys"]
    for c in concerns:
        said = [cid_of(g["id"]) for t in journeys[c["id"]]["dialogue"] for g in t.get("grounds", [])]
        emerged = [cid_of(n["id"]) for n in c["nodes"] if n["level"] == "body"]
        c["causal"] = causal(said, emerged)
        log(f"{c['id']}: {len(c['causal']['nodes'])} variables, {len(c['causal']['edges'])} factors")
    json.dump(concerns, open(cpath, "w"), ensure_ascii=False, indent=1)
    sys.exit(0)

if __name__ == "__main__":
    journeys, concerns = {}, []
    for j in JOURNEYS:
        r = resolve(j)
        journeys[j["id"]] = r["journey"]
        concerns.append(r["concern"])
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "..", "src", "lib", "data", "concerns.json"), "w") as f:
        json.dump(concerns, f, ensure_ascii=False, indent=1)
    json.dump({"generated": time.strftime("%Y-%m-%d"), "journeys": journeys}, sys.stdout, ensure_ascii=False, indent=1)
