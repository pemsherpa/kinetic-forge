import { ClaimInput } from '../types';

export const exampleClaims: Record<string, ClaimInput> = {
  'C1': {
    id: 'C-001-BASELINE',
    description: 'Minor fender bender in parking lot. Back bumper dented. Other driver accepted fault.',
    type: 'Comprehensive',
    amount: 25000,
    pastClaims: 0,
    documentsComplete: true,
    documentsPartial: false,
    documentsMissing: false,
  },
  'C2': {
    id: 'C-002-MISMATCH',
    description: 'Windshield cracked while driving on highway due to flying pebble. Claiming for own damage.',
    type: 'Third-Party',
    amount: 15000,
    pastClaims: 0,
    documentsComplete: true,
    documentsPartial: false,
    documentsMissing: false,
  },
  'C3': {
    id: 'C-003-FRAUD-RISK',
    description: 'Car caught fire while parked overnight. Cause unknown. Total loss claim.',
    type: 'Comprehensive',
    amount: 800000,
    pastClaims: 5,
    documentsComplete: false,
    documentsPartial: true,
    documentsMissing: false,
  },
  'C4': {
    id: 'C-004-INCOMPLETE',
    description: 'Rear ended at a red light. Trunk is completely smashed. Driver drove away.',
    type: 'Comprehensive',
    amount: 35000,
    pastClaims: 0,
    documentsComplete: false,
    documentsPartial: false,
    documentsMissing: true,
  },
  'C5': {
    id: 'C-005-VISION-TEST',
    description: 'Severe front-end collision. Entire hood destroyed, engine block heavily damaged. Vehicle undriveable.',
    type: 'Comprehensive',
    amount: 450000,
    pastClaims: 1,
    documentsComplete: true,
    documentsPartial: false,
    documentsMissing: false,
    imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=2000' // image of a perfectly fine car
  }
};
