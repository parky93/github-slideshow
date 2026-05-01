import { db } from './client'

export function seedDatabase(): void {
  const existing = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM qualifications')
  if (existing && existing.count > 0) return

  type QualInput = {
    slug: string
    name: string
    category: string
    qualType?: string
    pathway: string
    summary: string
    officialUrl: string
    sections: Array<{ title: string; items: string[] }>
  }

  function insertQual(q: QualInput): number {
    const result = db.runSync(
      `INSERT INTO qualifications (slug, name, category, qual_type, pathway, summary, official_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [q.slug, q.name, q.category, q.qualType ?? 'qualification', q.pathway, q.summary, q.officialUrl],
    )
    const qualId = result.lastInsertRowId as number

    for (let i = 0; i < q.sections.length; i++) {
      const sec = q.sections[i]
      const secResult = db.runSync(
        'INSERT INTO sections (qualification_id, title, sort_order) VALUES (?, ?, ?)',
        [qualId, sec.title, i],
      )
      const secId = secResult.lastInsertRowId as number

      for (let j = 0; j < sec.items.length; j++) {
        db.runSync(
          'INSERT INTO checklist_items (section_id, prompt, sort_order) VALUES (?, ?, ?)',
          [secId, sec.items[j], j],
        )
      }
    }
    return qualId
  }

  // ─── WALKING PATHWAY ────────────────────────────────────────────

  insertQual({
    slug: 'camping-leader',
    name: 'Camping Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/camping-leader',
    summary: 'For those who lead groups on overnight camping expeditions in lowland terrain.',
    sections: [
      { title: 'Campcraft Skills', items: [] },
      { title: 'Group Management', items: [] },
      { title: 'Navigation', items: [] },
      { title: 'Risk Assessment', items: [] },
      { title: 'Emergency Procedures', items: [] },
    ],
  })

  insertQual({
    slug: 'lowland-leader',
    name: 'Lowland Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/lowland-leader',
    summary: 'For those who lead groups on foot in lowland, countryside terrain.',
    sections: [
      { title: 'Navigation', items: [] },
      { title: 'Country Knowledge', items: [] },
      { title: 'Group Leadership', items: [] },
      { title: 'Emergency Procedures', items: [] },
      { title: 'Duty of Care', items: [] },
    ],
  })

  insertQual({
    slug: 'hill-and-moorland-leader',
    name: 'Hill and Moorland Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/hill-and-moorland-leader',
    summary: 'For those leading groups in open hill and moorland terrain.',
    sections: [
      { title: 'Navigation', items: [] },
      { title: 'Terrain Judgement', items: [] },
      { title: 'Meteorology', items: [] },
      { title: 'Group Management', items: [] },
      { title: 'Emergency Procedures', items: [] },
      { title: 'Access and Environment', items: [] },
    ],
  })

  // Mountain Leader — full 64-item checklist
  insertQual({
    slug: 'mountain-leader',
    name: 'Mountain Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/mountain-leader',
    summary: "The UK's premier qualification for leading groups on hill and mountain walks in summer conditions.",
    sections: [
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
          "Plan and brief a day's mountain walk clearly and appropriately for the group",
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
    ],
  })

  insertQual({
    slug: 'winter-mountain-leader',
    name: 'Winter Mountain Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/winter-mountain-leader',
    summary: 'For those who lead groups on walks in Scottish winter mountain conditions, including snow and ice.',
    sections: [
      { title: 'Winter Navigation', items: [] },
      { title: 'Avalanche Awareness', items: [] },
      { title: 'Ice Axe and Crampons', items: [] },
      { title: 'Winter Terrain Judgement', items: [] },
      { title: 'Emergency Procedures in Winter', items: [] },
      { title: 'Group Management in Winter', items: [] },
    ],
  })

  insertQual({
    slug: 'international-mountain-leader',
    name: 'International Mountain Leader',
    category: 'walking',
    pathway: 'Walking',
    officialUrl: 'https://www.mountain-training.org/qualifications/walking/international-mountain-leader',
    summary: 'Enables holders to lead guided walking groups in mountainous terrain worldwide.',
    sections: [
      { title: 'Navigation — International Terrain', items: [] },
      { title: 'Environmental Knowledge', items: [] },
      { title: 'High Altitude Considerations', items: [] },
      { title: 'Guiding Skills', items: [] },
      { title: 'International Emergency Procedures', items: [] },
    ],
  })

  // ─── CLIMBING & COACHING PATHWAY ────────────────────────────────

  insertQual({
    slug: 'foundation-coach',
    name: 'Foundation Coach',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/foundation-coach',
    summary: 'Develops coaching knowledge for working with young people and beginners in climbing.',
    sections: [
      { title: 'Coaching Principles', items: [] },
      { title: 'Safeguarding', items: [] },
      { title: 'Movement Skills', items: [] },
      { title: 'Session Planning', items: [] },
    ],
  })

  insertQual({
    slug: 'development-coach',
    name: 'Development Coach',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/development-coach',
    summary: 'For those coaching intermediate to advanced climbers, focusing on technical skill development.',
    sections: [
      { title: 'Advanced Coaching Methods', items: [] },
      { title: 'Movement Analysis', items: [] },
      { title: 'Training Planning', items: [] },
      { title: 'Physiology and Injury Prevention', items: [] },
    ],
  })

  insertQual({
    slug: 'performance-coach',
    name: 'Performance Coach',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/performance-coach',
    summary: 'For those working at the highest level with elite and competition climbers.',
    sections: [
      { title: 'Elite Performance Methods', items: [] },
      { title: 'Competition Preparation', items: [] },
      { title: 'Sports Science Application', items: [] },
      { title: 'Athlete Management', items: [] },
    ],
  })

  insertQual({
    slug: 'indoor-climbing-assistant',
    name: 'Indoor Climbing Assistant',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/indoor-climbing-assistant',
    summary: 'Enables holders to assist with supervision and instruction of climbers on indoor walls.',
    sections: [
      { title: 'Safeguarding and Duty of Care', items: [] },
      { title: 'Belaying', items: [] },
      { title: 'Basic Movement Instruction', items: [] },
      { title: 'Emergency Procedures', items: [] },
    ],
  })

  insertQual({
    slug: 'bouldering-wall-instructor',
    name: 'Bouldering Wall Instructor',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/bouldering-wall-instructor',
    summary: 'For those instructing on bouldering walls, working with a range of participants.',
    sections: [
      { title: 'Participant Management', items: [] },
      { title: 'Bouldering Movement Teaching', items: [] },
      { title: 'Session Design', items: [] },
      { title: 'Safety Management', items: [] },
    ],
  })

  insertQual({
    slug: 'climbing-wall-instructor',
    name: 'Climbing Wall Instructor',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor',
    summary: 'Enables holders to instruct groups of novices on indoor climbing walls, including top-rope and leading.',
    sections: [
      { title: 'Ropework and Belaying', items: [] },
      { title: 'Instruction Technique', items: [] },
      { title: 'Movement Coaching', items: [] },
      { title: 'Session Planning', items: [] },
      { title: 'Risk Management', items: [] },
    ],
  })

  insertQual({
    slug: 'cwi-abseil-module',
    name: 'CWI — Abseil Module',
    category: 'climbing_coaching',
    qualType: 'module',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor-abseil-module',
    summary: 'Add-on module for CWI holders to extend practice to include abseiling instruction.',
    sections: [
      { title: 'Abseil Setup', items: [] },
      { title: 'Participant Management on Abseil', items: [] },
      { title: 'Emergency Procedures', items: [] },
    ],
  })

  insertQual({
    slug: 'climbing-wall-development-instructor',
    name: 'Climbing Wall Development Instructor',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/climbing-wall-development-instructor',
    summary: 'For those developing lead climbing instruction at indoor walls.',
    sections: [
      { title: 'Lead Climbing Instruction', items: [] },
      { title: 'Advanced Ropework', items: [] },
      { title: 'Movement for Lead Climbers', items: [] },
      { title: 'Risk Management', items: [] },
    ],
  })

  insertQual({
    slug: 'rock-climbing-instructor',
    name: 'Rock Climbing Instructor',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/rock-climbing-instructor',
    summary: 'Enables holders to instruct groups at single-pitch outdoor crags.',
    sections: [
      { title: 'Ropework at the Crag', items: [] },
      { title: 'Anchors and Belay Systems', items: [] },
      { title: 'Instructing Movement', items: [] },
      { title: 'Descent and Abseiling', items: [] },
      { title: 'Group Management at the Crag', items: [] },
      { title: 'Access and Environment', items: [] },
    ],
  })

  insertQual({
    slug: 'rock-climbing-development-instructor',
    name: 'Rock Climbing Development Instructor',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/rock-climbing-development-instructor',
    summary: 'Extends RCI practice to include multi-pitch rock climbing and advanced technical instruction.',
    sections: [
      { title: 'Multi-pitch Techniques', items: [] },
      { title: 'Advanced Anchor Systems', items: [] },
      { title: 'Route Selection and Risk', items: [] },
      { title: 'Retreat and Rescue', items: [] },
    ],
  })

  insertQual({
    slug: 'mountaineering-and-climbing-instructor',
    name: 'Mountaineering and Climbing Instructor',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/mountaineering-and-climbing-instructor',
    summary: 'For experienced mountain and rock instructors combining navigation, leadership and technical climbing.',
    sections: [
      { title: 'Mountain Navigation', items: [] },
      { title: 'Technical Rock', items: [] },
      { title: 'Mountain Rescue', items: [] },
      { title: 'Group Management in Mountain Terrain', items: [] },
      { title: 'Campcraft and Bivouac', items: [] },
    ],
  })

  insertQual({
    slug: 'winter-mountaineering-and-climbing-instructor',
    name: 'Winter Mountaineering and Climbing Instructor',
    category: 'climbing_coaching',
    pathway: 'Climbing & Coaching',
    officialUrl: 'https://www.mountain-training.org/qualifications/climbing/winter-mountaineering-and-climbing-instructor',
    summary: 'The highest technical award, covering instructing in winter mountaineering and climbing.',
    sections: [
      { title: 'Winter Technical Skills', items: [] },
      { title: 'Ice and Mixed Climbing Instruction', items: [] },
      { title: 'Avalanche Management', items: [] },
      { title: 'Winter Emergency Procedures', items: [] },
    ],
  })
}
