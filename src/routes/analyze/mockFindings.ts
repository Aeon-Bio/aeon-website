export const mockFindings = [
  {
    "pattern": {
      "gene_list": [
        "SLC9A1"
      ],
      "personally_associated_genes": [
        "SLC9A1"
      ],
      "summary": "Decreased ion transport in blood cells increases risk of type 2 diabetes",
      "direction": "hyper"
    },
    "description": "Your blood cells show increased methylation at a site that regulates the activity of the SLC9A1 gene. This gene is involved in transporting ions across cell membranes, which is important for maintaining cellular balance. Increased methylation at this site can reduce the activity of SLC9A1, potentially disrupting ion transport and cellular function. This pattern is associated with an increased risk of developing type 2 diabetes and can be influenced by electrolyte imbalances and cellular stress. Maintaining a balanced diet and managing stress can help optimize your body's cellular function.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Ion transport"
      ],
      "conservedPathways": [
        "Electrolyte transport",
        "Cellular homeostasis"
      ],
      "commonCellularRoles": [
        "Regulation of intracellular pH",
        "Maintenance of cell volume",
        "Electrolyte balance"
      ],
      "evolutionaryContext": "SLC9A1 is a highly conserved gene across species, indicating its fundamental role in cellular physiology.",
      "tissueContext": "SLC9A1 is expressed in various tissues, including blood cells, kidney, and intestine, where it plays a role in ion transport and cellular regulation.",
      "regulatoryNetwork": {
        "upstream": [
          "Electrolyte imbalance",
          "Cellular stress"
        ],
        "downstream": [
          "Ion transport pathways",
          "Cellular regulation pathways"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": "cg25130381",
          "gene_name": "SLC9A1",
          "description": "Hypermethylation at cg25130381 in the gene body of SLC9A1 may lead to decreased SLC9A1 expression, potentially disrupting ion transport and increasing the risk of type 2 diabetes.",
          "chromosome": "chr1",
          "position": 27313308,
          "context": "Body",
          "studyIds": [
            "10.2337/db18-0290"
          ],
          "direction": "hyper",
          "matchStrength": 0.9,
          "methylationMetrics": {
            "value": 0.39247824458612335,
            "siteMean": 0.37194347075031453,
            "siteMedian": 0.3687080140742991,
            "zScore": 2.2776258285183433,
            "MAD": 0.010436407163193889,
            "percentile": 95.0
          },
          "modifyingFactors": [
            {
              "factor": "Electrolyte imbalance",
              "effect": "Imbalances in electrolyte levels may promote hypermethylation at this site.",
              "interventionPotential": "Electrolyte supplementation may help correct imbalances and potentially reduce hypermethylation."
            },
            {
              "factor": "Cellular stress",
              "effect": "Increased cellular stress may promote hypermethylation at this site.",
              "interventionPotential": "Stress management techniques may help reduce cellular stress and potentially reduce hypermethylation."
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.2337/db18-0290",
        "studyMetrics": [
          {
            "studyId": "10.2337/db18-0290",
            "totalSubjects": 1264,
            "studyPopulationSummary": [
              {
                "groupName": "Incident T2DM",
                "count": 563,
                "description": "Individuals who developed type 2 diabetes mellitus (T2DM) during follow-up"
              },
              {
                "groupName": "Noncase",
                "count": 701,
                "description": "Individuals who did not develop T2DM during follow-up"
              }
            ],
            "populationContext": "European descent, aged 40-79 years at baseline",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Supplement with magnesium to support electrolyte balance and reduce cellular stress",
        "lucideIcon": "magnet",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Magnesium supplementation can help correct electrolyte imbalances, which may reduce hypermethylation at the SLC9A1 locus. Magnesium also plays a role in stress response, which can further support healthy cellular function.",
        "specificActions": [
          "Take 200mg of magnesium glycinate daily with breakfast"
        ],
        "monitoringMetrics": [
          {
            "metric": "Electrolyte levels",
            "frequency": "Every 3 months",
            "target": "Within normal range"
          }
        ],
        "contraindications": [
          "Kidney disease",
          "Certain medications"
        ],
        "supportingEvidence": [
          "Electrolyte imbalances may promote hypermethylation at this site.",
          "Magnesium plays a role in stress response."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypermethylation at cg25130381 in the gene body of SLC9A1 may lead to decreased SLC9A1 expression.",
        "SLC9A1 is a solute carrier family member involved in ion transport."
      ],
      "functionalImpact": [
        "Decreased SLC9A1 expression",
        "Altered ion transport",
        "Dysregulation of cellular processes"
      ],
      "healthRelevance": "Decreased SLC9A1 expression due to hypermethylation is associated with increased risk of T2DM.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "SLC9A1 is a solute carrier family member involved in ion transport.",
          "Hypermethylation in gene bodies can lead to decreased gene expression."
        ],
        "supportingStudies": [
          "10.2337/db18-0290"
        ],
        "biologicalContext": [
          "ion transport",
          "electrolyte balance",
          "cellular homeostasis"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "RUNX3"
      ],
      "personally_associated_genes": [
        "RUNX3"
      ],
      "summary": "Enhanced tumor suppressor activity in blood cells may improve cancer defense",
      "direction": "hypo"
    },
    "description": "Your blood cells show decreased methylation at a site that regulates the activity of the RUNX3 gene. This gene is a tumor suppressor that helps control cell growth and inflammation. Decreased methylation at this site can increase the activity of RUNX3, potentially enhancing its tumor-suppressing function. This pattern is associated with a potential improvement in cancer defense and can be influenced by dietary stilbenoids like resveratrol and pterostilbene. Consuming foods rich in these compounds may help support your body's natural defense mechanisms.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Tumor suppression"
      ],
      "conservedPathways": [
        "Inflammatory response pathways",
        "Cancer-related signal transduction pathways"
      ],
      "commonCellularRoles": [
        "Transcription factor regulating gene expression",
        "Regulation of cell growth and differentiation",
        "Modulation of inflammatory response"
      ],
      "evolutionaryContext": "RUNX3 is a highly conserved gene across species, indicating its fundamental role in cell regulation and development.",
      "tissueContext": "RUNX3 is expressed in various tissues, including mammary epithelial cells and peripheral blood, where it plays a role in tumor suppression and inflammatory response.",
      "regulatoryNetwork": {
        "upstream": [
          "Dietary stilbenoids (resveratrol, pterostilbene)"
        ],
        "downstream": [
          "Inflammatory response pathways",
          "Cancer-related signal transduction pathways"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": "cg18231267",
          "gene_name": "RUNX3",
          "description": "Hypomethylation of a CpG site in the CpG island region of RUNX3, potentially leading to increased gene expression and activation of tumor suppressor function.",
          "chromosome": "chr1",
          "position": 25228496,
          "context": "CpG island",
          "studyIds": [
            "10.1002/mnfr.201800193"
          ],
          "direction": "hypo",
          "matchStrength": 0.9,
          "methylationMetrics": {
            "value": 0.5041465988116605,
            "siteMean": 0.5855316634156873,
            "siteMedian": 0.5929453644369329,
            "zScore": -3.768525904928856,
            "MAD": 0.023563262629860793,
            "percentile": 5.0
          },
          "modifyingFactors": [
            {
              "factor": "Dietary stilbenoids (resveratrol, pterostilbene)",
              "effect": "Induces hypomethylation at the RUNX3 locus",
              "interventionPotential": "Dietary supplementation with resveratrol and pterostilbene may enhance hypomethylation."
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1002/mnfr.201800193",
        "studyMetrics": [
          {
            "studyId": "10.1002/mnfr.201800193",
            "totalSubjects": 24,
            "studyPopulationSummary": [
              {
                "groupName": "MCF10A_control",
                "count": 3,
                "description": "MCF10A human immortalized mammary epithelial cells treated with ethanol vehicle control"
              },
              {
                "groupName": "MCF10A_RSV",
                "count": 3,
                "description": "MCF10A human immortalized mammary epithelial cells treated with 15\u00b5M resveratrol for 9 days"
              },
              {
                "groupName": "MCF10A_PTS",
                "count": 3,
                "description": "MCF10A human immortalized mammary epithelial cells treated with 7\u00b5M pterostilbene for 9 days"
              },
              {
                "groupName": "Rat_CSAA",
                "count": 6,
                "description": "Fischer 344 rats fed a choline-sufficient amino acid-defined (CSAA) diet for 20 days"
              },
              {
                "groupName": "Rat_CSAA+RSV",
                "count": 6,
                "description": "Fischer 344 rats fed a CSAA diet supplemented with 1.2 g/kg resveratrol for 20 days"
              },
              {
                "groupName": "Rat_CSAA+PTS",
                "count": 6,
                "description": "Fischer 344 rats fed a CSAA diet supplemented with 1.34 g/kg pterostilbene for 20 days"
              }
            ],
            "populationContext": "MCF10A human mammary epithelial cells and Fischer 344 rats",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Consume foods rich in resveratrol and pterostilbene to support RUNX3 activity",
        "lucideIcon": "leaf",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Dietary stilbenoids like resveratrol and pterostilbene can induce hypomethylation at the RUNX3 locus, potentially increasing its tumor suppressor function.",
        "specificActions": [
          "Incorporate berries, grapes, and peanuts into your diet",
          "Consider a daily supplement of 100mg trans-resveratrol with 5mg piperine"
        ],
        "monitoringMetrics": [],
        "contraindications": [
          "Drug interactions",
          "Allergies"
        ],
        "supportingEvidence": [
          "Dietary stilbenoids (resveratrol, pterostilbene) induce hypomethylation at the RUNX3 locus.",
          "RUNX3 is a known tumor suppressor gene."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation of a CpG site in the CpG island region of RUNX3 may lead to increased gene expression.",
        "RUNX3 is a known tumor suppressor gene that acts as a transcription factor regulating expression of a gene network linked to inflammatory response and signal transduction."
      ],
      "functionalImpact": [
        "Increased expression of RUNX3",
        "Potential activation of tumor suppressor function",
        "Altered inflammatory response"
      ],
      "healthRelevance": "Altered methylation of RUNX3 may affect its expression and function, potentially impacting cancer development.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "RUNX3 is a tumor suppressor gene.",
          "Hypomethylation in regulatory regions can increase gene expression."
        ],
        "supportingStudies": [
          "10.1002/mnfr.201800193"
        ],
        "biologicalContext": [
          "cancer-related signal transduction",
          "tumor suppression",
          "inflammatory response"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "LRP5"
      ],
      "personally_associated_genes": [
        "LRP5"
      ],
      "summary": "Enhanced stem cell renewal in blood may affect tissue repair",
      "direction": "hypo"
    },
    "description": "Your blood cells show reduced methylation in the promoter region of the LRP5 gene, which is involved in stem cell self-renewal. This change suggests that LRP5 gene activity may be increased, potentially affecting the balance of stem cell renewal and differentiation. This pattern is important because it can influence how your body repairs tissues and responds to injury. The effect is most pronounced in blood cells and may be modified by lifestyle factors that affect stem cell activity, such as exercise and diet.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Wnt signaling pathway regulation"
      ],
      "conservedPathways": [
        "Wnt signaling pathway",
        "Stem cell self-renewal"
      ],
      "commonCellularRoles": [
        "Cell proliferation",
        "Cell differentiation",
        "Tissue repair"
      ],
      "evolutionaryContext": "Highly conserved across species due to its fundamental role in development and tissue maintenance.",
      "tissueContext": "Primarily active in stem cells and progenitor cells, with effects in various tissues.",
      "regulatoryNetwork": {
        "upstream": [
          "DNA methylation machinery"
        ],
        "downstream": [
          "Wnt signaling components",
          "Cell cycle regulators"
        ],
        "feedback": [
          "Wnt signaling feedback loops"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": null,
          "gene_name": "LRP5",
          "description": "Hypomethylation of the LRP5 promoter region in side-population trophoblasts may lead to increased LRP5 expression, potentially disrupting the Wnt signaling pathway and affecting stem cell self-renewal.",
          "chromosome": null,
          "position": null,
          "context": "promoter region",
          "studyIds": [
            "10.1080/15592294.2018.1549462"
          ],
          "direction": "hypo",
          "matchStrength": 0.9,
          "methylationMetrics": {
            "value": 0.4760289192199707,
            "siteMean": 0.5603743143379688,
            "siteMedian": 0.5676144808530807,
            "zScore": -2.925785217414054,
            "MAD": 0.03130289984650946,
            "percentile": 5.0
          },
          "modifyingFactors": []
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1080/15592294.2018.1549462",
        "studyMetrics": [
          {
            "studyId": "10.1080/15592294.2018.1549462",
            "totalSubjects": 13,
            "studyPopulationSummary": [
              {
                "groupName": "side-population trophoblasts",
                "count": 13,
                "description": "Candidate human trophoblast stem cell population"
              },
              {
                "groupName": "cytotrophoblasts",
                "count": 13,
                "description": "Intermediate progenitor population"
              },
              {
                "groupName": "extravillous trophoblasts",
                "count": 13,
                "description": "Terminally differentiated population"
              }
            ],
            "populationContext": "Comparative epigenomic analysis of human trophoblast populations",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Engage in regular moderate-intensity exercise to support healthy stem cell function",
        "lucideIcon": "activity",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Exercise can modulate stem cell activity and improve tissue repair, potentially counteracting the effects of altered LRP5 methylation.",
        "specificActions": [
          "Perform 30 minutes of moderate-intensity exercise (e.g., brisk walking, cycling) at least 5 days per week."
        ],
        "monitoringMetrics": [
          {
            "metric": "Physical activity level",
            "frequency": "Weekly",
            "target": "Consistent moderate-intensity exercise"
          }
        ],
        "contraindications": [
          "Consult a healthcare provider before starting a new exercise program, especially if you have any underlying health conditions."
        ],
        "supportingEvidence": [
          "Studies have shown that exercise can positively influence stem cell function and tissue repair."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation of the LRP5 promoter region is associated with increased gene expression.",
        "LRP5 is a key component of the Wnt signaling pathway, which regulates stem cell self-renewal and differentiation."
      ],
      "functionalImpact": [
        "Increased LRP5 activity may enhance stem cell renewal in blood, potentially affecting tissue repair."
      ],
      "healthRelevance": "Altered stem cell renewal can impact tissue repair and regeneration, potentially affecting overall health and recovery from injuries.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "LRP5 is a receptor in the Wnt signaling pathway, which plays a crucial role in stem cell maintenance and differentiation."
        ],
        "supportingStudies": [
          "Studies have shown that LRP5 is involved in canonical Wnt signaling and permits the regenerative capacity of mammary epithelial stem cells."
        ],
        "biologicalContext": [
          "Stem cell self-renewal",
          "Tissue repair",
          "Wnt signaling"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "PDCD1"
      ],
      "personally_associated_genes": [
        "PDCD1"
      ],
      "summary": "Enhanced immune checkpoint activity in blood may weaken immune response",
      "direction": "hypo"
    },
    "description": "Your blood cells show reduced methylation associated with the PDCD1 gene, which encodes the PD-1 immune checkpoint protein. This suggests that PDCD1 gene activity may be increased, potentially leading to enhanced T cell exhaustion and a weakened immune response. This pattern is important because it can affect your body's ability to fight off infections and other diseases. The effect is primarily observed in blood cells and may be modified by factors that affect immune function, such as sleep quality and stress levels. Targeted interventions may help regulate immune responses.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Regulation of T cell activation"
      ],
      "conservedPathways": [
        "T cell receptor signaling",
        "Immune checkpoint pathways"
      ],
      "commonCellularRoles": [
        "T cell exhaustion",
        "Immune response regulation",
        "Autoimmunity"
      ],
      "evolutionaryContext": "Highly conserved across species due to its fundamental role in immune regulation.",
      "tissueContext": "Primarily active in T cells and other immune cells, with systemic effects on immune function.",
      "regulatoryNetwork": {
        "upstream": [
          "Polycomb Repressive Complex 2 (PRC2)"
        ],
        "downstream": [
          "Other immune checkpoint proteins",
          "T cell activation markers"
        ],
        "feedback": [
          "T cell receptor signaling",
          "Innate immune responses"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": null,
          "gene_name": "PDCD1",
          "description": "Upregulation of PDCD1 gene expression due to decreased methylation at associated variably methylated positions (aVMPs).",
          "chromosome": null,
          "position": null,
          "context": null,
          "studyIds": [
            "10.1186/s13059-016-1053-6"
          ],
          "direction": "hypo",
          "matchStrength": 0.6400000000000001,
          "methylationMetrics": {
            "value": 0.398850890142577,
            "siteMean": 0.4450146438820021,
            "siteMedian": 0.45325468374150135,
            "zScore": -2.3944775382257992,
            "MAD": 0.022720527852282596,
            "percentile": 15.0
          },
          "modifyingFactors": [
            {
              "factor": "Poor sleep",
              "effect": "Poor sleep quality may increase cellular stress and the need for lymphocyte activation, potentially modulating PDCD1 expression.",
              "interventionPotential": "Sleep hygiene: Consistent sleep schedule, dark and quiet sleep environment, and avoiding stimulants before bed. Consistent daily practices for long-term duration."
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1186/s13059-016-1053-6",
        "studyMetrics": [
          {
            "studyId": "10.1186/s13059-016-1053-6",
            "totalSubjects": 3295,
            "studyPopulationSummary": [
              {
                "groupName": "whole_blood_samples",
                "count": 3295,
                "description": "Individuals aged 18 to 88 years"
              },
              {
                "groupName": "RNA_seq_subset",
                "count": 2044,
                "description": "Subset of whole blood samples with matching RNA-seq data"
              },
              {
                "groupName": "validation_whole_blood",
                "count": 643,
                "description": "Independent whole blood samples"
              },
              {
                "groupName": "validation_monocytes",
                "count": 1202,
                "description": "Purified monocytes"
              }
            ],
            "populationContext": "Observational cohort study with multi-omic analysis",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Prioritize consistent sleep patterns to support healthy immune function",
        "lucideIcon": "moon",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Consistent sleep patterns can help regulate immune responses and potentially counteract the effects of altered PDCD1 methylation.",
        "specificActions": [
          "Establish a regular sleep schedule, aiming for 7-9 hours of sleep per night.",
          "Create a relaxing bedtime routine and ensure a dark, quiet, and cool sleep environment."
        ],
        "monitoringMetrics": [
          {
            "metric": "Sleep duration",
            "frequency": "Daily",
            "target": "7-9 hours of sleep per night"
          },
          {
            "metric": "Sleep quality",
            "frequency": "Weekly",
            "target": "Consistent and restful sleep"
          }
        ],
        "contraindications": [
          "Consult a healthcare provider if you have persistent sleep problems or underlying sleep disorders."
        ],
        "supportingEvidence": [
          "Studies have shown that poor sleep quality can negatively impact immune function and may modulate PDCD1 expression."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation at variably methylated positions (aVMPs) near PDCD1 is associated with increased gene expression.",
        "PDCD1 encodes the PD-1 immune checkpoint protein, which regulates T cell activation."
      ],
      "functionalImpact": [
        "Increased PDCD1 activity may lead to enhanced T cell exhaustion and a weakened immune response."
      ],
      "healthRelevance": "Dysregulation of the PD-1 immune checkpoint can impair immune responses, potentially affecting the body's ability to fight off infections and other diseases.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "PDCD1 is an immune checkpoint protein that inhibits T cell activation and promotes T cell exhaustion."
        ],
        "supportingStudies": [
          "Gene Ontology (GO) analysis showed enrichment for processes involved in neuron differentiation and neuron development."
        ],
        "biologicalContext": [
          "Lymphocyte activation",
          "Immune checkpoint regulation",
          "T cell exhaustion"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "MYOD1"
      ],
      "personally_associated_genes": [
        "MYOD1"
      ],
      "summary": "Enhanced muscle cell development improves exercise recovery",
      "direction": "hypo"
    },
    "description": "Your muscle cells show increased activity in a key gene involved in muscle development and repair. This change suggests that your muscles may be more efficient at repairing and growing, which can lead to better recovery after exercise and improved muscle strength. This pattern is often seen in individuals with high physical activity levels and can be further enhanced through targeted exercise and nutrition. The effect is most pronounced during periods of muscle stress and recovery.",
    "knowledgeContext": {
      "establishedFunctions": [
        "MyoD is a master regulator of muscle differentiation, initiating the cascade of myogenic gene expression."
      ],
      "conservedPathways": [
        "Myogenesis",
        "Muscle differentiation"
      ],
      "commonCellularRoles": [
        "Activation of muscle-specific gene expression",
        "Promotion of myoblast differentiation and fusion"
      ],
      "evolutionaryContext": "Highly conserved across vertebrates, reflecting its fundamental role in muscle development.",
      "tissueContext": "Primarily active in skeletal muscle, but also plays a role in cardiac muscle development.",
      "regulatoryNetwork": {
        "upstream": [
          "DNA methyltransferases (DNMTs)"
        ],
        "downstream": [
          "Myogenin",
          "Myosin heavy chain (MyHC)"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": null,
          "gene_name": "MYOD1",
          "description": "Hypomethylation of MYOD1 regulatory regions is associated with increased transcription and protein levels.",
          "chromosome": null,
          "position": null,
          "context": null,
          "studyIds": [
            "10.7150/ijbs.4729"
          ],
          "direction": "hypo",
          "matchStrength": 0.7200000000000001,
          "methylationMetrics": {
            "value": 0.09188408878716556,
            "siteMean": 0.12016830473122272,
            "siteMedian": 0.12367995625192468,
            "zScore": -2.6981853475250186,
            "MAD": 0.011784167271505169,
            "percentile": 15.0
          },
          "modifyingFactors": [
            {
              "factor": "5-azacytidine (AZA)",
              "effect": "Increases MyoD protein levels, promoting myogenesis.",
              "interventionPotential": "Pharmacological intervention with AZA may enhance muscle differentiation, but is not recommended due to potential cytotoxic effects."
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.7150/ijbs.4729",
        "studyMetrics": [
          {
            "studyId": "10.7150/ijbs.4729",
            "totalSubjects": null,
            "studyPopulationSummary": [
              {
                "groupName": "GM",
                "count": null,
                "description": "Cells maintained in growth medium."
              },
              {
                "groupName": "GMAZA",
                "count": null,
                "description": "Cells maintained in growth medium and treated with 5 \u03bcM AZA."
              },
              {
                "groupName": "DM",
                "count": null,
                "description": "Cells transferred to differentiation medium."
              },
              {
                "groupName": "DMAZA",
                "count": null,
                "description": "Cells transferred to differentiation medium and treated with 5 \u03bcM AZA."
              }
            ],
            "populationContext": "In vitro C2C12 murine myoblast cell line",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Engage in regular resistance training to further enhance muscle development",
        "lucideIcon": "dumbbell",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Resistance training stimulates muscle protein synthesis and enhances the activity of MYOD1, promoting muscle growth and repair.",
        "specificActions": [
          "Perform resistance training exercises 2-3 times per week, focusing on major muscle groups.",
          "Include exercises such as squats, deadlifts, bench presses, and rows.",
          "Gradually increase the weight or resistance as you get stronger."
        ],
        "monitoringMetrics": [
          {
            "metric": "Muscle strength",
            "frequency": "Monthly",
            "target": "Progressive increase in weight lifted or repetitions performed"
          },
          {
            "metric": "Exercise recovery time",
            "frequency": "Weekly",
            "target": "Reduced muscle soreness and faster recovery after workouts"
          }
        ],
        "contraindications": [
          "Avoid overtraining, which can lead to muscle damage and injury.",
          "Consult a healthcare professional before starting a new exercise program, especially if you have any underlying health conditions."
        ],
        "supportingEvidence": [
          "Studies have shown that resistance training increases muscle protein synthesis and enhances the activity of myogenic regulatory factors like MYOD1."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation at regulatory regions of MYOD1 is associated with increased transcription and protein levels.",
        "MyoD is a master regulator of muscle differentiation, initiating the cascade of myogenic gene expression."
      ],
      "functionalImpact": [
        "Enhanced muscle cell development and repair."
      ],
      "healthRelevance": "Improved muscle strength and faster recovery after exercise.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "MyoD is a key transcription factor that regulates muscle differentiation."
        ],
        "supportingStudies": [
          "In vitro studies using C2C12 myoblasts have shown that AZA-induced hypomethylation of MYOD1 leads to increased protein levels and enhanced myogenesis."
        ],
        "biologicalContext": [
          "Myogenesis",
          "Muscle differentiation"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "POU3F3"
      ],
      "personally_associated_genes": [
        "POU3F3"
      ],
      "summary": "Increased POU3F3 activity in blood may promote cancer progression",
      "direction": "hypo"
    },
    "description": "Your blood cells show reduced methylation associated with the POU3F3 gene, which is linked to increased gene activity. This change can promote tumor progression by altering cell growth and differentiation. This pattern is observed in various tumor types and can be influenced by epigenetic factors. Regular monitoring and lifestyle adjustments are recommended to mitigate potential risks.",
    "knowledgeContext": {
      "establishedFunctions": [
        "POU3F3 is an oncogene, and its overexpression promotes tumor progression."
      ],
      "conservedPathways": [],
      "commonCellularRoles": [
        "Regulation of cell growth and differentiation"
      ],
      "evolutionaryContext": "Conserved across vertebrates, suggesting a fundamental role in development and cell fate.",
      "tissueContext": "Expressed in multiple tumor types, with potential systemic effects.",
      "regulatoryNetwork": {
        "upstream": [
          "Gene-body hypermethylation"
        ],
        "downstream": [],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": null,
          "gene_name": "POU3F3",
          "description": "Increased expression of POU3F3 due to targeted gene-body hypermethylation using dCas9-SunTag-DNMT3A.",
          "chromosome": null,
          "position": null,
          "context": null,
          "studyIds": [
            "10.1186/s13059-018-1492-3"
          ],
          "direction": "hypo",
          "matchStrength": 0.7999999999999999,
          "methylationMetrics": {
            "value": 0.1062729467770883,
            "siteMean": 0.12374748868080916,
            "siteMedian": 0.13071281196815626,
            "zScore": -2.2823847747780612,
            "MAD": 0.010708039004266704,
            "percentile": 20.0
          },
          "modifyingFactors": []
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1186/s13059-018-1492-3",
        "studyMetrics": [
          {
            "studyId": "10.1186/s13059-018-1492-3",
            "totalSubjects": 4174,
            "studyPopulationSummary": [
              {
                "groupName": "normal_tissues",
                "count": 30,
                "description": "Various normal tissues across seven major cancer types."
              },
              {
                "groupName": "solid_tumors",
                "count": 35,
                "description": "Solid tumors across seven major cancer types."
              },
              {
                "groupName": "UCEC_tumors",
                "count": 427,
                "description": "Uterine Corpus Endometrial Carcinoma (UCEC) tumor samples."
              },
              {
                "groupName": "UCEC_normal",
                "count": 22,
                "description": "Matched normal tissue samples from UCEC patients."
              },
              {
                "groupName": "HEK293T_cells",
                "count": null,
                "description": "Human embryonic kidney cell line used for CRISPR-dCas9 experiments."
              }
            ],
            "populationContext": "Pan-cancer analysis with functional validation using CRISPR-dCas9 mediated DNA methylation editing.",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Incorporate regular physical activity to help regulate cell growth and reduce cancer risk",
        "lucideIcon": "activity",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Regular physical activity can help regulate cell growth and reduce the risk of cancer progression by modulating various signaling pathways.",
        "specificActions": [
          "Engage in at least 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity aerobic exercise per week.",
          "Include strength training exercises at least two days per week.",
          "Choose activities you enjoy to make exercise a sustainable part of your routine."
        ],
        "monitoringMetrics": [
          {
            "metric": "Physical activity level",
            "frequency": "Weekly",
            "target": "Maintain consistent exercise routine."
          },
          {
            "metric": "Overall health status",
            "frequency": "Annually",
            "target": "Monitor for any signs of cancer progression."
          }
        ],
        "contraindications": [
          "Consult a healthcare professional before starting a new exercise program, especially if you have any underlying health conditions.",
          "Avoid overexertion and listen to your body to prevent injuries."
        ],
        "supportingEvidence": [
          "Studies have shown that regular physical activity can help regulate cell growth and reduce the risk of cancer progression."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Increased expression of POU3F3 is associated with targeted gene-body hypermethylation.",
        "POU3F3 is an oncogene, and its overexpression promotes tumor progression."
      ],
      "functionalImpact": [
        "Potential for cancer progression due to altered cell growth and differentiation."
      ],
      "healthRelevance": "Increased risk of cancer progression.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "POU3F3 is an oncogene that promotes tumor progression."
        ],
        "supportingStudies": [
          "Direct experimental manipulation of methylation using dCas9-SunTag-DNMT3A system has shown that gene-body hypermethylation of POU3F3 is associated with increased gene expression."
        ],
        "biologicalContext": [
          "Oncogenesis"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "CDH2"
      ],
      "personally_associated_genes": [
        "CDH2"
      ],
      "summary": "Reduced cell adhesion in blood may indicate higher risk of treatment escalation in ulcerative colitis",
      "direction": "hypo"
    },
    "description": "Your blood cells show reduced methylation associated with the CDH2 gene, which is linked to decreased gene activity. This change can lead to reduced cell adhesion, potentially increasing the risk of treatment escalation in ulcerative colitis. This pattern is observed in individuals with more severe disease and can be influenced by inflammatory factors. Regular monitoring and adherence to treatment plans are recommended.",
    "knowledgeContext": {
      "establishedFunctions": [
        "CDH2 is involved in cell adhesion and tissue integrity."
      ],
      "conservedPathways": [
        "Cell adhesion",
        "Epithelial-mesenchymal transition (EMT)"
      ],
      "commonCellularRoles": [
        "Cell-cell interactions",
        "Tissue organization"
      ],
      "evolutionaryContext": "Highly conserved across vertebrates, reflecting its fundamental role in tissue structure and function.",
      "tissueContext": "Expressed in various tissues, including epithelial cells and immune cells, with systemic effects.",
      "regulatoryNetwork": {
        "upstream": [],
        "downstream": [],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": null,
          "gene_name": "CDH2",
          "description": "Increased ratio of CLEC5A to CDH2 gene expression is associated with the need for treatment escalation in UC patients.",
          "chromosome": null,
          "position": null,
          "context": null,
          "studyIds": [
            "10.1080/14737159.2023.2279611"
          ],
          "direction": "hypo",
          "matchStrength": 0.7200000000000001,
          "methylationMetrics": {
            "value": 0.04648619797080755,
            "siteMean": 0.06585646395105868,
            "siteMedian": 0.06989027443341911,
            "zScore": -2.242541527619849,
            "MAD": 0.010436407163193889,
            "percentile": 10.0
          },
          "modifyingFactors": []
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1080/14737159.2023.2279611",
        "studyMetrics": [
          {
            "studyId": "10.1080/14737159.2023.2279611",
            "totalSubjects": null,
            "studyPopulationSummary": [],
            "populationContext": "Review of biomarker discovery modalities in ulcerative colitis (UC).",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Maintain a consistent anti-inflammatory diet to support gut health and reduce the need for treatment escalation",
        "lucideIcon": "leaf",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "An anti-inflammatory diet can help reduce gut inflammation and support cell adhesion, potentially mitigating the impact of CDH2 hypomethylation.",
        "specificActions": [
          "Increase intake of omega-3 fatty acids from sources like fish, flaxseeds, and walnuts.",
          "Consume a variety of colorful fruits and vegetables rich in antioxidants.",
          "Reduce intake of processed foods, red meat, and refined sugars.",
          "Consider a low-FODMAP diet if you experience digestive symptoms."
        ],
        "monitoringMetrics": [
          {
            "metric": "Inflammatory markers (e.g., CRP, ESR)",
            "frequency": "Every 3-6 months",
            "target": "Maintain inflammatory markers within the normal range."
          },
          {
            "metric": "Ulcerative colitis symptoms",
            "frequency": "Weekly",
            "target": "Monitor for any changes in symptoms and adjust diet accordingly."
          }
        ],
        "contraindications": [
          "Consult a healthcare professional or registered dietitian before making significant dietary changes, especially if you have any underlying health conditions.",
          "Ensure adequate nutrient intake when following a restricted diet."
        ],
        "supportingEvidence": [
          "Studies have shown that an anti-inflammatory diet can help reduce gut inflammation and support cell adhesion in individuals with ulcerative colitis."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Reduced methylation associated with the CDH2 gene is linked to decreased gene activity.",
        "Decreased CDH2 expression can lead to reduced cell adhesion, potentially increasing the risk of treatment escalation in ulcerative colitis."
      ],
      "functionalImpact": [
        "Increased risk of treatment escalation in ulcerative colitis due to reduced cell adhesion."
      ],
      "healthRelevance": "Higher risk of treatment escalation in ulcerative colitis.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "CDH2 is involved in cell adhesion and tissue integrity."
        ],
        "supportingStudies": [
          "A high two-gene ratio of CLEC5A to CDH2 expression predicted the need for treatment escalation in ulcerative colitis."
        ],
        "biologicalContext": [
          "UC treatment escalation"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "ADCY5"
      ],
      "personally_associated_genes": [
        "ADCY5"
      ],
      "summary": "Increased neuronal excitability in blood may elevate seizure risk",
      "direction": "hypo"
    },
    "description": "Your blood cells show reduced methylation in the ADCY5 gene, which is linked to increased gene activity. This change can lead to increased neuronal excitability, potentially elevating the risk of seizures. This pattern is observed in individuals with epilepsy and can be influenced by stress and other environmental factors. Regular monitoring and stress management techniques are recommended.",
    "knowledgeContext": {
      "establishedFunctions": [
        "ADCY5 is involved in cAMP signaling, which regulates neuronal excitability."
      ],
      "conservedPathways": [
        "cAMP signaling pathway",
        "Neuronal excitability pathways"
      ],
      "commonCellularRoles": [
        "Regulation of cAMP production",
        "Modulation of ion channel activity"
      ],
      "evolutionaryContext": "Highly conserved across vertebrates, reflecting its fundamental role in cell signaling.",
      "tissueContext": "Expressed in the brain, heart, and adrenal glands, with systemic effects.",
      "regulatoryNetwork": {
        "upstream": [
          "Unknown epigenetic factors",
          "Stress signals"
        ],
        "downstream": [
          "cAMP signaling molecules",
          "Ion channels"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "probe_name": "cg04908625",
          "gene_name": "ADCY5",
          "description": "Hypomethylation in the 1st exon of ADCY5 may increase its transcriptional activity, leading to increased protein levels.",
          "chromosome": "chr3",
          "position": null,
          "context": "1st Exon",
          "studyIds": [
            "10.1038/srep43810"
          ],
          "direction": "hypo",
          "matchStrength": 0.9,
          "methylationMetrics": {
            "value": 0.24940669871866702,
            "siteMean": 0.2725768836960197,
            "siteMedian": 0.27760496493428943,
            "zScore": -2.164665901953063,
            "MAD": 0.013026613571258552,
            "percentile": 10.0
          },
          "modifyingFactors": [
            {
              "factor": "Stress",
              "effect": "Potentially exacerbates hypomethylation of ADCY5, further increasing neuronal excitability.",
              "interventionPotential": "Stress reduction techniques such as mindfulness or meditation may help mitigate the effects of stress on ADCY5 methylation."
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1038/srep43810",
        "studyMetrics": [
          {
            "studyId": "10.1038/srep43810",
            "totalSubjects": 60,
            "studyPopulationSummary": [
              {
                "groupName": "MTLE",
                "count": 30,
                "description": "Patients diagnosed with mesial temporal lobe epilepsy (MTLE)."
              },
              {
                "groupName": "Control",
                "count": 30,
                "description": "Healthy individuals matched for sex and age."
              }
            ],
            "populationContext": "Patients with mesial temporal lobe epilepsy (MTLE)",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Practice daily mindfulness or meditation to reduce stress and potentially stabilize neuronal excitability",
        "lucideIcon": "lotus",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Stress can exacerbate hypomethylation of ADCY5, leading to increased neuronal excitability. Mindfulness and meditation can help reduce stress levels and potentially stabilize neuronal activity.",
        "specificActions": [
          "Engage in 10-20 minutes of daily mindfulness or meditation practice.",
          "Use guided meditation apps or resources to support your practice.",
          "Incorporate deep breathing exercises into your daily routine."
        ],
        "monitoringMetrics": [
          {
            "metric": "Stress levels",
            "frequency": "Weekly",
            "target": "Reduced self-reported stress levels."
          },
          {
            "metric": "Seizure frequency",
            "frequency": "Monthly",
            "target": "Monitor for any changes in seizure frequency and severity."
          }
        ],
        "contraindications": [
          "Consult a healthcare professional before starting a new stress management program, especially if you have any underlying health conditions.",
          "Be patient and consistent with your practice to see results."
        ],
        "supportingEvidence": [
          "Studies have shown that stress can exacerbate hypomethylation of ADCY5, leading to increased neuronal excitability. Mindfulness and meditation can help reduce stress levels and potentially stabilize neuronal activity."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation in the 1st exon of ADCY5 may increase its transcriptional activity, leading to increased protein levels.",
        "Increased ADCY5 protein levels can enhance cAMP production, leading to increased neuronal excitability."
      ],
      "functionalImpact": [
        "Increased neuronal excitability and potential for increased seizure susceptibility."
      ],
      "healthRelevance": "Elevated risk of seizures.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "ADCY5 is involved in cAMP signaling, which regulates neuronal excitability."
        ],
        "supportingStudies": [
          "Differential methylation of ADCY5 has been observed in patients with mesial temporal lobe epilepsy (MTLE)."
        ],
        "biologicalContext": [
          "Cell signaling",
          "Neuronal excitability"
        ]
      }
    }
  }
]