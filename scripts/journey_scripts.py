"""
The authored half of each journey: what the person says, which phrases the
agent tries to ground, what the agent asks (its discretion), and what data
the person brings later with the values it showed — each `finds` entry carries
`obs`: (label, value, present) observations that become variables beneath the term. Everything else — what
grounds, what lands, what emerges, what is safe now, what to measure, what
is indexed — is resolved from INDRA CoGEx by resolve_journeys.py.

A 'you' turn: text, ground = [(said phrase, grounding query)], none = phrases
the agent could not ground. An 'agent' turn: text (a question). The final
agent turn of the dialogue is `ask`: the follow-up appended to the assembled
reply. Deeper turns bring holdings and `finds`: per emerged term, what the
data showed and whether the branch is open or closed.
"""

JOURNEYS = [
    {
        "id": "tired",
        "said": "I’m tired all the time.",
        "dialogue": [
            {"you": "I’m tired all the time.", "ground": [("tired", "fatigue")]},
            {"agent": "How do you sleep? And any bleeding — heavy periods, anything like that?"},
            {
                "you": "Badly. My partner says I snore. And yes, heavy.",
                "ground": [("snore", "snoring"), ("heavy", "heavy periods")],
                "none": ["badly"],
            },
            {"agent": "Do you eat much meat? And has your weight changed at all, without you meaning it to?"},
            {
                "you": "Not much meat. Gained, without changing anything.",
                "ground": [("gained", "weight gain")],
                "none": ["not much meat"],
            },
            {"agent": "How long has this been going on?"},
            {"you": "More than a year.", "none": ["more than a year"]},
            {"ask": "Which of those is easiest for you?"},
        ],
        "deeper": [
            {
                "you": "I wore a sleep tracker for a week.",
                "brings": ["wearable"],
                "finds": [
                    {"term": "mesh:D020181", "showed": "your oxygen dips at night, and your sleep is broken up", "state": "open",
                     "obs": [("SpO₂ dips", "nightly", True), ("fragmented sleep", "6 of 7 nights", True)]},
                ],
                "ask": "I still want the blood.",
            },
            {
                "you": "Got the blood panel back.",
                "brings": ["blood"],
                "finds": [
                    {"term": "mesh:D018798", "showed": "ferritin 9, hemoglobin holding", "state": "open",
                     "obs": [("ferritin", "9 ng/mL", True), ("hemoglobin", "12.4 g/dL", False)]},
                    {"term": "mesh:D007037", "showed": "TSH 6.1", "state": "open", "obs": [("TSH", "6.1 mIU/L", True)]},
                    {"term": "mesh:D014806", "showed": "B12 fine", "state": "closed", "obs": [("B12", "410 pg/mL", False)]},
                ],
                "ask": "Your periods need their own look — that is where the iron is going.",
            },
            {
                "you": "I had my genome done last year.",
                "brings": ["genome", "methylation"],
                "finds": [
                    {"term": "mesh:D007037", "showed": "nothing on IGSF1, so the TSH is one to trust", "state": "open",
                     "obs": [("IGSF1", "no variant", False)]},
                    # TMPRSS6 ⊣ Anemia, Iron-Deficiency — indra_rel, 9 ev (CoGEx 2026-08-30):
                    # the IRIDA axis; unsuppressed hepcidin, oral iron does not absorb
                    {"term": "mesh:D018798", "showed": "TMPRSS6 carries a variant — iron by mouth may not absorb", "state": "open",
                     "obs": [("TMPRSS6", "variant found", True)]},
                ],
                "ask": "If the ferritin will not climb on the plate, it is an infusion conversation. Nothing here changes the sleep.",
            },
        ],
        "dish": "how much of the fatigue is the apnea, and how much the iron",
    },
    {
        "id": "heart",
        "said": "My father had a heart attack at 52.",
        "dialogue": [
            {
                "you": "My father had a heart attack at 52.",
                "ground": [("heart attack", "heart attack"), ("my father", "family history of heart disease")],
            },
            {"agent": "Was that his only one? And anyone else on that side — strokes, stents, bypasses?"},
            {
                # "stents" stays ungrounded on purpose: it is the uncle's device, not this body —
                # grounding it pulled trial co-mentions (3D printing, cautery) into the model
                "you": "First and only. His brother had stents at 60. Me — I get winded on stairs now.",
                "ground": [("winded", "dyspnea")],
                "none": ["stents"],
            },
            {"agent": "Does the wind come with any tightness? And do you smoke, or did you?"},
            {
                "you": "No tightness. I smoked twenty years — quit five back. And a work physical once called my sugar borderline.",
                "ground": [("smoked", "smoking"), ("sugar borderline", "prediabetes")],
                "none": ["no tightness"],
            },
            {"agent": "How do you sleep through all of this?"},
            {
                "you": "Five hours, most nights. Work runs hot.",
                "ground": [("five hours", "sleep deprivation")],
                "none": ["work runs hot"],
            },
            {"ask": "Have you ever had a lipid panel yourself?"},
        ],
        "deeper": [
            {
                "you": "I have a watch and a cuff.",
                "brings": ["wearable"],
                "finds": [
                    {"term": "mesh:D006973", "showed": "resting rate and pressure fine", "state": "closed",
                     "obs": [("home pressure", "118/76", False), ("resting rate", "58", False)]},
                    {"term": "mesh:D012892", "showed": "the short sleep is real — five hours twelve, most nights", "state": "open",
                     "obs": [("sleep", "5h12m avg", True)]},
                ],
                "ask": "The cuff clears the pressure; it says nothing about your cholesterol. Get the draw done.",
            },
            {
                "you": "Blood panel is back.",
                "brings": ["blood"],
                "finds": [
                    {"term": "mesh:D006937", "showed": "ApoB 148, Lp(a) 120 — both high, in the way that runs in families", "state": "open",
                     "obs": [("ApoB", "148 mg/dL", True), ("Lp(a)", "120 nmol/L", True)]},
                    {"term": "mesh:D011236", "showed": "HbA1c 5.9 — the borderline was real", "state": "open",
                     "obs": [("HbA1c", "5.9%", True)]},
                ],
                "ask": "See your doctor this month.",
            },
            {
                "you": "I sent off a genome.",
                "brings": ["genome", "methylation"],
                "finds": [
                    {"term": "mesh:D006938", "showed": "one copy of an LDLR variant: familial hypercholesterolemia", "state": "open",
                     "obs": [("LDLR", "one copy, pathogenic", True)]},
                ],
                "ask": "The lipids and the sugar are two different fights, and the variant only owns the first. Your children should be tested by the time they’re ten.",
            },
        ],
        "dish": "how this LDLR variant handles PCSK9 inhibition in your cells",
    },
    {
        "id": "ninety",
        "said": "I want to stay sharp at ninety.",
        "dialogue": [
            {"you": "I want to stay sharp at ninety.", "ground": [("sharp", "sharp")]},
            {"agent": "Sharp how — memory, attention, mood?"},
            {
                "you": "I don’t want to lose my memory. My grandmother did, in her eighties.",
                "ground": [("lose my memory", "memory loss"), ("lose my memory", "dementia")],
                "none": ["my grandmother did"],
            },
            {"agent": "How’s your hearing? Your blood pressure? Your sleep?"},
            {
                "you": "Hearing’s going. Pressure is “a bit high.” Sleep is fine.",
                "ground": [("hearing’s going", "hearing loss"), ("a bit high", "high blood pressure")],
            },
            {"agent": "When your grandmother lost hers — was it gradual, or after something like a stroke?"},
            {"you": "Gradual, I think. Nobody ever said.", "none": ["gradual"]},
            {"ask": "Would you get your hearing tested, and show me your pressure over a few weeks?"},
        ],
        "deeper": [
            {
                "you": "I’ve been wearing a tracker.",
                "brings": ["wearable"],
                "finds": [{"term": "mesh:D012892", "showed": "sleep really is fine; you don’t move much", "state": "closed",
                     "obs": [("sleep", "7.4 h, unbroken", False), ("steps", "2,900 a day", True)]}],
                "ask": "Thirty minutes of walking a day is the strongest thing on this list.",
            },
            {
                "you": "Blood panel.",
                "brings": ["blood"],
                "finds": [
                    {"term": "mesh:D006973", "showed": "your home readings are high enough to treat", "state": "open",
                     "obs": [("home pressure", "146/91", True), ("cystatin C", "0.9 mg/L", False)]},
                ],
                "ask": "There is a blood test for the amyloid side now — p-tau — if you want to know.",
            },
            {
                "you": "Genome and a methylation clock.",
                "brings": ["genome", "methylation"],
                "finds": [
                    {"term": "mesh:D000544", "showed": "one copy of APOE ε4; the clock runs three years fast", "state": "open",
                     "obs": [("APOE", "ε3/ε4", True), ("methylation clock", "+3.1 years", True)]},
                ],
                "ask": "Neither changes what to do this year. It changes how much it matters.",
            },
        ],
        "dish": "whether your ε4 neurons clear amyloid under the drugs on offer",
    },
]


# How the agent asks about a variable when the model wants it narrowed.
# Keyed by CoGEx id; "drugs" is the medication variable of any said term.
QUESTIONS = {
    "drugs": "Are you on anything — for sleep, pain, mood, blood pressure?",
    "mesh:D020181": "Does anyone say you stop breathing at night, or do you wake gasping?",
    "mesh:D012892": "How many hours do you actually sleep, and is it broken?",
    "mesh:D000740": "Have you ever been told you were anaemic? Any dizziness standing up?",
    "mesh:D018798": "Have you ever been low on iron?",
    "mesh:D007037": "Cold when others aren’t? Dry skin, hair thinning?",
    "mesh:D009765": "Has your weight changed over the last few years?",
    "mesh:D007333": "Any family history of diabetes? Ever had your sugar checked?",
    "mesh:D007889": "Are your periods heavier or longer than they used to be? Any pelvic pressure?",
    "mesh:D062788": "Is there pain with the bleeding?",
    "mesh:D006470": "Any other bleeding — gums, nose, bruising easily?",
    "mesh:D009103": "Any numbness, blurred vision, or weakness that comes and goes?",
    "mesh:D064806": "Any gut trouble — bloating, changes in your bowels?",
    "mesh:D000860": "Do you get short of breath doing things you used to manage?",
    "mesh:D006949": "Do you know your cholesterol?",
    "mesh:D000073865": "Do you smoke?",
    "mesh:D012907": "Do you smoke, or did you?",
    "mesh:D024821": "Any high blood pressure, high sugar, or weight around the middle?",
    "mesh:D006973": "Do you know your blood pressure?",
    "mesh:D050197": "Any chest tightness on exertion?",
    "mesh:D013927": "Any clots — in a leg, a lung — in you or the family?",
    "mesh:D006333": "Any breathlessness lying flat, or swollen ankles?",
    "mesh:D020521": "Anyone in the family had a stroke?",
    "mesh:D001281": "Does your heart ever race or flutter for no reason?",
    "mesh:D006937": "Has anyone ever told you your cholesterol was high?",
    "mesh:D006938": "Anyone in the family with very high cholesterol young, or a heart attack before 55?",
    "mesh:D000544": "Anyone in the family with Alzheimer’s, and at what age?",
    "mesh:D034381": "How is your hearing — do people say you turn the TV up?",
    "mesh:D001930": "Ever had a head injury that knocked you out?",
    "mesh:D003704": "Have you noticed memory slips others have remarked on?",
    "mesh:D007511": "Any episodes of weakness or slurred speech, even brief?",
}
