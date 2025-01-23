export const mockFindings = [
  {
    "pattern": {
      "gene_list": [
        "NFKBIL2"
      ],
      "personally_associated_genes": [
        "NFKBIL2"
      ],
      "summary": "Increased methylation of NFKBIL2 in blood suggests reduced inhibition of inflammation in the body",
      "direction": "hyper"
    },
    "description": "Your blood cells show increased methylation of the NFKBIL2 gene, which normally acts to suppress inflammation. This change likely reduces the activity of NFKBIL2, leading to less inhibition of the NF-\u03baB pathway, a key regulator of inflammation. This can result in a heightened inflammatory state, particularly in blood vessel walls, which may impact cardiovascular health. This effect can be modified by inflammatory stimuli and may be persistent if inflammation is not controlled.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Inhibits NF-\u03baB signaling"
      ],
      "conservedPathways": [
        "NF-\u03baB signaling pathway"
      ],
      "commonCellularRoles": [
        "Regulation of inflammation",
        "Immune response"
      ],
      "evolutionaryContext": "Highly conserved across species due to its role in fundamental immune and inflammatory processes.",
      "tissueContext": "Primarily active in immune cells and endothelial cells, with systemic effects due to its role in inflammation.",
      "regulatoryNetwork": {
        "upstream": [
          "Inflammatory cytokines",
          "Pathogen-associated molecular patterns (PAMPs)"
        ],
        "downstream": [
          "Pro-inflammatory cytokine genes",
          "Adhesion molecule genes"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "NFKBIL2",
          "gene_name": "NFKBIL2",
          "description": "Hypermethylation of the NFKBIL2 gene may lead to reduced expression of the NFKBIL2 protein, which is an inhibitor of NF-\u03baB. This could result in increased NF-\u03baB activity.",
          "chromosome": null,
          "position": null,
          "context": "CpG island",
          "studyIds": [
            "10.1093/ndt/gft537"
          ],
          "direction": "hyper",
          "matchStrength": 0.37750319489231976,
          "modifyingFactors": [
            {
              "factor": "Inflammatory stimuli",
              "effect": "Increased inflammatory stimuli may exacerbate the methylation changes at this site, potentially reducing NF-\u03baB inhibition and accelerating the decline in kidney function.",
              "interventionPotential": "Anti-inflammatory drugs or dietary interventions"
            }
          ],
          "modes": [
            {
              "center": 0.018185329041443765,
              "spread": 0.00306259377233684,
              "density": 2.0
            }
          ],
          "personal_metrics": {
            "name": "NFKBIL2",
            "value": 0.31488633155822754,
            "methylation_state": "hyper",
            "confidence": 0.9999999997275326,
            "distribution_type": "unimodal",
            "deviations": {
              "mode_deviation": 96.87899361539975,
              "weighted_deviation": 193.7579872307995,
              "median_deviation": 97.64452124882538
            },
            "percentile": 99.29235963526642
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.1093/ndt/gft537",
            "totalSubjects": 40,
            "studyPopulationSummary": [
              {
                "groupName": "rapid_progression",
                "count": 20,
                "description": "Participants with the highest rate of decline in estimated glomerular filtration rate (eGFR)"
              },
              {
                "groupName": "stable_kidney_function",
                "count": 20,
                "description": "Participants with the lowest rate of decline in eGFR, including those with improved kidney function"
              }
            ],
            "populationContext": "Participants from the Chronic Renal Insufficiency Cohort (CRIC) study with the highest and lowest rate of decline in eGFR",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Incorporate daily anti-inflammatory foods to reduce NF-\u03baB activation",
        "lucideIcon": "leaf",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Dietary interventions can modulate inflammatory pathways, potentially reducing the need for NFKBIL2 to suppress NF-\u03baB, and thus reducing the impact of its hypermethylation.",
        "specificActions": [
          "Increase intake of foods rich in omega-3 fatty acids (e.g., fatty fish, flaxseeds)",
          "Consume foods high in antioxidants (e.g., berries, leafy greens)",
          "Reduce intake of processed foods and refined sugars"
        ],
        "monitoringMetrics": [
          {
            "metric": "hs-CRP levels",
            "frequency": "Every 3 months",
            "target": "< 3 mg/L"
          },
          {
            "metric": "Dietary intake of anti-inflammatory foods",
            "frequency": "Daily",
            "target": "Consistent consumption of recommended foods"
          }
        ],
        "contraindications": [
          "Specific food allergies",
          "Interactions with other medications"
        ],
        "supportingEvidence": [
          "Dietary interventions can modulate inflammatory pathways.",
          "Omega-3 fatty acids and antioxidants have anti-inflammatory effects."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypermethylation of NFKBIL2 reduces its expression.",
        "Reduced NFKBIL2 expression leads to increased NF-\u03baB activity.",
        "Increased NF-\u03baB activity promotes inflammation."
      ],
      "functionalImpact": [
        "Reduced inhibition of inflammation"
      ],
      "healthRelevance": "Increased inflammation can contribute to cardiovascular issues and other health problems.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "NFKBIL2 inhibits NF-\u03baB, a key regulator of inflammation."
        ],
        "supportingStudies": [
          "Studies showing the role of NFKBIL2 in inflammation and kidney disease progression."
        ],
        "biologicalContext": [
          "NF-\u03baB signaling pathway",
          "Inflammation",
          "Immune response"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "GFI1"
      ],
      "personally_associated_genes": [
        "GFI1"
      ],
      "summary": "Increased methylation of GFI1 in blood suggests potential dysregulation of hematopoiesis",
      "direction": "hyper"
    },
    "description": "Your blood cells show increased methylation of the GFI1 gene, which is involved in blood cell development. This change likely reduces GFI1 gene expression, potentially impairing hematopoiesis and affecting immune cell function. This may have implications for overall blood cell health and immune response. This effect can be modified by cigarette smoking and other environmental factors.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Regulates hematopoiesis and stem cell function"
      ],
      "conservedPathways": [
        "Myeloid differentiation pathways",
        "Immune response pathways"
      ],
      "commonCellularRoles": [
        "Hematopoietic stem cell regulation",
        "Immune cell differentiation"
      ],
      "evolutionaryContext": "Highly conserved across species due to its role in fundamental blood cell development.",
      "tissueContext": "Primarily active in hematopoietic cells, with systemic effects due to its role in blood cell development.",
      "regulatoryNetwork": {
        "upstream": [
          "DNMTs",
          "Transcription factors",
          "Cigarette smoke exposure",
          "Hematopoietic growth factors"
        ],
        "downstream": [
          "Hematopoietic differentiation genes",
          "Immune cell regulators"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "GFI1",
          "gene_name": "GFI1",
          "description": "Potential reduction in GFI1 gene expression due to promoter hypermethylation",
          "chromosome": null,
          "position": null,
          "context": "promoter",
          "studyIds": [
            "10.1186/gb-2012-13-10-r84"
          ],
          "direction": "hyper",
          "matchStrength": 0.3082740162471773,
          "modifyingFactors": [
            {
              "factor": "Unknown environmental factors",
              "effect": "Potentially influence the rate of hypermethylation",
              "interventionPotential": null
            }
          ],
          "modes": [
            {
              "center": 0.03826885758312033,
              "spread": 0.0070991014699403,
              "density": 32.98412698412699
            },
            {
              "center": 0.2794392904892574,
              "spread": 0.024772823499595854,
              "density": 6.015873015873016
            }
          ],
          "personal_metrics": {
            "name": "GFI1",
            "value": 0.3740827739238739,
            "methylation_state": "hyper",
            "confidence": 0.9547872653269704,
            "distribution_type": "bimodal",
            "deviations": {
              "mode_deviation": 3.8204560508074707,
              "weighted_deviation": 22.983378464381452,
              "median_deviation": 41.74557013202363
            },
            "percentile": 99.33714969927948
          }
        },
        {
          "matched_probe": null,
          "matched_gene": "GFI1",
          "gene_name": "GFI1",
          "description": "Hypermethylation of the GFI1 gene, potentially leading to reduced expression of GFI1.",
          "chromosome": null,
          "position": null,
          "context": null,
          "studyIds": [
            "10.3390/ijerph16132356"
          ],
          "direction": "hyper",
          "matchStrength": 0.3082740162471773,
          "modifyingFactors": [
            {
              "factor": "Cigarette smoking",
              "effect": "Induces hypermethylation at cg10399789",
              "interventionPotential": "Smoking cessation"
            }
          ],
          "modes": [
            {
              "center": 0.03826885758312033,
              "spread": 0.0070991014699403,
              "density": 32.98412698412699
            },
            {
              "center": 0.2794392904892574,
              "spread": 0.024772823499595854,
              "density": 6.015873015873016
            }
          ],
          "personal_metrics": {
            "name": "GFI1",
            "value": 0.3740827739238739,
            "methylation_state": "hyper",
            "confidence": 0.9547872653269704,
            "distribution_type": "bimodal",
            "deviations": {
              "mode_deviation": 3.8204560508074707,
              "weighted_deviation": 22.983378464381452,
              "median_deviation": 41.74557013202363
            },
            "percentile": 99.33714969927948
          }
        },
        {
          "matched_probe": null,
          "matched_gene": "GFI1",
          "gene_name": "GFI1",
          "description": "Increased methylation at the GFI1 promoter region may lead to reduced GFI1 gene expression.",
          "chromosome": null,
          "position": null,
          "context": "promoter",
          "studyIds": [
            "10.1186/s13058-014-0450-6"
          ],
          "direction": "hyper",
          "matchStrength": 0.3082740162471773,
          "modifyingFactors": [],
          "modes": [
            {
              "center": 0.03826885758312033,
              "spread": 0.0070991014699403,
              "density": 32.98412698412699
            },
            {
              "center": 0.2794392904892574,
              "spread": 0.024772823499595854,
              "density": 6.015873015873016
            }
          ],
          "personal_metrics": {
            "name": "GFI1",
            "value": 0.3740827739238739,
            "methylation_state": "hyper",
            "confidence": 0.9547872653269704,
            "distribution_type": "bimodal",
            "deviations": {
              "mode_deviation": 3.8204560508074707,
              "weighted_deviation": 22.983378464381452,
              "median_deviation": 41.74557013202363
            },
            "percentile": 99.33714969927948
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.1186/gb-2012-13-10-r84",
            "totalSubjects": 1149,
            "studyPopulationSummary": [
              {
                "groupName": "breast_tumors",
                "count": 103,
                "description": "Primary breast tumor samples"
              },
              {
                "groupName": "colorectal_tumors",
                "count": 125,
                "description": "Primary colorectal tumor samples"
              },
              {
                "groupName": "prostate_tumors",
                "count": 95,
                "description": "Primary prostate tumor samples"
              },
              {
                "groupName": "glioblastomas",
                "count": 88,
                "description": "Primary glioblastoma tumor samples"
              },
              {
                "groupName": "lung_tumors",
                "count": 66,
                "description": "Primary lung tumor samples"
              },
              {
                "groupName": "acute_myeloid_leukemias",
                "count": 188,
                "description": "Acute myeloid leukemia (AML) samples"
              },
              {
                "groupName": "ovarian_tumors",
                "count": 484,
                "description": "Primary ovarian tumor samples"
              },
              {
                "groupName": "normal_breast_tissue",
                "count": "Varies across datasets",
                "description": "Normal breast tissue samples"
              },
              {
                "groupName": "normal_colon_tissue",
                "count": "Varies across datasets",
                "description": "Normal colon tissue samples"
              },
              {
                "groupName": "normal_prostate_tissue",
                "count": "Varies across datasets",
                "description": "Normal prostate tissue samples"
              },
              {
                "groupName": "normal_brain_tissue",
                "count": "Varies across datasets",
                "description": "Normal brain tissue samples"
              },
              {
                "groupName": "normal_lung_tissue",
                "count": "Varies across datasets",
                "description": "Normal lung tissue samples"
              },
              {
                "groupName": "normal_blood_cells",
                "count": "Varies across datasets",
                "description": "Normal blood cell samples"
              },
              {
                "groupName": "normal_ovarian_tissue",
                "count": "Varies across datasets",
                "description": "Normal ovarian tissue samples"
              }
            ],
            "populationContext": "Patients with various cancers and normal tissue controls",
            "effectSizes": []
          },
          {
            "studyId": "10.3390/ijerph16132356",
            "totalSubjects": 1214,
            "studyPopulationSummary": [
              {
                "groupName": "all_participants",
                "count": 1214,
                "description": "Men from eastern Massachusetts, participants from the Normative Aging Study (NAS)"
              }
            ],
            "populationContext": "Men from eastern Massachusetts, participants from the Normative Aging Study (NAS)",
            "effectSizes": []
          },
          {
            "studyId": "10.1186/s13058-014-0450-6",
            "totalSubjects": 517,
            "studyPopulationSummary": [
              {
                "groupName": "breast_cancer_cases",
                "count": 517,
                "description": "Women with a first diagnosis of invasive breast cancer"
              },
              {
                "groupName": "normal_breast_tissues",
                "count": 9,
                "description": "Histologically normal breast tissues from women without cancer"
              }
            ],
            "populationContext": "Women with a first diagnosis of invasive breast cancer and normal breast tissue controls",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Prioritize smoking cessation to support healthy blood cell development",
        "lucideIcon": "cigarette-off",
        "strength": "Strong",
        "source": "direct",
        "rationale": "Smoking cessation can reduce the hypermethylation of GFI1, supporting normal hematopoiesis and immune function.",
        "specificActions": [
          "Use nicotine replacement therapy",
          "Seek counseling or support groups",
          "Avoid secondhand smoke exposure"
        ],
        "monitoringMetrics": [
          {
            "metric": "Smoking status",
            "frequency": "Monthly",
            "target": "Complete abstinence from smoking"
          },
          {
            "metric": "Cotinine levels in blood",
            "frequency": "Quarterly",
            "target": "Below detectable levels"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "Cigarette smoking induces hypermethylation at cg10399789.",
          "Smoking cessation can reverse some epigenetic changes."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypermethylation of GFI1 reduces its expression.",
        "Reduced GFI1 expression impairs hematopoiesis.",
        "Dysregulation of GFI1 can affect immune cell function."
      ],
      "functionalImpact": [
        "Potential disruption of hematopoiesis",
        "Altered cell differentiation and lineage commitment"
      ],
      "healthRelevance": "Dysregulation of hematopoiesis and immune function can increase susceptibility to various health issues.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "GFI1 is a transcriptional repressor involved in hematopoiesis and cell differentiation."
        ],
        "supportingStudies": [
          "Studies showing the role of GFI1 in blood cell development and immune function."
        ],
        "biologicalContext": [
          "Hematopoiesis",
          "Stem cell regulation"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "PRKCZ"
      ],
      "personally_associated_genes": [
        "PRKCZ"
      ],
      "summary": "Reduced PRKCZ activity in blood may indicate altered immune responses and vitamin D processing.",
      "direction": "hypo"
    },
    "description": "Your blood cells show decreased methylation in the PRKCZ gene region, which typically leads to increased gene activity. PRKCZ is involved in immune responses and vitamin D metabolism. This change may affect how your body regulates inflammation and processes vitamin D, potentially impacting overall immune function and bone health. This effect is likely consistent throughout the day and can be influenced by dietary factors. Maintaining a balanced diet and regular exercise may help support these processes.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Immune response regulation"
      ],
      "conservedPathways": [
        "Vitamin D metabolism",
        "Immune signaling pathways"
      ],
      "commonCellularRoles": [
        "Regulation of immune cell activity",
        "Modulation of cellular responses to vitamin D"
      ],
      "evolutionaryContext": "Highly conserved across species due to its role in fundamental cellular processes.",
      "tissueContext": "Primarily observed in blood cells, but may have systemic effects due to its role in immune and metabolic processes.",
      "regulatoryNetwork": {
        "upstream": [
          "Allopurinol exposure",
          "HLA-B*5801 allele"
        ],
        "downstream": [
          "Immune response genes",
          "Vitamin D metabolism pathways"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "PRKCZ",
          "gene_name": "PRKCZ",
          "description": "Hypomethylation of the PRKCZ 5'UTR and body region likely increases PRKCZ gene expression.",
          "chromosome": null,
          "position": null,
          "context": "5'UTR; Body",
          "studyIds": [
            "10.3389/fphar.2017.00923"
          ],
          "direction": "hypo",
          "matchStrength": 0.8759999999999999,
          "modifyingFactors": [
            {
              "factor": "Allopurinol exposure",
              "effect": "Allopurinol use is a prerequisite for the observed hypomethylation and SCARs development.",
              "interventionPotential": "Drug withdrawal"
            },
            {
              "factor": "HLA-B*5801 allele",
              "effect": "Presence of HLA-B*5801 allele increases the risk of allopurinol-induced SCARs, potentially interacting with PRKCZ hypomethylation.",
              "interventionPotential": "Genetic screening"
            }
          ],
          "modes": [
            {
              "center": 0.6089320747008344,
              "spread": 0.019344872482801513,
              "density": 141.0
            }
          ],
          "personal_metrics": {
            "name": "PRKCZ",
            "value": 0.09023454785346985,
            "methylation_state": "hypo",
            "confidence": 0.9889127803035556,
            "distribution_type": "unimodal",
            "deviations": {
              "mode_deviation": -26.813178908701037,
              "weighted_deviation": -3780.6582261268463,
              "median_deviation": -29.432992227402107
            },
            "percentile": 0.14622433113112443
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.3389/fphar.2017.00923",
            "totalSubjects": 35,
            "studyPopulationSummary": [
              {
                "groupName": "allopurinol-SCARs",
                "count": 15,
                "description": "Patients diagnosed with severe cutaneous adverse reactions (SCARs) induced by allopurinol"
              },
              {
                "groupName": "allopurinol-tolerant controls",
                "count": 20,
                "description": "Patients using allopurinol without any evidence of cutaneous adverse reactions"
              }
            ],
            "populationContext": "Han Chinese individuals taking allopurinol",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Optimize vitamin D intake through diet and sunlight exposure to support immune function.",
        "lucideIcon": "sun",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Increased PRKCZ activity may enhance vitamin D processing, which is crucial for immune regulation.",
        "specificActions": [
          "Consume vitamin D-rich foods such as fatty fish, egg yolks, and fortified dairy products.",
          "Spend 15-20 minutes in sunlight daily, preferably during midday hours, to promote vitamin D synthesis."
        ],
        "monitoringMetrics": [
          {
            "metric": "Serum vitamin D levels",
            "frequency": "Every 3 months",
            "target": "30-50 ng/mL"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "PRKCZ is associated with the metabolism of serum vitamin D."
        ]
      },
      {
        "recommendation": "Incorporate anti-inflammatory foods into your diet to support immune balance.",
        "lucideIcon": "leaf",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Modulating inflammation may help balance immune responses affected by altered PRKCZ activity.",
        "specificActions": [
          "Include foods rich in omega-3 fatty acids, such as flaxseeds, chia seeds, and walnuts.",
          "Increase consumption of colorful fruits and vegetables rich in antioxidants."
        ],
        "monitoringMetrics": [
          {
            "metric": "C-reactive protein (CRP) levels",
            "frequency": "Every 3 months",
            "target": "< 3 mg/L"
          }
        ],
        "contraindications": [],
        "supportingEvidence": [
          "PRKCZ is involved in immune response regulation."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation of PRKCZ is associated with increased gene expression.",
        "PRKCZ plays a role in immune response regulation and vitamin D metabolism."
      ],
      "functionalImpact": [
        "Altered immune responses and vitamin D processing."
      ],
      "healthRelevance": "May impact immune function and bone health.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "PRKCZ is involved in the metabolism of serum vitamin D and relapse in multiple sclerosis."
        ],
        "supportingStudies": [
          "10.3389/fphar.2017.00923"
        ],
        "biologicalContext": [
          "metabolism of serum vitamin D",
          "relapse in multiple sclerosis"
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "PRKAG2"
      ],
      "personally_associated_genes": [
        "PRKAG2"
      ],
      "summary": "Reduced energy regulation in blood may impact heart and kidney function",
      "direction": "hypo"
    },
    "description": "Your blood cells show decreased methylation of the PRKAG2 gene, which plays a key role in regulating cellular energy. This change suggests an increase in PRKAG2 activity, which can affect how your body manages energy, particularly in the heart and kidneys. This pattern is often seen in individuals with kidney issues and may contribute to metabolic imbalances. Regular monitoring of kidney function and heart health can help manage these effects.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Regulation of cellular energy metabolism"
      ],
      "conservedPathways": [
        "AMPK signaling pathway",
        "Glycogen metabolism"
      ],
      "commonCellularRoles": [
        "Energy homeostasis",
        "Metabolic adaptation"
      ],
      "evolutionaryContext": "Highly conserved across species due to its fundamental role in energy regulation.",
      "tissueContext": "Expressed in cardiac and kidney cells, with systemic effects through blood circulation.",
      "regulatoryNetwork": {
        "upstream": [
          "Uremic toxins",
          "Inflammatory cytokines"
        ],
        "downstream": [
          "AMPK signaling pathway",
          "Glycogen metabolism genes"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "PRKAG2",
          "gene_name": "PRKAG2",
          "description": "Hypomethylation of the PRKAG2 gene may lead to increased expression of PRKAG2.",
          "chromosome": null,
          "position": null,
          "context": null,
          "studyIds": [
            "10.1038/s41598-021-04321-5"
          ],
          "direction": "hypo",
          "matchStrength": 0.3232051571160116,
          "modifyingFactors": [
            {
              "factor": "Uremic toxins",
              "effect": "Uremic toxins may contribute to hypomethylation of PRKAG2, potentially altering energy metabolism.",
              "interventionPotential": "Kidney Transplantation"
            }
          ],
          "modes": [
            {
              "center": 0.08525568575462485,
              "spread": 0.011782390093189229,
              "density": 22.029100529100532
            },
            {
              "center": 0.35846535861492157,
              "spread": 0.022277425078404627,
              "density": 3.0
            },
            {
              "center": 0.6690146649859057,
              "spread": 0.02693204054657718,
              "density": 40.97178130511463
            },
            {
              "center": 0.9171120524406433,
              "spread": 0.007935643196105957,
              "density": 0.9991181657848325
            }
          ],
          "personal_metrics": {
            "name": "PRKAG2",
            "value": 0.046470027416944504,
            "methylation_state": "hypo",
            "confidence": 0.9828270795371838,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": -3.291832814133379,
              "weighted_deviation": -72.51611598753611,
              "median_deviation": -27.03063638471564
            },
            "percentile": 0.09392028668386392
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.1038/s41598-021-04321-5",
            "totalSubjects": 47,
            "studyPopulationSummary": [
              {
                "groupName": "controls",
                "count": 24,
                "description": "Age- and sex-matched healthy individuals"
              },
              {
                "groupName": "dialysis_patients",
                "count": 11,
                "description": "Patients initiating dialysis for kidney failure"
              },
              {
                "groupName": "kidney_transplant_patients",
                "count": 12,
                "description": "Patients undergoing kidney transplantation"
              }
            ],
            "populationContext": "Patients with chronic kidney disease (CKD) and healthy controls.",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Optimize timing of moderate exercise to enhance AMPK activation",
        "lucideIcon": "activity",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Moderate exercise can activate AMPK, which is downstream of PRKAG2, helping to improve energy regulation.",
        "specificActions": [
          "Perform 30-45 minutes of moderate-intensity cardio (e.g., brisk walking, cycling) in the morning, when cortisol levels are naturally higher."
        ],
        "monitoringMetrics": [
          {
            "metric": "Heart rate variability (HRV)",
            "frequency": "Daily",
            "target": "Increased HRV during exercise sessions"
          },
          {
            "metric": "Blood glucose levels",
            "frequency": "Fasting and post-exercise",
            "target": "Stable blood glucose levels"
          }
        ],
        "contraindications": [
          "Avoid high-intensity exercise if you have existing heart conditions without consulting a healthcare provider."
        ],
        "supportingEvidence": [
          "Exercise is known to activate AMPK, which is downstream of PRKAG2, improving energy metabolism."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation of PRKAG2 may lead to increased gene expression.",
        "Increased PRKAG2 expression can enhance AMPK signaling, affecting energy metabolism."
      ],
      "functionalImpact": [
        "Altered energy metabolism in cardiac and kidney cells."
      ],
      "healthRelevance": "Changes in PRKAG2 expression may contribute to metabolic dysfunction and cardiac complications.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "PRKAG2 is a key regulator of cellular energy metabolism through the AMPK pathway."
        ],
        "supportingStudies": [
          "Studies have linked PRKAG2 to cardiac glycogenosis and metabolic dysfunction in kidney disease."
        ],
        "biologicalContext": [
          "PRKAG2 is involved in energy metabolism and has been linked to cardiac glycogenosis."
        ]
      }
    }
  },
  {
    "pattern": {
      "gene_list": [
        "PLEC1"
      ],
      "personally_associated_genes": [
        "PLEC1"
      ],
      "summary": "Reduced methylation of PLEC1 in blood may affect cell structure and stability",
      "direction": "hypo"
    },
    "description": "Your blood cells show decreased methylation in the PLEC1 gene, which is important for maintaining cell structure and stability. This change suggests an increase in PLEC1 activity, which can affect how cells adhere and move. While measured in blood, this pattern has been linked to changes in cell structure and function in other tissues. Regular physical activity and a balanced diet can help support healthy cell function.",
    "knowledgeContext": {
      "establishedFunctions": [
        "Maintains cell structure and stability"
      ],
      "conservedPathways": [
        "Cytoskeleton organization pathways"
      ],
      "commonCellularRoles": [
        "Cell adhesion",
        "Cell migration"
      ],
      "evolutionaryContext": "Highly conserved across species due to its fundamental role in cell structure and function.",
      "tissueContext": "Expressed in various tissues, including blood cells, with potential systemic effects.",
      "regulatoryNetwork": {
        "upstream": [
          "Epigenetic modifiers",
          "Mechanical stress"
        ],
        "downstream": [
          "Cytoskeleton proteins",
          "Cell adhesion molecules",
          "Cell migration pathways"
        ],
        "feedback": []
      }
    },
    "provenance": {
      "associated_regions": [
        {
          "matched_probe": null,
          "matched_gene": "PLEC1",
          "gene_name": "PLEC1",
          "description": "Hypomethylation of the gene body of PLEC1, potentially leading to increased gene expression.",
          "chromosome": null,
          "position": null,
          "context": "Body",
          "studyIds": [
            "10.20517/cdr.2022.63"
          ],
          "direction": "hypo",
          "matchStrength": 0.3355726945720694,
          "modifyingFactors": [],
          "modes": [
            {
              "center": 0.1069037941244872,
              "spread": 0.010521325227942177,
              "density": 22.00088183421517
            },
            {
              "center": 0.3838156204702433,
              "spread": 0.023063438576264448,
              "density": 2.9991181657848323
            },
            {
              "center": 0.4677313913901647,
              "spread": 0.018924005682859773,
              "density": 3.0
            },
            {
              "center": 0.6183714307844639,
              "spread": 0.0177884644885078,
              "density": 8.0
            },
            {
              "center": 0.782377315465782,
              "spread": 0.014168137641203763,
              "density": 9.0
            },
            {
              "center": 0.913720890879631,
              "spread": 0.007522478167675846,
              "density": 2.0
            },
            {
              "center": 0.9707704186439514,
              "spread": 0.003799140453338623,
              "density": 1.0
            }
          ],
          "personal_metrics": {
            "name": "PLEC1",
            "value": 0.05374230444431305,
            "methylation_state": "hypo",
            "confidence": 0.9778040818599809,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": -5.052737039150703,
              "weighted_deviation": -111.16467053771684,
              "median_deviation": -25.55598239529941
            },
            "percentile": 0.17221131273338128
          }
        },
        {
          "matched_probe": null,
          "matched_gene": "PLEC1",
          "gene_name": "PLEC1",
          "description": "Hypomethylation within the PLEC1 gene may lead to increased expression of PLEC1.",
          "chromosome": null,
          "position": null,
          "context": "within PLEC1 gene",
          "studyIds": [
            "10.21203/RS.3.RS-375556/V1",
            "10.1038/s41598-022-08998-0"
          ],
          "direction": "hypo",
          "matchStrength": 0.3355726945720694,
          "modifyingFactors": [
            {
              "factor": "Mechanical stress on cells",
              "effect": "Potential modification of PLEC1 expression and function through mechanical stress.",
              "interventionPotential": "Physical therapy"
            }
          ],
          "modes": [
            {
              "center": 0.1069037941244872,
              "spread": 0.010521325227942177,
              "density": 22.00088183421517
            },
            {
              "center": 0.3838156204702433,
              "spread": 0.023063438576264448,
              "density": 2.9991181657848323
            },
            {
              "center": 0.4677313913901647,
              "spread": 0.018924005682859773,
              "density": 3.0
            },
            {
              "center": 0.6183714307844639,
              "spread": 0.0177884644885078,
              "density": 8.0
            },
            {
              "center": 0.782377315465782,
              "spread": 0.014168137641203763,
              "density": 9.0
            },
            {
              "center": 0.913720890879631,
              "spread": 0.007522478167675846,
              "density": 2.0
            },
            {
              "center": 0.9707704186439514,
              "spread": 0.003799140453338623,
              "density": 1.0
            }
          ],
          "personal_metrics": {
            "name": "PLEC1",
            "value": 0.05374230444431305,
            "methylation_state": "hypo",
            "confidence": 0.9778040818599809,
            "distribution_type": "multimodal",
            "deviations": {
              "mode_deviation": -5.052737039150703,
              "weighted_deviation": -111.16467053771684,
              "median_deviation": -25.55598239529941
            },
            "percentile": 0.17221131273338128
          }
        }
      ],
      "studyContext": {
        "studyMetrics": [
          {
            "studyId": "10.20517/cdr.2022.63",
            "totalSubjects": 12,
            "studyPopulationSummary": [
              {
                "groupName": "cases",
                "count": 6,
                "description": "HER2-positive breast cancer patients who experienced recurrence after trastuzumab treatment"
              },
              {
                "groupName": "controls",
                "count": 6,
                "description": "HER2-positive breast cancer patients who did not develop recurrence after trastuzumab treatment"
              }
            ],
            "populationContext": "HER2-positive breast cancer patients treated with trastuzumab.",
            "effectSizes": []
          },
          {
            "studyId": "10.21203/RS.3.RS-375556/V1",
            "totalSubjects": 5881,
            "studyPopulationSummary": [
              {
                "groupName": "NTR_adults",
                "count": 2682,
                "description": "Twins, parents of twins, siblings of twins, and spouses of twins"
              },
              {
                "groupName": "ALSPAC_adults",
                "count": 1232,
                "description": "Parents from the Avon Longitudinal Study of Parents and Children (ALSPAC) cohort"
              },
              {
                "groupName": "ALSPAC_children_longitudinal",
                "count": 1021,
                "description": "Offspring from the ALSPAC cohort"
              },
              {
                "groupName": "NTR_children_buccal",
                "count": 946,
                "description": "Twins from the Netherlands Twin Register (NTR)"
              },
              {
                "groupName": "NTR_MZ_discordant_adults",
                "count": 133,
                "description": "Monozygotic (MZ) twin pairs discordant for handedness"
              },
              {
                "groupName": "NTR_MZ_discordant_children",
                "count": 86,
                "description": "Monozygotic (MZ) twin pairs discordant for handedness"
              }
            ],
            "populationContext": "Twins, parents of twins, siblings of twins, and spouses of twins, and offspring from the ALSPAC cohort.",
            "effectSizes": []
          },
          {
            "studyId": "10.1038/s41598-022-08998-0",
            "totalSubjects": 6665,
            "studyPopulationSummary": [
              {
                "groupName": "NTR_adults",
                "count": 2682,
                "description": "Adults from the Netherlands Twin Register (NTR)"
              },
              {
                "groupName": "ALSPAC_adults",
                "count": 1232,
                "description": "Adults from the Avon Longitudinal Study of Parents and Children (ALSPAC)"
              },
              {
                "groupName": "ALSPAC_offspring",
                "count": 791,
                "description": "Offspring from ALSPAC with longitudinal DNA methylation data"
              },
              {
                "groupName": "NTR_children",
                "count": 946,
                "description": "Children from NTR with buccal cell DNA methylation data"
              },
              {
                "groupName": "NTR_MZ_adult_twins",
                "count": 133,
                "description": "Monozygotic (MZ) twin pairs from NTR adults"
              },
              {
                "groupName": "NTR_MZ_child_twins",
                "count": 86,
                "description": "MZ twin pairs from NTR children"
              }
            ],
            "populationContext": "Adults and children from the Netherlands Twin Register (NTR) and the Avon Longitudinal Study of Parents and Children (ALSPAC).",
            "effectSizes": []
          }
        ]
      }
    },
    "recommendations": [
      {
        "recommendation": "Incorporate regular, varied physical activity to support cell structure",
        "lucideIcon": "move",
        "strength": "Moderate",
        "source": "mechanism",
        "rationale": "Physical activity can provide mechanical stress that may positively influence PLEC1 expression and cell structure.",
        "specificActions": [
          "Engage in a mix of activities such as walking, swimming, and light strength training for at least 30 minutes most days of the week."
        ],
        "monitoringMetrics": [
          {
            "metric": "Self-reported physical activity levels",
            "frequency": "Weekly",
            "target": "Consistent engagement in varied physical activities"
          },
          {
            "metric": "Muscle strength and flexibility",
            "frequency": "Monthly",
            "target": "Maintenance or improvement in muscle strength and flexibility"
          }
        ],
        "contraindications": [
          "Consult a healthcare provider before starting a new exercise program, especially if you have any underlying health conditions."
        ],
        "supportingEvidence": [
          "Mechanical stress from physical activity can influence PLEC1 expression and cell structure."
        ]
      }
    ],
    "evidence": {
      "strength": "moderate",
      "mechanisticInsights": [
        "Hypomethylation of PLEC1 may lead to increased gene expression.",
        "Increased PLEC1 expression can affect cytoskeleton functions, impacting cell structure and stability."
      ],
      "functionalImpact": [
        "Altered cell adhesion and migration.",
        "Potential impact on neuronal development."
      ],
      "healthRelevance": "Changes in PLEC1 expression may contribute to cell adhesion and migration issues.",
      "knowledgeBase": {
        "establishedMechanisms": [
          "PLEC1 is a key protein involved in maintaining cell structure and stability through its role in cytoskeleton functions."
        ],
        "supportingStudies": [
          "Studies have linked PLEC1 to cell adhesion and migration, and its altered expression may contribute to various health conditions."
        ],
        "biologicalContext": [
          "PLEC1 is involved in cytoskeleton functions, cell adhesion, and cell migration."
        ]
      }
    }
  }
]