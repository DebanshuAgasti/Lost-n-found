export const MOCK_USERS = [
  { id: 1, email: 'alex@example.com', fullName: 'Alex Mercer', role: 'ROLE_USER', phone: '+1-555-0101' },
  { id: 2, email: 'sarah@example.com', fullName: 'Sarah Chen', role: 'ROLE_USER', phone: '+1-555-0102' },
  { id: 3, email: 'admin@example.com', fullName: 'Campus Security Admin', role: 'ROLE_ADMIN', phone: '+1-555-0999' }
];

export const MOCK_LOST_ITEMS = [
  {
    id: 1,
    title: 'Space Gray Apple iPhone 15 Pro',
    category: 'ELECTRONICS',
    status: 'ACTIVE',
    description: 'Lost my iPhone with a transparent MagSafe case. Has a small Cyberpunk sticker on the lower back.',
    lostDate: '2026-10-02',
    lostTime: '15:30',
    locationName: 'Central Campus Library, 2nd Floor Quiet Zone',
    city: 'San Jose',
    latitude: 37.3352,
    longitude: -121.8811,
    rewardAmount: 100.00,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    attributes: {
      brand: 'Apple',
      model: 'iPhone 15 Pro 256GB',
      primaryColor: 'Space Gray',
      secondaryColor: 'Black',
      distinctiveMarks: 'Holographic Cyberpunk sticker on bottom back corner',
      scratchesOrDamage: 'Tiny scratch on top-right metal bezel',
      stickersOrAccessories: 'Clear Spigen MagSafe Case'
    }
  },
  {
    id: 2,
    title: 'Brown Leather Fossil Bifold Wallet',
    category: 'WALLET_AND_PURSE',
    status: 'ACTIVE',
    description: 'Vintage brown leather wallet containing university student ID and bus pass.',
    lostDate: '2026-10-01',
    lostTime: '12:15',
    locationName: 'Student Union Food Court',
    city: 'San Jose',
    latitude: 37.3364,
    longitude: -121.8825,
    rewardAmount: 50.00,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    attributes: {
      brand: 'Fossil',
      model: 'Derrick RFID Bifold',
      primaryColor: 'Dark Brown',
      secondaryColor: 'Tan',
      distinctiveMarks: 'Initials AM embossed on inside flap',
      scratchesOrDamage: 'Distressed vintage patina',
      stickersOrAccessories: 'None'
    }
  },
  {
    id: 3,
    title: 'Sage Green Hydro Flask Water Bottle (32oz)',
    category: 'OTHER',
    status: 'ACTIVE',
    description: 'Wide-mouth sage green water bottle covered with outdoor and national park stickers.',
    lostDate: '2026-10-03',
    lostTime: '09:00',
    locationName: 'Recreation & Fitness Center Gym',
    city: 'San Jose',
    latitude: 37.3340,
    longitude: -121.8790,
    rewardAmount: 20.00,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    attributes: {
      brand: 'Hydro Flask',
      model: '32 oz Wide Mouth',
      primaryColor: 'Sage Green',
      secondaryColor: 'Black Lid',
      distinctiveMarks: 'Yosemite & Big Sur stickers',
      scratchesOrDamage: 'Small dent on bottom steel rim',
      stickersOrAccessories: 'Paracord handle strap'
    }
  }
];

export const MOCK_FOUND_ITEMS = [
  {
    id: 101,
    title: 'Apple iPhone with Sticker Found in Library',
    category: 'ELECTRONICS',
    status: 'ACTIVE',
    description: 'Found dark titanium iPhone sitting on a wooden desk next to computer station #14.',
    foundDate: '2026-10-02',
    foundTime: '17:45',
    locationName: 'Campus Library 2nd Floor Study Cubicles',
    city: 'San Jose',
    storageLocation: 'Library Front Desk Locker B-4',
    currentCustodian: 'Sarah Chen (Library Desk)',
    verificationQuestion: 'What is the sticker on the back and what picture is the lockscreen wallpaper?',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    attributes: {
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      primaryColor: 'Space Gray',
      secondaryColor: 'Silver rim',
      distinctiveMarks: 'Has a distinctive sticker on back',
      scratchesOrDamage: 'Clean glass, slight wear on top corner',
      stickersOrAccessories: 'Clear plastic case'
    }
  },
  {
    id: 102,
    title: 'Vintage Leather Wallet Found Near Cafeteria',
    category: 'WALLET_AND_PURSE',
    status: 'ACTIVE',
    description: 'Handed in by dining staff. High quality dark leather with cards inside.',
    foundDate: '2026-10-01',
    foundTime: '14:00',
    locationName: 'Student Union Dining Hall',
    city: 'San Jose',
    storageLocation: 'Campus Security Safe Box #12',
    currentCustodian: 'Campus Security HQ',
    verificationQuestion: 'What are the two initials engraved on the inside leather fold?',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    attributes: {
      brand: 'Fossil',
      model: 'Bifold',
      primaryColor: 'Brown',
      secondaryColor: 'Tan',
      distinctiveMarks: 'Contains embossed initials',
      scratchesOrDamage: 'Light leather scuffs',
      stickersOrAccessories: 'None'
    }
  }
];

export const MOCK_MATCHES = [
  {
    id: 501,
    lostItemId: 1,
    foundItemId: 101,
    overallScore: 0.935,
    status: 'SUGGESTED',
    reviewerNotes: 'Extremely high correlation across visual, category, brand, and spatial-temporal proximity.',
    breakdown: {
      visualScore: 0.94,
      categoryScore: 1.0,
      attributesScore: 0.96,
      textScore: 0.88,
      locationScore: 0.98,
      temporalScore: 0.95,
      explanation: 'Exact brand (Apple) and model (iPhone 15 Pro) match. Found on the same day in the 2nd floor library area (~150m distance). Both reports document a clear case and back sticker.'
    },
    aiExplanation: {
      executiveSummary: 'This is an exceptional 93.5% confidence match. Both reports describe an Apple iPhone 15 Pro with a clear case and rear sticker found within 2 hours of the lost report at the Central Library.',
      matchingFactors: [
        'Exact category match: ELECTRONICS (100%)',
        'Physical visual cosine similarity: 94.0%',
        'Geographic proximity: Same building / 2nd floor (~0.05 km)',
        'Timeline consistency: Found 2 hours after reported lost time',
        'Distinctive feature correlation: Clear case with decorative back sticker'
      ],
      conflictingFactors: [
        'None identified. Visual embeddings and location data align precisely.'
      ],
      confidenceGrade: 'VERY_HIGH',
      recommendation: 'Highly recommended for immediate claim verification. Prompt owner for lockscreen photo proof.'
    }
  }
];

export const MOCK_CLAIMS = [
  {
    id: 301,
    foundItemId: 101,
    lostItemId: 1,
    claimantId: 1,
    claimantName: 'Alex Mercer',
    status: 'SUBMITTED',
    proofDescription: 'I can unlock the phone with Face ID or passcode 847291. The wallpaper is a golden retriever puppy in snow.',
    verificationAnswers: 'Cyberpunk Edgerunners sticker on bottom right. Lockscreen is my golden retriever dog in winter.',
    createdAt: '2026-10-02T19:30:00Z',
    aiVerification: {
      confidenceScore: 0.94,
      verdict: 'LIKELY_MATCH',
      recommendedAction: 'APPROVE',
      reasoning: 'Claimant answers the specific hidden question about the Cyberpunk sticker and provides verifiable wallpaper details.',
      matchedEvidence: [
        'Accurately described the Cyberpunk sticker mentioned in private custodian notes',
        'Offered specific lockscreen wallpaper description matching physical device'
      ],
      discrepancyEvidence: []
    }
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'High Confidence Match Detected! (93.5%)',
    message: 'Your lost "Space Gray Apple iPhone 15 Pro" has a potential match found at Central Campus Library.',
    type: 'MATCH_FOUND',
    referenceId: 501,
    referenceType: 'MATCH',
    isRead: false,
    createdAt: '10 mins ago'
  },
  {
    id: 2,
    title: 'New Ownership Claim Submitted',
    message: 'Alex Mercer filed a claim with secret answers on Found Item #101.',
    type: 'CLAIM_SUBMITTED',
    referenceId: 301,
    referenceType: 'CLAIM',
    isRead: false,
    createdAt: '1 hour ago'
  }
];
