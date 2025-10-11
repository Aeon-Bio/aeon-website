export const mockFindings = [
	{
		pattern: {
			gene_list: ['PLEC1'],
			personally_associated_genes: ['PLEC1'],
			summary:
				'Increased cellular structural protein production may enhance cell resilience and adaptability.',
			direction: 'hypo'
		},
		description:
			"This blood-based measurement reflects the regulation of PLEC1, a gene crucial for producing plectin, a protein that strengthens the cell's structural framework, the cytoskeleton. The cytoskeleton is essential for cell shape, movement, and resilience against physical stress. Higher expression of PLEC1, potentially indicated by lower methylation, may enhance the robustness of blood cells, improving their ability to withstand daily stressors and maintain optimal function. Research suggests that PLEC1 plays a broad role in cellular integrity across various tissues, and these fundamental mechanisms are likely conserved in blood cells.",
		knowledgeContext: {
			establishedFunctions: [
				'cytoskeleton organization',
				'cell adhesion',
				'cell migration',
				'mechanical stability'
			],
			conservedPathways: [
				'cytoskeletal signaling pathways',
				'integrin signaling',
				'cell stress response pathways'
			],
			commonCellularRoles: [
				'maintaining cell shape',
				'facilitating cell movement',
				'providing mechanical support',
				'integrating cytoskeletal networks'
			],
			evolutionaryContext:
				'Plectin is a highly conserved protein across species, indicating its fundamental importance for cellular function and survival.',
			tissueContext:
				'PLEC1 is ubiquitously expressed, with particularly high levels in tissues subjected to mechanical stress, including muscle and epithelial tissues. Its role in blood cells, while less studied for mechanical stress, is crucial for maintaining cell integrity and adaptability.',
			regulatoryNetwork: {
				upstream: ['growth factors', 'mechanical signals', 'epigenetic modifiers'],
				downstream: [
					'actin filaments',
					'intermediate filaments',
					'microtubules',
					'cell adhesion proteins'
				],
				feedback: ['mechanical stress sensing pathways', 'cytoskeletal remodeling signals']
			}
		},
		provenance: {
			associated_regions: [
				{
					matched_probe: null,
					matched_gene: 'PLEC1',
					gene_name: 'PLEC1',
					description:
						'Hypomethylation within the PLEC1 gene body is associated with potentially increased PLEC1 expression.',
					chromosome: 'chr8',
					position: 145354215,
					context: 'gene body',
					studyIds: [
						'10.21203/RS.3.RS-375556/V1',
						'10.1038/s41598-022-08998-0',
						'10.20517/cdr.2022.63'
					],
					direction: 'hypo',
					matchStrength: 0.828,
					modifyingFactors: [
						{
							factor: 'Mechanical stress on cells',
							effect: 'Mechanical stress can influence PLEC1 expression and function.',
							interventionPotential:
								'Physical activities and therapies may modulate PLEC1 related pathways.'
						}
					],
					modes: [
						{
							center: 0.4142356577173029,
							spread: 0.018607282301711468,
							density: 132.00088183421514
						},
						{
							center: 0.9367832738123122,
							spread: 0.007558770504859915,
							density: 8.999118165784832
						}
					],
					personal_metrics: {
						name: 'PLEC1',
						value: 0.06817078590393066,
						methylation_state: 'hypo',
						confidence: 0.9307464896760145,
						distribution_type: 'bimodal',
						deviations: {
							mode_deviation: -18.598356611246864,
							weighted_deviation: -2454.999473351791,
							median_deviation: -24.14168796211989
						},
						percentile: 0.1716142112543007
					}
				}
			],
			studyContext: {
				studyMetrics: [
					{
						studyId: '10.21203/RS.3.RS-375556/V1',
						totalSubjects: 5881,
						studyPopulationSummary: [
							{
								groupName: 'NTR_children_buccal',
								count: 946,
								description:
									'Children from the Netherlands Twin Register (NTR) with buccal cell DNA methylation data.'
							}
						],
						populationContext: 'Children from a twin study, buccal cell methylation.',
						effectSizes: []
					},
					{
						studyId: '10.1038/s41598-022-08998-0',
						totalSubjects: 6665,
						studyPopulationSummary: [
							{
								groupName: 'NTR_children',
								count: 946,
								description: 'Children from NTR with buccal cell DNA methylation data'
							}
						],
						populationContext: 'Children from a twin study, buccal cell methylation.',
						effectSizes: []
					},
					{
						studyId: '10.20517/cdr.2022.63',
						totalSubjects: 12,
						studyPopulationSummary: [
							{
								groupName: 'cases',
								count: 6,
								description: 'HER2-positive breast cancer patients with recurrence.'
							}
						],
						populationContext: 'Breast cancer patients, disease context.',
						effectSizes: []
					}
				]
			}
		},
		recommendations: [
			{
				recommendation:
					'Engage in regular moderate-intensity exercise for at least 150 minutes per week to promote cellular resilience and adaptability.',
				lucideIcon: 'activity',
				strength: 'Moderate',
				source: 'mechanism',
				rationale:
					'Physical activity can induce mechanical stress on cells, potentially stimulating cytoskeletal protein production and enhancing cellular robustness.',
				specificActions: [
					'Aim for 30 minutes of brisk walking, cycling, or swimming five times a week.',
					'Incorporate strength training exercises twice a week to further challenge and strengthen cells.'
				],
				monitoringMetrics: [
					{
						metric: 'Exercise duration and intensity',
						frequency: 'Weekly',
						target:
							'150 minutes of moderate-intensity or 75 minutes of vigorous-intensity exercise per week'
					}
				],
				contraindications:
					'Consult a healthcare provider before starting a new exercise program, especially if you have pre-existing health conditions.',
				supportingEvidence: [
					'Research indicates that mechanical signals and physical stress can influence cytoskeletal dynamics and protein expression.'
				]
			},
			{
				recommendation:
					'Maintain a balanced diet rich in protein and essential nutrients to support cellular repair and cytoskeletal maintenance.',
				lucideIcon: 'salad',
				strength: 'Moderate',
				source: 'supporting',
				rationale:
					'Adequate protein intake provides the building blocks for cytoskeletal proteins, while essential nutrients support overall cellular health and repair mechanisms.',
				specificActions: [
					'Include lean protein sources such as fish, poultry, beans, and lentils in your daily meals.',
					'Consume a variety of fruits and vegetables to ensure sufficient intake of vitamins and minerals crucial for cellular function.'
				],
				monitoringMetrics: [
					{
						metric: 'Dietary protein intake',
						frequency: 'Daily',
						target:
							'Aim for 0.8-1.2 grams of protein per kilogram of body weight daily, adjusting based on activity level.'
					}
				],
				contraindications:
					'No known contraindications for a balanced diet. Individuals with specific dietary restrictions or medical conditions should consult a nutritionist.',
				supportingEvidence: [
					'Nutritional studies highlight the importance of protein and micronutrients for cellular health and tissue maintenance.'
				]
			},
			{
				recommendation:
					'Prioritize sufficient sleep, aiming for 7-9 hours of quality sleep per night, to facilitate cellular repair and reduce cellular stress.',
				lucideIcon: 'moon',
				strength: 'General',
				source: 'general',
				rationale:
					'Sleep is crucial for cellular repair processes and reducing overall stress on the body, which indirectly supports cytoskeletal health and cellular resilience.',
				specificActions: [
					'Establish a consistent sleep schedule, going to bed and waking up around the same time each day.',
					'Create a relaxing bedtime routine to improve sleep quality, such as reading or taking a warm bath.'
				],
				monitoringMetrics: [
					{
						metric: 'Sleep duration and quality',
						frequency: 'Daily',
						target: '7-9 hours of restful sleep per night'
					}
				],
				contraindications:
					'No known contraindications for prioritizing sleep. Individuals with sleep disorders should seek professional advice.',
				supportingEvidence: [
					'Sleep research consistently demonstrates the role of sleep in cellular repair, stress reduction, and overall health maintenance.'
				]
			}
		],
		evidence: {
			strength: 'moderate',
			mechanisticInsights: [
				'PLEC1 encodes plectin, a critical cytoskeletal protein.',
				'Hypomethylation in the PLEC1 gene region may lead to increased PLEC1 expression.',
				'Increased plectin production can enhance cytoskeleton stability and cellular resilience.'
			],
			functionalImpact: [
				'Improved cellular structural integrity',
				'Enhanced cell adaptability to physical stress',
				'Potential for better tissue maintenance and repair'
			],
			healthRelevance:
				'Maintaining robust cellular structure is fundamental for overall health and resilience, contributing to wellness optimization in healthy adults.',
			knowledgeBase: {
				establishedMechanisms: [
					'Cytoskeleton function in cell mechanics and resilience',
					'Epigenetic regulation of gene expression through DNA methylation',
					'Role of PLEC1 in cytoskeletal organization'
				],
				supportingStudies: [
					'EWAS studies linking PLEC1 methylation to gene expression (though primarily in buccal cells).',
					'Literature on PLEC1 function in cytoskeleton and cell mechanics.'
				],
				biologicalContext: [
					'Cytoskeleton dynamics',
					'Cellular stress response',
					'Tissue homeostasis'
				]
			}
		}
	},
	{
		pattern: {
			gene_list: ['ERBB2'],
			personally_associated_genes: ['ERBB2'],
			summary:
				'Increased ERBB2 methylation may impair cell signaling pathways critical for healthy cell growth.',
			direction: 'hyper'
		},
		description:
			'This blood-based measurement indicates increased methylation of the ERBB2 gene promoter, a key regulator of cell signaling and growth. ERBB2 is fundamental for signal transmission controlling cell proliferation and differentiation, processes essential in blood cell function and overall wellness. While initial studies were in EBV-infected B-cells, ERBB2 signaling pathways are highly conserved across cell types, including blood cells, ensuring relevance to blood measurements. Research suggests that altered ERBB2 methylation can disrupt cellular communication precision, potentially affecting healthy cell growth dynamics. This is supported by in vitro studies showing methylation changes in the ERBB2 promoter modulate gene expression and downstream signaling in various cellular contexts.',
		knowledgeContext: {
			establishedFunctions: [
				'Cell signaling',
				'Cell proliferation',
				'Cell differentiation',
				'Growth factor receptor signaling'
			],
			conservedPathways: ['PI3K/AKT pathway', 'MAPK pathway', 'HER2 signaling'],
			commonCellularRoles: [
				'Regulation of cell growth and survival',
				'Signal transduction in response to growth factors'
			],
			evolutionaryContext:
				'ERBB2 and related receptor tyrosine kinases are evolutionarily conserved, underscoring their vital role in multicellular organism development and homeostasis.',
			tissueContext:
				'ERBB2 signaling is crucial across tissues, including immune and blood cells, regulating cell communication and responses to growth signals, directly relevant to blood-based analysis.',
			regulatoryNetwork: {
				upstream: ['Growth factors (e.g., EGF, NRG1)', 'DNMTs (DNA methyltransferases)'],
				downstream: ['PI3K', 'AKT', 'MAPK', 'Cell cycle regulators'],
				feedback: [
					'Negative feedback loops involving phosphatases and ubiquitin ligases finely tune ERBB2 signaling intensity and duration.'
				]
			}
		},
		provenance: {
			associated_regions: [
				{
					matched_probe: null,
					matched_gene: 'ERBB2',
					gene_name: 'ERBB2',
					description:
						'Increased methylation at the ERBB2 promoter region, potentially reducing gene activity.',
					chromosome: 'chr17',
					position: 39721599,
					context: 'promoter',
					studyIds: ['10.1073/pnas.1503806112', '10.1172/JCI69735'],
					direction: 'hyper',
					matchStrength: 0.3278868227041766,
					modifyingFactors: [
						{
							factor: 'EBV infection',
							effect:
								'EBV infection induces hypermethylation of the ERBB2 promoter, decreasing gene expression in B-cells.',
							interventionPotential: 'Demethylating agents (research context)'
						},
						{
							factor: 'Aging',
							effect:
								'Aging processes may increase methylation at the ERBB2 promoter, potentially altering cell signaling over time.',
							interventionPotential: 'Anti-inflammatory strategies (research context)'
						}
					],
					modes: [
						{
							center: 0.07820518692646967,
							spread: 0.007809690179990213,
							density: 31.998236331569665
						},
						{
							center: 0.39436508675801085,
							spread: 0.019221320817219122,
							density: 1.001763668430335
						},
						{
							center: 0.556297779083252,
							spread: 0.014199644327163696,
							density: 1
						},
						{
							center: 0.746785219040578,
							spread: 0.016296052002019806,
							density: 25.999999999999996
						}
					],
					personal_metrics: {
						name: 'ERBB2',
						value: 0.8014060258865356,
						methylation_state: 'hyper',
						confidence: 0.9756780101818799,
						distribution_type: 'multimodal',
						deviations: {
							mode_deviation: 3.351781575021217,
							weighted_deviation: 87.14632095055164,
							median_deviation: 50.75584451837674
						},
						percentile: 99.72991724948567
					}
				},
				{
					matched_probe: null,
					matched_gene: 'ERBB2',
					gene_name: 'ERBB2',
					description:
						'Increased methylation of the ERBB2 promoter CpG island, further supporting reduced gene accessibility.',
					chromosome: 'chr17',
					position: 39721599,
					context: 'promoter CpG island',
					studyIds: ['10.1172/JCI69735'],
					direction: 'hyper',
					matchStrength: 0.3278868227041766,
					modifyingFactors: [
						{
							factor: 'Aging',
							effect:
								'Aging increases methylation at the ERBB2 promoter CpG island, contributing to age-related cellular changes.',
							interventionPotential: 'Anti-inflammatory strategies (research context)'
						},
						{
							factor: 'Chronic inflammation',
							effect:
								'Chronic inflammation may accelerate methylation at the ERBB2 promoter CpG island, exacerbating signaling disruptions.',
							interventionPotential: 'Anti-inflammatory strategies (research context)'
						}
					],
					modes: [
						{
							center: 0.07820518692646967,
							spread: 0.007809690179990213,
							density: 31.998236331569665
						},
						{
							center: 0.39436508675801085,
							spread: 0.019221320817219122,
							density: 1.001763668430335
						},
						{
							center: 0.556297779083252,
							spread: 0.014199644327163696,
							density: 1
						},
						{
							center: 0.746785219040578,
							spread: 0.016296052002019806,
							density: 25.999999999999996
						}
					],
					personal_metrics: {
						name: 'ERBB2',
						value: 0.8014060258865356,
						methylation_state: 'hyper',
						confidence: 0.9756780101818799,
						distribution_type: 'multimodal',
						deviations: {
							mode_deviation: 3.351781575021217,
							weighted_deviation: 87.14632095055164,
							median_deviation: 50.75584451837674
						},
						percentile: 99.72991724948567
					}
				}
			],
			studyContext: {
				studyMetrics: [
					{
						studyId: '10.1073/pnas.1503806112',
						totalSubjects: 3,
						studyPopulationSummary: [
							{
								groupName: 'EBV_infected_PBMCs',
								count: '3 donors',
								description:
									'In vitro study using primary peripheral blood mononuclear cells (PBMCs) from 3 healthy donors infected with EBV.'
							}
						],
						populationContext: 'In vitro analysis of EBV-infected PBMCs from healthy individuals.',
						effectSizes: []
					},
					{
						studyId: '10.1172/JCI69735',
						totalSubjects: null,
						studyPopulationSummary: [],
						populationContext:
							'Review of multiple studies on ERBB2 methylation in aging and cancer.',
						effectSizes: []
					}
				]
			}
		},
		recommendations: [
			{
				recommendation:
					'Engage in regular moderate-intensity exercise for at least 150 minutes weekly to foster balanced cell signaling and support healthy cell growth.',
				lucideIcon: 'activity',
				strength: 'Moderate',
				source: 'mechanism',
				rationale:
					'Regular exercise positively modulates cellular signaling pathways and promotes overall cellular health, potentially counteracting impacts of altered ERBB2 methylation on cell growth regulation.',
				specificActions: [
					'Aim for five 30-minute sessions of activities like brisk walking, cycling, or swimming each week.',
					'Include strength training twice weekly to further enhance metabolic and cellular health.'
				],
				monitoringMetrics: [
					{
						metric: 'Weekly exercise duration',
						frequency: 'Weekly',
						target: '≥ 150 minutes of moderate intensity'
					},
					{
						metric: 'Self-reported energy levels',
						frequency: 'Daily',
						target: 'Stable or improved daily energy'
					}
				],
				contraindications:
					'Consult healthcare provider before starting new exercise, especially with pre-existing conditions.',
				supportingEvidence: [
					'Established guidelines for physical activity and its benefits for cellular function.',
					'Research linking regular exercise to improved cellular signaling pathways.'
				]
			},
			{
				recommendation:
					'Consume a diet rich in diverse antioxidants, aiming for at least 5 daily servings of fruits and vegetables, to bolster cellular protection and optimize signaling pathways.',
				lucideIcon: 'salad',
				strength: 'Moderate',
				source: 'context',
				rationale:
					'Antioxidant-rich diets protect cells from oxidative stress and support robust cell signaling, potentially beneficial against effects of altered ERBB2 methylation.',
				specificActions: [
					'Incorporate a wide array of colorful fruits and vegetables into daily meals.',
					'Complement antioxidant intake with whole grains and lean protein sources for balanced nutrition.'
				],
				monitoringMetrics: [
					{
						metric: 'Daily fruit and vegetable servings',
						frequency: 'Daily',
						target: '≥ 5 diverse servings'
					},
					{
						metric: 'Variety of plant-based food colors',
						frequency: 'Weekly',
						target: 'Increased color diversity in weekly diet'
					}
				],
				contraindications:
					'Generally safe; no known contraindications for balanced, antioxidant-rich diets.',
				supportingEvidence: [
					'Well-documented benefits of antioxidant-rich diets for enhancing cellular health.',
					'Established dietary guidelines promoting high fruit and vegetable intake.'
				]
			},
			{
				recommendation:
					'Incorporate daily stress-reduction practices like meditation or yoga for 15-30 minutes to support balanced cellular function and overall resilience.',
				lucideIcon: 'meditation',
				strength: 'Preliminary',
				source: 'general',
				rationale:
					'Chronic stress can negatively affect cellular processes. Regular stress reduction may help maintain cellular equilibrium and resilience, potentially mitigating effects of ERBB2 methylation changes on cell signaling.',
				specificActions: [
					'Allocate 15-30 minutes daily for mindfulness meditation or yoga practice.',
					'Explore additional relaxation methods such as deep breathing or nature walks.'
				],
				monitoringMetrics: [
					{
						metric: 'Daily stress reduction practice time',
						frequency: 'Daily',
						target: '15-30 minutes of focused practice'
					},
					{
						metric: 'Self-assessed stress levels',
						frequency: 'Weekly',
						target: 'Consistent low to moderate stress perception'
					}
				],
				contraindications:
					'Generally safe; consult healthcare professional if pre-existing mental health conditions exist before starting new practices.',
				supportingEvidence: [
					'Research indicating chronic stress impairs cellular health and function.',
					'Studies demonstrating benefits of stress reduction for improved overall well-being.'
				]
			}
		],
		evidence: {
			strength: 'moderate',
			mechanisticInsights: [
				'Hypermethylation of the ERBB2 promoter region is consistently linked to reduced ERBB2 gene expression.',
				'ERBB2, a receptor tyrosine kinase, plays a vital role in cell signaling cascades governing cell growth and differentiation.'
			],
			functionalImpact: [
				'Potential disruption of critical cell signaling pathways due to altered ERBB2 expression.',
				'Possible modulation of cell proliferation and differentiation processes impacting cellular homeostasis.'
			],
			healthRelevance:
				'Dysregulation of ERBB2 has significant implications for maintaining healthy cell growth control, a cornerstone of overall health and wellness.',
			knowledgeBase: {
				establishedMechanisms: [
					"ERBB2's established function in cell signaling and its relevance to cellular health.",
					'Promoter methylation as a recognized mechanism for gene expression regulation.'
				],
				supportingStudies: [
					'In vitro studies demonstrating direct links between ERBB2 promoter methylation and gene expression levels.',
					'Review articles consolidating evidence on ERBB2 methylation across various biological contexts.'
				],
				biologicalContext: [
					"ERBB2's role in fundamental cell signaling pathways.",
					'Conservation of ERBB2 signaling mechanisms across different cell types, including blood cells.'
				]
			}
		}
	},
	{
		pattern: {
			gene_list: ['MYO5A'],
			personally_associated_genes: ['MYO5A'],
			summary: 'Reduced neurotransmitter transport may disrupt brain function and adaptability.',
			direction: 'hyper'
		},
		description:
			"This blood-based measurement indicates methylation changes affecting MYO5A, a gene crucial for neurotransmitter transport within cells. While the original study examined brain tissue and linked findings to season of birth, MYO5A's fundamental role in cellular transport is relevant across tissues, including blood cells. Efficient neurotransmitter transport is essential for neuronal communication and overall brain health, impacting mood, stress response, and cognitive functions. Research suggests environmental factors can influence MYO5A methylation, potentially affecting these processes systemically.",
		knowledgeContext: {
			establishedFunctions: [
				'Neurotransmitter vesicle transport',
				'Actin-based motor protein function',
				'Cellular trafficking'
			],
			conservedPathways: ['Vesicle trafficking pathway', 'Actin cytoskeleton regulation'],
			commonCellularRoles: [
				'Intracellular transport in neurons and immune cells',
				'Synaptic vesicle dynamics',
				'Cellular organization'
			],
			evolutionaryContext:
				'Highly conserved motor protein across eukaryotes, indicating fundamental cellular importance in cellular transport mechanisms.',
			tissueContext:
				'Expressed in various tissues including brain and blood cells, with critical roles in neuronal function and immune cell activity, making blood measurements relevant.',
			regulatoryNetwork: {
				upstream: ['Environmental factors (e.g., photoperiod)', 'Epigenetic regulators'],
				downstream: [
					'Synaptic vesicles',
					'Neurotransmitter release machinery',
					'Actin cytoskeleton'
				],
				feedback: []
			}
		},
		provenance: {
			associated_regions: [
				{
					matched_probe: 'cg03370588',
					matched_gene: 'MYO5A',
					gene_name: 'MYO5A',
					description:
						'Observed hypermethylation at cg03370588 within the TSS200 region of MYO5A, suggesting potential decreased MYO5A expression and reduced gene activity.',
					chromosome: 'chr15',
					position: 52821290,
					context: 'TSS200',
					studyIds: ['10.1017/S2040174421000453'],
					direction: 'hyper',
					matchStrength: 0.319,
					modifyingFactors: [
						{
							factor: 'Photoperiod',
							effect:
								'Shorter photoperiod at birth is associated with increased methylation at this CpG site.',
							interventionPotential:
								'Exposure to natural or artificial bright light, particularly during infancy and early childhood.'
						}
					],
					modes: [
						{
							center: 0.04195833392441273,
							spread: 0.00836004875600338,
							density: 1
						}
					],
					personal_metrics: {
						name: 'cg03370588',
						value: 0.5425136685371399,
						methylation_state: 'hyper',
						confidence: 0.9955517774348694,
						distribution_type: 'multimodal',
						deviations: {
							mode_deviation: 59.87469083278691,
							weighted_deviation: 59.87469083278691,
							median_deviation: 59.87469083278691
						},
						percentile: 99.50377376498714
					}
				}
			],
			studyContext: {
				studyMetrics: [
					{
						studyId: '10.1017/S2040174421000453',
						totalSubjects: 30,
						studyPopulationSummary: [
							{
								groupName: 'Hypothalamus',
								count: 16,
								description: 'Post-mortem human hypothalamus tissue samples from older adults'
							},
							{
								groupName: 'Inferior Temporal Gyrus (ITG)',
								count: 14,
								description:
									'Post-mortem human inferior temporal gyrus tissue samples from older adults'
							}
						],
						populationContext:
							'Study focused on post-mortem human brain tissue from older adults, investigating seasonal birth effects on methylation.',
						effectSizes: []
					}
				]
			}
		},
		recommendations: [
			{
				recommendation:
					'Engage in zone 2 cardio exercise for 30 minutes, five times per week to enhance neurotransmitter balance and support overall brain health.',
				lucideIcon: 'activity',
				strength: 'Moderate',
				source: 'mechanism',
				rationale:
					'Regular zone 2 cardio exercise is shown to improve neurogenesis and neurotransmitter function, potentially counteracting the effects of reduced neurotransmitter transport efficiency.',
				specificActions: [
					'Perform activities like brisk walking, light jogging, or cycling at a moderate intensity where you can hold a conversation.',
					'Monitor heart rate to stay within zone 2 (approximately 60-70% of your maximum heart rate).'
				],
				monitoringMetrics: [
					{
						metric: 'Mood stability',
						frequency: 'Weekly',
						target: 'Experience more balanced and positive mood'
					},
					{
						metric: 'Energy levels',
						frequency: 'Weekly',
						target: 'Increased daily vitality and reduced fatigue'
					}
				],
				contraindications:
					'Consult with a healthcare provider before starting a new exercise regimen, especially if you have pre-existing cardiovascular conditions.',
				supportingEvidence: [
					'Extensive research demonstrates the positive impact of regular aerobic exercise on brain health and neurotransmitter systems.'
				]
			},
			{
				recommendation:
					'Prioritize a consistent sleep schedule, aiming for 7-9 hours of uninterrupted sleep nightly to optimize brain function and support cellular repair.',
				lucideIcon: 'moon',
				strength: 'Moderate',
				source: 'outcome',
				rationale:
					'Consistent, quality sleep is vital for neuronal health and effective neurotransmitter system regulation, which is crucial for efficient cellular transport and brain waste clearance.',
				specificActions: [
					'Establish a regular bedtime and wake time, maintaining it even on weekends.',
					'Create a relaxing pre-sleep routine, such as reading or taking a warm bath, to enhance sleep quality.'
				],
				monitoringMetrics: [
					{
						metric: 'Sleep quality (using a sleep tracker or subjective assessment)',
						frequency: 'Daily',
						target: 'Achieve consistently restful and deep sleep'
					},
					{
						metric: 'Daytime cognitive performance',
						frequency: 'Daily',
						target: 'Improved focus, memory, and mental clarity during the day'
					}
				],
				contraindications:
					'If experiencing persistent sleep difficulties, consult a sleep specialist to rule out underlying sleep disorders.',
				supportingEvidence: [
					'Robust scientific literature highlights the critical role of sleep duration and quality in maintaining cognitive function and overall brain health.'
				]
			},
			{
				recommendation:
					'Incorporate 10-15 minutes of daily mindfulness meditation to manage stress and promote cellular resilience, supporting optimal brain function.',
				lucideIcon: 'lotus',
				strength: 'Preliminary',
				source: 'general',
				rationale:
					'Chronic stress can negatively affect cellular processes. Regular mindfulness meditation can help reduce stress levels and foster cellular health, indirectly supporting efficient neurotransmitter transport and neuronal function.',
				specificActions: [
					'Use guided meditation apps or online resources to facilitate daily practice.',
					'Focus on breath awareness and cultivate present moment attention during meditation sessions.'
				],
				monitoringMetrics: [
					{
						metric: 'Subjective stress level (scale of 1-10)',
						frequency: 'Weekly',
						target: 'Gradual reduction in perceived stress levels'
					},
					{
						metric: 'Emotional well-being (self-assessment)',
						frequency: 'Weekly',
						target: 'Increased feelings of calm and emotional balance'
					}
				],
				contraindications:
					'Generally safe, but individuals with pre-existing mental health conditions should consult a mental health professional before starting meditation practices.',
				supportingEvidence: [
					'Emerging research indicates the potential benefits of mindfulness and meditation for stress reduction and promoting cellular well-being.'
				]
			}
		],
		evidence: {
			strength: 'moderate',
			mechanisticInsights: [
				'MYO5A is a key motor protein responsible for the transport of neurotransmitter vesicles within cells.',
				'Observed hypermethylation suggests potential downregulation of MYO5A gene expression, possibly leading to impaired neurotransmitter transport.'
			],
			functionalImpact: [
				'Reduced efficiency in neurotransmitter delivery to synapses and other cellular locations.',
				'Potential disruption of synaptic function and neuronal communication, affecting various brain processes.'
			],
			healthRelevance:
				'Efficient neurotransmitter transport is fundamentally important for optimal brain function, including mood regulation, cognitive processing, and effective stress responses.',
			knowledgeBase: {
				establishedMechanisms: [
					"MYO5A's role in intracellular vesicle transport is well-established.",
					'Promoter hypermethylation is a known mechanism for gene silencing.'
				],
				supportingStudies: [
					'Study 10.1017/S2040174421000453 provides direct evidence of MYO5A methylation changes in brain tissue.'
				],
				biologicalContext: [
					'Critical role of neurotransmission in brain health and function.',
					'Importance of cellular transport mechanisms for neuronal maintenance and communication.'
				]
			}
		}
	},
	{
		pattern: {
			gene_list: ['ACP2'],
			personally_associated_genes: ['ACP2'],
			summary: 'Increased fat storage may contribute to weight gain and metabolic imbalance.',
			direction: 'hyper'
		},
		description:
			'Blood methylation patterns indicate changes in a gene related to fat storage and metabolism. Specifically, increased methylation of ACP2 suggests reduced activity of this gene. ACP2 is involved in lysosomes, cellular components that break down waste and recycle materials. Reduced ACP2 function in blood cells may reflect broader metabolic shifts that favor increased fat storage throughout the body. This interpretation is supported by studies linking ACP2 methylation to body mass index (BMI).',
		knowledgeContext: {
			establishedFunctions: [
				'Lysosomal acid phosphatase activity',
				'Bone resorption',
				'Metabolic regulation'
			],
			conservedPathways: ['Lysosomal pathways', 'Phosphate metabolism', 'Adipogenesis regulation'],
			commonCellularRoles: [
				'Lysosomal function in various cell types',
				'Regulation of bone remodeling',
				'Contribution to metabolic homeostasis'
			],
			evolutionaryContext:
				'Conserved across vertebrates, indicating fundamental roles in cellular metabolism and tissue maintenance.',
			tissueContext:
				'Ubiquitous expression, with notable roles in bone, adipose tissue, and immune cells.',
			regulatoryNetwork: {
				upstream: ['Genetic variants (SNPs)', 'Dietary factors', 'Hormonal signals'],
				downstream: ['Lysosomal enzymes', 'Lipid metabolism genes', 'Inflammatory cytokines'],
				feedback: ['Metabolic stress signals', 'Nutrient availability feedback loops']
			}
		},
		provenance: {
			associated_regions: [
				{
					matched_probe: null,
					matched_gene: 'ACP2',
					gene_name: 'ACP2',
					description:
						'Hypermethylation in cis-regulatory region of ACP2 associated with decreased gene expression and increased BMI.',
					chromosome: 'chr4',
					position: 74454848,
					context: 'cis',
					studyIds: ['10.1038/s41598-023-39936-3'],
					direction: 'hyper',
					matchStrength: 0.3138352047510742,
					modifyingFactors: [
						{
							factor: 'Environmental factors',
							effect: 'May influence methylation and ACP2 expression, affecting BMI.',
							interventionPotential: 'Environmental modification'
						},
						{
							factor: 'Lifestyle factors',
							effect: 'May influence methylation and ACP2 expression, affecting BMI.',
							interventionPotential: 'Lifestyle modification'
						}
					],
					modes: [
						{
							center: 0.03366452635964379,
							spread: 0.0034472631486706586,
							density: 16
						},
						{
							center: 0.5309170782566071,
							spread: 0.017751753330230713,
							density: 2
						},
						{
							center: 0.672282938931918,
							spread: 0.02336284274357414,
							density: 2.992063492063492
						},
						{
							center: 0.8089870374897759,
							spread: 0.013399993410388715,
							density: 11.007936507936506
						}
					],
					personal_metrics: {
						name: 'ACP2',
						value: 0.8616171479225159,
						methylation_state: 'hyper',
						confidence: 0.9765570841742031,
						distribution_type: 'multimodal',
						deviations: {
							mode_deviation: 3.9276221130032103,
							weighted_deviation: 43.23501484710676,
							median_deviation: 54.78911718340898
						},
						percentile: 99.79244652701676
					}
				}
			],
			studyContext: {
				studyMetrics: [
					{
						studyId: '10.1038/s41598-023-39936-3',
						totalSubjects: 2115,
						studyPopulationSummary: [
							{
								groupName: 'FHS Offspring',
								count: 686,
								description: 'Participants from the Framingham Heart Study (FHS) Offspring cohort'
							},
							{
								groupName: 'FHS Third Generation',
								count: 1429,
								description: 'Participants from the FHS Third Generation cohort'
							}
						],
						populationContext: 'Healthy adults from the Framingham Heart Study.',
						effectSizes: []
					}
				]
			}
		},
		recommendations: [
			{
				recommendation:
					'Engage in regular aerobic exercise, aiming for at least 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity activity per week, to improve metabolic function and support healthy weight management.',
				lucideIcon: 'activity',
				strength: 'Moderate',
				source: 'mechanism',
				rationale:
					'Aerobic exercise can enhance metabolic rate and improve insulin sensitivity, counteracting potential effects of altered ACP2 methylation on fat storage.',
				specificActions: ['Brisk walking', 'Jogging', 'Cycling', 'Swimming'],
				monitoringMetrics: [
					{
						metric: 'Weight',
						frequency: 'Weekly',
						target: 'Maintain or achieve healthy weight range'
					},
					{
						metric: 'Waist circumference',
						frequency: 'Monthly',
						target: 'Reduce or maintain healthy waist circumference'
					}
				],
				contraindications:
					'Consult healthcare provider if pre-existing cardiovascular conditions or orthopedic issues exist.',
				supportingEvidence: [
					'Extensive research supports the role of aerobic exercise in improving metabolic health and weight management.'
				]
			},
			{
				recommendation:
					'Adopt a balanced diet rich in whole foods, including fruits, vegetables, lean proteins, and whole grains, while limiting processed foods, sugary drinks, and unhealthy fats, to support optimal lysosomal function and metabolic balance.',
				lucideIcon: 'carrot',
				strength: 'Moderate',
				source: 'context',
				rationale:
					'A nutrient-dense diet provides essential vitamins and minerals that support lysosomal enzyme activity and overall metabolic processes.',
				specificActions: [
					'Increase intake of fruits and vegetables to at least 5 servings daily',
					'Choose lean protein sources like fish, poultry, and beans',
					'Select whole grains over refined grains',
					'Reduce consumption of processed foods and sugary beverages'
				],
				monitoringMetrics: [
					{
						metric: 'Dietary intake',
						frequency: 'Daily tracking',
						target: 'Adherence to balanced dietary guidelines'
					},
					{
						metric: 'Energy levels',
						frequency: 'Daily',
						target: 'Maintain consistent energy levels throughout the day'
					}
				],
				contraindications:
					'None, generally safe for healthy adults. Consult a dietitian for specific dietary needs or restrictions.',
				supportingEvidence: [
					'Dietary guidelines consistently emphasize whole foods for metabolic health.'
				]
			},
			{
				recommendation:
					'Prioritize stress management techniques such as mindfulness meditation or yoga for at least 15 minutes daily to mitigate potential stress-related impacts on metabolic pathways and cellular function.',
				lucideIcon: 'leaf',
				strength: 'Preliminary',
				source: 'general',
				rationale:
					'Chronic stress can negatively affect metabolic processes and cellular health. Stress reduction techniques may help modulate these effects.',
				specificActions: [
					'Practice mindfulness meditation',
					'Engage in yoga or tai chi',
					'Deep breathing exercises',
					'Progressive muscle relaxation'
				],
				monitoringMetrics: [
					{
						metric: 'Perceived stress level',
						frequency: 'Weekly',
						target: 'Reduce or maintain low stress levels'
					},
					{
						metric: 'Sleep quality',
						frequency: 'Daily',
						target: 'Improve sleep duration and quality'
					}
				],
				contraindications: 'None, generally safe and beneficial for most individuals.',
				supportingEvidence: [
					'Stress management is widely recognized for its positive effects on overall health and well-being.'
				]
			}
		],
		evidence: {
			strength: 'moderate',
			mechanisticInsights: [
				'Hypermethylation of ACP2 is associated with reduced gene expression.',
				'ACP2 is involved in lysosomal function and phosphate metabolism.',
				'Dysregulation of ACP2 may contribute to altered adipogenesis and increased BMI.'
			],
			functionalImpact: [
				'Potential decrease in lysosomal acid phosphatase activity.',
				'Possible alterations in cellular waste processing and recycling.',
				'Likely influence on metabolic regulation and fat storage.'
			],
			healthRelevance:
				'Increased fat storage and potential weight gain, contributing to metabolic imbalance and increased BMI.',
			knowledgeBase: {
				establishedMechanisms: [
					"ACP2's role in lysosomal function and metabolic processes is well-documented."
				],
				supportingStudies: [
					'Human studies have consistently linked ACP2 methylation to BMI and adiposity.'
				],
				biologicalContext: [
					'The study context is relevant to healthy adults and wellness optimization, focusing on metabolic health.'
				]
			}
		}
	},
	{
		pattern: {
			gene_list: ['EIF3I'],
			personally_associated_genes: ['EIF3I'],
			summary: 'Increased methylation of EIF3I may reduce protein synthesis efficiency.',
			direction: 'hyper'
		},
		description:
			'This blood-based measurement reflects the methylation status of EIF3I, a gene crucial for initiating protein translation in cells. Protein synthesis is a fundamental process for cellular function and maintenance.  Research indicates that environmental cadmium exposure is linked to increased methylation of EIF3I in blood, potentially reducing its activity. Efficient protein synthesis is essential for overall cellular health and adaptability, ensuring cells can respond to stress and maintain their functions effectively. This measurement provides insight into a core cellular process that can be influenced by environmental factors.',
		knowledgeContext: {
			establishedFunctions: [
				'Translation initiation',
				'Ribosome biogenesis',
				'Cell growth',
				'Cell proliferation'
			],
			conservedPathways: ['Eukaryotic translation initiation pathway', 'mTOR signaling pathway'],
			commonCellularRoles: [
				'Essential for protein production in all cell types',
				'Regulation of cell growth and division',
				'Response to cellular stress'
			],
			evolutionaryContext:
				'Highly conserved across eukaryotes, indicating its fundamental importance for life.',
			tissueContext:
				'Ubiquitously expressed, with critical roles in tissues with high protein turnover, including blood cells.',
			regulatoryNetwork: {
				upstream: ['Cadmium exposure', 'DNMTs (DNA methyltransferases)', 'Environmental toxins'],
				downstream: [
					'Ribosomal proteins',
					'mTOR signaling components',
					'Proteins involved in cell growth and proliferation'
				],
				feedback: ['Cellular stress response pathways', 'Amino acid availability sensing']
			}
		},
		provenance: {
			associated_regions: [
				{
					matched_probe: null,
					matched_gene: 'EIF3I',
					gene_name: 'EIF3I',
					description:
						'Hypermethylation at the TSS1500 region of EIF3I associated with cadmium exposure in whole blood.',
					chromosome: 'chr7',
					position: 100188447,
					context: 'TSS1500',
					studyIds: ['10.1093/eep/dvx006'],
					direction: 'hyper',
					matchStrength: 0.3097025225890324,
					modifyingFactors: [
						{
							factor: 'Cadmium exposure',
							effect: 'Increased methylation at cg14992253',
							interventionPotential: 'Reduce cadmium exposure through diet and environment.'
						}
					],
					modes: [
						{
							center: 0.04073394639417529,
							spread: 0.0044836940799748756,
							density: 10
						},
						{
							center: 0.14617385596983015,
							spread: 0.012058005127047284,
							density: 1.9999999999999998
						},
						{
							center: 0.7924420757504997,
							spread: 0.013161263712325162,
							density: 4
						}
					],
					personal_metrics: {
						name: 'EIF3I',
						value: 0.8922057151794434,
						methylation_state: 'hyper',
						confidence: 0.9616475882909048,
						distribution_type: 'multimodal',
						deviations: {
							mode_deviation: 7.580095772681593,
							weighted_deviation: 30.320383090726374,
							median_deviation: 99.76647151051834
						},
						percentile: 99.88244702297699
					}
				}
			],
			studyContext: {
				studyMetrics: [
					{
						studyId: '10.1093/eep/dvx006',
						totalSubjects: 40,
						studyPopulationSummary: [
							{
								groupName: 'High Cd Exposure (HE)',
								count: 20,
								description: 'Women with high environmental Cd exposure'
							},
							{
								groupName: 'Low Cd Exposure (LE)',
								count: 20,
								description: 'Women with low environmental Cd exposure'
							}
						],
						populationContext: 'Women exposed to varying levels of environmental cadmium.',
						effectSizes: []
					}
				]
			}
		},
		recommendations: [
			{
				recommendation:
					'Minimize exposure to cadmium by choosing low-cadmium rice and testing water sources, especially if residing in areas with known contamination.',
				lucideIcon: 'molecule',
				strength: 'Moderate',
				source: 'mechanism',
				rationale:
					'Directly addresses the environmental factor (cadmium exposure) linked to EIF3I methylation changes.',
				specificActions: [
					'Check rice origin and opt for low-cadmium sources.',
					'Test household water for cadmium levels, especially well water.',
					'Use water filters certified to remove heavy metals.'
				],
				monitoringMetrics: [],
				contraindications: 'None.',
				supportingEvidence: ['Research study linking cadmium exposure to EIF3I methylation.']
			},
			{
				recommendation:
					'Support overall detoxification pathways by consuming a diet rich in cruciferous vegetables (broccoli, kale, cabbage) and antioxidants (berries, green tea) daily.',
				lucideIcon: 'leaf',
				strength: 'Moderate',
				source: 'context',
				rationale:
					'Supports general detoxification processes that may help mitigate the effects of environmental toxins.',
				specificActions: [
					'Include at least one serving of cruciferous vegetables daily.',
					'Consume antioxidant-rich fruits and beverages regularly.',
					'Ensure adequate intake of vitamins and minerals essential for detoxification (e.g., B vitamins, vitamin C, selenium).'
				],
				monitoringMetrics: [],
				contraindications:
					'Consult with a healthcare provider if you have specific dietary restrictions or medical conditions.',
				supportingEvidence: ['General knowledge about dietary support for detoxification pathways.']
			},
			{
				recommendation:
					'Engage in regular moderate exercise for at least 150 minutes per week to enhance cellular function and resilience.',
				lucideIcon: 'activity',
				strength: 'General',
				source: 'general',
				rationale:
					'General lifestyle recommendation to support cellular health and function, indirectly supporting protein synthesis efficiency.',
				specificActions: [
					'Aim for at least 30 minutes of moderate-intensity exercise most days of the week.',
					'Choose activities you enjoy to ensure long-term adherence.',
					'Include both aerobic and strength training exercises.'
				],
				monitoringMetrics: [],
				contraindications:
					'Consult with a healthcare provider before starting a new exercise program, especially if you have pre-existing health conditions.',
				supportingEvidence: [
					'Established benefits of exercise for overall health and cellular function.'
				]
			}
		],
		evidence: {
			strength: 'moderate',
			mechanisticInsights: [
				'Cadmium exposure can induce hypermethylation.',
				'Hypermethylation in the TSS1500 region typically reduces gene expression.',
				'EIF3I is essential for protein synthesis.'
			],
			functionalImpact: [
				'Potential reduction in EIF3I expression.',
				'Possible decrease in protein synthesis efficiency.'
			],
			healthRelevance:
				'Efficient protein synthesis is crucial for cellular health and function, and its impairment may have broad implications for wellness.',
			knowledgeBase: {
				establishedMechanisms: [
					'DNA methylation as a regulator of gene expression.',
					'Cadmium as an environmental toxicant affecting epigenetic mechanisms.',
					"EIF3I's role in translation initiation."
				],
				supportingStudies: ['10.1093/eep/dvx006 (Study linking cadmium to EIF3I methylation)'],
				biologicalContext: [
					'Environmental toxicology',
					'Epigenetics',
					'Protein synthesis',
					'Cellular metabolism'
				]
			}
		}
	},
	{
		pattern: {
			gene_list: ['GSTM4'],
			personally_associated_genes: ['GSTM4'],
			summary: 'Reduced GSTM4 activity impairs cellular detoxification processes.',
			direction: 'hyper'
		},
		description:
			'This blood-based measurement indicates a potential decrease in the activity of GSTM4, a gene involved in cellular detoxification. GSTM4 encodes glutathione S-transferase Mu 4, an enzyme crucial for neutralizing harmful toxins and oxidative stress within cells. This process is fundamental for maintaining cellular health and resilience against environmental pollutants and metabolic byproducts. Research suggests that methylation changes affecting GSTM4 in blood cells can reflect systemic detoxification capacity.',
		knowledgeContext: {
			establishedFunctions: [
				'Glutathione S-transferase activity',
				'Detoxification of xenobiotics',
				'Protection against oxidative stress',
				'Metabolism of environmental toxins'
			],
			conservedPathways: [
				'Xenobiotic metabolism',
				'Glutathione conjugation',
				'Antioxidant defense'
			],
			commonCellularRoles: [
				'Cytoprotection in various tissues including blood cells',
				'Regulation of cellular response to toxins',
				'Maintenance of redox balance'
			],
			evolutionaryContext:
				'GSTM family enzymes are evolutionarily conserved, highlighting their essential role in environmental adaptation and protection from harmful substances.',
			tissueContext:
				'GSTM4 is expressed in blood cells, where it contributes to systemic detoxification. Methylation in blood is a relevant proxy for assessing systemic detoxification capacity.',
			regulatoryNetwork: {
				upstream: [
					'NRF2 (regulates GSTM4 expression)',
					'Environmental toxins (induce GSTM4 expression)'
				],
				downstream: ['Detoxified metabolites', 'Reduced oxidative stress', 'Cellular protection'],
				feedback: ['Cellular stress response pathways']
			}
		},
		provenance: {
			associated_regions: [
				{
					matched_probe: 'cg26668989',
					matched_gene: 'GSTM4',
					gene_name: 'GSTM4',
					description:
						'Hypermethylation upstream of GSTM4 is associated with potentially reduced gene expression and impaired detoxification capacity.',
					chromosome: 'chr1',
					position: 101288388,
					context: 'Upstream',
					studyIds: ['10.1093/jnci/djz109'],
					direction: 'hyper',
					matchStrength: 0.30856076365472096,
					modifyingFactors: [],
					modes: [
						{
							center: 0.03572844633493911,
							spread: 0.00516585947074167,
							density: 11
						},
						{
							center: 0.1920350082809963,
							spread: 0.017746842848473547,
							density: 3
						},
						{
							center: 0.3982759714126587,
							spread: 0.016324549913406372,
							density: 1
						},
						{
							center: 0.47192101180553436,
							spread: 0.0323299765586853,
							density: 1
						},
						{
							center: 0.733105226578536,
							spread: 0.021030143756556343,
							density: 4.999999999999999
						}
					],
					personal_metrics: {
						name: 'GSTM4',
						value: 0.8456265330314636,
						methylation_state: 'hyper',
						confidence: 0.9395442857531255,
						distribution_type: 'multimodal',
						deviations: {
							mode_deviation: 5.35047728420059,
							weighted_deviation: 26.752386421002946,
							median_deviation: 60.2792539881948
						},
						percentile: 99.8297309520612
					}
				}
			],
			studyContext: {
				studyMetrics: [
					{
						studyId: '10.1093/jnci/djz109',
						totalSubjects: 228951,
						studyPopulationSummary: [
							{
								groupName: 'breast_cancer_patients',
								count: 122977,
								description: 'Women of European descent diagnosed with breast cancer'
							},
							{
								groupName: 'controls',
								count: 105974,
								description: 'Women of European descent without a breast cancer diagnosis'
							}
						],
						populationContext:
							'Large-scale GWAS in women of European descent, linking methylation to breast cancer risk, but relevant detoxification mechanisms are broadly applicable.',
						effectSizes: []
					}
				]
			}
		},
		recommendations: [
			{
				recommendation:
					'Increase consumption of cruciferous vegetables like broccoli and kale at least five times per week to enhance GSTM4 activity and support detoxification pathways.',
				lucideIcon: 'leaf-vegetable',
				strength: 'Moderate',
				source: 'mechanism',
				rationale:
					'Cruciferous vegetables contain sulforaphane and other compounds that are known to induce phase II detoxification enzymes, including GSTs, supporting the function of GSTM4.',
				specificActions: [
					'Add broccoli sprouts to salads or smoothies.',
					'Include roasted or steamed kale as a side dish.',
					'Consume cauliflower, cabbage, and Brussels sprouts regularly.'
				],
				monitoringMetrics: [],
				contraindications:
					'Individuals with thyroid issues should consume cruciferous vegetables in moderation and ensure adequate iodine intake.',
				supportingEvidence: [
					'Studies showing sulforaphane and other isothiocyanates induce GST enzymes.',
					'Dietary guidelines recommending cruciferous vegetable intake for health promotion.'
				]
			},
			{
				recommendation:
					'Engage in regular moderate-intensity exercise for at least 150 minutes per week to promote overall metabolic health and support natural detoxification processes.',
				lucideIcon: 'heart-pulse',
				strength: 'Moderate',
				source: 'general',
				rationale:
					'Exercise improves circulation, lymphatic drainage, and sweating, all of which aid in the removal of toxins from the body, complementing cellular detoxification mechanisms.',
				specificActions: [
					'Aim for 30 minutes of brisk walking, jogging, or cycling most days of the week.',
					'Incorporate strength training exercises twice a week.',
					'Stay hydrated before, during, and after exercise.'
				],
				monitoringMetrics: [],
				contraindications:
					'Consult a physician before starting a new exercise program, especially for individuals with pre-existing health conditions.',
				supportingEvidence: [
					'Research demonstrating the benefits of exercise for cardiovascular health and metabolic function.',
					'General health guidelines recommending regular physical activity.'
				]
			},
			{
				recommendation:
					'Ensure adequate intake of antioxidants through a diet rich in fruits, berries, and colorful vegetables to reduce oxidative stress and support detoxification.',
				lucideIcon: 'apple-whole',
				strength: 'Moderate',
				source: 'supporting',
				rationale:
					'Antioxidants neutralize free radicals and reduce oxidative stress, lessening the burden on cellular detoxification systems and supporting the function of enzymes like GSTM4.',
				specificActions: [
					'Include a variety of colorful fruits and vegetables in daily meals.',
					'Consume berries, dark leafy greens, and citrus fruits regularly.',
					'Consider antioxidant-rich spices like turmeric and ginger in cooking.'
				],
				monitoringMetrics: [],
				contraindications:
					'Generally safe, but individuals with specific dietary restrictions or allergies should choose appropriate antioxidant sources.',
				supportingEvidence: [
					'Numerous studies highlighting the role of dietary antioxidants in reducing oxidative stress and promoting health.',
					'Dietary recommendations for antioxidant-rich foods.'
				]
			}
		],
		evidence: {
			strength: 'moderate',
			mechanisticInsights: [
				'Hypermethylation of GSTM4 suggests reduced gene expression.',
				'GSTM4 is a key enzyme in phase II detoxification.',
				'Impaired GSTM4 activity can lead to reduced detoxification capacity and increased oxidative stress.'
			],
			functionalImpact: [
				'Potentially reduced ability to detoxify environmental toxins and metabolic byproducts.',
				'Increased susceptibility to oxidative damage.',
				'Possible impact on cellular resilience and long-term health.'
			],
			healthRelevance:
				'Maintaining efficient detoxification processes is crucial for overall wellness and long-term health, protecting against environmental and metabolic stressors.',
			knowledgeBase: {
				establishedMechanisms: [
					'GSTM4 enzymatic activity in detoxification',
					'Regulation of GSTM4 expression by methylation'
				],
				supportingStudies: ['GWAS study 10.1093/jnci/djz109'],
				biologicalContext: ['Cellular detoxification', 'Oxidative stress response']
			}
		}
	}
];
