import AsyncStorage from '@react-native-async-storage/async-storage'
import { setJSON } from './client'

export interface StoredItem {
  id: number
  sectionId: number
  prompt: string
  sortOrder: number
  isCoachingItem: boolean
}

export interface StoredSection {
  id: number
  qualId: number
  title: string
  sortOrder: number
  items: StoredItem[]
}

export interface StoredQual {
  id: number
  slug: string
  name: string
  category: string
  qualType: string
  pathway: string | null
  summary: string
  officialUrl: string
  sections: StoredSection[]
}

let qid = 0
let sid = 0
let iid = 0

function makeQual(
  slug: string, name: string, category: string, pathway: string,
  summary: string, officialUrl: string,
  sections: Array<{ title: string; items: string[] }>,
  qualType = 'qualification',
): StoredQual {
  const qualId = ++qid
  return {
    id: qualId, slug, name, category, qualType, pathway, summary, officialUrl,
    sections: sections.map((s, si) => {
      const secId = ++sid
      return {
        id: secId, qualId, title: s.title, sortOrder: si,
        items: s.items.map((prompt, ii) => ({
          id: ++iid, sectionId: secId, prompt, sortOrder: ii, isCoachingItem: false,
        })),
      }
    }),
  }
}

export async function seedDatabase(): Promise<void> {
  const done = await AsyncStorage.getItem('mta:seeded')
  if (done) return

  const quals: StoredQual[] = [
    makeQual('camping-leader', 'Camping Leader', 'walking', 'Walking',
      'For those who lead groups on overnight camping expeditions in lowland terrain.',
      'https://www.mountain-training.org/qualifications/walking/camping-leader',
      [
        { title: 'Campcraft Skills', items: [] },
        { title: 'Group Management', items: [] },
        { title: 'Navigation', items: [] },
        { title: 'Risk Assessment', items: [] },
        { title: 'Emergency Procedures', items: [] },
      ]),

    makeQual('lowland-leader', 'Lowland Leader', 'walking', 'Walking',
      'For those who lead groups on foot in lowland, countryside terrain.',
      'https://www.mountain-training.org/qualifications/walking/lowland-leader',
      [
        { title: 'Navigation', items: [] },
        { title: 'Country Knowledge', items: [] },
        { title: 'Group Leadership', items: [] },
        { title: 'Emergency Procedures', items: [] },
        { title: 'Duty of Care', items: [] },
      ]),

    makeQual('hill-and-moorland-leader', 'Hill and Moorland Leader', 'walking', 'Walking',
      'For those leading groups in open hill and moorland terrain.',
      'https://www.mountain-training.org/qualifications/walking/hill-and-moorland-leader',
      [
        { title: 'Navigation', items: [] },
        { title: 'Terrain Judgement', items: [] },
        { title: 'Meteorology', items: [] },
        { title: 'Group Management', items: [] },
        { title: 'Emergency Procedures', items: [] },
        { title: 'Access and Environment', items: [] },
      ]),

    makeQual('mountain-leader', 'Mountain Leader', 'walking', 'Walking',
      "The UK's premier qualification for leading groups on hill and mountain walks in summer conditions.",
      'https://www.mountain-training.org/qualifications/walking/mountain-leader',
      [
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
      ]),

    makeQual('winter-mountain-leader', 'Winter Mountain Leader', 'walking', 'Walking',
      'For those who lead groups on walks in Scottish winter mountain conditions.',
      'https://www.mountain-training.org/qualifications/walking/winter-mountain-leader',
      [
        { title: 'Winter Navigation', items: [] },
        { title: 'Avalanche Awareness', items: [] },
        { title: 'Ice Axe and Crampons', items: [] },
        { title: 'Winter Terrain Judgement', items: [] },
        { title: 'Emergency Procedures in Winter', items: [] },
        { title: 'Group Management in Winter', items: [] },
      ]),

    makeQual('international-mountain-leader', 'International Mountain Leader', 'walking', 'Walking',
      'Enables holders to lead guided walking groups in mountainous terrain worldwide.',
      'https://www.mountain-training.org/qualifications/walking/international-mountain-leader',
      [
        { title: 'Navigation — International Terrain', items: [] },
        { title: 'Environmental Knowledge', items: [] },
        { title: 'High Altitude Considerations', items: [] },
        { title: 'Guiding Skills', items: [] },
        { title: 'International Emergency Procedures', items: [] },
      ]),

    makeQual('foundation-coach', 'Foundation Coach', 'climbing_coaching', 'Climbing & Coaching',
      'Develops coaching knowledge for working with young people and beginners in climbing.',
      'https://www.mountain-training.org/qualifications/climbing/foundation-coach',
      [
        { title: 'Coaching Principles', items: [] },
        { title: 'Safeguarding', items: [] },
        { title: 'Movement Skills', items: [] },
        { title: 'Session Planning', items: [] },
      ]),

    makeQual('development-coach', 'Development Coach', 'climbing_coaching', 'Climbing & Coaching',
      'For those coaching intermediate to advanced climbers.',
      'https://www.mountain-training.org/qualifications/climbing/development-coach',
      [
        { title: 'Advanced Coaching Methods', items: [] },
        { title: 'Movement Analysis', items: [] },
        { title: 'Training Planning', items: [] },
        { title: 'Physiology and Injury Prevention', items: [] },
      ]),

    makeQual('performance-coach', 'Performance Coach', 'climbing_coaching', 'Climbing & Coaching',
      'For those working at the highest level with elite and competition climbers.',
      'https://www.mountain-training.org/qualifications/climbing/performance-coach',
      [
        { title: 'Elite Performance Methods', items: [] },
        { title: 'Competition Preparation', items: [] },
        { title: 'Sports Science Application', items: [] },
        { title: 'Athlete Management', items: [] },
      ]),

    makeQual('indoor-climbing-assistant', 'Indoor Climbing Assistant', 'climbing_coaching', 'Climbing & Coaching',
      'Enables holders to assist with supervision and instruction of climbers on indoor walls.',
      'https://www.mountain-training.org/qualifications/climbing/indoor-climbing-assistant',
      [
        { title: 'Safeguarding and Duty of Care', items: [] },
        { title: 'Belaying', items: [] },
        { title: 'Basic Movement Instruction', items: [] },
        { title: 'Emergency Procedures', items: [] },
      ]),

    makeQual('bouldering-wall-instructor', 'Bouldering Wall Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'For those instructing on bouldering walls.',
      'https://www.mountain-training.org/qualifications/climbing/bouldering-wall-instructor',
      [
        { title: 'Participant Management', items: [] },
        { title: 'Bouldering Movement Teaching', items: [] },
        { title: 'Session Design', items: [] },
        { title: 'Safety Management', items: [] },
      ]),

    makeQual('climbing-wall-instructor', 'Climbing Wall Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Enables holders to instruct groups of novices on indoor climbing walls.',
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor',
      [
        { title: 'Ropework and Belaying', items: [] },
        { title: 'Instruction Technique', items: [] },
        { title: 'Movement Coaching', items: [] },
        { title: 'Session Planning', items: [] },
        { title: 'Risk Management', items: [] },
      ]),

    makeQual('cwi-abseil-module', 'CWI — Abseil Module', 'climbing_coaching', 'Climbing & Coaching',
      'Add-on module for CWI holders to extend practice to include abseiling instruction.',
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor-abseil-module',
      [
        { title: 'Abseil Setup', items: [] },
        { title: 'Participant Management on Abseil', items: [] },
        { title: 'Emergency Procedures', items: [] },
      ], 'module'),

    makeQual('climbing-wall-development-instructor', 'Climbing Wall Development Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'For those developing lead climbing instruction at indoor walls.',
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-development-instructor',
      [
        { title: 'Lead Climbing Instruction', items: [] },
        { title: 'Advanced Ropework', items: [] },
        { title: 'Movement for Lead Climbers', items: [] },
        { title: 'Risk Management', items: [] },
      ]),

    makeQual('rock-climbing-instructor', 'Rock Climbing Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Enables holders to instruct groups at single-pitch outdoor crags.',
      'https://www.mountain-training.org/qualifications/climbing/rock-climbing-instructor',
      [
        { title: 'Ropework at the Crag', items: [] },
        { title: 'Anchors and Belay Systems', items: [] },
        { title: 'Instructing Movement', items: [] },
        { title: 'Descent and Abseiling', items: [] },
        { title: 'Group Management at the Crag', items: [] },
        { title: 'Access and Environment', items: [] },
      ]),

    makeQual('rock-climbing-development-instructor', 'Rock Climbing Development Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Extends RCI practice to include multi-pitch rock climbing.',
      'https://www.mountain-training.org/qualifications/climbing/rock-climbing-development-instructor',
      [
        { title: 'Multi-pitch Techniques', items: [] },
        { title: 'Advanced Anchor Systems', items: [] },
        { title: 'Route Selection and Risk', items: [] },
        { title: 'Retreat and Rescue', items: [] },
      ]),

    makeQual('mountaineering-and-climbing-instructor', 'Mountaineering and Climbing Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Combining navigation, leadership and technical climbing instruction.',
      'https://www.mountain-training.org/qualifications/climbing/mountaineering-and-climbing-instructor',
      [
        { title: 'Mountain Navigation', items: [] },
        { title: 'Technical Rock', items: [] },
        { title: 'Mountain Rescue', items: [] },
        { title: 'Group Management in Mountain Terrain', items: [] },
        { title: 'Campcraft and Bivouac', items: [] },
      ]),

    makeQual('winter-mountaineering-and-climbing-instructor', 'Winter Mountaineering and Climbing Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'The highest technical award, covering instructing in winter mountaineering and climbing.',
      'https://www.mountain-training.org/qualifications/climbing/winter-mountaineering-and-climbing-instructor',
      [
        { title: 'Winter Technical Skills', items: [] },
        { title: 'Ice and Mixed Climbing Instruction', items: [] },
        { title: 'Avalanche Management', items: [] },
        { title: 'Winter Emergency Procedures', items: [] },
      ]),
  ]

  await setJSON('mta:quals', quals)
  await AsyncStorage.setItem('mta:seeded', '1')
}
