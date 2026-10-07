export interface CdsAllergyRule {
  allergenClass: string;
  aliases: string[];
  contraindicatedDrugs: string[];
  severity: 'CRITICAL' | 'ELEVATED';
  clinicalRationale: string;
  suggestedAlternatives: {
    drugName: string;
    dosage: string;
    frequency: string;
    reason: string;
  }[];
}

export const CDS_ALLERGY_RULES: CdsAllergyRule[] = [
  {
    allergenClass: 'Penicillin / Beta-Lactam',
    aliases: ['penicillin', 'penicillin vk', 'penicillins', 'amoxicillin', 'ampicillin'],
    contraindicatedDrugs: [
      'amoxicillin',
      'ampicillin',
      'augmentin',
      'amoxicillin/clavulanate',
      'penicillin vk',
      'piperacillin',
      'piperacillin/tazobactam',
      'oxacillin',
      'nafcillin',
    ],
    severity: 'CRITICAL',
    clinicalRationale: 'Direct Beta-Lactam core ring cross-reactivity. High risk of severe Type I IgE-mediated anaphylaxis, bronchospasm, and urticaria.',
    suggestedAlternatives: [
      {
        drugName: 'Azithromycin (Zithromax)',
        dosage: '500 mg Day 1, then 250 mg daily',
        frequency: 'Once daily for 5 days',
        reason: 'Macrolide class — zero Beta-Lactam cross-reactivity, safe alternative for respiratory/bacterial infections.',
      },
      {
        drugName: 'Doxycycline Hyclate',
        dosage: '100 mg',
        frequency: 'Twice daily with water',
        reason: 'Tetracycline class — broad spectrum non-Beta-Lactam option.',
      },
      {
        drugName: 'Levofloxacin (Levaquin)',
        dosage: '500 mg',
        frequency: 'Once daily',
        reason: 'Fluoroquinolone class — potent bactericidal alternative for penicillin-allergic patients.',
      },
    ],
  },
  {
    allergenClass: 'Sulfonamides (Sulfa Drugs)',
    aliases: ['sulfa', 'sulfa drugs', 'sulfonamide', 'sulfamethoxazole', 'bactrim'],
    contraindicatedDrugs: [
      'bactrim',
      'bactrim ds',
      'sulfamethoxazole',
      'trimethoprim/sulfamethoxazole',
      'sulfasalazine',
      'sulfadiazine',
    ],
    severity: 'CRITICAL',
    clinicalRationale: 'Arylamine sulfonamide cross-reactivity. Risk of severe cutaneous adverse reactions (SCARs), including Stevens-Johnson Syndrome (SJS) and toxic epidermal necrolysis.',
    suggestedAlternatives: [
      {
        drugName: 'Nitrofurantoin (Macrobid)',
        dosage: '100 mg',
        frequency: 'Twice daily for 7 days',
        reason: 'First-line non-sulfa urinary antimicrobial.',
      },
      {
        drugName: 'Ciprofloxacin (Cipro)',
        dosage: '500 mg',
        frequency: 'Twice daily',
        reason: 'Fluoroquinolone alternative with zero sulfonamide cross-allergenicity.',
      },
    ],
  },
  {
    allergenClass: 'NSAIDs & Aspirin',
    aliases: ['aspirin', 'nsaid', 'nsaids', 'ibuprofen', 'naproxen'],
    contraindicatedDrugs: [
      'ibuprofen',
      'advil',
      'motrin',
      'naproxen',
      'aleve',
      'ketorolac',
      'toradol',
      'aspirin',
      'meloxicam',
      'celecoxib',
      'diclofenac',
    ],
    severity: 'ELEVATED',
    clinicalRationale: 'COX-1 inhibition pathway sensitivity. Risk of precipitating acute bronchospasm (Aspirin-Exacerbated Respiratory Disease / AERD), severe GI bleeding, and acute renal impairment.',
    suggestedAlternatives: [
      {
        drugName: 'Acetaminophen (Tylenol)',
        dosage: '500 mg - 650 mg',
        frequency: 'Every 6 hours as needed (Max 3,000 mg/day)',
        reason: 'Non-COX-1 selective central analgesic and antipyretic — safe in NSAID-sensitive patients.',
      },
      {
        drugName: 'Tramadol HCl',
        dosage: '50 mg',
        frequency: 'Every 6 to 8 hours as needed',
        reason: 'Central opioid-receptor agonist with non-NSAID anti-inflammatory sparing.',
      },
    ],
  },
  {
    allergenClass: 'Codeine & Natural Opiates',
    aliases: ['codeine', 'morphine', 'opiates', 'opioids'],
    contraindicatedDrugs: [
      'codeine',
      'tylenol #3',
      'tylenol with codeine',
      'morphine',
      'hydrocodone',
      'oxycodone',
      'percocet',
      'vicodin',
    ],
    severity: 'CRITICAL',
    clinicalRationale: 'Phenanthrene opiate alkaloid cross-sensitivity. High risk of histamine release, respiratory depression, severe hypotension, and angioedema.',
    suggestedAlternatives: [
      {
        drugName: 'Acetaminophen (Extra Strength)',
        dosage: '500 mg',
        frequency: 'Every 6 hours as needed',
        reason: 'Non-opioid non-sedating analgesic.',
      },
      {
        drugName: 'Ketorolac Tromethamine',
        dosage: '10 mg',
        frequency: 'Every 6 hours (Max 5 days)',
        reason: 'Potent non-opioid parenteral/oral analgesic for acute pain management.',
      },
    ],
  },
];

export interface CdsEvaluationResult {
  hasContraindication: boolean;
  severity: 'CRITICAL' | 'ELEVATED' | 'NONE';
  matchedAllergy?: string;
  allergenClass?: string;
  clinicalRationale?: string;
  suggestedAlternatives: {
    drugName: string;
    dosage: string;
    frequency: string;
    reason: string;
  }[];
}

/**
 * Real-time Clinical Decision Support Evaluator
 * Cross-checks a candidate prescription against the patient's active allergy profile.
 */
export function evaluatePrescriptionSafety(
  patientAllergies: string[] = [],
  candidateDrugName: string = '',
): CdsEvaluationResult {
  if (!patientAllergies || patientAllergies.length === 0 || !candidateDrugName.trim()) {
    return {
      hasContraindication: false,
      severity: 'NONE',
      suggestedAlternatives: [],
    };
  }

  const cleanDrug = candidateDrugName.toLowerCase().trim();

  // Evaluate against all CDS cross-reactivity rules
  for (const rule of CDS_ALLERGY_RULES) {
    // Check if patient has any allergy matching this rule
    const patientMatchesAllergy = patientAllergies.some((userAllergy) => {
      const cleanUserAllergy = userAllergy.toLowerCase().trim();
      return rule.aliases.some(
        (alias) =>
          cleanUserAllergy.includes(alias) ||
          alias.includes(cleanUserAllergy) ||
          cleanUserAllergy === alias,
      );
    });

    if (patientMatchesAllergy) {
      // Check if candidate drug is contraindicated under this class
      const isContraindicated = rule.contraindicatedDrugs.some(
        (badDrug) =>
          cleanDrug.includes(badDrug) ||
          badDrug.includes(cleanDrug),
      );

      if (isContraindicated) {
        const matchedAllergy =
          patientAllergies.find((a) =>
            rule.aliases.some((alias) => a.toLowerCase().includes(alias)),
          ) || rule.allergenClass;

        return {
          hasContraindication: true,
          severity: rule.severity,
          matchedAllergy,
          allergenClass: rule.allergenClass,
          clinicalRationale: rule.clinicalRationale,
          suggestedAlternatives: rule.suggestedAlternatives,
        };
      }
    }
  }

  return {
    hasContraindication: false,
    severity: 'NONE',
    suggestedAlternatives: [],
  };
}

