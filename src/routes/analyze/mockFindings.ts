export const mockFindings = [
  {
    "pattern": {
      "gene_list": [
        "KLRB1"
      ],
      "personally_associated_genes": [
        "KLRB1"
      ],
      "summary": "Decreased immune cell activation in blood reduces inflammatory responses and infection defense",
      "direction": "hyper"
    },
    "description": "Your blood cells show changes in how they respond to infections and inflammation. Specifically, there is reduced activity of immune cells called natural killer T (NKT) cells, which help coordinate immune responses. This pattern affects how quickly and strongly your immune system reacts to threats. The effect is most pronounced during initial immune responses and can be modified through lifestyle factors that support immune function.",
    "knowledgeContext": {
      "establishedFunctions": [
        "NKT cell activation",
        "Inflammatory response regulation",
        "Immune cell signaling"
      ],
      "conservedPathways": [
        "T cell receptor signaling",
        "Cytokine production",
        "Cell-mediated immunity"
      ],
      "commonCellularRoles": [
        "Immune cell activation",
        "Inflammatory response",
        "Pathogen defense"
      ],
      "evolutionaryContext": "KLRB1 is highly conserved across species and plays a fundamental role in immune system function",
      "tissueContext": "Primarily expressed in blood immune cells, particularly NKT cells",
      "regulatoryNetwork": {
        "upstream": [
          "Cytokine signaling",
          "T cell receptor activation"
        ],
        "downstream": [
          "Inflammatory mediators",
          "Immune cell recruitment"
        ],
        "feedback": [
          "Cytokine production",
          "T cell proliferation"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "KLRB1",
          "gene_name": "KLRB1",
          "description": "Hypermethylation associated with decreased KLRB1 expression in NKT cells",
          "chromosome": "12",
          "position": 9822124,
          "context": "promoter",
          "studyIds": [
            "10.1101/783126"
          ],
          "direction": "hyper",
          "matchStrength": 0.72,
          "methylationMetrics": {
            "value": 0.7842900156974792,
            "percentile": 95.85736028076259,
            "z_score": 55.777853308839354,
            "population_distribution": {
              "q5": 0.5723353236913681,
              "q25": 0.6521209627389908,
              "q75": 0.6545347745951582,
              "q95": 0.7396467000246048,
              "mean": 0.6545347805346001,
              "median": 0.6545347745951582,
              "std": 0.04621774421841687,
              "mad": 0.001569079929249373
            }
          },
          "modifyingFactors": [
            {
              "factor": "Smoking exposure",
              "effect": "Further decreases KLRB1 expression",
              "interventionPotential": "Smoking cessation may help normalize expression"
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1101/783126",
        "studyMetrics": [
          {
            "studyId": "10.1101/783126",
            "totalSubjects": 8,
            "studyPopulationSummary": [
              {
                "groupName": "smokers",
                "count": 4,
                "description": "Current smokers with serum cotinine levels 240-511 ng/ml"
              },
              {
                "groupName": "nonsmokers",
                "count": 4,
                "description": "Never smokers with cotinine <2 ng/ml"
              }
            ],
            "populationContext": "Adult males and females matched by gender and race",
            "effectSizes": [
              0.72
            ]
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Perform zone 2 cardio exercise 3-4 times per week",
        "lucideIcon": "heart-pulse",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Regular moderate exercise helps normalize immune cell function and inflammatory responses",
        "specificActions": [
          "Maintain heart rate between 120-140 bpm for 30-45 minutes",
          "Focus on steady-state activities like walking, cycling, or swimming",
          "Allow 24-48 hours between sessions for recovery"
        ],
        "monitoringMetrics": [
          {
            "metric": "Resting heart rate",
            "frequency": "Daily",
            "target": "Reduction of 5-10 bpm over 8-12 weeks"
          }
        ],
        "contraindications": [
          "Acute illness or infection",
          "Severe fatigue",
          "Recent injury"
        ],
        "supportingEvidence": [
          "Regular moderate exercise reduces systemic inflammation",
          "Zone 2 cardio improves immune cell function"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "KLRB1 hypermethylation reduces NKT cell activation",
        "Decreased KLRB1 expression impairs immune responses",
        "Effect is most pronounced in initial immune activation"
      ],
      "functionalImpact": [
        "Reduced inflammatory response",
        "Decreased pathogen defense",
        "Altered immune cell signaling"
      ],
      "healthRelevance": "May affect ability to mount effective immune responses to infections and inflammatory triggers",
      "knowledgeBase": {
        "establishedMechanisms": [
          "KLRB1 regulates NKT cell activation",
          "DNA methylation controls KLRB1 expression"
        ],
        "supportingStudies": [
          "Single-cell RNA sequencing of immune cells",
          "DNA methylation analysis in blood cells"
        ],
        "biologicalContext": [
          "Immune system regulation",
          "Inflammatory response",
          "Host defense"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "HDAC11"
      ],
      "personally_associated_genes": [
        "HDAC11"
      ],
      "summary": "Enhanced memory formation and learning capacity improves cognitive performance",
      "direction": "hyper"
    },
    "description": "Your cells show changes in how they regulate gene activity related to memory formation and learning. This pattern affects how efficiently your brain forms and consolidates new memories. The effect is most noticeable during active learning and can be enhanced through activities that promote cognitive engagement. Regular mental stimulation and proper sleep help optimize this memory-enhancing pattern.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Histone deacetylation",
        "Gene expression regulation",
        "Memory formation"
      ],
      "conservedPathways": [
        "Epigenetic regulation",
        "Synaptic plasticity",
        "Memory consolidation"
      ],
      "commonCellularRoles": [
        "Gene silencing",
        "Chromatin modification",
        "Neural plasticity"
      ],
      "evolutionaryContext": "HDAC11 is conserved across species and plays a key role in memory-related gene regulation",
      "tissueContext": "Expressed in blood cells and neural tissue",
      "regulatoryNetwork": {
        "upstream": [
          "Neural activity",
          "Learning stimuli"
        ],
        "downstream": [
          "Memory-related genes",
          "Synaptic proteins"
        ],
        "feedback": [
          "Gene expression patterns",
          "Chromatin states"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "HDAC11",
          "gene_name": "HDAC11",
          "description": "Hypermethylation associated with enhanced memory formation",
          "chromosome": "3",
          "position": 13523543,
          "context": "promoter",
          "studyIds": [
            "10.1523/JNEUROSCI.2407-18.2019"
          ],
          "direction": "hyper",
          "matchStrength": 0.56,
          "methylationMetrics": {
            "value": 0.8830400109291077,
            "percentile": 95.11024337731739,
            "z_score": 76.06637498778232,
            "population_distribution": {
              "q5": 0.005350254406221211,
              "q25": 0.010582254035398364,
              "q75": 0.842604786157608,
              "q95": 0.8804030567407607,
              "mean": 0.2159862034378082,
              "median": 0.05205853842198849,
              "std": 0.015165524847329317,
              "mad": 0.007368525229394436
            }
          },
          "modifyingFactors": [
            {
              "factor": "Cognitive activity",
              "effect": "Enhances memory formation",
              "interventionPotential": "Regular mental stimulation may optimize effects"
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1523/JNEUROSCI.2407-18.2019",
        "studyMetrics": [
          {
            "studyId": "10.1523/JNEUROSCI.2407-18.2019",
            "totalSubjects": 35,
            "studyPopulationSummary": [
              {
                "groupName": "VNS",
                "count": 18,
                "description": "Vagus nerve stimulation group"
              },
              {
                "groupName": "control",
                "count": 17,
                "description": "Sham stimulation group"
              }
            ],
            "populationContext": "Adult male rats",
            "effectSizes": [
              0.56
            ]
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Engage in daily cognitive training exercises",
        "lucideIcon": "brain",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Regular cognitive training enhances memory formation and neural plasticity",
        "specificActions": [
          "Complete 15-20 minutes of memory games or puzzles",
          "Learn a new skill or language",
          "Practice recall exercises",
          "Engage in social learning activities"
        ],
        "monitoringMetrics": [
          {
            "metric": "Memory performance",
            "frequency": "Weekly",
            "target": "Improvement in recall accuracy and speed"
          }
        ],
        "contraindications": [
          "Mental fatigue",
          "Sleep deprivation",
          "Acute stress"
        ],
        "supportingEvidence": [
          "Cognitive training improves memory performance",
          "Regular mental stimulation enhances neural plasticity"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "HDAC11 regulates memory-related gene expression",
        "Methylation changes affect learning capacity",
        "Effect is enhanced by cognitive stimulation"
      ],
      "functionalImpact": [
        "Enhanced memory formation",
        "Improved learning capacity",
        "Better cognitive performance"
      ],
      "healthRelevance": "May enhance ability to form and retain new memories",
      "knowledgeBase": {
        "establishedMechanisms": [
          "HDAC11 controls memory-related genes",
          "Methylation regulates HDAC11 expression"
        ],
        "supportingStudies": [
          "Animal studies of memory formation",
          "Epigenetic analysis of learning"
        ],
        "biologicalContext": [
          "Memory formation",
          "Neural plasticity",
          "Cognitive function"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "IL36RN"
      ],
      "personally_associated_genes": [
        "IL36RN"
      ],
      "summary": "Decreased inflammatory response in blood reduces systemic inflammation",
      "direction": "hypo"
    },
    "description": "Your blood cells show changes in how they regulate inflammation throughout your body. Specifically, there is reduced activity of inflammatory signals that can contribute to systemic inflammation. This pattern affects how strongly your body responds to inflammatory triggers. The effect is most pronounced during immune responses and can be supported through anti-inflammatory lifestyle factors.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Inflammatory regulation",
        "Immune response control",
        "Cytokine signaling"
      ],
      "conservedPathways": [
        "Inflammatory signaling",
        "Immune regulation",
        "Cytokine production"
      ],
      "commonCellularRoles": [
        "Inflammation control",
        "Immune modulation",
        "Tissue protection"
      ],
      "evolutionaryContext": "IL36RN is conserved and important for inflammatory regulation",
      "tissueContext": "Expressed in blood cells and immune tissue",
      "regulatoryNetwork": {
        "upstream": [
          "Inflammatory triggers",
          "Immune activation"
        ],
        "downstream": [
          "Inflammatory mediators",
          "Immune responses"
        ],
        "feedback": [
          "Inflammation levels",
          "Immune state"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "IL36RN",
          "gene_name": "IL36RN",
          "description": "Hypomethylation associated with reduced inflammatory response",
          "chromosome": "2",
          "position": 113825449,
          "context": "promoter",
          "studyIds": [
            "10.3389/fphys.2020.00687"
          ],
          "direction": "hypo",
          "matchStrength": 0.72,
          "methylationMetrics": {
            "value": 0.3545700013637543,
            "percentile": 3.523857565957348,
            "z_score": -15.27738050413599,
            "population_distribution": {
              "q5": 0.5030992239713669,
              "q25": 0.534242257475853,
              "q75": 0.7383195906877518,
              "q95": 0.8087968200445174,
              "mean": 0.6572739276994152,
              "median": 0.6999476447177293,
              "std": 0.04211526326398287,
              "mad": 0.015248505486865923
            }
          },
          "modifyingFactors": [
            {
              "factor": "Inflammatory triggers",
              "effect": "May increase inflammation",
              "interventionPotential": "Anti-inflammatory lifestyle may help maintain benefits"
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.3389/fphys.2020.00687",
        "studyMetrics": [
          {
            "studyId": "10.3389/fphys.2020.00687",
            "totalSubjects": 221,
            "studyPopulationSummary": [
              {
                "groupName": "review",
                "count": 221,
                "description": "Review of inflammatory regulation studies"
              }
            ],
            "populationContext": "Review of inflammatory regulation studies",
            "effectSizes": [
              0.72
            ]
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Follow an anti-inflammatory lifestyle",
        "lucideIcon": "heart",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Anti-inflammatory practices help maintain reduced inflammatory signaling",
        "specificActions": [
          "Consume anti-inflammatory foods daily",
          "Practice stress management techniques",
          "Maintain regular sleep schedule",
          "Engage in moderate exercise"
        ],
        "monitoringMetrics": [
          {
            "metric": "Inflammatory markers",
            "frequency": "Quarterly",
            "target": "Within normal range"
          }
        ],
        "contraindications": [
          "Active infection",
          "Autoimmune flare",
          "Acute injury"
        ],
        "supportingEvidence": [
          "Anti-inflammatory lifestyle reduces systemic inflammation",
          "Lifestyle factors modulate immune response"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "IL36RN regulates inflammatory responses",
        "Reduced expression decreases inflammation",
        "Effect is modulated by immune triggers"
      ],
      "functionalImpact": [
        "Reduced inflammatory signaling",
        "Decreased systemic inflammation",
        "Modified immune response"
      ],
      "healthRelevance": "May reduce risk of inflammation-related conditions",
      "knowledgeBase": {
        "establishedMechanisms": [
          "IL36RN controls inflammatory signaling",
          "Expression affects immune response"
        ],
        "supportingStudies": [
          "Inflammatory regulation studies",
          "Immune response research"
        ],
        "biologicalContext": [
          "Inflammation control",
          "Immune regulation",
          "Tissue protection"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "RPL23AP82",
        "RABL2B"
      ],
      "personally_associated_genes": [
        "RPL23AP82"
      ],
      "summary": "Increased DNA methylation in cell growth regulators suggests enhanced cellular growth control in blood cells",
      "direction": "hyper"
    },
    "description": "Your blood cells show elevated methylation of genes involved in regulating cell growth and division. This pattern affects how your cells control their growth cycles and maintain appropriate cell numbers. The changes are most pronounced in circulating blood cells and may influence their renewal and turnover rates. This methylation pattern helps maintain stable cell populations while preventing excessive proliferation.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Cell growth regulation",
        "Cell cycle control",
        "Cellular proliferation"
      ],
      "conservedPathways": [
        "Cell cycle checkpoints",
        "Growth factor signaling"
      ],
      "commonCellularRoles": [
        "Cell division control",
        "Growth regulation",
        "Population maintenance"
      ],
      "evolutionaryContext": "Cell growth control mechanisms are highly conserved across species",
      "tissueContext": "Primary effects in blood cells with potential systemic impacts",
      "regulatoryNetwork": {
        "upstream": [
          "Growth factors",
          "Cell cycle regulators"
        ],
        "downstream": [
          "Cell division genes",
          "Proliferation factors"
        ],
        "feedback": [
          "Cell density sensing",
          "Contact inhibition"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "RPL23AP82",
          "gene_name": "RPL23AP82",
          "description": "Methylation site in RPL23AP82 gene body and regulatory regions",
          "chromosome": "16",
          "position": 24640902,
          "context": "Body; 1stExon; TSS200; 5'UTR",
          "studyIds": [
            "10.1161/HYPERTENSIONAHA.119.14509"
          ],
          "direction": "hyper",
          "matchStrength": 0.8,
          "methylationMetrics": {
            "value": 0.408284991979599,
            "percentile": 95.75641416820777,
            "z_score": 64.24903233438717,
            "population_distribution": {
              "q5": 0.0003085626085521654,
              "q25": 0.004890200798399746,
              "q75": 0.28831737488508224,
              "q95": 0.3028124898672103,
              "mean": 0.05062093448046842,
              "median": 0.025889236479997635,
              "std": 0.006969590067233265,
              "mad": 0.004014471933866541
            }
          },
          "modifyingFactors": [
            {
              "factor": "Cell cycle phase",
              "effect": "Methylation levels may vary with cell cycle stage",
              "interventionPotential": "Cell cycle synchronization could normalize methylation"
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1161/HYPERTENSIONAHA.119.14509",
        "studyMetrics": [
          {
            "studyId": "10.1161/HYPERTENSIONAHA.119.14509",
            "totalSubjects": 301,
            "studyPopulationSummary": [
              {
                "groupName": "Total participants",
                "count": 301,
                "description": "Adult participants without major pre-existing conditions"
              }
            ],
            "populationContext": "Adult participants without major pre-existing medical conditions",
            "effectSizes": [
              0.8
            ]
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Optimize cellular growth cycles through timed fasting",
        "lucideIcon": "clock",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Intermittent fasting can help regulate cell growth patterns and methylation",
        "specificActions": [
          "Practice 16/8 intermittent fasting 3 days per week",
          "Break fast with protein-rich foods",
          "Stay hydrated during fasting periods",
          "Monitor energy levels and adjust timing as needed"
        ],
        "monitoringMetrics": [
          {
            "metric": "Fasting window adherence",
            "frequency": "Daily",
            "target": "16 hour fasting window"
          }
        ],
        "contraindications": [
          "Active infection or illness",
          "Pregnancy or nursing",
          "History of eating disorders"
        ],
        "supportingEvidence": [
          "Fasting influences cellular growth patterns",
          "Timing of nutrient intake affects methylation"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypermethylation of RPL23AP82 suggests enhanced growth control",
        "RABL2B involvement indicates regulated cell division",
        "Methylation pattern supports controlled proliferation"
      ],
      "functionalImpact": [
        "Regulated blood cell turnover",
        "Balanced cell population maintenance"
      ],
      "healthRelevance": "Proper control of blood cell growth and division is essential for maintaining healthy blood cell populations",
      "knowledgeBase": {
        "establishedMechanisms": [
          "DNA methylation regulates gene expression",
          "Cell growth genes are methylation-sensitive"
        ],
        "supportingStudies": [
          "Studies showing RPL23AP82 role in growth",
          "Research on blood cell turnover regulation"
        ],
        "biologicalContext": [
          "Blood cell renewal",
          "Growth control pathways"
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
      "summary": "Enhanced peptide processing in blood cells strengthens neurotransmitter regulation",
      "direction": "hyper"
    },
    "description": "Your blood cells show increased activity of MME, an enzyme that helps break down and regulate important signaling molecules. This change enhances your cells' ability to process and regulate various peptides and neurotransmitters. The effect is particularly important for maintaining balanced signaling in your nervous and cardiovascular systems. This pattern suggests your cells have an enhanced capacity to regulate these important molecular signals.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Peptide degradation and processing",
        "Neurotransmitter regulation",
        "Cell surface peptidase activity"
      ],
      "conservedPathways": [
        "Peptide processing pathway",
        "Signal peptide regulation",
        "Membrane protein processing"
      ],
      "commonCellularRoles": [
        "Peptide degradation",
        "Signal molecule processing",
        "Membrane protein regulation"
      ],
      "evolutionaryContext": "Highly conserved peptidase important for signal molecule processing across species",
      "tissueContext": "Expressed in blood cells and various tissues including nervous system",
      "regulatoryNetwork": {
        "upstream": [
          "DNA methyltransferases",
          "Transcription factors"
        ],
        "downstream": [
          "Peptide substrates",
          "Signaling molecules"
        ],
        "feedback": [
          "Peptide levels",
          "Signal molecule concentration"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "MME",
          "gene_name": "MME",
          "description": "Hypermethylation of MME promoter region",
          "chromosome": "3",
          "position": 154741958,
          "context": "promoter",
          "studyIds": [
            "10.3892/or.2015.3993"
          ],
          "direction": "hyper",
          "matchStrength": 0.9,
          "methylationMetrics": {
            "value": 0.8777499794960022,
            "percentile": 95.36502908609415,
            "z_score": 66.45158445907043,
            "population_distribution": {
              "q5": 0.0039054177468642605,
              "q25": 0.01062086969614029,
              "q75": 0.8347938507795334,
              "q95": 0.8681221276521682,
              "mean": 0.11242047106164486,
              "median": 0.04330078698694706,
              "std": 0.018489596724197904,
              "mad": 0.00846986546564628
            }
          },
          "modifyingFactors": [
            {
              "factor": "Neurotransmitter levels",
              "effect": "Can influence MME expression",
              "interventionPotential": "Modifiable through lifestyle and dietary factors"
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.3892/or.2015.3993",
        "studyMetrics": [
          {
            "studyId": "10.3892/or.2015.3993",
            "totalSubjects": 110,
            "studyPopulationSummary": [
              {
                "groupName": "Total",
                "count": 110,
                "description": "Adult subjects with methylation analysis"
              }
            ],
            "populationContext": "Adult subjects",
            "effectSizes": [
              0.9
            ]
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Time exercise to optimize peptide regulation",
        "lucideIcon": "activity",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Exercise timing can enhance natural peptide processing rhythms",
        "specificActions": [
          "Perform moderate aerobic exercise for 30-45 minutes in the morning",
          "Maintain consistent daily exercise schedule",
          "Stay hydrated before and after exercise"
        ],
        "monitoringMetrics": [
          {
            "metric": "Morning heart rate variability",
            "frequency": "Daily",
            "target": "Increase of 10% from baseline"
          }
        ],
        "contraindications": [
          "Acute illness",
          "Severe fatigue",
          "Recent injury"
        ],
        "supportingEvidence": [
          "Exercise timing affects peptide processing",
          "Morning exercise optimizes regulatory pathways"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "MME hypermethylation leads to increased peptide processing",
        "Enhanced peptide regulation affects signaling pathways",
        "Blood-based measurements reflect systemic effects"
      ],
      "functionalImpact": [
        "Improved peptide processing capacity",
        "Enhanced signal molecule regulation"
      ],
      "healthRelevance": "Enhanced peptide processing may support healthy signaling regulation",
      "knowledgeBase": {
        "establishedMechanisms": [
          "MME regulates peptide processing",
          "Methylation affects MME expression"
        ],
        "supportingStudies": [
          "Blood-based methylation studies",
          "Peptide processing research"
        ],
        "biologicalContext": [
          "Peptide regulation pathway",
          "Signal processing systems"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "NOTCH2"
      ],
      "personally_associated_genes": [
        "NOTCH2"
      ],
      "summary": "Increased DNA methylation in blood cell signaling pathways affects cellular development and regeneration capacity",
      "direction": "hyper"
    },
    "description": "Your blood cells show elevated DNA methylation of NOTCH2, a key regulator of cell development and renewal. This pattern suggests reduced NOTCH2 activity, which can affect how your blood and immune cells develop and function. This molecular change may influence your body's cellular regeneration processes and immune system responses. The effect is particularly relevant for blood cell development and tissue repair mechanisms.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Cell fate determination",
        "Stem cell maintenance",
        "Tissue regeneration"
      ],
      "conservedPathways": [
        "Notch signaling pathway",
        "Cell differentiation",
        "Developmental regulation"
      ],
      "commonCellularRoles": [
        "Cell fate decisions",
        "Progenitor cell maintenance",
        "Tissue homeostasis"
      ],
      "evolutionaryContext": "NOTCH2 is highly conserved across species and plays fundamental roles in development and tissue maintenance",
      "tissueContext": "Primarily active in blood cells and stem cell populations",
      "regulatoryNetwork": {
        "upstream": [
          "DNA methyltransferases",
          "Developmental signals"
        ],
        "downstream": [
          "HES/HEY family genes",
          "Cell cycle regulators"
        ],
        "feedback": [
          "Self-renewal pathways",
          "Differentiation signals"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "NOTCH2",
          "gene_name": "NOTCH2",
          "description": "Promoter region of NOTCH2 showing increased methylation",
          "chromosome": "1",
          "position": 120612017,
          "context": "promoter",
          "studyIds": [
            "10.1186/s13072-022-00440-z"
          ],
          "direction": "hyper",
          "matchStrength": 0.9,
          "methylationMetrics": {
            "value": 0.5932000279426575,
            "percentile": 96.27309984170955,
            "z_score": 57.23814388262713,
            "population_distribution": {
              "q5": 0.00004566356965369778,
              "q25": 0.001998909981921315,
              "q75": 0.4328911453485489,
              "q95": 0.45423816740512846,
              "mean": 0.14532454735170178,
              "median": 0.011935819871723652,
              "std": 0.01289449257235963,
              "mad": 0.006849675439298153
            }
          },
          "modifyingFactors": [
            {
              "factor": "Age",
              "effect": "Methylation may increase with age",
              "interventionPotential": "Lifestyle factors may modify age-related methylation"
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.1186/s13072-022-00440-z",
        "studyMetrics": [
          {
            "studyId": "10.1186/s13072-022-00440-z",
            "totalSubjects": 6,
            "studyPopulationSummary": [
              {
                "groupName": "lens_epithelial_cells",
                "count": 3,
                "description": "Undifferentiated lens epithelial cells"
              }
            ],
            "populationContext": "Cell differentiation study",
            "effectSizes": [
              0.9
            ]
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Engage in regular moderate exercise to optimize cellular regeneration",
        "lucideIcon": "activity",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Regular exercise has been shown to promote healthy NOTCH signaling and cellular regeneration",
        "specificActions": [
          "Perform 30 minutes of moderate aerobic exercise 5 times per week",
          "Include resistance training 2-3 times per week",
          "Maintain consistent exercise schedule"
        ],
        "monitoringMetrics": [
          {
            "metric": "Exercise frequency",
            "frequency": "Weekly",
            "target": "5 sessions per week"
          }
        ],
        "contraindications": [
          "Acute illness",
          "Severe cardiovascular conditions"
        ],
        "supportingEvidence": [
          "Exercise promotes cellular regeneration",
          "Physical activity supports healthy blood cell production"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "NOTCH2 hypermethylation reduces gene expression",
        "Reduced NOTCH2 activity affects cell development",
        "Changes in NOTCH signaling impact tissue regeneration"
      ],
      "functionalImpact": [
        "Altered blood cell development",
        "Modified tissue regeneration capacity"
      ],
      "healthRelevance": "Changes in NOTCH2 methylation can affect how effectively your body produces and maintains healthy blood cells",
      "knowledgeBase": {
        "establishedMechanisms": [
          "DNA methylation regulates gene expression",
          "NOTCH2 controls cell fate decisions"
        ],
        "supportingStudies": [
          "Studies showing NOTCH2 methylation affects cell development",
          "Research linking NOTCH signaling to blood cell formation"
        ],
        "biologicalContext": [
          "Blood cell development",
          "Tissue regeneration",
          "Cellular differentiation"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "NSD1",
        "CCDC144CP"
      ],
      "personally_associated_genes": [
        "NSD1",
        "CCDC144CP"
      ],
      "summary": "Enhanced histone modification control in blood cells strengthens cellular stability and gene regulation",
      "direction": "mixed"
    },
    "description": "Your blood cells show distinct patterns in genes controlling DNA packaging and organization. The NSD1 gene, which helps modify how DNA is stored and accessed, shows increased activity. Meanwhile, CCDC144CP, involved in cellular structure, shows decreased activity. This combination suggests your cells have enhanced control over gene regulation but may need support maintaining optimal structural stability. These patterns are most active during morning hours and can be influenced by specific lifestyle factors.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Histone methylation regulation",
        "Chromatin structure maintenance",
        "Gene expression control"
      ],
      "conservedPathways": [
        "Histone modification",
        "Epigenetic regulation",
        "Cellular structural organization"
      ],
      "commonCellularRoles": [
        "Gene expression regulation",
        "Chromatin remodeling",
        "Cellular architecture maintenance"
      ],
      "evolutionaryContext": "Histone modification systems are highly conserved across species, indicating their fundamental importance in cellular function",
      "tissueContext": "Primary effects observed in blood cells with potential systemic impacts on gene regulation",
      "regulatoryNetwork": {
        "upstream": [
          "Epigenetic modifiers",
          "Cellular stress response",
          "Metabolic state"
        ],
        "downstream": [
          "Histone methylation patterns",
          "Gene accessibility",
          "Cellular structure stability"
        ],
        "feedback": [
          "Chromatin state sensing",
          "Cellular stress adaptation",
          "Metabolic feedback"
        ]
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "NSD1",
          "gene_name": "NSD1",
          "description": "Histone methyltransferase involved in chromatin regulation",
          "chromosome": "5",
          "position": 176560000,
          "context": "gene body",
          "studyIds": [
            "10.5772/24818"
          ],
          "direction": "hyper",
          "matchStrength": 0.56,
          "methylationMetrics": {
            "value": 0.8312900066375732,
            "percentile": 95.08182000342927,
            "z_score": 51.538872459294886,
            "population_distribution": {
              "q5": 0.000051486519259924536,
              "q25": 0.0025907549425028265,
              "q75": 0.7984525114297867,
              "q95": 0.8284833073616028,
              "mean": 0.1981028274396168,
              "median": 0.05402481183409691,
              "std": 0.019947556185270974,
              "mad": 0.010172232120696987
            }
          },
          "modifyingFactors": [
            {
              "factor": "Time of day",
              "effect": "Activity peaks in morning hours",
              "interventionPotential": "Time interventions for morning hours"
            }
          ]
        },
        {
          "matched_probe": null,
          "matched_gene": "CCDC144CP",
          "gene_name": "CCDC144CP",
          "description": "Protein coding gene involved in cellular structure",
          "chromosome": "16",
          "position": 24640902,
          "context": "intron",
          "studyIds": [
            "10.3389/fcvm.2022.837725"
          ],
          "direction": "hypo",
          "matchStrength": 0.8,
          "methylationMetrics": {
            "value": 0.4370550066232681,
            "percentile": 3.7126083653502935,
            "z_score": -5.381512664692933,
            "population_distribution": {
              "q5": 0.5886090904474258,
              "q25": 0.6263230890035629,
              "q75": 0.6806283295154572,
              "q95": 0.7228673309087753,
              "mean": 0.6544091144093761,
              "median": 0.6534217596054077,
              "std": 0.04252909102579194,
              "mad": 0.027118653059005737
            }
          },
          "modifyingFactors": [
            {
              "factor": "Age",
              "effect": "Increased impact with age",
              "interventionPotential": "Support cellular stability"
            }
          ]
        }
      ],
      "studyContext": {
        "primaryStudyId": "10.5772/24818",
        "studyMetrics": [
          {
            "studyId": "10.5772/24818",
            "totalSubjects": 0,
            "studyPopulationSummary": [
              {
                "groupName": "Review",
                "count": 0,
                "description": "Review article analyzing methylation patterns"
              }
            ],
            "populationContext": "Review of methylation studies",
            "effectSizes": [
              0.56
            ]
          },
          {
            "studyId": "10.3389/fcvm.2022.837725",
            "totalSubjects": 221,
            "studyPopulationSummary": [
              {
                "groupName": "Discovery",
                "count": 110,
                "description": "Cardiac surgery patients"
              },
              {
                "groupName": "Validation",
                "count": 101,
                "description": "Cardiac surgery patients"
              }
            ],
            "populationContext": "Adult cardiac surgery patients",
            "effectSizes": [
              0.8
            ]
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Time physical activity to morning hours",
        "lucideIcon": "sun",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Morning exercise optimizes histone methylation patterns when NSD1 activity naturally peaks",
        "specificActions": [
          "Perform moderate aerobic exercise between 7-9am",
          "Start with 20-30 minutes of walking or cycling",
          "Gradually increase duration to 45-60 minutes",
          "Maintain heart rate at 60-70% of maximum"
        ],
        "monitoringMetrics": [
          {
            "metric": "Morning energy levels",
            "frequency": "Daily",
            "target": "Sustained improvement over 4 weeks"
          }
        ],
        "contraindications": [
          "Acute illness",
          "Severe fatigue",
          "Recent injury"
        ],
        "supportingEvidence": [
          "Circadian regulation of histone modifications",
          "Exercise effects on epigenetic patterns"
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "NSD1 hypermethylation suggests enhanced control over histone modifications",
        "CCDC144CP hypomethylation indicates altered structural protein regulation",
        "Combined effects suggest balanced regulation of cellular stability"
      ],
      "functionalImpact": [
        "Modified histone methylation patterns",
        "Altered cellular structural protein expression"
      ],
      "healthRelevance": "Enhanced control over gene regulation with potential implications for cellular stability and stress response",
      "knowledgeBase": {
        "establishedMechanisms": [
          "Histone methylation regulation",
          "Structural protein expression control"
        ],
        "supportingStudies": [
          "Review of methylation patterns in cellular regulation",
          "Clinical study of methylation in cardiac patients"
        ],
        "biologicalContext": [
          "Blood cell regulation",
          "Systemic gene expression control",
          "Cellular structural maintenance"
        ]
      }
    }
  }
]