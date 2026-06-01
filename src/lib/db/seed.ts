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
  if (done === '2') return

  const quals: StoredQual[] = [
    makeQual('camping-leader', 'Camping Leader', 'walking', 'Walking',
      'For those who lead groups on overnight camping expeditions in lowland terrain.',
      'https://www.mountain-training.org/qualifications/walking/camping-leader',
      [
        {
          title: 'Campcraft Skills',
          items: [
            'Select and pitch a tent correctly in varied conditions including wind and rain',
            'Maintain and check tent equipment before and after use',
            'Manage campsite hygiene including waste disposal and latrine provision',
            'Source and treat water safely in a lowland environment',
            'Prepare hot food and drinks safely using a camp stove',
            'Demonstrate safe use and storage of camping fuel',
            'Pack a rucksack efficiently for an overnight expedition',
            'Brief the group on Leave No Trace principles at a campsite',
          ],
        },
        {
          title: 'Group Management',
          items: [
            'Lead and motivate a group effectively on an overnight lowland expedition',
            'Manage group welfare including warmth, hydration and rest',
            'Brief the group clearly on objectives, rules and expectations',
            'Supervise and support group members when setting up camp',
            'Manage group dynamics including conflict and low motivation',
            'Adapt plans appropriately when conditions or group needs change',
          ],
        },
        {
          title: 'Navigation',
          items: [
            'Navigate accurately using a 1:25,000 map in lowland terrain',
            'Identify features on a map and relate them to the ground',
            'Plan a safe route for a group avoiding identifiable hazards',
            'Use a compass to set the map and follow a bearing',
            'Navigate on public footpaths, bridleways and tracks',
            'Relocate confidently when off route in lowland terrain',
          ],
        },
        {
          title: 'Risk Assessment',
          items: [
            'Conduct a risk assessment for a lowland overnight expedition',
            'Identify common camping hazards: water bodies, traffic, terrain and weather',
            'Manage group behaviour around camp hazards including fire and fuel',
            'Maintain appropriate supervision ratios for the group type',
            'Complete pre-activity documentation including consent and medical forms',
          ],
        },
        {
          title: 'Emergency Procedures',
          items: [
            'Carry and use an appropriate first aid kit for a lowland expedition',
            'Administer first aid for common camping incidents: cuts, burns and blisters',
            'Summon emergency services accurately from lowland terrain',
            'Manage a group if a member becomes unwell overnight',
            'Complete an accident or incident report accurately',
          ],
        },
      ]),

    makeQual('lowland-leader', 'Lowland Leader', 'walking', 'Walking',
      'For those who lead groups on foot in lowland, countryside terrain.',
      'https://www.mountain-training.org/qualifications/walking/lowland-leader',
      [
        {
          title: 'Navigation',
          items: [
            'Read and interpret a 1:25,000 map accurately in lowland countryside',
            'Identify paths, tracks, boundaries and features on a map',
            'Set the map by inspection and with a compass',
            'Take and follow a compass bearing in open country',
            'Navigate on rights of way: footpaths, bridleways and byways',
            'Plan an efficient and safe route for a group through lowland terrain',
            'Identify and use linear features, junctions and landmarks as navigation aids',
            'Relocate confidently when off route',
          ],
        },
        {
          title: 'Country Knowledge',
          items: [
            'Know the rights of access and responsibilities in England and Wales',
            'Identify common agricultural and rural hazards for walking groups',
            'Understand and brief groups on the Countryside Code',
            'Know relevant land designations: AONB, National Park and SSSI',
            'Understand seasonal considerations for lowland walking including crops and lambing',
            'Identify common lowland habitats and points of natural interest',
          ],
        },
        {
          title: 'Group Leadership',
          items: [
            'Lead a group safely on a lowland day walk from start to finish',
            'Brief the group clearly before departure',
            'Manage group pace, rest stops and nutrition throughout the day',
            'Adapt the plan when conditions or group needs change',
            'Motivate and engage group members throughout the walk',
            'Manage a group safely across varied terrain: road, field, woodland and waterside',
          ],
        },
        {
          title: 'Emergency Procedures',
          items: [
            'Carry and use an appropriate first aid kit for a lowland walk',
            'Administer first aid for common walking incidents',
            'Summon emergency services from lowland terrain with accurate location information',
            'Manage a group safely in an unexpected or emergency situation',
            'Know local emergency contacts and procedures for the area',
          ],
        },
        {
          title: 'Duty of Care',
          items: [
            "Understand the leader's legal duty of care for group members",
            'Conduct a risk assessment appropriate for a lowland walking group',
            'Manage safeguarding responsibilities when working with young people',
            'Maintain appropriate adult-to-group supervision ratios',
            'Complete relevant pre-activity documentation accurately',
          ],
        },
      ]),

    makeQual('hill-and-moorland-leader', 'Hill and Moorland Leader', 'walking', 'Walking',
      'For those leading groups in open hill and moorland terrain.',
      'https://www.mountain-training.org/qualifications/walking/hill-and-moorland-leader',
      [
        {
          title: 'Navigation',
          items: [
            'Navigate accurately using 1:25,000 and 1:50,000 maps on open moorland',
            'Identify moorland features on a map: tors, bogs, streams, ridges and valleys',
            'Set the map and follow a bearing in poor visibility on featureless terrain',
            'Use aspect of slope and contour interpretation to navigate on open ground',
            'Plan and execute a safe route across open moorland for a group',
            'Relocate accurately when visibility is poor or position uncertain',
            'Navigate effectively at dusk or in mist using systematic techniques',
          ],
        },
        {
          title: 'Terrain Judgement',
          items: [
            'Identify hazardous moorland terrain: deep bogs, steep edges and mine workings',
            'Choose safe lines of travel avoiding boggy and unstable ground',
            'Assess and manage the risk of crossing moorland streams and rivers',
            'Identify erosion-sensitive and ecologically sensitive areas',
            'Judge safe ground for group movement across heather and rough grassland',
          ],
        },
        {
          title: 'Meteorology',
          items: [
            'Interpret basic weather forecasts for upland and moorland conditions',
            'Recognise weather deterioration indicators in the field',
            'Understand the effect of altitude and exposed terrain on conditions',
            'Make informed route decisions based on forecast and observed conditions',
            'Brief a group clearly on weather implications for the day',
          ],
        },
        {
          title: 'Group Management',
          items: [
            'Lead a group safely across open moorland terrain',
            'Manage group clothing and layering for changeable conditions',
            'Control group pace and rest stops on rough terrain',
            'Motivate and support group members on sustained moorland walks',
            'Manage group welfare: hydration, nutrition and foot care',
            'Respond appropriately to group fatigue or low morale',
          ],
        },
        {
          title: 'Emergency Procedures',
          items: [
            'Carry and use an appropriate first aid kit for moorland conditions',
            'Manage a casualty in exposed moorland terrain',
            'Summon emergency services from remote or upland ground',
            'Navigate to a safe shelter or evacuation route in an emergency',
            'Manage a group emergency effectively in poor weather',
          ],
        },
        {
          title: 'Access and Environment',
          items: [
            'Know access rights and responsibilities on moorland and open access land',
            'Apply Leave No Trace principles on sensitive moorland environments',
            'Identify key moorland habitats and main conservation concerns',
            'Understand seasonal access restrictions: grouse shooting and ground-nesting birds',
            'Brief groups clearly on their responsibilities in the countryside',
          ],
        },
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
        {
          title: 'Winter Navigation',
          items: [
            'Navigate accurately using map and compass in whiteout and storm conditions',
            'Identify winter-specific hazards on a map: cornice lines and avalanche paths',
            'Navigate on featureless snow-covered terrain using compass bearings and timing',
            'Use GPS appropriately as a backup in winter conditions',
            'Plan safe winter routes avoiding avalanche terrain and corniced ridges',
            'Relocate confidently when disoriented in severe winter conditions',
          ],
        },
        {
          title: 'Avalanche Awareness',
          items: [
            'Understand the key factors in avalanche formation: terrain, snowpack and weather',
            'Identify avalanche terrain: convex rolls, lee slopes and gully heads',
            'Use avalanche forecasts to inform winter route planning',
            'Conduct a systematic avalanche search and rescue',
            'Carry and use avalanche rescue equipment: transceiver, probe and shovel',
            'Know when conditions demand complete avoidance of specific terrain',
          ],
        },
        {
          title: 'Ice Axe and Crampons',
          items: [
            'Fit and adjust crampons correctly for each group member',
            'Walk confidently with crampons on varied winter terrain',
            'Use an ice axe for balance and support in ascent and descent',
            'Perform an ice axe self-arrest on a training slope',
            'Select appropriate techniques for different snow and ice angles',
            'Brief and supervise a group using ice axes and crampons safely',
          ],
        },
        {
          title: 'Winter Terrain Judgement',
          items: [
            'Identify winter hazards: cornices, ice, soft snow and wind slab',
            'Choose routes that avoid overhead hazard from cornices',
            'Assess snow slope stability using visual and tactile indicators',
            'Judge when technical terrain requires rope use in winter conditions',
            'Manage descent of steep snow-covered slopes safely with a group',
          ],
        },
        {
          title: 'Emergency Procedures in Winter',
          items: [
            'Manage a casualty in winter conditions: hypothermia and frostbite',
            'Construct a snow shelter for emergency use: snow hole or snow grave',
            'Summon mountain rescue in winter conditions with limited phone coverage',
            'Navigate to a safe emergency shelter on a winter mountain',
            'Manage the group effectively during a winter mountain emergency',
          ],
        },
        {
          title: 'Group Management in Winter',
          items: [
            'Brief a group comprehensively before a winter mountain day',
            'Manage group clothing and insulation throughout a winter day',
            'Control group pace and rest stops in cold and fatiguing conditions',
            'Maintain group morale and communication in severe conditions',
            'Make confident and safe go/no-go decisions based on current conditions',
          ],
        },
      ]),

    makeQual('international-mountain-leader', 'International Mountain Leader', 'walking', 'Walking',
      'Enables holders to lead guided walking groups in mountainous terrain worldwide.',
      'https://www.mountain-training.org/qualifications/walking/international-mountain-leader',
      [
        {
          title: 'Navigation — International Terrain',
          items: [
            'Navigate using a variety of map scales and styles across different international terrain',
            'Understand different map datums and coordinate systems including UTM and GPS',
            'Navigate in a range of mountain environments: Alpine, Pyrenean and Scandinavian',
            'Plan complex multi-day routes in high-mountain terrain',
            'Use GPS and digital mapping tools appropriate for international guiding',
          ],
        },
        {
          title: 'Environmental Knowledge',
          items: [
            'Understand the ecology and habitats of key international mountain regions',
            'Identify key environmental risks: altitude, sun exposure and dehydration',
            'Know relevant access legislation and land ownership in main guiding destinations',
            'Apply Leave No Trace principles in international protected mountain areas',
            'Brief client groups clearly on environmental responsibilities when abroad',
          ],
        },
        {
          title: 'High Altitude Considerations',
          items: [
            'Understand the physiological effects of altitude: AMS, HACE and HAPE',
            'Identify early symptoms of altitude sickness and manage the group accordingly',
            'Plan acclimatisation schedules for trips to elevations above 2500m',
            'Know when to initiate emergency descent and manage the group accordingly',
            'Understand the impact of pre-existing medical conditions at altitude',
          ],
        },
        {
          title: 'Guiding Skills',
          items: [
            'Plan and execute multi-day mountain guiding itineraries for client groups',
            'Adapt plans efficiently to group fitness, ability and current conditions',
            'Manage client expectations and deliver a professional guiding service',
            'Navigate international emergency protocols and insurance requirements',
            'Communicate key safety information effectively in at least one additional language',
          ],
        },
        {
          title: 'International Emergency Procedures',
          items: [
            'Know emergency services procedures in key guiding destinations',
            'Manage a casualty internationally: hospital referral, travel insurance and evacuation',
            'Operate a satellite communicator for international mountain rescue',
            'Manage a group through a serious incident far from home base',
            'Complete relevant paperwork and incident reporting for an international emergency',
          ],
        },
      ]),

    makeQual('foundation-coach', 'Foundation Coach', 'climbing_coaching', 'Climbing & Coaching',
      'Develops coaching knowledge for working with young people and beginners in climbing.',
      'https://www.mountain-training.org/qualifications/climbing/foundation-coach',
      [
        {
          title: 'Coaching Principles',
          items: [
            'Understand principles of motor learning as applied to climbing movement',
            'Identify and apply appropriate coaching styles for different learners',
            'Set appropriate and achievable goals collaboratively with climbers',
            'Give effective demonstrations of climbing technique',
            'Observe movement and provide structured, constructive feedback',
            'Plan and deliver safe, progressive coaching sessions',
            'Reflect on coaching sessions and identify areas for personal development',
          ],
        },
        {
          title: 'Safeguarding',
          items: [
            'Understand current safeguarding legislation for working with children and young people',
            'Know the signs of abuse and neglect and the correct reporting procedure',
            'Apply safeguarding principles consistently throughout climbing coaching practice',
            'Maintain appropriate professional boundaries with young people and adults at risk',
            'Comply with DBS/PVG checking requirements and relevant child protection policies',
          ],
        },
        {
          title: 'Movement Skills',
          items: [
            'Demonstrate fundamental movement skills: footwork, body position and balance',
            'Identify common movement errors and explain how to correct them',
            'Teach efficient use of handholds: crimps, slopers, pinches and jugs',
            'Introduce safe falling technique and bouldering practice to beginners',
            'Progress climbers from basic to intermediate movement patterns appropriately',
            'Plan drills and exercises to develop specific movement skills',
          ],
        },
        {
          title: 'Session Planning',
          items: [
            'Write a structured coaching session plan with clear learning objectives',
            'Set up a safe bouldering or top-rope environment for a coached session',
            'Manage participant welfare and physical limits throughout a session',
            'Adapt session activities when planned content is not achieving objectives',
            'Evaluate session outcomes against planned objectives and reflect on delivery',
          ],
        },
      ]),

    makeQual('development-coach', 'Development Coach', 'climbing_coaching', 'Climbing & Coaching',
      'For those coaching intermediate to advanced climbers.',
      'https://www.mountain-training.org/qualifications/climbing/development-coach',
      [
        {
          title: 'Advanced Coaching Methods',
          items: [
            'Design and implement a periodised training plan for an improving climber',
            'Apply principles of deliberate practice to climbing skill development',
            'Use video analysis to identify and correct movement errors',
            'Coach lead climbing technique and fall practice safely',
            'Develop a climber\'s mental skills: focus, commitment and managing fear',
            'Assess and develop climbing tactics for on-sight and redpoint routes',
          ],
        },
        {
          title: 'Movement Analysis',
          items: [
            'Analyse footwork quality: precision, silent feet, smearing and edging',
            'Identify and correct body tension, hip position and centre of gravity issues',
            'Analyse and develop dynamic movement: dynos, deadpoints and momentum use',
            'Assess and develop finger strength training safely and progressively',
            'Coach effective resting and recovery techniques on the wall',
          ],
        },
        {
          title: 'Training Planning',
          items: [
            "Assess a climber's strengths and weaknesses through systematic observation and testing",
            'Set SMART performance goals collaboratively with a climber',
            'Design a training week with appropriate load and recovery balance',
            'Monitor training response and adjust load based on observed progress',
            'Plan training cycles to target competition peaks or redpoint goals',
          ],
        },
        {
          title: 'Physiology and Injury Prevention',
          items: [
            'Understand the physiology of endurance, power and power endurance in climbing',
            'Identify common climbing injuries: finger pulley, elbow and shoulder',
            'Apply safe warming-up and cooling-down protocols appropriate for climbing',
            'Recognise overtraining indicators and advise on rest and recovery',
            'Know when to refer a climber to a sports physiotherapist or medical professional',
          ],
        },
      ]),

    makeQual('performance-coach', 'Performance Coach', 'climbing_coaching', 'Climbing & Coaching',
      'For those working at the highest level with elite and competition climbers.',
      'https://www.mountain-training.org/qualifications/climbing/performance-coach',
      [
        {
          title: 'Elite Performance Methods',
          items: [
            'Apply sports science principles to elite climbing performance planning',
            'Design individualised high-performance training programmes for elite athletes',
            'Use load monitoring and recovery tools to manage athlete training effectively',
            'Apply power, endurance and technical skill concepts at elite competitive level',
            'Analyse performance data and adjust programmes based on evidence',
          ],
        },
        {
          title: 'Competition Preparation',
          items: [
            'Plan a competition season with appropriate peaking and taper phases',
            'Support athlete mental preparation and pre-competition routines',
            'Manage athlete logistics and environment at competition venues',
            'Analyse competitor performance and extract applicable insights',
            'Debrief athletes constructively following competition outcomes',
          ],
        },
        {
          title: 'Sports Science Application',
          items: [
            'Apply sleep, nutrition and recovery principles to elite athletic performance',
            'Use strength and conditioning principles specific to climbing athletes',
            'Implement sports psychology techniques: visualisation, focus cues and routines',
            'Monitor and manage athlete load to prevent overtraining and injury',
            'Collaborate effectively with sports medicine and strength and conditioning staff',
          ],
        },
        {
          title: 'Athlete Management',
          items: [
            'Build a trust-based, professional coaching relationship with elite athletes',
            'Manage athlete wellbeing: mental health, burnout risk and life-sport balance',
            'Set aspirational but realistic long-term performance pathways',
            'Communicate appropriately with parents, federations and sponsors',
            'Advocate for athlete welfare in all coaching and programme decisions',
          ],
        },
      ]),

    makeQual('indoor-climbing-assistant', 'Indoor Climbing Assistant', 'climbing_coaching', 'Climbing & Coaching',
      'Enables holders to assist with supervision and instruction of climbers on indoor walls.',
      'https://www.mountain-training.org/qualifications/climbing/indoor-climbing-assistant',
      [
        {
          title: 'Safeguarding and Duty of Care',
          items: [
            'Understand the role and limitations of an indoor climbing assistant',
            'Apply safeguarding principles when working with children at a climbing wall',
            'Maintain appropriate supervision ratios for group climbing sessions',
            'Conduct a pre-session briefing covering wall rules and safe behaviour',
            'Know the emergency procedures and first aid arrangements at the wall',
          ],
        },
        {
          title: 'Belaying',
          items: [
            'Demonstrate safe and competent top-rope belaying with an assisted-braking device',
            'Belay climbers of varying sizes and ability safely and effectively',
            'Identify and correct poor belay technique in participants',
            'Check harnesses and tie-ins correctly before allowing participants to climb',
            'Lower a climber smoothly and safely from a top-rope route',
            'Know when to refuse to allow a participant to climb due to safety concerns',
          ],
        },
        {
          title: 'Basic Movement Instruction',
          items: [
            'Introduce basic footwork and hand position to beginner climbers',
            'Give clear, simple instructions for movement on beginner routes',
            'Support and encourage participants of varying confidence and ability',
            'Adapt instructions for different ages and learning styles',
            'Identify climbers who need additional support or may be at risk',
          ],
        },
        {
          title: 'Emergency Procedures',
          items: [
            'Know the wall\'s emergency evacuation procedure thoroughly',
            'Manage a stuck or distressed climber calmly and safely',
            'Summon first aid support at the wall using correct procedures',
            'Complete an incident report accurately following any accident',
          ],
        },
      ]),

    makeQual('bouldering-wall-instructor', 'Bouldering Wall Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'For those instructing on bouldering walls.',
      'https://www.mountain-training.org/qualifications/climbing/bouldering-wall-instructor',
      [
        {
          title: 'Participant Management',
          items: [
            'Plan and deliver a structured bouldering session for a mixed-ability group',
            'Brief participants thoroughly on bouldering safety and etiquette before the session',
            'Manage landing zones and spotting practice safely throughout the session',
            'Supervise participants and intervene to prevent unsafe movement or behaviour',
            'Adapt activities for different ages, abilities and group sizes effectively',
          ],
        },
        {
          title: 'Bouldering Movement Teaching',
          items: [
            'Demonstrate and explain fundamental bouldering movement skills clearly',
            'Identify and correct common movement errors for beginner boulderers',
            'Introduce problem-solving and route-reading skills progressively',
            'Teach effective and safe falling and landing technique',
            'Progress participants from basic to more challenging problems safely',
            'Use games and drills to develop movement skills in an engaging way',
          ],
        },
        {
          title: 'Session Design',
          items: [
            'Plan a progressive bouldering session with warm-up, skill focus and cool-down',
            'Select appropriate problems for the ability level of the group',
            'Evaluate the session and adjust plans based on participant progress',
            'Write a brief session plan including learning objectives and activities',
            'Reflect on delivery and identify improvements for future sessions',
          ],
        },
        {
          title: 'Safety Management',
          items: [
            'Conduct a safety check of the bouldering area before each session',
            'Manage participant behaviour around landing zones and traverses',
            'Identify and manage risks from fatigue and overconfidence during the session',
            'Know the emergency procedures at the bouldering facility',
            'Complete an accident report accurately if required',
          ],
        },
      ]),

    makeQual('climbing-wall-instructor', 'Climbing Wall Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Enables holders to instruct groups of novices on indoor climbing walls.',
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor',
      [
        {
          title: 'Ropework and Belaying',
          items: [
            'Set up and check top-rope systems safely at a climbing wall',
            'Demonstrate and teach safe top-rope belaying with appropriate devices',
            'Check participant harnesses, tie-ins and belay devices before climbing',
            'Supervise multiple roped participants simultaneously',
            'Manage participant safety during lowering and descent from routes',
            'Identify and correct unsafe ropework or belay technique promptly',
          ],
        },
        {
          title: 'Instruction Technique',
          items: [
            'Plan and deliver a structured top-rope climbing session for novices',
            'Introduce climbing to complete beginners clearly and safely',
            'Give effective movement demonstrations and coaching cues',
            'Manage group transitions: briefing, climbing, lowering and rest periods',
            'Adapt instruction to different ages, abilities and group sizes',
          ],
        },
        {
          title: 'Movement Coaching',
          items: [
            'Teach basic footwork: smearing, edging and trusting feet on holds',
            'Introduce hand positions: jugs, crimps and slopers for beginners',
            'Develop beginner body position, balance and weight transfer',
            'Give constructive feedback on movement to beginning climbers',
            'Progress participants to more challenging routes at an appropriate pace',
          ],
        },
        {
          title: 'Session Planning',
          items: [
            'Write a structured climbing session plan with clear learning objectives',
            'Select appropriate routes and activities for the group\'s ability level',
            'Set up and check the climbing environment safely before the session',
            'Manage group welfare throughout: rest, hydration and motivation',
            'Evaluate the session and reflect on outcomes against objectives',
          ],
        },
        {
          title: 'Risk Management',
          items: [
            'Conduct a dynamic risk assessment throughout the climbing session',
            'Identify and manage risks from equipment, environment and participants',
            'Know the emergency procedures at the climbing wall',
            'Complete incident documentation accurately and promptly',
            'Know the limits of CWI scope of practice and when to refer on',
          ],
        },
      ]),

    makeQual('cwi-abseil-module', 'CWI — Abseil Module', 'climbing_coaching', 'Climbing & Coaching',
      'Add-on module for CWI holders to extend practice to include abseiling instruction.',
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-instructor-abseil-module',
      [
        {
          title: 'Abseil Setup',
          items: [
            'Set up a safe top anchor for abseiling at an indoor wall',
            'Select and check appropriate abseil devices and equipment for the group',
            'Brief participants on abseil technique and safety before the activity',
            'Check participant harnesses and connections correctly before each abseil',
            'Manage participant safety during abseil setup at the top anchor',
          ],
        },
        {
          title: 'Participant Management on Abseil',
          items: [
            'Introduce and demonstrate abseil technique clearly to first-time participants',
            'Supervise participants during abseil and provide a safety backup',
            'Manage participant fear and anxiety on abseil calmly and effectively',
            'Adapt the activity for participants of different sizes and abilities',
            'Ensure landing zone safety is maintained throughout the session',
          ],
        },
        {
          title: 'Emergency Procedures',
          items: [
            'Manage a stuck or distressed participant on abseil',
            'Lower a participant in an emergency using an assisted-braking device',
            'Complete an incident report for an abseil-related incident',
            'Know the limits of scope of practice and when to stop the activity',
          ],
        },
      ], 'module'),

    makeQual('climbing-wall-development-instructor', 'Climbing Wall Development Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'For those developing lead climbing instruction at indoor walls.',
      'https://www.mountain-training.org/qualifications/climbing/climbing-wall-development-instructor',
      [
        {
          title: 'Lead Climbing Instruction',
          items: [
            'Teach lead climbing technique to intermediate climbers safely and progressively',
            'Brief participants on lead falls, clipping and run-out management',
            'Supervise and support participants taking their first lead falls safely',
            'Assess participant readiness for lead climbing and manage progression',
            'Manage the specific risks of lead climbing at an indoor wall',
            'Create an environment where participants can develop lead confidence safely',
          ],
        },
        {
          title: 'Advanced Ropework',
          items: [
            'Set up and check lead belay systems safely at a climbing wall',
            'Teach correct lead belaying technique and identify common errors',
            'Manage rope management issues: drag, tangles and correct feed rate',
            'Check lead belay competence before allowing unsupervised practice',
            'Set up an abseiling system from a top anchor at a wall safely',
          ],
        },
        {
          title: 'Movement for Lead Climbers',
          items: [
            'Coach clipping technique and efficient rest positions for lead climbing',
            'Develop lead climbers\' route-reading and tactical skills',
            'Coach effective fall preparation and body position for safe falls',
            'Develop mental skills specific to lead climbing: commitment and trust',
            'Progress climbers from bottom-rope to confident independent leading',
          ],
        },
        {
          title: 'Risk Management',
          items: [
            'Conduct a risk assessment specific to lead climbing instruction activities',
            'Identify and manage the increased risks on lead compared to top-rope',
            'Know the scope of CWDI practice and when to refer to a higher award',
            'Manage the learning environment for lead fall practice safely',
            'Complete relevant documentation for lead climbing instruction sessions',
          ],
        },
      ]),

    makeQual('rock-climbing-instructor', 'Rock Climbing Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Enables holders to instruct groups at single-pitch outdoor crags.',
      'https://www.mountain-training.org/qualifications/climbing/rock-climbing-instructor',
      [
        {
          title: 'Ropework at the Crag',
          items: [
            'Set up safe top-rope systems at a variety of single-pitch crags',
            'Select and use appropriate anchors: bolts, threads, spikes and natural features',
            'Manage ropes safely at the crag: flaking, stacking and carrying',
            'Rig a top-rope for bottom-roping and direct belaying from above',
            'Manage participants safely at both the crag top and base',
            'Lower participants from above using appropriate device and technique',
          ],
        },
        {
          title: 'Anchors and Belay Systems',
          items: [
            'Construct safe anchors from multiple natural and artificial placements',
            'Use equalising systems: magic X, sliding X and pre-equalised',
            'Belay participants directly from above using appropriate techniques',
            'Assess anchor quality and back up inadequate or suspect placements',
            'Understand load forces and minimise risk in multi-point anchor systems',
            'Demonstrate correct knots: figure-of-eight, clove hitch, Italian hitch',
          ],
        },
        {
          title: 'Instructing Movement',
          items: [
            'Teach efficient movement technique on single-pitch routes at the crag',
            'Give clear demonstrations and coaching cues in an outdoor environment',
            'Develop participants\' ability to read routes and select holds',
            'Progress participants safely from beginner to more challenging routes',
            'Adapt instruction for different ages, abilities and group sizes',
          ],
        },
        {
          title: 'Descent and Abseiling',
          items: [
            'Set up and manage a safe abseil for a group at an outdoor crag',
            'Teach abseil technique to participants and supervise descents',
            'Identify and use safe walking descents as an alternative to abseiling',
            'Manage group safety during descent from a crag in all conditions',
            'Know when abseiling is not the safest option and choose an alternative',
          ],
        },
        {
          title: 'Group Management at the Crag',
          items: [
            'Manage a group safely at both the base and top of a single-pitch crag',
            'Brief participants thoroughly on crag safety before any climbing begins',
            'Supervise multiple roped participants simultaneously at the crag',
            'Manage group dynamics, motivation and safety on a full day out',
            'Identify and manage objective hazards: rockfall, loose rock and weather',
          ],
        },
        {
          title: 'Access and Environment',
          items: [
            'Know the access status and approach for crags in your regular operating area',
            'Apply Leave No Trace principles at an outdoor crag',
            'Brief participants on crag environmental responsibilities',
            'Know seasonal access restrictions relevant to raptors and ground ecology',
            'Understand the role of crag clean-up and basic route maintenance',
          ],
        },
      ]),

    makeQual('rock-climbing-development-instructor', 'Rock Climbing Development Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Extends RCI practice to include multi-pitch rock climbing.',
      'https://www.mountain-training.org/qualifications/climbing/rock-climbing-development-instructor',
      [
        {
          title: 'Multi-pitch Techniques',
          items: [
            'Lead multi-pitch rock routes safely and confidently at appropriate grade',
            'Manage rope systems on multi-pitch routes: coils, stacking and communication',
            'Select appropriate multi-pitch systems: pitching and simul-climbing',
            'Manage a second on multi-pitch terrain including direct belaying from above',
            'Retreat safely from a multi-pitch route in an emergency situation',
            'Brief a client clearly on multi-pitch procedures and communication signals',
          ],
        },
        {
          title: 'Advanced Anchor Systems',
          items: [
            'Construct anchors using a range of placements in multi-pitch terrain',
            'Assess rock quality and select placements accordingly',
            'Build and equalise anchors at multi-pitch stances efficiently',
            'Manage load forces and system efficiency in multi-pitch anchor setups',
            'Back up existing in-situ protection where quality is uncertain',
          ],
        },
        {
          title: 'Route Selection and Risk',
          items: [
            'Select appropriate multi-pitch routes for a client\'s ability and experience level',
            'Assess objective hazards on multi-pitch terrain: loose rock and weather windows',
            'Plan a multi-pitch day with appropriate time margins and descent options',
            'Brief a client clearly on multi-pitch objectives, risks and contingency plans',
            'Make informed go/no-go decisions based on conditions and client readiness',
          ],
        },
        {
          title: 'Retreat and Rescue',
          items: [
            'Retreat efficiently from a multi-pitch route in deteriorating conditions',
            'Abseil from in-situ or self-placed anchors safely in an emergency',
            'Manage a stuck or injured second on a multi-pitch route',
            'Summon mountain rescue from a multi-pitch setting effectively',
            'Apply improvised rescue techniques: assisted hoist and passing a knot',
          ],
        },
      ]),

    makeQual('mountaineering-and-climbing-instructor', 'Mountaineering and Climbing Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'Combining navigation, leadership and technical climbing instruction.',
      'https://www.mountain-training.org/qualifications/climbing/mountaineering-and-climbing-instructor',
      [
        {
          title: 'Mountain Navigation',
          items: [
            'Navigate accurately to and from mountain crags using map and compass',
            'Plan safe approach and descent routes for mountain climbing venues',
            'Navigate confidently in poor weather to and from a mountain venue',
            'Use GPS as a backup navigation tool on complex mountain approaches',
            'Manage group safety during mountain approaches and descents',
          ],
        },
        {
          title: 'Technical Rock',
          items: [
            'Lead technical rock at appropriate grade safely with a client group',
            'Place and assess a range of traditional protection: cams, wires and hexes',
            'Build multi-pitch trad anchors on a variety of mountain rock types',
            'Second or lower a client on technical mountain rock routes',
            'Manage the rope system efficiently on complex mountain terrain',
            'Select routes appropriate for client ability and conditions',
          ],
        },
        {
          title: 'Mountain Rescue',
          items: [
            'Manage a casualty on technical mountain terrain effectively',
            'Apply improvised rescue techniques: hoists, lowering systems and stretcher',
            'Summon mountain rescue from a mountain crag environment',
            'Navigate to and signal a helicopter-landing site in mountain terrain',
            'Manage a group during a mountain rescue callout: communication and welfare',
          ],
        },
        {
          title: 'Group Management in Mountain Terrain',
          items: [
            'Plan and execute a full day of climbing in mountain terrain safely',
            'Manage group welfare and morale on a long, committing mountain day',
            'Adapt plans to changing conditions: weather, group fitness and route state',
            'Manage multiple clients on a mountain route simultaneously and safely',
            'Debrief the group effectively on the day\'s activities and decisions',
          ],
        },
        {
          title: 'Campcraft and Bivouac',
          items: [
            'Select an appropriate campsite or bivouac site in mountain terrain',
            'Set up a bivouac or tent safely in exposed mountain conditions',
            'Manage overnight group welfare: food, water, warmth and kit drying',
            'Brief the group on environmental responsibilities at a mountain camp',
            'Plan a multi-day mountain climbing itinerary with overnight logistics',
          ],
        },
      ]),

    makeQual('winter-mountaineering-and-climbing-instructor', 'Winter Mountaineering and Climbing Instructor', 'climbing_coaching', 'Climbing & Coaching',
      'The highest technical award, covering instructing in winter mountaineering and climbing.',
      'https://www.mountain-training.org/qualifications/climbing/winter-mountaineering-and-climbing-instructor',
      [
        {
          title: 'Winter Technical Skills',
          items: [
            'Move confidently and efficiently on steep snow and ice',
            'Use ice axe techniques for self-arrest, step cutting and snow anchoring',
            'Place ice screws and deadmen as protection and anchors in winter conditions',
            'Lead winter snow and ice routes at appropriate grade safely',
            'Select and use crampon techniques for a full variety of winter terrain',
            'Demonstrate efficient rope work management in winter conditions',
          ],
        },
        {
          title: 'Ice and Mixed Climbing Instruction',
          items: [
            'Teach ice axe and crampon technique to beginners in a safe and progressive setting',
            'Set up and manage a safe top-rope on snow and ice for a group',
            'Instruct participants in basic winter movement progressively and safely',
            'Coach lead winter climbing technique to intermediate level climbers',
            'Manage group safety on steep winter terrain while using ropes',
          ],
        },
        {
          title: 'Avalanche Management',
          items: [
            'Apply advanced avalanche terrain avoidance in all winter route planning',
            'Conduct a formal avalanche risk assessment using STOP or AAIRS frameworks',
            'Lead a systematic avalanche rescue effectively as the group leader',
            'Teach avalanche safety awareness to a guided group in winter terrain',
            'Use a slope meter and assess snowpack characteristics to inform decisions',
          ],
        },
        {
          title: 'Winter Emergency Procedures',
          items: [
            'Manage hypothermia and frostbite effectively in a winter mountain environment',
            'Construct an emergency snow shelter to a survivable standard in realistic time',
            'Manage a winter mountain rescue callout effectively from start to finish',
            'Improvise a rescue system on steep snow or ice terrain',
            'Brief and manage a group through a serious winter mountain emergency',
          ],
        },
      ]),
  ]

  await setJSON('mta:quals', quals)
  await AsyncStorage.setItem('mta:seeded', '2')
}
