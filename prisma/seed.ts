import { PrismaClient } from '@prisma/client'
import { generateStableKey } from '../src/lib/mapping/stable-key'

const prisma = new PrismaClient()

async function main() {
  console.log('🏔️  Seeding Mountain Training qualifications...')

  // Clear existing data
  await prisma.progressSnapshot.deleteMany()
  await prisma.ratingHistory.deleteMany()
  await prisma.userRating.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.section.deleteMany()
  await prisma.changeSet.deleteMany()
  await prisma.itemMapping.deleteMany()
  await prisma.refreshRun.deleteMany()
  await prisma.qualification.deleteMany()

  // ─────────────────────────────────────────────────────────────
  // WALKING PATHWAY
  // ─────────────────────────────────────────────────────────────

  // 1. Camping Leader
  await createQual({
    slug: 'camping-leader',
    title: 'Camping Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/camping-leader',
    summary:
      'The Camping Leader qualification is designed for those who lead groups on overnight camping expeditions in lowland terrain.',
    keyInfo: {
      trainingDays: '3 days',
      assessmentDays: '2 days',
      prerequisites: ['Lowland Leader (or working towards it)'],
    },
    sections: [
      { title: 'Campcraft Skills', items: [] },
      { title: 'Group Management', items: [] },
      { title: 'Navigation', items: [] },
      { title: 'Risk Assessment', items: [] },
      { title: 'Emergency Procedures', items: [] },
    ],
  })

  // 2. Lowland Leader
  await createQual({
    slug: 'lowland-leader',
    title: 'Lowland Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/lowland-leader',
    summary:
      'The Lowland Leader is the award for those who lead groups on foot in lowland, countryside terrain.',
    keyInfo: {
      trainingDays: '3 days',
      assessmentDays: '2 days',
    },
    sections: [
      { title: 'Navigation', items: [] },
      { title: 'Country Knowledge', items: [] },
      { title: 'Group Leadership', items: [] },
      { title: 'Emergency Procedures', items: [] },
      { title: 'Duty of Care', items: [] },
    ],
  })

  // 3. Hill and Moorland Leader
  await createQual({
    slug: 'hill-and-moorland-leader',
    title: 'Hill and Moorland Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl:
      'https://www.mountain-training.org/qualifications/walking/hill-and-moorland-leader',
    summary:
      'The Hill and Moorland Leader qualification is for those leading groups in open hill and moorland terrain.',
    keyInfo: {
      trainingDays: '4 days',
      assessmentDays: '2 days',
    },
    sections: [
      { title: 'Navigation', items: [] },
      { title: 'Terrain Judgement', items: [] },
      { title: 'Meteorology', items: [] },
      { title: 'Group Management', items: [] },
      { title: 'Emergency Procedures', items: [] },
      { title: 'Access and Environment', items: [] },
    ],
  })

  // 4. Mountain Leader — FULL CHECKLIST
  const mlQual = await createQual({
    slug: 'mountain-leader',
    title: 'Mountain Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/mountain-leader',
    handbookUrl:
      'https://www.mountain-training.org/qualifications/walking/mountain-leader/candidate-information',
    checklistUrl:
      'https://www.mountain-training.org/content/files/ml-logbook-and-skills-checklist.pdf',
    summary:
      'The Mountain Leader award is the UK\'s premier qualification for those who lead groups on hill and mountain walks in summer conditions. It covers navigation, terrain judgement, leadership, and emergency procedures in mountain environments.',
    keyInfo: {
      trainingDays: '5 days',
      assessmentDays: '5 days',
      prerequisites: [
        'Minimum 20 quality mountain days before training',
        'Minimum 20 quality mountain days before assessment',
      ],
      recommendedExperience:
        'At least 40 Quality Mountain Days in a variety of mountain terrain and conditions, including some leadership experience',
    },
    sections: [],
  })

  // Now add the full ML checklist
  await addMLChecklist(mlQual.id, 'mountain-leader')

  // 5. Winter Mountain Leader
  await createQual({
    slug: 'winter-mountain-leader',
    title: 'Winter Mountain Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl:
      'https://www.mountain-training.org/qualifications/walking/winter-mountain-leader',
    summary:
      'The Winter Mountain Leader award is for those who lead groups on walks and expeditions in Scottish winter mountain conditions, including snow and ice.',
    keyInfo: {
      trainingDays: '5 days',
      assessmentDays: '5 days',
      prerequisites: ['Mountain Leader (Summer)', 'Winter experience log required'],
    },
    sections: [
      { title: 'Winter Navigation', items: [] },
      { title: 'Avalanche Awareness', items: [] },
      { title: 'Ice Axe and Crampons', items: [] },
      { title: 'Winter Terrain Judgement', items: [] },
      { title: 'Emergency Procedures in Winter', items: [] },
      { title: 'Group Management in Winter', items: [] },
    ],
  })

  // 6. International Mountain Leader
  await createQual({
    slug: 'international-mountain-leader',
    title: 'International Mountain Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl:
      'https://www.mountain-training.org/qualifications/walking/international-mountain-leader',
    summary:
      'The International Mountain Leader qualification enables holders to lead guided walking groups in mountainous terrain worldwide.',
    keyInfo: {
      trainingDays: '10 days',
      assessmentDays: '5 days',
      prerequisites: ['Mountain Leader'],
    },
    sections: [
      { title: 'Navigation — International Terrain', items: [] },
      { title: 'Environmental Knowledge', items: [] },
      { title: 'High Altitude Considerations', items: [] },
      { title: 'Guiding Skills', items: [] },
      { title: 'International Emergency Procedures', items: [] },
    ],
  })

  // ─────────────────────────────────────────────────────────────
  // CLIMBING & COACHING PATHWAY
  // ─────────────────────────────────────────────────────────────

  // 7. Foundation Coach
  await createQual({
    slug: 'foundation-coach',
    title: 'Foundation Coach',
    category: 'coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/foundation-coach',
    summary:
      'The Foundation Coach qualification develops coaching knowledge and skills for working with young people and beginners in climbing.',
    keyInfo: { trainingDays: '2 days', assessmentDays: '1 day' },
    sections: [
      { title: 'Coaching Principles', items: [] },
      { title: 'Safeguarding', items: [] },
      { title: 'Movement Skills', items: [] },
      { title: 'Session Planning', items: [] },
    ],
  })

  // 8. Development Coach
  await createQual({
    slug: 'development-coach',
    title: 'Development Coach',
    category: 'coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/development-coach',
    summary:
      'The Development Coach qualification is for those coaching intermediate to advanced climbers, focusing on technical skill development and performance.',
    keyInfo: { trainingDays: '4 days', assessmentDays: '2 days' },
    sections: [
      { title: 'Advanced Coaching Methods', items: [] },
      { title: 'Movement Analysis', items: [] },
      { title: 'Training Planning', items: [] },
      { title: 'Physiology and Injury Prevention', items: [] },
    ],
  })

  // 9. Performance Coach
  await createQual({
    slug: 'performance-coach',
    title: 'Performance Coach',
    category: 'coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/performance-coach',
    summary:
      'The Performance Coach award is for those working at the highest level with elite and competition climbers.',
    keyInfo: { trainingDays: '5 days', assessmentDays: '3 days' },
    sections: [
      { title: 'Elite Performance Methods', items: [] },
      { title: 'Competition Preparation', items: [] },
      { title: 'Sports Science Application', items: [] },
      { title: 'Athlete Management', items: [] },
    ],
  })

  // 10. Indoor Climbing Assistant
  await createQual({
    slug: 'indoor-climbing-assistant',
    title: 'Indoor Climbing Assistant',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/indoor-climbing-assistant',
    summary:
      'The Indoor Climbing Assistant qualification enables holders to assist with the supervision and instruction of climbers on indoor walls.',
    keyInfo: { trainingDays: '2 days', assessmentDays: '1 day' },
    sections: [
      { title: 'Safeguarding and Duty of Care', items: [] },
      { title: 'Belaying', items: [] },
      { title: 'Basic Movement Instruction', items: [] },
      { title: 'Emergency Procedures', items: [] },
    ],
  })

  // 11. Bouldering Wall Instructor
  await createQual({
    slug: 'bouldering-wall-instructor',
    title: 'Bouldering Wall Instructor',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/bouldering-wall-instructor',
    summary:
      'The Bouldering Wall Instructor qualification is for those instructing on bouldering walls, working with a range of participants.',
    keyInfo: { trainingDays: '3 days', assessmentDays: '1 day' },
    sections: [
      { title: 'Participant Management', items: [] },
      { title: 'Bouldering Movement Teaching', items: [] },
      { title: 'Session Design', items: [] },
      { title: 'Safety Management', items: [] },
    ],
  })

  // 12. Climbing Wall Instructor
  await createQual({
    slug: 'climbing-wall-instructor',
    title: 'Climbing Wall Instructor',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor',
    summary:
      'The Climbing Wall Instructor qualification enables holders to instruct groups of novices on indoor climbing walls, including top-rope and leading.',
    keyInfo: { trainingDays: '4 days', assessmentDays: '2 days' },
    sections: [
      { title: 'Ropework and Belaying', items: [] },
      { title: 'Instruction Technique', items: [] },
      { title: 'Movement Coaching', items: [] },
      { title: 'Session Planning', items: [] },
      { title: 'Risk Management', items: [] },
    ],
  })

  // 13. CWI Abseil Module
  await createQual({
    slug: 'cwi-abseil-module',
    title: 'Climbing Wall Instructor — Abseil Module',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    qualType: 'module',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor-abseil-module',
    summary:
      'An add-on module for CWI holders to extend their practice to include abseiling instruction at climbing walls.',
    keyInfo: { trainingDays: '1 day', assessmentDays: '1 day' },
    sections: [
      { title: 'Abseil Setup', items: [] },
      { title: 'Participant Management on Abseil', items: [] },
      { title: 'Emergency Procedures', items: [] },
    ],
  })

  // 14. Climbing Wall Development Instructor
  await createQual({
    slug: 'climbing-wall-development-instructor',
    title: 'Climbing Wall Development Instructor',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-development-instructor',
    summary:
      'The CWDI is for those developing lead climbing instruction at indoor walls, working with more experienced climbers.',
    keyInfo: { trainingDays: '4 days', assessmentDays: '2 days' },
    sections: [
      { title: 'Lead Climbing Instruction', items: [] },
      { title: 'Advanced Ropework', items: [] },
      { title: 'Movement for Lead Climbers', items: [] },
      { title: 'Risk Management', items: [] },
    ],
  })

  // 15. Rock Climbing Instructor
  await createQual({
    slug: 'rock-climbing-instructor',
    title: 'Rock Climbing Instructor',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/rock-climbing-instructor',
    summary:
      'The Rock Climbing Instructor award enables holders to instruct groups at single-pitch outdoor crags, teaching basic rock climbing skills.',
    keyInfo: {
      trainingDays: '5 days',
      assessmentDays: '3 days',
      prerequisites: ['CWI or equivalent', 'Outdoor climbing experience'],
    },
    sections: [
      { title: 'Ropework at the Crag', items: [] },
      { title: 'Anchors and Belay Systems', items: [] },
      { title: 'Instructing Movement', items: [] },
      { title: 'Descent and Abseiling', items: [] },
      { title: 'Group Management at the Crag', items: [] },
      { title: 'Access and Environment', items: [] },
    ],
  })

  // 16. Rock Climbing Development Instructor
  await createQual({
    slug: 'rock-climbing-development-instructor',
    title: 'Rock Climbing Development Instructor',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/rock-climbing-development-instructor',
    summary:
      'The RCDI extends RCI practice to include multi-pitch rock climbing and more advanced technical instruction.',
    keyInfo: {
      trainingDays: '5 days',
      assessmentDays: '4 days',
      prerequisites: ['Rock Climbing Instructor', 'Multi-pitch experience'],
    },
    sections: [
      { title: 'Multi-pitch Techniques', items: [] },
      { title: 'Advanced Anchor Systems', items: [] },
      { title: 'Route Selection and Risk', items: [] },
      { title: 'Retreat and Rescue', items: [] },
    ],
  })

  // 17. Mountaineering and Climbing Instructor
  await createQual({
    slug: 'mountaineering-and-climbing-instructor',
    title: 'Mountaineering and Climbing Instructor',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/mountaineering-and-climbing-instructor',
    summary:
      'The MCI is for experienced mountain and rock instructors working in mountain environments, combining navigation, leadership and technical climbing instruction.',
    keyInfo: {
      trainingDays: '7 days',
      assessmentDays: '5 days',
      prerequisites: ['Mountain Leader', 'Rock Climbing Development Instructor'],
    },
    sections: [
      { title: 'Mountain Navigation', items: [] },
      { title: 'Technical Rock', items: [] },
      { title: 'Mountain Rescue', items: [] },
      { title: 'Group Management in Mountain Terrain', items: [] },
      { title: 'Campcraft and Bivouac', items: [] },
    ],
  })

  // 18. Winter Mountaineering and Climbing Instructor
  await createQual({
    slug: 'winter-mountaineering-and-climbing-instructor',
    title: 'Winter Mountaineering and Climbing Instructor',
    category: 'climbing',
    pathway: 'Climbing & Coaching',
    officialUrl:
      'https://www.mountain-training.org/qualifications/climbing/winter-mountaineering-and-climbing-instructor',
    summary:
      'The WMCI is the highest technical award, covering instructing in winter mountaineering and climbing on snow, ice and mixed routes.',
    keyInfo: {
      trainingDays: '7 days',
      assessmentDays: '5 days',
      prerequisites: ['MCI', 'Extensive winter experience'],
    },
    sections: [
      { title: 'Winter Technical Skills', items: [] },
      { title: 'Ice and Mixed Climbing Instruction', items: [] },
      { title: 'Avalanche Management', items: [] },
      { title: 'Winter Emergency Procedures', items: [] },
    ],
  })

  console.log('✅ All qualifications seeded.')
  console.log('📋 Mountain Leader has full checklist data.')
}

// ─────────────────────────────────────────────────────────────
// Helper: create a qualification with sections
// ─────────────────────────────────────────────────────────────

interface QualInput {
  slug: string
  title: string
  category: string
  pathway: string
  qualType?: string
  officialUrl: string
  handbookUrl?: string
  checklistUrl?: string
  summary?: string
  keyInfo?: Record<string, unknown>
  sections: Array<{ title: string; items: string[] }>
}

async function createQual(input: QualInput) {
  const qual = await prisma.qualification.create({
    data: {
      slug: input.slug,
      title: input.title,
      category: input.category,
      pathway: input.pathway,
      qualType: input.qualType ?? 'qualification',
      officialUrl: input.officialUrl,
      handbookUrl: input.handbookUrl,
      checklistUrl: input.checklistUrl,
      summary: input.summary,
      keyInfo: input.keyInfo ? JSON.stringify(input.keyInfo) : null,
    },
  })

  for (let i = 0; i < input.sections.length; i++) {
    const sec = input.sections[i]
    const section = await prisma.section.create({
      data: {
        qualificationId: qual.id,
        title: sec.title,
        order: i,
      },
    })

    for (let j = 0; j < sec.items.length; j++) {
      const prompt = sec.items[j]
      await prisma.checklistItem.create({
        data: {
          qualificationId: qual.id,
          sectionId: section.id,
          stableKey: generateStableKey(input.slug, sec.title, prompt),
          prompt,
          sourceType: 'manual',
          order: j,
          extractionConfidence: 0.9,
        },
      })
    }
  }

  return qual
}

// ─────────────────────────────────────────────────────────────
// Full Mountain Leader checklist
// ─────────────────────────────────────────────────────────────

async function addMLChecklist(qualId: string, slug: string) {
  const sections = [
    {
      title: 'Navigation',
      items: [
        'Use a 1:25,000 and 1:50,000 scale map accurately in all weathers and conditions',
        'Identify features and terrain from a map and relate them to the ground',
        'Set the map using a compass and by inspection',
        'Take and follow a bearing accurately over varied terrain',
        'Use aspect of slope, contour interpretation and other techniques to navigate in poor visibility',
        'Use pacing and timing to measure distance on the ground',
        'Navigate at night using map and compass',
        'Identify and use attack points, catching features and handrails',
        'Plan and execute a safe and efficient route for a group in mountain terrain',
        'Relocate accurately when lost using systematic methods',
      ],
    },
    {
      title: 'Terrain Judgement',
      items: [
        'Identify potentially hazardous ground: crags, gullies, bogs, steep grass, loose rock',
        'Choose appropriate lines of travel to avoid hazards',
        'Judge when it is appropriate to use rope on steep or technical ground',
        'Identify objective and subjective hazards in mountain terrain',
        'Make safe and informed decisions about route choice in adverse conditions',
        'Demonstrate awareness of ground conditions and how they change seasonally',
        'Read terrain confidently on featureless or complex mountain ground',
      ],
    },
    {
      title: 'Meteorology',
      items: [
        'Interpret weather forecasts and understand synoptic charts',
        'Identify sources of reliable mountain weather information',
        'Recognise weather patterns and indicators in the field',
        'Understand the effect of altitude, aspect and season on weather',
        'Make safe decisions based on forecast and observed conditions',
        'Brief a group clearly on weather implications for the day',
        'Know when conditions demand retreat or significant route change',
      ],
    },
    {
      title: 'River Lore',
      items: [
        'Assess the safety of river crossings in mountain terrain',
        'Select safe crossing points and crossing techniques',
        'Manage a group safely when crossing or avoiding rivers and streams',
        'Understand flash flood risk and indicators',
        'Know when not to cross and find alternative routes',
        'Use appropriate crossing techniques: waddle position, group support',
      ],
    },
    {
      title: 'Emergency Procedures',
      items: [
        'Carry and use appropriate first aid kit and know its contents',
        'Manage a mountain casualty: assessment, treatment, evacuation decision',
        'Improvise a stretcher for evacuation if required',
        'Summon mountain rescue effectively: phone, SMS, emergency signal',
        'Navigate to a helicopter-landing site and signal to aircraft',
        'Administer first aid for hypothermia, head injury, fractures, blisters',
        'Manage a group effectively in an emergency: communications, morale, shelter',
        'Complete an accident report form accurately',
        'Know the limitations of mobile phone coverage and carry a backup plan',
        'Demonstrate the emergency signal (6 blasts/flashes per minute)',
      ],
    },
    {
      title: 'Leadership and Teaching',
      items: [
        'Plan and brief a day\'s mountain walk clearly and appropriately for the group',
        'Lead a group safely through the day, adjusting plans as conditions change',
        'Manage group pace, rest stops, and nutrition effectively',
        'Teach basic navigation skills to group members when appropriate',
        'Give clear, concise instructions and demonstrate skills confidently',
        'Manage group dynamics: motivation, conflict, fatigue, anxiety',
        'Adapt leadership style to group experience and conditions',
        'Conduct a thorough pre-departure check of group equipment and fitness',
        'Debrief a day appropriately: review learning, discuss decisions made',
      ],
    },
    {
      title: 'Use of Ropes',
      items: [
        'Choose when to use a rope to manage group safety on terrain',
        'Tie and use appropriate knots: figure-of-eight, clove hitch, Italian hitch, overhand',
        'Construct a safe anchor on a variety of natural and artificial features',
        'Use a rope for a short roping technique safely',
        'Set up a top rope to safeguard a group on steep ground',
        'Manage a group safely when using a rope on terrain',
        'Understand load forces and how to minimise them in an anchor system',
      ],
    },
    {
      title: 'Access, Environment and Overnight',
      items: [
        'Know the access rights and responsibilities in England, Wales and Scotland',
        'Identify and apply Leave No Trace principles in mountain environments',
        'Manage a wild camp safely and with minimal environmental impact',
        'Select an appropriate campsite: shelter, drainage, ground surface',
        'Set up camp in adverse conditions including strong wind and rain',
        'Manage group food, water and hygiene on an overnight expedition',
        'Brief the group on environmental considerations and access responsibilities',
        'Know the main conservation designations and their implications for leaders',
      ],
    },
  ]

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i]
    const section = await prisma.section.create({
      data: {
        qualificationId: qualId,
        title: sec.title,
        order: i,
        description: null,
      },
    })

    for (let j = 0; j < sec.items.length; j++) {
      const prompt = sec.items[j]
      await prisma.checklistItem.create({
        data: {
          qualificationId: qualId,
          sectionId: section.id,
          stableKey: generateStableKey(slug, sec.title, prompt),
          prompt,
          sourceType: 'manual',
          order: j,
          extractionConfidence: 0.95,
        },
      })
    }
  }

  console.log(`   ✓ Mountain Leader: ${sections.length} sections, ${sections.reduce((sum, s) => sum + s.items.length, 0)} items`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
