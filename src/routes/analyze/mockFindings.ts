export const mockFindings = [
  {
    "pattern": {
      "gene_list": [
        "PLEC1"
      ],
      "personally_associated_genes": [
        "PLEC1"
      ],
      "summary": "Decreased methylation within the PLEC1 gene in blood cells may enhance cytoskeleton function, potentially influencing cell structure and resilience in healthy adults.",
      "direction": "hypo"
    },
    "description": "This methylation pattern in blood cells reflects the regulation of the PLEC1 gene, which encodes plectin, a critical protein for maintaining the cytoskeleton. While originally identified in buccal cells in the context of handedness studies, the underlying mechanism involves fundamental cytoskeleton organization relevant to all cell types, including blood cells. The measurement indicates potentially increased activity of PLEC1 in blood cells due to hypomethylation, suggesting a potential enhancement of cytoskeleton function. This interpretation is supported by extensive research on plectin's role in providing structural stability to cells, mediating cell adhesion, and influencing cell migration, all of which are important for cellular integrity and function in healthy adults.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Cytoskeleton organization",
        "Cell adhesion",
        "Cell migration",
        "Mechanical stability of cells"
      ],
      "conservedPathways": [
        "Cytoskeleton organization pathways",
        "Integrin signaling pathways",
        "Cellular stress response pathways"
      ],
      "commonCellularRoles": [
        "Maintaining cell shape and structural integrity in blood cells and other tissues",
        "Facilitating cell movement and tissue organization",
        "Providing resistance to mechanical stress and maintaining cellular resilience"
      ],
      "evolutionaryContext": "Highly conserved across metazoans, highlighting its fundamental role in cellular structure and function.",
      "tissueContext": "Expressed in various tissues, including blood cells, where it contributes to cell shape, flexibility, and interaction with the extracellular matrix.",
      "regulatoryNetwork": {
        "upstream": [
          "Epigenetic modifiers (potentially influenced by mechanical cues and cellular environment)",
          "Cellular signaling pathways affecting cytoskeleton dynamics (e.g., growth factor signaling, stress response)"
        ],
        "downstream": [
          "Cytoskeleton proteins (actin, vimentin, intermediate filaments)",
          "Cell adhesion molecules (integrins, cadherins)",
          "Cellular structural components and signaling scaffolds"
        ],
        "feedback": [
          "Mechanical stress and cell shape can influence PLEC1 expression and methylation, creating a dynamic regulatory loop."
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "PLEC1",
          "gene_name": "PLEC1",
          "description": "Hypomethylation within the PLEC1 gene body observed in buccal cells, associated with handedness, suggesting potential broader impacts on cytoskeleton regulation across tissues, including blood cells.",
          "chromosome": "chr8",
          "position": 143818187,
          "context": "gene body",
          "studyIds": [
            "10.21203/RS.3.RS-375556/V1",
            "10.1038/s41598-022-08998-0"
          ],
          "direction": "hypo",
          "matchStrength": 0.828,
          "modifyingFactors": [
            {
              "factor": "Mechanical stress on cells",
              "effect": "Potential modulation of PLEC1 expression and cytoskeleton function in response to varying levels of mechanical stress.",
              "interventionPotential": "Regular physical activity and targeted physical therapies to promote healthy mechanical signaling."
            }
          ],
          "modes": [
            {
              "center": 0.4142356577173029,
              "spread": 0.018607282301711468,
              "density": 132.00088183421514
            },
            {
              "center": 0.9367832738123122,
              "spread": 0.007558770504859915,
              "density": 8.999118165784832
            }
          ],
          "personal_metrics": {
            "name": "PLEC1",
            "value": 0.06817078590393066,
            "methylation_state": "hypo",
            "confidence": 0.9309526487537634,
            "distribution_type": "bimodal",
            "deviations": {
              "mode_deviation": -18.598356611246864,
              "weighted_deviation": -2454.999473351791,
              "median_deviation": -24.14168796211989
            },
            "percentile": 0.1716142112543007
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.21203/RS.3.RS-375556/V1",
            "totalSubjects": 946,
            "studyPopulationSummary": [
              {
                "groupName": "NTR_children_buccal",
                "count": 946,
                "description": "Children from the Netherlands Twin Register (NTR) with DNA methylation data from buccal cells."
              }
            ],
            "populationContext": "Study of handedness in children using buccal cell methylation from twin cohorts.",
            "effectSizes": []
          },
          {
            "studyId": "10.1038/s41598-022-08998-0",
            "totalSubjects": 6665,
            "studyPopulationSummary": [
              {
                "groupName": "Meta-analysis of multiple cohorts",
                "count": 6665,
                "description": "Meta-analysis including NTR children and adults, ALSPAC children and adults, examining DNA methylation and handedness."
              }
            ],
            "populationContext": "Meta-analysis across multiple cohorts to investigate the epigenetic basis of handedness.",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Engage in regular physical activity, incorporating diverse movements that challenge balance and coordination, to support robust cytoskeleton function and enhance cellular resilience.",
        "lucideIcon": "activity",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Physical activity provides mechanical stimuli that can positively modulate cytoskeleton dynamics and potentially enhance PLEC1 activity in blood cells, contributing to overall cellular health.",
        "specificActions": [
          "Include weight-bearing exercises such as walking, jogging, or dancing at least 3 times per week for 30-45 minutes.",
          "Practice balance-focused activities like yoga, tai chi, or Pilates 2-3 times per week.",
          "Incorporate varied movements into daily routines, such as climbing stairs or gardening, to promote diverse mechanical loading on cells."
        ],
        "monitoringMetrics": [],
        "contraindications": [],
        "supportingEvidence": [
          "Studies linking PLEC1 methylation to cytoskeleton function (10.21203/RS.3.RS-375556/V1, 10.1038/s41598-022-08998-0).",
          "Extensive literature supporting the beneficial effects of mechanical stress and physical activity on cellular function and cytoskeleton integrity."
        ]
      },
      {
        "recommendation": "Consume a nutrient-dense diet rich in vitamin C, proline, and lysine, alongside minerals like zinc and copper, to provide essential building blocks and cofactors for optimal cytoskeleton protein synthesis and maintenance.",
        "lucideIcon": "carrot",
        "strength": "Moderate",
        "source": "context",
        "rationale": "Adequate intake of specific nutrients supports the synthesis and stability of collagen and other cytoskeleton components, ensuring a resilient cellular structure.",
        "specificActions": [
          "Increase consumption of vitamin C-rich foods like citrus fruits, bell peppers, and berries daily.",
          "Include protein sources rich in lysine and proline such as lean meats, poultry, fish, eggs, and dairy products in each meal.",
          "Incorporate zinc and copper-rich foods like nuts, seeds, whole grains, and shellfish into your weekly diet."
        ],
        "monitoringMetrics": [],
        "contraindications": [],
        "supportingEvidence": [
          "Established knowledge of nutritional requirements for collagen and connective tissue synthesis.",
          "Research highlighting the roles of vitamin C, proline, lysine, zinc, and copper in cellular structure and enzymatic processes related to cytoskeleton maintenance."
        ]
      },
      {
        "recommendation": "Maintain consistent hydration throughout the day and ensure adequate electrolyte intake, particularly sodium, potassium, and magnesium, to support cellular volume regulation and optimal cytoskeleton dynamics.",
        "lucideIcon": "droplets",
        "strength": "General",
        "source": "general",
        "rationale": "Proper hydration and electrolyte balance are fundamental for cellular homeostasis, directly impacting cytoskeleton function, cell signaling, and overall cellular health.",
        "specificActions": [
          "Drink water consistently throughout the day, aiming for at least 8 glasses, and adjust intake based on activity level and environmental conditions.",
          "Consume electrolyte-rich foods such as bananas, leafy greens, yogurt, and coconut water regularly, especially after physical activity or in hot weather.",
          "Monitor urine color and thirst levels to gauge hydration status and adjust fluid and electrolyte intake accordingly."
        ],
        "monitoringMetrics": [],
        "contraindications": [],
        "supportingEvidence": [
          "General scientific consensus and established health guidelines emphasizing the importance of hydration and electrolyte balance for overall physiological function.",
          "Research demonstrating the critical role of hydration and electrolytes in maintaining cellular volume, membrane potential, and enzymatic activities essential for cytoskeleton function."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation within the PLEC1 gene body in blood cells is inferred to potentially increase PLEC1 gene expression.",
        "PLEC1 encodes plectin, a versatile protein essential for cytoskeleton organization, cell adhesion, and mechanical stability.",
        "Enhanced PLEC1 expression in blood cells may lead to improved cytoskeleton function, contributing to cellular resilience and adaptability."
      ],
      "functionalImpact": [
        "Potential enhancement of cytoskeleton function in blood cells, leading to improved structural integrity.",
        "Possible increase in cellular resilience and adaptability to mechanical and environmental stresses.",
        "Inferred systemic benefits from improved blood cell integrity and function, although direct systemic effects are not explicitly studied."
      ],
      "healthRelevance": "Maintaining a well-functioning and adaptable cytoskeleton in blood cells is crucial for their integrity, function, and overall contribution to physiological homeostasis in healthy adults. PLEC1 plays a significant role in supporting these processes.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "DNA methylation in gene bodies is often associated with gene expression regulation.",
          "PLEC1/plectin is a well-established component of the cytoskeleton with critical roles in cell structure and mechanics.",
          "Cytoskeleton integrity is essential for cellular function and response to stress."
        ],
        "supportingStudies": [
          "Epigenome-wide association studies (EWAS) identifying PLEC1 hypomethylation in buccal cells (10.21203/RS.3.RS-375556/V1, 10.1038/s41598-022-08998-0).",
          "Extensive body of literature on PLEC1/plectin function and cytoskeleton biology."
        ],
        "biologicalContext": [
          "Cytoskeleton dynamics and regulation in blood cells.",
          "Cellular response to mechanical stress and environmental changes.",
          "Importance of cellular integrity for overall health and wellness."
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "MYO5A"
      ],
      "personally_associated_genes": [
        "MYO5A"
      ],
      "summary": "Increased methylation of MYO5A in blood cells may reduce cellular transport efficiency and potentially influence neurological function.",
      "direction": "hyper"
    },
    "description": "This methylation pattern in blood cells reflects potential changes in cellular transport mechanisms, indicated by MYO5A methylation. While initially studied in the context of season of birth and brain tissue, the underlying mechanism relates to fundamental cellular processes applicable to all healthy adults. The measurement suggests decreased MYO5A gene activity in blood cells, which may impact intracellular vesicle transport. This interpretation is supported by research linking MYO5A to neuronal function and broader cellular transport processes, suggesting relevance beyond the original study context.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Vesicle transport",
        "Actin-based motility",
        "Neuronal function",
        "Intracellular trafficking"
      ],
      "conservedPathways": [
        "Actin cytoskeleton pathway",
        "Motor protein pathways",
        "Intracellular transport pathways",
        "Membrane trafficking"
      ],
      "commonCellularRoles": [
        "Transport of organelles and vesicles",
        "Cellular organization",
        "Signal transduction",
        "Cytoskeletal dynamics"
      ],
      "evolutionaryContext": "MYO5A is conserved across eukaryotes, indicating a fundamental role in cellular function.",
      "tissueContext": "While measured in blood, MYO5A is expressed in various tissues, including brain and blood cells, where it plays a role in transport processes.",
      "regulatoryNetwork": {
        "upstream": [
          "Environmental factors (e.g., photoperiod)",
          "Genetic factors",
          "Cellular stress"
        ],
        "downstream": [
          "Synaptic vesicles",
          "Organelles",
          "Cellular cargo",
          "Cellular membrane components"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": "cg03370588",
          "matched_gene": "MYO5A",
          "gene_name": "MYO5A",
          "description": "Hypermethylation at cg03370588 (TSS200 region of MYO5A) associated with season of birth in brain tissue, suggesting potential impact on neuronal development and function.",
          "chromosome": "chr15",
          "position": 52821290,
          "context": "TSS200",
          "studyIds": [
            "10.1017/S2040174421000453"
          ],
          "direction": "hyper",
          "matchStrength": 0.31915990106649184,
          "modifyingFactors": [
            {
              "factor": "photoperiod",
              "effect": "Short photoperiod at birth associated with hypermethylation.",
              "interventionPotential": "Light therapy during perinatal period (not applicable for healthy adults)."
            }
          ],
          "modes": [
            {
              "center": 0.04195833392441273,
              "spread": 0.00836004875600338,
              "density": 1
            }
          ],
          "personal_metrics": {
            "name": "cg03370588",
            "value": 0.5425136685371399,
            "methylation_state": "hyper",
            "confidence": 0.9951297881949125,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": 59.87469083278691,
              "weighted_deviation": 59.87469083278691,
              "median_deviation": 59.87469083278691
            },
            "percentile": 99.50377376498714
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.1017/S2040174421000453",
            "totalSubjects": 30,
            "studyPopulationSummary": [
              {
                "groupName": "Hypothalamus",
                "count": 16,
                "description": "Post-mortem human hypothalamus tissue samples"
              },
              {
                "groupName": "Inferior Temporal Gyrus (ITG)",
                "count": 14,
                "description": "Post-mortem human inferior temporal gyrus tissue samples"
              }
            ],
            "populationContext": "Post-mortem human brain tissue from older adults, studied in relation to season of birth.",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Engage in regular physical activity, aiming for at least 150 minutes of moderate-intensity exercise per week, to support efficient cellular function and potentially enhance vesicle transport in blood cells.",
        "lucideIcon": "activity",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Physical activity is known to positively influence cellular health and may support efficient intracellular transport processes, which MYO5A facilitates, in blood cells.",
        "specificActions": [
          "Schedule 30-minute brisk walks, jogging, or cycling sessions five times a week.",
          "Incorporate strength training exercises targeting major muscle groups twice a week."
        ],
        "monitoringMetrics": [
          {
            "metric": "Weekly exercise duration",
            "frequency": "Weekly",
            "target": "Achieve at least 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity exercise."
          }
        ],
        "contraindications": "Consult a healthcare provider if you have pre-existing health conditions before starting a new exercise regimen.",
        "supportingEvidence": [
          "General benefits of regular exercise on cellular health, metabolic function, and cardiovascular health."
        ]
      },
      {
        "recommendation": "Maintain a balanced diet rich in diverse fruits and vegetables, focusing on colorful varieties, to increase antioxidant intake and support optimal cellular function.",
        "lucideIcon": "apple",
        "strength": "Moderate",
        "source": "general",
        "rationale": "Antioxidants from fruits and vegetables can help protect blood cells from oxidative stress, which can impair cellular transport and overall function. A diverse intake ensures a broad spectrum of beneficial compounds.",
        "specificActions": [
          "Include at least five servings of diverse fruits and vegetables daily, prioritizing colorful options like berries, leafy greens, and bell peppers.",
          "Incorporate antioxidant-rich foods such as nuts, seeds, and whole grains into your daily meals."
        ],
        "monitoringMetrics": [
          {
            "metric": "Daily servings of fruits and vegetables",
            "frequency": "Daily",
            "target": "Consume at least 5 servings of diverse fruits and vegetables each day."
          }
        ],
        "contraindications": "No known contraindications for a balanced diet rich in fruits and vegetables.",
        "supportingEvidence": [
          "Established benefits of antioxidant-rich diets for cellular health, reduced oxidative stress, and overall wellness."
        ]
      },
      {
        "recommendation": "Prioritize consistent sleep hygiene to achieve 7-9 hours of quality sleep nightly, supporting cellular repair and efficient cellular function in blood cells.",
        "lucideIcon": "moon",
        "strength": "Moderate",
        "source": "general",
        "rationale": "Adequate and quality sleep is essential for cellular repair processes and optimal function, including efficient transport mechanisms within blood cells. Consistent sleep patterns enhance these benefits.",
        "specificActions": [
          "Establish a regular sleep schedule by going to bed and waking up at the same time daily, even on weekends.",
          "Create a relaxing bedtime routine, such as reading or taking a warm bath, to improve sleep quality and prepare your body for rest.",
          "Ensure your sleep environment is dark, quiet, and cool to promote restful sleep."
        ],
        "monitoringMetrics": [
          {
            "metric": "Average nightly sleep duration",
            "frequency": "Weekly",
            "target": "Achieve an average of 7-9 hours of restful sleep per night."
          },
          {
            "metric": "Sleep quality (self-assessed)",
            "frequency": "Weekly",
            "target": "Report feeling rested and refreshed upon waking."
          }
        ],
        "contraindications": "No known contraindications for prioritizing sleep hygiene.",
        "supportingEvidence": [
          "Extensive research highlighting the critical role of sleep for cellular health, repair, and overall physiological function."
        ]
      }
    ],
    "evidence": {
      "strength": "preliminary",
      "mechanisticInsights": [
        "MYO5A is a motor protein crucial for intracellular vesicle transport within cells, including blood cells.",
        "Hypermethylation in the TSS200 region of MYO5A suggests potential downregulation of gene expression and reduced MYO5A protein levels in blood cells.",
        "Decreased MYO5A activity may lead to impaired cellular transport efficiency, affecting the movement of vesicles and organelles within blood cells."
      ],
      "functionalImpact": [
        "Potential reduction in the efficiency of intracellular transport processes in blood cells.",
        "Possible downstream effects on various cellular functions in blood cells that rely on efficient vesicle transport, such as nutrient delivery and waste removal."
      ],
      "healthRelevance": "While the direct impact on overall health from this blood-based methylation change is still under investigation, maintaining efficient cellular transport in blood cells is crucial for supporting systemic wellness and cellular homeostasis.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "MYO5A's role in actin-based vesicle transport is well-established.",
          "Promoter methylation is a known mechanism for gene expression regulation."
        ],
        "supportingStudies": [
          "10.1017/S2040174421000453"
        ],
        "biologicalContext": [
          "Cellular transport mechanisms",
          "Vesicle trafficking and dynamics",
          "Actin cytoskeleton and motor proteins"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "EDNRB"
      ],
      "personally_associated_genes": [
        "EDNRB"
      ],
      "summary": "Increased methylation of the EDNRB gene region in blood cells suggests decreased endothelin receptor B signaling.",
      "direction": "hyper"
    },
    "description": "This methylation pattern in blood cells indicates a potential decrease in the activity of the endothelin receptor B (EDNRB). While studies have explored EDNRB methylation in the context of cancer, this blood-based measurement reflects fundamental vascular regulatory mechanisms relevant to healthy adults. EDNRB plays a crucial role in vascular tone, blood pressure regulation, and cellular communication within the vasculature.  The observed hypermethylation suggests a subtle reduction in EDNRB's influence in blood cells, potentially modulating endothelin signaling, which is important for maintaining healthy blood vessel function and overall cardiovascular wellness. This interpretation is grounded in the understanding of endothelin's broad role in vascular homeostasis and cellular function across various tissues.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Endothelin receptor B activity",
        "Regulation of vascular tone and blood pressure",
        "Modulation of smooth muscle cell function",
        "Role in cell growth, differentiation, and inflammation",
        "Contribution to vascular homeostasis"
      ],
      "conservedPathways": [
        "Endothelin signaling pathway",
        "G protein-coupled receptor signaling",
        "Calcium signaling pathway",
        "Nitric oxide signaling pathway"
      ],
      "commonCellularRoles": [
        "Regulation of blood vessel constriction and dilation in blood cells",
        "Modulation of vascular smooth muscle cell activity",
        "Mediation of cellular communication within the vascular system",
        "Contribution to tissue homeostasis and inflammatory responses in blood vessels"
      ],
      "evolutionaryContext": "Endothelin signaling is an evolutionarily ancient and highly conserved system critical for vascular function and homeostasis across vertebrate species.",
      "tissueContext": "EDNRB is expressed in blood vessels, smooth muscle cells, endothelial cells, and immune cells within the blood, highlighting its systemic role in vascular and immune regulation.",
      "regulatoryNetwork": {
        "upstream": [
          "Endothelins (ET-1, ET-2, ET-3)",
          "Growth factors (e.g., VEGF, TGF-beta)",
          "Inflammatory cytokines (e.g., TNF-alpha, IL-1beta)",
          "Shear stress",
          "Hypoxia"
        ],
        "downstream": [
          "Nitric oxide (NO) production and release",
          "Calcium release and intracellular calcium signaling",
          "MAPK/ERK signaling cascade",
          "PI3K/AKT signaling pathway",
          "Regulation of gene expression related to vascular tone and inflammation"
        ],
        "feedback": [
          "Endothelin-induced nitric oxide release leading to vasodilation (negative feedback loop)",
          "Receptor desensitization and internalization mechanisms to regulate signaling intensity",
          "Cross-talk with other vasoactive systems (e.g., renin-angiotensin system)"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "EDNRB",
          "gene_name": "EDNRB",
          "description": "Hypermethylation of the EDNRB promoter region, potentially reducing gene expression.",
          "chromosome": "chr13",
          "position": 28180182,
          "context": "promoter",
          "studyIds": [
            "10.1586/erm.09.10",
            "10.1186/s13148-015-0094-0"
          ],
          "direction": "hyper",
          "matchStrength": 0.3182628934683379,
          "modifyingFactors": [
            {
              "factor": "Age",
              "effect": "Age-dependent increase in methylation",
              "interventionPotential": "Maintain healthy lifestyle across lifespan"
            }
          ],
          "modes": [
            {
              "center": 0.07134589185423956,
              "spread": 0.00909112884524473,
              "density": 33.00529100529101
            },
            {
              "center": 0.3319099247455597,
              "spread": 0.03233402967453003,
              "density": 0.9955908289241623
            },
            {
              "center": 0.43579240143299103,
              "spread": 0.017242464287999415,
              "density": 2
            },
            {
              "center": 0.5199444741010666,
              "spread": 0.019076020800281004,
              "density": 2
            },
            {
              "center": 0.7396585535575242,
              "spread": 0.022785916856694483,
              "density": 19.99911816578484
            }
          ],
          "personal_metrics": {
            "name": "EDNRB",
            "value": 0.8046827912330627,
            "methylation_state": "hyper",
            "confidence": 0.9277941915980996,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": 2.853702929071932,
              "weighted_deviation": 57.07154208855588,
              "median_deviation": 41.29076257982896
            },
            "percentile": 99.7359508770118
          }
        },
        {
          "matched_probe": null,
          "matched_gene": "EDNRB",
          "gene_name": "EDNRB",
          "description": "Hypermethylation of the TSS1500 region of EDNRB, potentially reducing gene expression.",
          "chromosome": "chr13",
          "position": 28178682,
          "context": "TSS1500",
          "studyIds": [
            "10.1186/s13148-015-0094-0"
          ],
          "direction": "hyper",
          "matchStrength": 0.3182628934683379,
          "modifyingFactors": [],
          "modes": [
            {
              "center": 0.07134589185423956,
              "spread": 0.00909112884524473,
              "density": 33.00529100529101
            },
            {
              "center": 0.3319099247455597,
              "spread": 0.03233402967453003,
              "density": 0.9955908289241623
            },
            {
              "center": 0.43579240143299103,
              "spread": 0.017242464287999415,
              "density": 2
            },
            {
              "center": 0.5199444741010666,
              "spread": 0.019076020800281004,
              "density": 2
            },
            {
              "center": 0.7396585535575242,
              "spread": 0.022785916856694483,
              "density": 19.99911816578484
            }
          ],
          "personal_metrics": {
            "name": "EDNRB",
            "value": 0.8046827912330627,
            "methylation_state": "hyper",
            "confidence": 0.9277941915980996,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": 2.853702929071932,
              "weighted_deviation": 57.07154208855588,
              "median_deviation": 41.29076257982896
            },
            "percentile": 99.7359508770118
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.1586/erm.09.10",
            "totalSubjects": 0,
            "studyPopulationSummary": [],
            "populationContext": "Review of prostate cancer methylation",
            "effectSizes": []
          },
          {
            "studyId": "10.1186/s13148-015-0094-0",
            "totalSubjects": 55,
            "studyPopulationSummary": [
              {
                "groupName": "DCIS",
                "count": 40,
                "description": "Women with Estrogen-receptor positive ductal carcinoma in situ (DCIS)"
              },
              {
                "groupName": "Adjacent-Normal",
                "count": 15,
                "description": "Women with matched adjacent-normal breast tissue"
              }
            ],
            "populationContext": "Women with ductal carcinoma in situ (DCIS) and adjacent normal tissue",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Consume a diet rich in diverse fruits and vegetables, aiming for at least 5 servings daily, to increase antioxidant intake and support healthy blood vessel function.",
        "lucideIcon": "apple-whole",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Antioxidants from fruits and vegetables can protect blood vessels from oxidative stress and support endothelial function, which is relevant to endothelin signaling and vascular health.",
        "specificActions": [
          "Include a variety of colorful fruits and vegetables in each meal.",
          "Aim for at least two cups of vegetables and one and a half to two cups of fruit per day."
        ],
        "monitoringMetrics": [],
        "contraindications": [
          "No major contraindications for general healthy adults. Individuals with specific dietary restrictions should consult their healthcare provider."
        ],
        "supportingEvidence": [
          "Extensive research supports the benefits of fruit and vegetable-rich diets for cardiovascular health and endothelial function."
        ]
      },
      {
        "recommendation": "Engage in regular moderate-intensity aerobic exercise, such as brisk walking or cycling, for at least 150 minutes per week to promote healthy vascular tone and blood flow.",
        "lucideIcon": "heart-pulse",
        "strength": "Moderate",
        "source": "general",
        "rationale": "Regular aerobic exercise improves endothelial function, promotes vasodilation, and can positively influence vascular tone, potentially counteracting any negative impacts of reduced EDNRB activity.",
        "specificActions": [
          "Aim for at least 30 minutes of moderate-intensity exercise most days of the week.",
          "Choose activities you enjoy to maintain consistency."
        ],
        "monitoringMetrics": [],
        "contraindications": [
          "Individuals with pre-existing cardiovascular conditions should consult their doctor before starting a new exercise program."
        ],
        "supportingEvidence": [
          "Numerous studies demonstrate the positive effects of regular aerobic exercise on cardiovascular health and vascular function."
        ]
      },
      {
        "recommendation": "Practice mindfulness or meditation for 10-15 minutes daily to reduce stress levels and support a balanced nervous system, which can positively influence vascular regulation.",
        "lucideIcon": "meditation",
        "strength": "Preliminary",
        "source": "context",
        "rationale": "Chronic stress can negatively impact vascular function. Mindfulness and meditation can help regulate the nervous system and reduce stress hormones, potentially supporting healthy vascular tone and indirectly influencing endothelin signaling.",
        "specificActions": [
          "Find a quiet space and dedicate 10-15 minutes each day for mindfulness or meditation.",
          "Use guided meditation apps or resources if helpful."
        ],
        "monitoringMetrics": [],
        "contraindications": [],
        "supportingEvidence": [
          "Emerging research suggests that mindfulness and meditation practices can have beneficial effects on cardiovascular health and stress reduction."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypermethylation in the EDNRB gene region in blood cells is observed.",
        "Hypermethylation is associated with decreased gene activity, suggesting reduced EDNRB signaling.",
        "EDNRB encodes endothelin receptor B, crucial for vascular tone, blood pressure, and cellular communication."
      ],
      "functionalImpact": [
        "Potential for decreased endothelin receptor B signaling in blood cells.",
        "Possible subtle modulation of vascular tone regulation within the blood vessel system.",
        "Potential alterations in cellular communication processes within the vasculature."
      ],
      "healthRelevance": "Maintaining balanced endothelin signaling is crucial for healthy vascular function, blood pressure regulation, and overall cardiovascular wellness in healthy adults.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "EDNRB's role in endothelin signaling and vascular regulation is well-established.",
          "DNA methylation is a known regulator of gene expression."
        ],
        "supportingStudies": [
          "10.1586/erm.09.10",
          "10.1186/s13148-015-0094-0"
        ],
        "biologicalContext": [
          "Vascular health and regulation",
          "Cardiovascular wellness",
          "Cellular signaling and communication",
          "Blood pressure homeostasis"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "MME"
      ],
      "personally_associated_genes": [
        "MME"
      ],
      "summary": "Increased methylation of the MME gene in blood cells suggests reduced activity of peptide degradation, potentially influencing cell signaling and inflammatory responses.",
      "direction": "hyper"
    },
    "description": "This blood-based methylation pattern indicates modulation of fundamental peptide degradation processes within blood cells. While research on this pattern originates from cancer studies, the underlying biological mechanism—the regulation of peptide metabolism by MME—is pertinent to healthy adults.  The observed hypermethylation suggests decreased expression of MME in blood cells. MME encodes a metallopeptidase crucial for degrading peptides and processing cell surface proteins. Reduced MME activity in blood cells may lead to altered peptide signaling dynamics and potentially influence inflammatory responses, given MME's known roles in immune cell function and inflammation pathways. This interpretation is grounded in broader research highlighting MME's involvement in peptide signaling and degradation across various tissues, reinforcing its relevance to overall physiological balance in healthy individuals.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Metallopeptidase activity",
        "Peptide degradation",
        "Cell surface protein processing",
        "Modulation of inflammatory responses",
        "Regulation of peptide signaling"
      ],
      "conservedPathways": [
        "Peptide hormone degradation pathways",
        "Cytokine processing pathways",
        "Inflammatory signaling cascades",
        "Extracellular matrix remodeling"
      ],
      "commonCellularRoles": [
        "Regulation of peptide signaling molecules in blood cells",
        "Modulation of inflammatory responses in the circulatory system",
        "Processing of cell surface proteins relevant to immune function",
        "Contribution to extracellular peptide homeostasis"
      ],
      "evolutionaryContext": "MME belongs to a highly conserved metallopeptidase family, indicating its fundamental role in peptide metabolism across species.",
      "tissueContext": "MME is expressed across various tissues, including blood cells, immune cells, and epithelial cells, where it participates in peptide signaling, inflammation modulation, and tissue homeostasis.",
      "regulatoryNetwork": {
        "upstream": [
          "Inflammatory cytokines",
          "Neurotransmitters",
          "Hormonal signals",
          "Epigenetic modifiers (DNMTs, histone modifiers)"
        ],
        "downstream": [
          "Peptide substrates (e.g., enkephalins, bradykinin, amyloid-beta)",
          "Cell surface receptors (e.g., chemokine receptors, integrins)",
          "Inflammatory mediators (e.g., prostaglandins, leukotrienes)",
          "Intracellular signaling pathways (e.g., MAPK, PI3K/AKT)"
        ],
        "feedback": [
          "Negative feedback loops regulating peptide signaling through substrate degradation",
          "Potential feedback regulation of inflammatory responses via peptide mediator processing",
          "Epigenetic regulation of MME expression in response to cellular signals"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "MME",
          "gene_name": "MME",
          "description": "Observed hypermethylation in the promoter region of MME in blood cells, inferred from studies in other tissues, suggesting potential for decreased MME gene expression.",
          "chromosome": "chr3",
          "position": 148417887,
          "context": "promoter",
          "studyIds": [
            "10.3892/or.2015.3993",
            "10.1186/s13058-014-0450-6",
            "10.1093/jnci/djz109"
          ],
          "direction": "hyper",
          "matchStrength": 0.3173505890817788,
          "modifyingFactors": [
            {
              "factor": "Neurotransmitter imbalance",
              "effect": "Imbalances in neurotransmitter signaling may contribute to increased MME promoter methylation.",
              "interventionPotential": "Lifestyle strategies to support neurotransmitter balance, such as stress management and a balanced diet."
            },
            {
              "factor": "Aging",
              "effect": "The aging process may be associated with increased methylation at the MME promoter region in blood cells.",
              "interventionPotential": "General healthy aging strategies may mitigate epigenetic changes."
            }
          ],
          "modes": [
            {
              "center": 0.048736589571201125,
              "spread": 0.006693478817539922,
              "density": 14.993827160493828
            },
            {
              "center": 0.22230980435109232,
              "spread": 0.01798814878748551,
              "density": 2.009700176366843
            },
            {
              "center": 0.3396320343017578,
              "spread": 0.03261101245880127,
              "density": 0.9964726631393298
            },
            {
              "center": 0.40187332034111023,
              "spread": 0.03816770017147064,
              "density": 1
            },
            {
              "center": 0.5646231174468994,
              "spread": 0.03613909884128502,
              "density": 2
            },
            {
              "center": 0.7387451549242601,
              "spread": 0.020929757911935395,
              "density": 9
            }
          ],
          "personal_metrics": {
            "name": "MME",
            "value": 0.8648366928100586,
            "methylation_state": "hyper",
            "confidence": 0.9463442772638713,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": 6.024510097839861,
              "weighted_deviation": 54.220590880558746,
              "median_deviation": 44.2554353320097
            },
            "percentile": 99.82879879817068
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.3892/or.2015.3993",
            "totalSubjects": 110,
            "studyPopulationSummary": [
              {
                "groupName": "tumor",
                "count": 55,
                "description": "Colorectal carcinoma tissue samples"
              },
              {
                "groupName": "normal",
                "count": 55,
                "description": "Adjacent normal epithelial cell samples"
              }
            ],
            "populationContext": "Study comparing methylation and expression in colorectal cancer tissues versus normal adjacent tissues.",
            "effectSizes": []
          },
          {
            "studyId": "10.1186/s13058-014-0450-6",
            "totalSubjects": 526,
            "studyPopulationSummary": [
              {
                "groupName": "breast_cancer_cases",
                "count": 517,
                "description": "Breast cancer patients with invasive breast cancer"
              },
              {
                "groupName": "normal_breast_tissues",
                "count": 9,
                "description": "Normal breast tissue samples from healthy individuals"
              }
            ],
            "populationContext": "Case-control study investigating methylation differences between breast cancer patients and healthy individuals.",
            "effectSizes": []
          },
          {
            "studyId": "10.1093/jnci/djz109",
            "totalSubjects": 228951,
            "studyPopulationSummary": [
              {
                "groupName": "breast_cancer_patients",
                "count": 122977,
                "description": "Breast cancer patients of European descent"
              },
              {
                "groupName": "controls",
                "count": 105974,
                "description": "Healthy controls of European descent"
              }
            ],
            "populationContext": "Genome-wide association study (GWAS) examining methylation in relation to breast cancer risk in a large European cohort.",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Maintain adequate zinc intake through diet to support optimal metallopeptidase enzyme function.",
        "lucideIcon": "zinc",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "MME, a metallopeptidase, requires zinc as a cofactor for its enzymatic activity. Sufficient zinc intake is crucial for supporting the function of metallopeptidases involved in peptide degradation and cell signaling.",
        "specificActions": [
          "Incorporate zinc-rich foods into your daily diet, such as lean meats, seafood, nuts, and seeds.",
          "If dietary intake is insufficient, consider a zinc supplement after consulting with a healthcare provider to determine appropriate dosage."
        ],
        "monitoringMetrics": [
          {
            "metric": "Frequency of zinc-rich food consumption",
            "frequency": "Weekly",
            "target": "Regularly consume zinc-rich foods"
          },
          {
            "metric": "Zinc supplement dosage (if applicable)",
            "frequency": "Daily",
            "target": "Follow recommended daily allowance or healthcare provider's advice"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "Zinc is an essential trace element and a critical cofactor for numerous enzymes, including metallopeptidases like MME, involved in vital biological processes."
        ]
      },
      {
        "recommendation": "Adopt lifestyle practices to mitigate chronic inflammation and support balanced cellular function.",
        "lucideIcon": "flame-kindling",
        "strength": "Moderate",
        "source": "context",
        "rationale": "Chronic inflammation can influence epigenetic patterns and potentially affect MME gene regulation and function. Reducing systemic inflammation may support healthy epigenetic maintenance and cellular processes.",
        "specificActions": [
          "Follow an anti-inflammatory dietary pattern rich in fruits, vegetables, omega-3 fatty acids, and whole grains, while limiting processed foods and refined sugars.",
          "Engage in regular moderate-intensity exercise and incorporate stress-reducing activities such as yoga or meditation into your routine."
        ],
        "monitoringMetrics": [
          {
            "metric": "Adherence to anti-inflammatory diet",
            "frequency": "Weekly",
            "target": "Consistently incorporate anti-inflammatory foods"
          },
          {
            "metric": "Frequency of moderate exercise and stress reduction practices",
            "frequency": "Weekly",
            "target": "Regular engagement in exercise and stress management"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "Chronic inflammation is a significant factor in various health conditions and can be modulated through dietary and lifestyle interventions."
        ]
      },
      {
        "recommendation": "Engage in activities that promote neurotransmitter balance to support overall epigenetic health.",
        "lucideIcon": "users-2",
        "strength": "Preliminary",
        "source": "context",
        "rationale": "Neurotransmitter balance may play a role in epigenetic regulation, including DNA methylation patterns. Activities promoting neurotransmitter balance could indirectly support healthy epigenetic states and cellular function.",
        "specificActions": [
          "Prioritize regular social interactions and maintain strong social connections to support neurotransmitter regulation.",
          "Incorporate mindfulness practices or relaxation techniques into your daily routine to help balance neurotransmitter activity and reduce stress."
        ],
        "monitoringMetrics": [
          {
            "metric": "Quality and frequency of social engagement",
            "frequency": "Weekly",
            "target": "Maintain meaningful social connections"
          },
          {
            "metric": "Self-reported mood and stress levels",
            "frequency": "Weekly",
            "target": "Maintain positive mood and manage stress effectively"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "Neurotransmitter balance is crucial for mental and overall well-being and can be influenced by lifestyle and social factors, potentially impacting epigenetic mechanisms."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "MME functions as a metallopeptidase involved in the degradation of peptides and processing of cell surface proteins.",
        "Hypermethylation in the MME promoter region in blood cells suggests a potential decrease in MME gene expression and activity."
      ],
      "functionalImpact": [
        "Reduced MME activity in blood cells may modulate peptide degradation processes.",
        "Potential alterations in cell signaling pathways and inflammatory responses due to changes in peptide metabolism."
      ],
      "healthRelevance": "Maintaining balanced peptide degradation and cell signaling is essential for cellular homeostasis, immune function, and overall wellness.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "MME's role in peptide metabolism and cell signaling is well-documented.",
          "DNA methylation in promoter regions is a known mechanism for regulating gene expression."
        ],
        "supportingStudies": [
          "Cancer studies provide evidence for MME's involvement in cell signaling and inflammation-related pathways, which can be extrapolated to general cellular function."
        ],
        "biologicalContext": [
          "Peptide degradation and cell signaling are fundamental biological processes relevant to all tissues, including blood cells.",
          "MME's function in immune cells and inflammation pathways highlights its potential systemic relevance."
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "ACP2"
      ],
      "personally_associated_genes": [
        "ACP2"
      ],
      "summary": "Increased methylation of ACP2 in blood cells may contribute to reduced lysosomal function and potentially impact metabolic health.",
      "direction": "hyper"
    },
    "description": "This methylation pattern in blood cells reflects potential changes in lysosomal function, indicated by increased methylation of the ACP2 gene. While originally observed in studies related to BMI and adiposity, the underlying mechanism involves basic cellular processes related to waste management and nutrient processing within lysosomes, which are relevant to healthy adults. This measurement suggests a possible decrease in ACP2 gene activity in blood cells, which could influence lysosomal efficiency. This interpretation is supported by research linking ACP2 to lysosomal function and metabolic regulation, suggesting a broader role in maintaining cellular and metabolic health.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Lysosomal acid phosphatase activity",
        "Bone resorption",
        "Metabolic regulation"
      ],
      "conservedPathways": [
        "Lysosomal pathway",
        "Phosphate metabolism",
        "Cellular catabolism"
      ],
      "commonCellularRoles": [
        "Breakdown of cellular waste products",
        "Recycling of cellular components",
        "Signal transduction"
      ],
      "evolutionaryContext": "Conserved across eukaryotes, indicating fundamental role in cellular homeostasis.",
      "tissueContext": "Ubiquitously expressed, with important roles in bone, immune cells, and metabolic tissues. In blood cells, it reflects systemic lysosomal function.",
      "regulatoryNetwork": {
        "upstream": [
          "Genetic variants (eQTMs)",
          "Environmental factors",
          "Nutritional status"
        ],
        "downstream": [
          "Lysosomal enzymes",
          "Autophagy pathways",
          "Metabolic signaling"
        ],
        "feedback": [
          "Cellular nutrient sensing",
          "Autophagy regulation"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": "cg17580616",
          "matched_gene": "ACP2",
          "gene_name": "ACP2",
          "description": "Hypermethylation at cg17580616 associated with decreased ACP2 expression and increased BMI in blood.",
          "chromosome": "chr4",
          "position": 74585740,
          "context": "cis-eQTM",
          "studyIds": [
            "10.1038/s41598-023-39936-3"
          ],
          "direction": "hyper",
          "matchStrength": 0.3138352047510742,
          "modifyingFactors": [
            {
              "factor": "Environmental factors",
              "effect": "May influence methylation and ACP2 expression, potentially modifying BMI.",
              "interventionPotential": "Environmental modification"
            },
            {
              "factor": "Lifestyle factors",
              "effect": "May influence methylation and ACP2 expression, potentially modifying BMI.",
              "interventionPotential": "Lifestyle modification"
            }
          ],
          "modes": [
            {
              "center": 0.03366452635964379,
              "spread": 0.0034472631486706586,
              "density": 16
            },
            {
              "center": 0.5309170782566071,
              "spread": 0.017751753330230713,
              "density": 2
            },
            {
              "center": 0.672282938931918,
              "spread": 0.02336284274357414,
              "density": 2.992063492063492
            },
            {
              "center": 0.8089870374897759,
              "spread": 0.013399993410388715,
              "density": 11.007936507936506
            }
          ],
          "personal_metrics": {
            "name": "ACP2",
            "value": 0.8616171479225159,
            "methylation_state": "hyper",
            "confidence": 0.9767204975756277,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": 3.9276221130032103,
              "weighted_deviation": 43.23501484710676,
              "median_deviation": 54.78911718340898
            },
            "percentile": 99.79244652701676
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.1038/s41598-023-39936-3",
            "totalSubjects": 2115,
            "studyPopulationSummary": [
              {
                "groupName": "FHS Offspring",
                "count": 686,
                "description": "Participants from the Framingham Heart Study Offspring cohort"
              },
              {
                "groupName": "FHS Third Generation",
                "count": 1429,
                "description": "Participants from the FHS Third Generation cohort"
              }
            ],
            "populationContext": "Adults from the Framingham Heart Study",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Support lysosomal function by consuming a diet rich in antioxidants, such as berries and leafy greens, aiming for at least 2 cups of colorful vegetables and 1 cup of berries daily to help protect lysosomes from oxidative stress.",
        "lucideIcon": "leaf-veggie",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Antioxidants can mitigate oxidative damage to lysosomes, supporting their optimal function.",
        "specificActions": [
          "Increase intake of colorful fruits and vegetables",
          "Prioritize antioxidant-rich foods at each meal"
        ],
        "monitoringMetrics": [
          {
            "metric": "Dietary antioxidant intake",
            "frequency": "Weekly self-assessment",
            "target": "Consistent intake of recommended servings"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "Research on antioxidants and cellular health",
          "Studies linking diet to lysosomal function"
        ]
      },
      {
        "recommendation": "Engage in regular moderate-intensity exercise, such as brisk walking or cycling, for at least 150 minutes per week, distributed across most days, to promote autophagy and lysosomal turnover.",
        "lucideIcon": "heart-pulse",
        "strength": "Moderate",
        "source": "outcome",
        "rationale": "Exercise promotes autophagy, the process of cellular cleaning that relies on lysosomes.",
        "specificActions": [
          "Schedule exercise sessions into weekly routine",
          "Track weekly exercise minutes"
        ],
        "monitoringMetrics": [
          {
            "metric": "Weekly exercise duration",
            "frequency": "Weekly tracking",
            "target": "Achieve 150 minutes of moderate-intensity exercise"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "Studies on exercise and autophagy",
          "Research on physical activity and metabolic health"
        ]
      },
      {
        "recommendation": "Maintain a healthy weight through balanced diet and regular physical activity to reduce metabolic stress on lysosomal pathways.",
        "lucideIcon": "scales",
        "strength": "General",
        "source": "general",
        "rationale": "Excess weight can increase metabolic burden and potentially impair lysosomal function.",
        "specificActions": [
          "Monitor weight regularly",
          "Adjust diet and exercise as needed to maintain healthy BMI"
        ],
        "monitoringMetrics": [
          {
            "metric": "Body Mass Index (BMI)",
            "frequency": "Monthly",
            "target": "Maintain BMI within healthy range (18.5-24.9)"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "General guidelines for healthy weight management",
          "Research linking obesity to cellular stress"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypermethylation of ACP2 may reduce its expression.",
        "Reduced ACP2 activity can impair lysosomal acid phosphatase function.",
        "Dysfunctional lysosomes can lead to accumulation of cellular waste and metabolic dysregulation."
      ],
      "functionalImpact": [
        "Potential decrease in lysosomal efficiency in blood cells.",
        "Possible impact on cellular waste clearance and nutrient recycling.",
        "Downstream effects on metabolic health and adiposity."
      ],
      "healthRelevance": "Lysosomal function is crucial for cellular health and metabolic balance. Supporting lysosomal function may contribute to overall wellness and metabolic resilience in healthy adults.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "ACP2 is a key enzyme in lysosomal function.",
          "Methylation in gene regions can regulate gene expression."
        ],
        "supportingStudies": [
          "10.1038/s41598-023-39936-3"
        ],
        "biologicalContext": [
          "Lysosomal function",
          "Cellular waste management",
          "Metabolic health"
        ]
      }
    }
  }
]