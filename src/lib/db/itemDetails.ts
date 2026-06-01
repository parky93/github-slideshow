/**
 * Detail strings for every checklist item in every MTA qualification
 * except climbing-wall-instructor (handled separately).
 *
 * Key format: '{qual-slug}:{section-index}:{item-index}' (0-based)
 */
export const ITEM_DETAILS: Record<string, string> = {

  // ─── CAMPING LEADER ──────────────────────────────────────────────────────────

  // Section 0 – Campcraft Skills
  'camping-leader:0:0': `Practice pitching solo in bad weather before training. Know fly-first technique, peg angles and how to storm-proof a pitch with additional guys.`,
  'camping-leader:0:1': `Check seams, pegs, poles and zips before departure and clean/dry the tent after use. Know what to look for and how to report damage.`,
  'camping-leader:0:2': `Plan a cat-hole or group latrine location away from water. Know grey-water disposal rules and how to brief groups on hygiene standards.`,
  'camping-leader:0:3': `Identify suitable water sources, understand sedimentation and chemical/filter treatment. Know the signs of contaminated water in a lowland setting.`,
  'camping-leader:0:4': `Set up a stable stove, use wind shields safely and know the hazards of CO. Be able to prepare a simple hot meal for a group within a reasonable time.`,
  'camping-leader:0:5': `Store fuel upright and away from ignition sources. Know correct connection, leak-testing and disposal procedures for common canister and liquid fuel systems.`,
  'camping-leader:0:6': `Distribute heavy items centrally and low. Know how to adjust the fit for different carriers and what weight is appropriate for different group members.`,
  'camping-leader:0:7': `Cover the seven Leave No Trace principles in practical terms at the site. Know how to demonstrate and reinforce them during the expedition.`,

  // Section 1 – Group Management
  'camping-leader:1:0': `Keep the group together, engaged and moving safely. Know how to pace the day, use positive language and manage flagging motivation.`,
  'camping-leader:1:1': `Monitor for cold, dehydration and tiredness throughout the day. Know clothing layers, water requirements and when to call a rest.`,
  'camping-leader:1:2': `Deliver a clear pre-expedition brief covering timings, kit, boundaries and behaviour expectations. Be consistent and answer questions calmly.`,
  'camping-leader:1:3': `Walk group members through pitching step-by-step. Know how to scaffold the task so that the group develops independence over multiple nights.`,
  'camping-leader:1:4': `Recognise early signs of conflict or disengagement. Know strategies for reintegrating individuals and maintaining group cohesion.`,
  'camping-leader:1:5': `Know common contingency triggers: weather change, injury, late arrival, unsuitable campsite. Have a plan B and communicate changes clearly to the group.`,

  // Section 2 – Navigation
  'camping-leader:2:0': `Be fluent in reading contour patterns, symbols and scale on a 1:25,000 map. Relate map features to the physical landscape around you.`,
  'camping-leader:2:1': `Practice identifying a feature on the map then finding it on the ground and vice versa. Use hedges, paths, streams and buildings as reference points.`,
  'camping-leader:2:2': `Identify hazards such as rivers, busy roads, cliffs and private land before departure. Know what makes a route suitable for a specific group.`,
  'camping-leader:2:3': `Use a baseplate compass to align the map with north, then turn to follow a bearing. Know how to correct for magnetic variation.`,
  'camping-leader:2:4': `Know the difference between footpaths, bridleways and byways. Be able to identify them on a map and on the ground using waymarkers.`,
  'camping-leader:2:5': `Use systematic relocation: stop, identify last known position, look for features, take a bearing. Practice this deliberately before training.`,

  // Section 3 – Risk Assessment
  'camping-leader:3:0': `Write a site- and group-specific risk assessment that covers terrain, weather, group demographics and activity hazards. Review it before and during the expedition.`,
  'camping-leader:3:1': `Walk the planned route and campsite mentally. Consider drowning risk at water bodies, vehicle traffic near roads, and slipping hazards at night.`,
  'camping-leader:3:2': `Establish no-go zones around stoves and fuel. Know how to brief groups on fire safety and what to do if fuel ignites.`,
  'camping-leader:3:3': `Know recommended ratios for different group types and ages. Understand when additional supervisors are needed and how to deploy them.`,
  'camping-leader:3:4': `Know what documentation is required by your organisation: consent forms, medical forms and emergency contacts. Check they are complete before departure.`,

  // Section 4 – Emergency Procedures
  'camping-leader:4:0': `Carry a kit appropriate for the hazard profile. Know every item in the kit and be able to use it without referring to instructions.`,
  'camping-leader:4:1': `Know wound cleaning and dressing, burn cooling and blister management. Be able to carry out each skill quickly and calmly in a field setting.`,
  'camping-leader:4:2': `Give a clear location using grid reference, nearest landmark and access point. Practice calling 999 and explaining a scenario before training.`,
  'camping-leader:4:3': `Keep calm, isolate if infectious illness suspected, contact parent/guardian and emergency contacts. Know your organisation's lone-sickness protocol.`,
  'camping-leader:4:4': `Know what information must be recorded: time, location, persons involved, action taken and witnesses. Submit to the correct person promptly.`,

  // ─── LOWLAND LEADER ──────────────────────────────────────────────────────────

  // Section 0 – Navigation
  'lowland-leader:0:0': `Practice map reading on a variety of footpaths and field paths. Be able to identify your location at any point on a planned route.`,
  'lowland-leader:0:1': `Know OS map symbols for hedges, tracks, buildings and field boundaries. Relate these confidently to what you can see on the ground.`,
  'lowland-leader:0:2': `Set the map by rotating it until features align with the ground. Use a compass for accuracy when visibility or unfamiliar terrain demands it.`,
  'lowland-leader:0:3': `Use the compass housing and baseplate to take a bearing from the map then follow it on the ground. Practice on open fields before training.`,
  'lowland-leader:0:4': `Identify the correct coloured waymarkers for each right of way type. Know how to follow them and what to do when they are absent.`,
  'lowland-leader:0:5': `Apply Naismith's Rule or similar for timing. Consider group fitness, terrain type and likely weather when planning route length and timing.`,
  'lowland-leader:0:6': `Identify fences, hedges, streams and roads as line features and gates, junctions and buildings as point features. Use them systematically.`,
  'lowland-leader:0:7': `Stop and identify your last certain position. Use terrain association and compass to work out where you are before moving again.`,

  // Section 1 – Country Knowledge
  'lowland-leader:1:0': `Know the Countryside and Rights of Way Act 2000 for England and Wales. Be able to explain permissive and statutory access rights to a group.`,
  'lowland-leader:1:1': `Know the risks from electric fences, bull fields, farm machinery and pesticide spraying. Know how to plan routes to avoid these where possible.`,
  'lowland-leader:1:2': `Be able to deliver the Countryside Code clearly and in appropriate language for your group. Cover gates, litter, dogs and farm animals.`,
  'lowland-leader:1:3': `Know the basic differences between AONB, National Park and SSSI designations and what they mean for public access and group activity.`,
  'lowland-leader:1:4': `Avoid walking through growing crops. Know typical lambing season dates and how noise and dogs can disturb livestock during sensitive periods.`,
  'lowland-leader:1:5': `Be able to point out key features of interest to engage the group. Examples: hedgerow species, field patterns, hedgerow history and bird song.`,

  // Section 2 – Group Leadership
  'lowland-leader:2:0': `Know your route thoroughly and be confident making decisions throughout the day. Carry contingency routes and know when to use them.`,
  'lowland-leader:2:1': `Cover route, timing, kit, behaviour and emergency procedure before departure. Keep it concise but complete and check for understanding.`,
  'lowland-leader:2:2': `Walk at the pace of the slowest group member. Build in regular rest stops and ensure everyone drinks and eats at appropriate intervals.`,
  'lowland-leader:2:3': `Monitor weather, group energy and time against the plan. Know your triggers for shortening or abandoning the route.`,
  'lowland-leader:2:4': `Use natural curiosity, features of interest and achievable challenges to keep the group engaged on longer walks.`,
  'lowland-leader:2:5': `Know the specific hazards of roads, crop fields, woodland and riverbanks. Have strategies for moving groups safely through each type.`,

  // Section 3 – Emergency Procedures
  'lowland-leader:3:0': `Carry a kit proportional to the day's hazards. Know the contents and be confident using each item without reference to instructions.`,
  'lowland-leader:3:1': `Be competent in treating blisters, sprains, minor cuts, bee stings and allergic reactions at the level required by your qualification.`,
  'lowland-leader:3:2': `Know how to give a clear location: grid reference, road name, postcode or landmark. Practice the 999 call process before training.`,
  'lowland-leader:3:3': `Keep the group calm and together. Know your contingency shelter, extraction route and who to call. Practise key scenarios before training.`,
  'lowland-leader:3:4': `Have the numbers for local police non-emergency, land manager and nearest hospital. Know the nearest access point for emergency vehicles.`,

  // Section 4 – Duty of Care
  'lowland-leader:4:0': `Know the standard of care required by a competent professional in your role. Understand how negligence is established and what documentation helps.`,
  'lowland-leader:4:1': `Carry out a route-specific dynamic and written risk assessment. Review it in the field as conditions change throughout the day.`,
  'lowland-leader:4:2': `Hold a current DBS check and know your organisation's safeguarding policy. Know the reporting procedure and never put yourself in a compromised situation.`,
  'lowland-leader:4:3': `Know recommended ratios for your group type. When ratios cannot be met, know how to manage with the adults available and when to cancel.`,
  'lowland-leader:4:4': `Know what forms are required: consent, medical, emergency contact and insurance. Ensure all are completed, signed and available on the day.`,

  // ─── HILL AND MOORLAND LEADER ────────────────────────────────────────────────

  // Section 0 – Navigation
  'hill-and-moorland-leader:0:0': `Practice on both scales across varied open terrain. A 1:50,000 covers more ground for planning; 1:25,000 gives detail for precise location.`,
  'hill-and-moorland-leader:0:1': `Know how to read tors, re-entrants, ridgelines and blanket bog on a map. Identify them on the ground from map evidence alone.`,
  'hill-and-moorland-leader:0:2': `In poor visibility take an accurate bearing from the map, use pacing and timing and commit to the bearing. Do not guess or wander.`,
  'hill-and-moorland-leader:0:3': `Aspect of slope means identifying which direction a slope faces to confirm your position. Practice linking contour reading with the terrain beneath your feet.`,
  'hill-and-moorland-leader:0:4': `Identify hazardous ground on the map before you go. Plan timing using Naismith plus moorland corrections for rough going and ascent.`,
  'hill-and-moorland-leader:0:5': `Use the STOP method: Stop, Think, Observe, Plan. Identify the last certain position and work systematically from there.`,
  'hill-and-moorland-leader:0:6': `Practice navigating by compass and timing in conditions of low contrast. Build habits: check map every ten minutes, note handrails and backstops.`,

  // Section 1 – Terrain Judgement
  'hill-and-moorland-leader:1:0': `Learn to read the ground for soft or shaking peat, disturbed ground over mine workings and unguarded cliff edges from above.`,
  'hill-and-moorland-leader:1:1': `Take longer routes on firm ground rather than shortcut through bogs. Know visual indicators of firm versus soft ground: vegetation colour, surface texture.`,
  'hill-and-moorland-leader:1:2': `Check level, colour and flow of streams before crossing. Know crossing techniques for shallow water and when to find an alternative.`,
  'hill-and-moorland-leader:1:3': `Know the indicators of peat hag and heather recovery zones. Avoid braided paths and stick to established routes on sensitive habitats.`,
  'hill-and-moorland-leader:1:4': `Assess heather depth and density for group safety. Know how rough grassland and tussock ground slows progress and increases slip risk.`,

  // Section 2 – Meteorology
  'hill-and-moorland-leader:2:0': `Use MWIS or Met Office Mountain Forecasts routinely. Know how to read wind speed, precipitation probability and visibility values.`,
  'hill-and-moorland-leader:2:1': `Know the signs: increasing cloud base, dropping pressure, backing wind, darkening sky. Practice identifying them before they become critical.`,
  'hill-and-moorland-leader:2:2': `Temperature drops approximately 1°C per 100m ascent. Wind chill on exposed moorland can be severe even at moderate wind speeds.`,
  'hill-and-moorland-leader:2:3': `Know your go/no-go criteria before you leave. If the forecast deteriorates overnight, be prepared to alter the route or timings.`,
  'hill-and-moorland-leader:2:4': `Explain wind direction, expected precipitation, temperature range and any lightning risk. Keep it concise but give people the information they need to stay safe.`,

  // Section 3 – Group Management
  'hill-and-moorland-leader:3:0': `Control the group at the front and rear. Know when to use a sweep and how to keep the group together on trackless ground.`,
  'hill-and-moorland-leader:3:1': `Do a kit check at the start. Brief on layering during the walk and monitor individuals who are falling behind or over-heating.`,
  'hill-and-moorland-leader:3:2': `On rough terrain reduce pace to what the slowest safe member can maintain. Shorter, more frequent stops can be better than long planned breaks.`,
  'hill-and-moorland-leader:3:3': `Use points of interest, navigational challenges and achievable goals. Acknowledge effort and reframe the difficulty as part of the experience.`,
  'hill-and-moorland-leader:3:4': `Ensure everyone drinks before they feel thirsty. On full-day moorland walks each person needs 500ml per hour in warm conditions.`,
  'hill-and-moorland-leader:3:5': `Recognise fatigue signs: silence, slowing, stumbling. Adapt pace, shorten the route and provide food and warm drink before it becomes a crisis.`,

  // Section 4 – Emergency Procedures
  'hill-and-moorland-leader:4:0': `Include blister treatment, wound care, hypothermia foil blanket and pain relief. Know the weight/content balance for the terrain.`,
  'hill-and-moorland-leader:4:1': `Position the casualty out of wind, insulate from the ground, treat for shock and protect from rain. Know the priority order for assessment.`,
  'hill-and-moorland-leader:4:2': `Know the six-figure grid reference format. Practice calling 999 and the information flow: location, casualties, group size, hazards.`,
  'hill-and-moorland-leader:4:3': `Know your contingency shelters on the planned route. Identify them before departure and have grid references ready.`,
  'hill-and-moorland-leader:4:4': `Designate a deputy, assign roles and manage the group away from the casualty. Maintain calmness and regular updates for the group.`,

  // Section 5 – Access and Environment
  'hill-and-moorland-leader:5:0': `Know the Countryside and Rights of Way Act 2000 and CRoW open access land provisions. Know the difference between access land and rights of way.`,
  'hill-and-moorland-leader:5:1': `Stick to established paths on vegetated ground. Carry out waste, do not disturb nesting birds and avoid camping on sensitive soils.`,
  'hill-and-moorland-leader:5:2': `Know the key habitats: upland heath, blanket bog, wet grassland and their conservation importance. Be able to brief groups simply and clearly.`,
  'hill-and-moorland-leader:5:3': `Grouse shooting season runs 12 August to 10 December. Ground-nesting bird season runs approximately April to July. Check local restrictions.`,
  'hill-and-moorland-leader:5:4': `Brief groups specifically on dogs on leads near livestock, litter and the importance of sticking to paths. Make it practical, not preachy.`,

  // ─── MOUNTAIN LEADER ─────────────────────────────────────────────────────────

  // Section 0 – Navigation
  'mountain-leader:0:0': `Be completely confident at both scales in all weathers. Know map symbols, contour patterns and how to use the map as the primary tool at all times.`,
  'mountain-leader:0:1': `Practice terrain association constantly. On every walk, check the map against the ground every few hundred metres until it becomes automatic.`,
  'mountain-leader:0:2': `Set the map by rotating it to align north. Use the compass to eliminate error when landmark identification is ambiguous.`,
  'mountain-leader:0:3': `Use the three-step process: take the bearing from map, add magnetic variation, follow the bearing. Practice on featureless ground.`,
  'mountain-leader:0:4': `Learn to identify re-entrants, spurs and ridges from contours alone. On a bearing with no features, aspect of slope confirms which side of a feature you are on.`,
  'mountain-leader:0:5': `Use a known stride length on the map scale. Count double paces in sets of 100. Combine with timing (5km/h on flat) for accurate distance estimates.`,
  'mountain-leader:0:6': `Navigate by compass bearing and timing only. Pre-identify your start heading, distance and a catching feature before setting off in the dark.`,
  'mountain-leader:0:7': `Attack points are close, identifiable features before the target. Catching features are beyond the target. Handrails are line features that guide the route.`,
  'mountain-leader:0:8': `Know Naismith's Rule with Tranter's corrections for pack weight and fitness. Include time for rests and decision-making. Check timing against progress during the day.`,
  'mountain-leader:0:9': `Use the STOP method. Work outward from your last certain position using terrain features and compass bearings. Never wander hoping to find a recognisable point.`,

  // Section 1 – Terrain Judgement
  'mountain-leader:1:0': `Learn to read steep grass, loose boulders, hidden crags above and below. Know what makes ground genuinely dangerous for an unroped group.`,
  'mountain-leader:1:1': `Walk the route mentally on the map before departure. On the hill, maintain a constant search ahead for hazard. Route choice is a continuous skill.`,
  'mountain-leader:1:2': `A rope is needed when a slip would result in serious injury or death and the terrain is not avoidable. Know how to short-rope and when to set up a top rope.`,
  'mountain-leader:1:3': `Objective hazards are natural (rockfall, cornices, bogs). Subjective hazards arise from human factors (fatigue, poor kit, overconfidence). Manage both.`,
  'mountain-leader:1:4': `Know your bail-out routes in advance. Recognise when deteriorating conditions make the original plan dangerous and commit to the alternative decisively.`,
  'mountain-leader:1:5': `In summer, steep grass dries quickly; in autumn, it becomes treacherous. Know how season, altitude, aspect and recent weather change ground conditions.`,
  'mountain-leader:1:6': `On featureless plateaux in cloud, use compass and timing. In complex terrain, slow down, confirm each feature before moving on.`,

  // Section 2 – Meteorology
  'mountain-leader:2:0': `Use MWIS, Met Office Mountain Forecasts and synoptic charts routinely. Know what isobars, fronts and pressure trends mean in practice.`,
  'mountain-leader:2:1': `Know multiple reliable sources: MWIS, Met Office, Yr.no. Check the previous evening and morning of the day. Know the forecast period and its limitations.`,
  'mountain-leader:2:2': `Rising cloud base, increasing wind, virga, lenticulars and a backing wind can all indicate deterioration. Identify these in the field before training.`,
  'mountain-leader:2:3': `Altitude: temperature falls ~1°C per 100m. Aspect: north and east-facing ground stays colder. Season: snowpack and ice hazard start earlier at altitude.`,
  'mountain-leader:2:4': `Establish go/no-go criteria before the day starts. Know the exact conditions that will trigger route change and communicate them to a deputy.`,
  'mountain-leader:2:5': `Cover wind speed and direction, precipitation type, temperature range and any specific hazard. Invite questions and check comprehension.`,
  'mountain-leader:2:6': `Know the exact conditions that demand retreat: sustained wind over 50 km/h, electrical storm approach, whiteout. Never wait for conditions to become critical.`,

  // Section 3 – River Lore
  'mountain-leader:3:0': `Check water colour, depth, current speed and entry/exit points. A safe crossing requires all four to be acceptable before the first person enters.`,
  'mountain-leader:3:1': `Look for a wide, shallow section with a flat gravel bed. Avoid bends, deep pools and downstream hazards. Know upstream and downstream rescue positions.`,
  'mountain-leader:3:2': `Cross one at a time with watchers upstream and downstream. Know how to form a group wedge if solo crossing seems marginal for some group members.`,
  'mountain-leader:3:3': `Know flash flood indicators: sudden rise in noise, discoloured water, floating debris. Identify zones upstream that could generate rapid run-off.`,
  'mountain-leader:3:4': `Know your map well enough to find alternatives. In spate conditions, a valley river can triple in level within an hour. Build contingency time into the plan.`,
  'mountain-leader:3:5': `Waddle position: face upstream, feet shoulder-width apart, probe with staff or ice axe. Group crossing: line abreast, arms on neighbour's shoulders, lean into flow.`,

  // Section 4 – Emergency Procedures
  'mountain-leader:4:0': `Know the complete contents of your kit and why each item is included. Tailor kit to the day: longer, more committing routes need more comprehensive kit.`,
  'mountain-leader:4:1': `Primary survey: DR ABCDE. Stabilise the casualty, treat life threats, assess evacuation need and call for help. Know the decision tree for self-rescue vs. MR.`,
  'mountain-leader:4:2': `Know how to use poles, rucksacks and jackets as a basic stretcher. Practice it so it can be done without hesitation in a real incident.`,
  'mountain-leader:4:3': `Call 999 and ask for police, then mountain rescue. Give location as six-figure grid reference plus description. Know SMS 999 for no voice coverage.`,
  'mountain-leader:4:4': `Identify a suitable landing site before the helicopter arrives: flat, clear of obstacles, into wind. Use orange smoke or arms-up signal to guide the aircraft.`,
  'mountain-leader:4:5': `Know the treatment priorities: remove from cold, re-warm gently (hypothermia); immobilise (fracture); RICE (soft tissue injury). Hold in-date FAW certificate.`,
  'mountain-leader:4:6': `Assign roles, keep non-casualties occupied and informed. Maintain physical warmth and reassurance for all group members throughout.`,
  'mountain-leader:4:7': `Know your organisation's form. Record time, location, conditions, symptoms/injuries, treatment given and names of all involved. Submit promptly.`,
  'mountain-leader:4:8': `Know mobile coverage maps for your operating area. Carry whistle, torch and map/compass as backups regardless of signal levels.`,
  'mountain-leader:4:9': `Six blasts or flashes per minute, then one minute silence. Reply is three signals per minute. All group members should know this signal.`,

  // Section 5 – Leadership and Teaching
  'mountain-leader:5:0': `Brief should cover route, timings, hazards, escape options and emergency procedure. Pitch the detail to the group's experience level.`,
  'mountain-leader:5:1': `Adjust pace, route and breaks as conditions demand. Communicate changes promptly to the group. Make decisions early, not when options are closing.`,
  'mountain-leader:5:2': `Match pace to the slowest safe walker. For food and water, give specific guidance, not just "eat something". Know the signs of hypoglycaemia.`,
  'mountain-leader:5:3': `Teach while walking: point features out, give map to a group member to confirm position, introduce bearing-taking as a shared skill.`,
  'mountain-leader:5:4': `Demonstrate before you describe. Stand where everyone can see. Check understanding before moving on. Use questions, not just monologue.`,
  'mountain-leader:5:5': `Know the signs of conflict and low morale. Use structured tasks, rotation of map reading, humour and recognition of effort as tools.`,
  'mountain-leader:5:6': `Directive leadership is needed in emergencies. Facilitative style works for competent, motivated groups. Know when to shift between the two.`,
  'mountain-leader:5:7': `Check boots are broken in, waterproofs are waterproof, food is adequate and no medical issues are undisclosed. Do this at the vehicle, not the summit.`,
  'mountain-leader:5:8': `Keep the debrief proportionate. Focus on one or two key decisions. Invite group reflection. Be honest about your own choices and what you would do differently.`,

  // Section 6 – Use of Ropes
  'mountain-leader:6:0': `Criteria: a slip would result in serious injury or death, the terrain cannot be avoided and the party cannot cross safely unroped.`,
  'mountain-leader:6:1': `Know the correct form and loading orientation for each knot. Practice tying them one-handed and with gloves on. Know which knot to use in each situation.`,
  'mountain-leader:6:2': `Know at least three anchor types per terrain category (spike, thread, stake). Build redundancy into every anchor. Never rely on a single point.`,
  'mountain-leader:6:3': `Short roping: keep 2–4m of rope between you and the client. Maintain tension and be in a position to arrest a slip. Practice the technique on suitable terrain.`,
  'mountain-leader:6:4': `Set up the anchor above and behind the top edge. Keep rope runs short to minimise potential fall distance. Know the correct belay device for the situation.`,
  'mountain-leader:6:5': `Manage the group at the top and base. Know how to sequence participants on the rope and maintain control at both ends simultaneously.`,
  'mountain-leader:6:6': `Understand that shock loading multiplies forces. Build anchors that absorb loading gradually. Know the rated limits of common equipment.`,

  // Section 7 – Access, Environment and Overnight
  'mountain-leader:7:0': `England/Wales: CRoW Act open access land, rights of way, national park byelaws. Scotland: Land Reform Act 2003 right of responsible access.`,
  'mountain-leader:7:1': `Seven LNT principles: plan ahead, travel on durable surfaces, dispose of waste, leave what you find, minimise fire impact, respect wildlife, be considerate.`,
  'mountain-leader:7:2': `Choose a site that shows no trace after you leave: durable surface, away from water, not on a visible skyline. Scatter cooking water and grey water.`,
  'mountain-leader:7:3': `Flat, sheltered from prevailing wind, not a frost hollow, above flood level, on grass or gravel not peat or heather. Check drainage direction.`,
  'mountain-leader:7:4': `Pitch fly first in rain. Guy out fully in wind before inner. Use snow pegs or rocks if ground is too hard for standard pegs.`,
  'mountain-leader:7:5': `Carry all water or treat in-situ. Brief on cat-hole use before dark. Ensure food is sealed against wildlife. Monitor group nutrition and mood.`,
  'mountain-leader:7:6': `Brief groups before you reach the site. Cover the access rights framework, LNT specifics for the location and what "good practice" looks like here.`,
  'mountain-leader:7:7': `Know NNR, SSSI, NNP and National Park designations and their implications for fires, camping, dogs and large groups. Check Natural England or SNH guidance.`,

  // ─── WINTER MOUNTAIN LEADER ──────────────────────────────────────────────────

  // Section 0 – Winter Navigation
  'winter-mountain-leader:0:0': `In whiteout, everything looks the same. Navigate entirely from compass bearing and timing. Commit to the bearing and do not deviate without a fresh fix.`,
  'winter-mountain-leader:0:1': `Cornices are shown by closely spaced contours at a ridge top. Avalanche paths show as smooth clear zones with compressed contours above and below.`,
  'winter-mountain-leader:0:2': `Know your stride length in full winter kit and boots. Time accurately. Use small steps in poor visibility to avoid crossing a critical line.`,
  'winter-mountain-leader:0:3': `GPS is a supplement to, not a substitute for, map and compass. Know how to enter a grid reference manually and verify it against the map.`,
  'winter-mountain-leader:0:4': `Cornice-free ridges: approach from windward side. Avalanche-path free: identify run-out zones and travel in valleys or on ridges between paths.`,
  'winter-mountain-leader:0:5': `Systematic relocation: STOP, check last known position on map, measure compass bearing to a plausible feature, move carefully to confirm. Do not guess.`,

  // Section 1 – Avalanche Awareness
  'winter-mountain-leader:1:0': `The avalanche triangle: unstable snowpack (layering, weak layers), steep terrain (30–45° is highest risk) and a trigger (extra load, warming, wind).`,
  'winter-mountain-leader:1:1': `Convex rolls act as stress points in the snowpack. Lee slopes accumulate wind slab. Gully heads funnel debris. Identify all three from the map before arriving.`,
  'winter-mountain-leader:1:2': `SAIS forecasts cover Scottish mountain areas. Read the aspect and elevation tables. Know how to apply the forecast to your specific planned route.`,
  'winter-mountain-leader:1:3': `Single beacon search: signal mode, grid search on audio and visual. Probe perpendicular to slope. Shovel strategically. Practice regularly to maintain speed.`,
  'winter-mountain-leader:1:4': `BCA or similar transceiver: test before every outing. Probe: 240cm minimum. Shovel: metal blade required. All group members must carry and know how to use them.`,
  'winter-mountain-leader:1:5': `Know your go/no-go criteria for avalanche terrain before departure. If the forecast is High or Very High, commit to alternative ridge or valley routes.`,

  // Section 2 – Ice Axe and Crampons
  'winter-mountain-leader:2:0': `Fit crampon bail straps snugly with no movement in the binding. Check after the first 100m of travel. Brief each group member individually before moving onto snow.`,
  'winter-mountain-leader:2:1': `Know French technique (flat-footing, all points in), German/American technique (front-pointing) and mixed technique. Choose based on angle and snow hardness.`,
  'winter-mountain-leader:2:2': `Low angle: axe in self-belay hold, spike down. Steep: axe in dagger position. Descent: face in on ice and hard snow, face out on soft snow.`,
  'winter-mountain-leader:2:3': `Practice on a safe training slope with a runout. Get to arrest position immediately on signal. Practice from all starting positions: face down, head downhill.`,
  'winter-mountain-leader:2:4': `Match technique to conditions: soft snow can be walked in boots alone; hard ice requires front-pointing; mixed requires hybrid technique.`,
  'winter-mountain-leader:2:5': `Give a fitting and technique demonstration before moving onto snow. Assign a competent person at the rear. Brief on the consequences of a fall without arresting.`,

  // Section 3 – Winter Terrain Judgement
  'winter-mountain-leader:3:0': `Cornice: bulging snow lip at ridge edge. Wind slab: dull hollow sound underfoot, drum-like when tapped. Soft unconsolidated snow: sinks above knee.`,
  'winter-mountain-leader:3:1': `Approach ridges from well back of the crest. Never assume where the cornice edge is without probing. Mark the safe limit for the group.`,
  'winter-mountain-leader:3:2': `Shovel tests: extended column test or rutschblock for snowpack structure. Visual check: recent avalanche debris, shooting cracks, whumping sounds.`,
  'winter-mountain-leader:3:3': `Steep winter terrain (over 30°) with hard snow or ice and a run-out onto hazards requires a rope. Know short-roping and anchor placement in winter conditions.`,
  'winter-mountain-leader:3:4': `Descend steep snow in a controlled traversing line. Brief group before starting descent. Position yourself to observe all members. Use rope on harder slopes.`,

  // Section 4 – Emergency Procedures in Winter
  'winter-mountain-leader:4:0': `Hypothermia: move from cold, insulate from ground and wind, do not rub limbs. Frostbite: do not re-warm in the field if refreezing is possible. Evacuate urgently.`,
  'winter-mountain-leader:4:1': `Snow hole: needs 1.5m+ of consolidated snow, sloped entrance and sleeping platform above the door. Takes 1–4 hours to dig. Know the size needed for the group.`,
  'winter-mountain-leader:4:2': `Give the most precise location possible: grid reference, summit name, aspect and height. Activate PLB or use satellite messenger if no phone signal.`,
  'winter-mountain-leader:4:3': `Know safe descent routes that avoid avalanche terrain and cornices. Identify them before departure and have grid references marked on the map.`,
  'winter-mountain-leader:4:4': `Assign a deputy, maintain group warmth, keep people occupied and informed. Do not let bystanders disperse in poor visibility.`,

  // Section 5 – Group Management in Winter
  'winter-mountain-leader:5:0': `Cover all kit checks, terrain plan, avalanche conditions, emergency procedure and communication protocol. Check everyone understands before moving.`,
  'winter-mountain-leader:5:1': `Check layering at every break. Prevent sweating on ascents (ventilate early). Add insulation immediately on stopping. Monitor faces for early frostbite signs.`,
  'winter-mountain-leader:5:2': `Cold and fatigue arrive much faster in winter. Plan shorter days and build in fuel stops. Cold reduces decision-making ability; keep decisions simple.`,
  'winter-mountain-leader:5:3': `Keep communication simple and consistent. Use hand signals in high wind. Check in with every group member at each stop. Watch for withdrawal and glazed eyes.`,
  'winter-mountain-leader:5:4': `Establish criteria before leaving: wind speed, visibility, snowpack warning level and temperature. Communicate them to the group and review them at each break.`,

  // ─── INTERNATIONAL MOUNTAIN LEADER ──────────────────────────────────────────

  // Section 0 – Navigation — International Terrain
  'international-mountain-leader:0:0': `Be able to use IGN (France), Swisstopo, SGM and Kompass maps. Know how to interpret unfamiliar contour intervals and different symbol sets.`,
  'international-mountain-leader:0:1': `Know WGS84 vs local datums. UTM zone notation for international areas. How to input coordinates into a GPS and cross-check with the paper map.`,
  'international-mountain-leader:0:2': `Know characteristic terrain for each region: Alpine glaciated peaks, Pyrenean limestone, Scandinavian fjord and plateau terrain. Practice in each before guiding there.`,
  'international-mountain-leader:0:3': `Multi-day planning needs daily contingency options, resupply points and accommodation alternatives. Know how to build in weather flexibility.`,
  'international-mountain-leader:0:4': `Know Garmin, ViewRanger and AllTrails in the context of mountain guiding. Understand battery management and backup protocols for multi-day use.`,

  // Section 1 – Environmental Knowledge
  'international-mountain-leader:1:0': `Know the key species and ecosystems of main guiding regions. Be able to brief clients on what they are seeing and why it matters.`,
  'international-mountain-leader:1:1': `AMS threshold starts around 2500m. UV exposure on snow is intense. Dehydration in dry alpine air is significantly faster than at sea level.`,
  'international-mountain-leader:1:2': `Know French, Spanish and Scandinavian access law basics. Know national park rules in your guiding area. Never assume UK rules apply abroad.`,
  'international-mountain-leader:1:3': `In international protected areas LNT principles apply plus local rules: no fires, no off-path camping, carry out all waste. Know the specific rules for each destination.`,
  'international-mountain-leader:1:4': `Brief clients before they leave home: permit requirements, waste rules, wildlife interaction restrictions and local cultural expectations.`,

  // Section 2 – High Altitude Considerations
  'international-mountain-leader:2:0': `AMS: headache, nausea, fatigue above 2500m. HACE: ataxia and altered consciousness. HAPE: breathlessness at rest, pink frothy sputum. All require descent.`,
  'international-mountain-leader:2:1': `Use the Lake Louise Score or similar checklist daily. Any score of 3+ requires rest and monitoring. Scores of 5+ or any neurological symptoms require immediate descent.`,
  'international-mountain-leader:2:2': `Typical acclimatisation: ascend no more than 300–500m per day above 3000m. Include a rest day every 3 days. "Climb high, sleep low" is the key principle.`,
  'international-mountain-leader:2:3': `Do not wait for symptoms to worsen. Descend by at least 300–500m and reassess. Know the Gamow bag protocol if one is carried.`,
  'international-mountain-leader:2:4': `Asthma, cardiac conditions, sleep apnoea and recent respiratory illness increase risk at altitude. Know when to recommend a pre-trip medical assessment.`,

  // Section 3 – Guiding Skills
  'international-mountain-leader:3:0': `Plan with realistic daily mileage, elevation gain and descent. Build in weather days and logistics buffer. Have contingency itineraries ready before departure.`,
  'international-mountain-leader:3:1': `Monitor group energy daily. Know the signs that a stage needs to be shortened. Be prepared to split the itinerary or hire local transport.`,
  'international-mountain-leader:3:2': `Set expectations in pre-trip communication. On the ground, manage comfort, safety and experience simultaneously. Debrief each day briefly.`,
  'international-mountain-leader:3:3': `Know the emergency service number, international SOS protocol and your insurance provider's emergency number. Carry policy documents on the trip.`,
  'international-mountain-leader:3:4': `Have key phrases in French, Spanish or Norwegian for the region. Know how to ask for help, describe an injury and give a grid reference in the local language.`,

  // Section 4 – International Emergency Procedures
  'international-mountain-leader:4:0': `Know 112 (European standard), PGHM (France), Guardia Civil (Spain) and local rescue numbers for each destination. Brief these to clients at the start.`,
  'international-mountain-leader:4:1': `Know your client insurance coverage and the insurer's emergency line. Know when costs are covered and when they are not. Document everything for the claim.`,
  'international-mountain-leader:4:2': `Garmin inReach or SPOT: know how to send a custom SOS message with location and description. Test the device before every trip.`,
  'international-mountain-leader:4:3': `Keep the group together, maintain morale and manage expectations. Know how to communicate with home base and when to escalate to official channels.`,
  'international-mountain-leader:4:4': `Complete a full written record: timeline, persons involved, treatment given, communications made and next of kin notification. Keep copies securely.`,

  // ─── FOUNDATION COACH ────────────────────────────────────────────────────────

  // Section 0 – Coaching Principles
  'foundation-coach:0:0': `Know the difference between blocked and random practice, and why variability improves long-term skill retention. Apply this to how you structure drills.`,
  'foundation-coach:0:1': `Know command, guided discovery and self-check styles. Match the style to the skill level: beginners need more structure; intermediates benefit from exploration.`,
  'foundation-coach:0:2': `Use SMART goal setting. Goals should be process-focused for beginners (e.g. "look at your feet") rather than outcome-focused (e.g. "get to the top").`,
  'foundation-coach:0:3': `Stand where everyone can see you and the hold. Move slowly and exaggerate the key movement. Describe what you are doing as you do it.`,
  'foundation-coach:0:4': `Use a task-observe-feedback cycle. Identify the primary error first. Give one clear cue, not a list. Check the cue is understood before the climber tries again.`,
  'foundation-coach:0:5': `Sessions should progress from warm-up to skill focus to consolidation. Each activity must have a clear purpose and a specific group outcome.`,
  'foundation-coach:0:6': `After each session note what worked, what did not and what you would change. Discuss with a mentor and track your development over time.`,

  // Section 1 – Safeguarding
  'foundation-coach:1:0': `Know the Children Act 1989 and 2004, Working Together 2018 and your organisation's policy. Know who your Designated Safeguarding Lead is.`,
  'foundation-coach:1:1': `Physical, emotional and sexual abuse and neglect each have specific indicators. Know the correct reporting chain: DSL first, then statutory agencies if needed.`,
  'foundation-coach:1:2': `Safeguarding is not just about responding to disclosures. It shapes how you communicate, plan sessions, manage changing and transport arrangements.`,
  'foundation-coach:1:3': `Never be alone with a young person. Use two-adult rule. No social media contact with under-18s on personal accounts. Keep session records and communications professional.`,
  'foundation-coach:1:4': `Hold an appropriate DBS/PVG certificate before coaching unsupervised. Know the renewal period and your organisation's update service requirements.`,

  // Section 2 – Movement Skills
  'foundation-coach:2:0': `Silent feet, straight arms, hips close to the wall on slabs and hips out on overhangs. Demonstrate each clearly and connect it to the physical sensation.`,
  'foundation-coach:2:1': `Common errors: looking down, bent arms, tense shoulders, poor foot placement. Know the verbal or physical cue that most effectively addresses each one.`,
  'foundation-coach:2:2': `Crimps: fingers over the hold, supported position. Slopers: open hand, palm contact. Pinches: thumb engages. Jugs: relax the grip, straight arm.`,
  'foundation-coach:2:3': `Teach landing: bent knees, slightly forward lean, absorb onto both feet. Use a dedicated falling zone session before introducing harder problems.`,
  'foundation-coach:2:4': `Progress by reducing hold size, increasing angle and introducing body position challenges. Know when a climber is ready to move on and when to consolidate.`,
  'foundation-coach:2:5': `Examples: deadpoint drill, silent feet drill, tick-tack footwork, matched-hands traversing. Know six to eight specific drills for the Foundation level.`,

  // Section 3 – Session Planning
  'foundation-coach:3:0': `Write objectives in terms of what the climber will be able to do. Include warm-up activity, main skill focus, consolidation phase and cool-down.`,
  'foundation-coach:3:1': `Mats are flat and butted, spotters in position, landing zone clear. For top-rope: harnesses fitted, tie-ins checked, belay device set before any climbing.`,
  'foundation-coach:3:2': `Watch for over-gripping, shaking hands, reluctance to try, excessive rest requests. Adjust activity intensity and volume accordingly.`,
  'foundation-coach:3:3': `Have a set of backup activities ready. If a drill is too hard, simplify. If too easy, progress. If the group is distracted, change the format.`,
  'foundation-coach:3:4': `Review each objective: was it achieved? What evidence do you have? What feedback did participants give? Write it up and use it to plan the next session.`,

  // ─── DEVELOPMENT COACH ───────────────────────────────────────────────────────

  // Section 0 – Advanced Coaching Methods
  'development-coach:0:0': `A periodised plan has mesocycles (4–6 weeks) of different emphasis: base fitness, strength, power, performance, rest. Know how to build one for a climber.`,
  'development-coach:0:1': `Deliberate practice: just outside comfort zone, focused attention, immediate feedback. Know how to create this environment for a specific skill deficit.`,
  'development-coach:0:2': `Film from a fixed angle on a tripod. Review with the climber and identify the primary error. Use pause and slow-motion to illustrate the correction needed.`,
  'development-coach:0:3': `Coach commitment to clips from a relaxed position. For fall practice, start with small low falls and progress systematically. Never rush fall practice.`,
  'development-coach:0:4': `Mental skills: pre-route routine, breathing cues, consequence-reduction technique, process focus. Teach these explicitly, not just through encouragement.`,
  'development-coach:0:5': `On-sight: route-read from the ground, identify rests and crux sequence. Redpoint: break into sections, drill the crux, link progressively from top down.`,

  // Section 1 – Movement Analysis
  'development-coach:1:0': `Silent feet: no scraping, hold the position for one second. Precision: place on the correct part of the hold first time. Smear: maximum rubber contact.`,
  'development-coach:1:1': `Hip drop brings the centre of mass closer to the wall on steep terrain. Over-arching (banana back) reduces reach and wastes energy. Identify with video.`,
  'development-coach:1:2': `Deadpoint: slow and controlled, apex of movement. Dyno: both hands and feet leave simultaneously. Know the progressions for teaching each safely.`,
  'development-coach:1:3': `Introduce fingerboarding only after two or more years of climbing. Hangboard protocols: maximum hangs, minimum edge size, adequate rest between sets.`,
  'development-coach:1:4': `Shake out position: straight arm, low centre of gravity, feet on rests. Know the recovery ranking of rest stances: knee-bars, heel-hooks and stem rests.`,

  // Section 2 – Training Planning
  'development-coach:2:0': `Use a structured assessment battery: max hang weight, campus board ability, climbing performance grades and movement quality observation.`,
  'development-coach:2:1': `SMART: Specific, Measurable, Achievable, Realistic, Time-bound. Goals should be set by the climber with the coach providing structure and realism.`,
  'development-coach:2:2': `A typical week: 2–3 climbing sessions, 1 strength session, 1 flexibility session, 2 rest days. Total volume of hard effort not more than 70% of capacity.`,
  'development-coach:2:3': `Track performance metrics each session. If progress stalls for 3+ weeks, review: volume, intensity, sleep, nutrition, stress. Adjust one variable at a time.`,
  'development-coach:2:4': `For competition: plan 4–6 weeks of peak training, then a 2-week taper. For redpoint: peak climbing volume 2–3 weeks before the target attempt.`,

  // Section 3 – Physiology and Injury Prevention
  'development-coach:3:0': `Endurance: oxidative metabolism, aerobic capacity of forearm flexors. Power: anaerobic alactic, short max effort. Power endurance: repeated hard moves.`,
  'development-coach:3:1': `A2 pulley is most common: sharp pain over middle finger during crimping. Lateral epicondylitis: outer elbow pain. Rotator cuff: shoulder instability or weakness.`,
  'development-coach:3:2': `Warm-up: easy climbing 10 min, light stretching, progressive hold difficulty over 20 min. Cool-down: easy climbing, stretching forearms and shoulders.`,
  'development-coach:3:3': `Overtraining: persistent fatigue, reduced performance, disrupted sleep, irritability. Prescribe structured rest weeks (deload) every 4–6 weeks.`,
  'development-coach:3:4': `Refer if: pain persists more than 2 weeks, there is localised swelling or bruising, or loss of strength is significant. Never coach through structural injury.`,

  // ─── PERFORMANCE COACH ───────────────────────────────────────────────────────

  // Section 0 – Elite Performance Methods
  'performance-coach:0:0': `Know the evidence base for periodisation, tapering and load management at elite level. Use current sports science literature to justify programming decisions.`,
  'performance-coach:0:1': `Individualise: use the athlete's historical training data, injury record and competition results to build a programme. One-size templates are insufficient at this level.`,
  'performance-coach:0:2': `Use session RPE, HRV and subjective wellbeing scores to monitor load. Know how to interpret trends over time, not just point-in-time values.`,
  'performance-coach:0:3': `Know the energy system demands of bouldering vs. lead vs. speed. Apply specific metabolic conditioning alongside technical and tactical work.`,
  'performance-coach:0:4': `Use competition results, training benchmarks and video analysis data. Know which metrics matter and how to present findings to the athlete.`,

  // Section 1 – Competition Preparation
  'performance-coach:1:0': `Map IFSC World Cup calendar. Identify A, B and C events. Structure macrocycles around A events with appropriate taper and recovery blocks.`,
  'performance-coach:1:1': `Know visualisation, activation protocols and pre-competition routines. Work with sports psychology support for athletes competing at international level.`,
  'performance-coach:1:2': `Handle isolation zone logistics, warm-up wall scheduling, nutrition timing and recovery between rounds. Anticipate and remove distractions.`,
  'performance-coach:1:3': `Watch video of top athletes. Identify tactical patterns on boulder problems. Translate into specific training exercises for your athlete.`,
  'performance-coach:1:4': `Focus on process performance, not just outcome (placing). Identify specific skills and tactics that need development for the next event.`,

  // Section 2 – Sports Science Application
  'performance-coach:2:0': `Sleep is the primary recovery tool. Nutrition periodisation: higher carbohydrate around hard sessions. Know protein targets for climbing athletes (1.6–2.2g/kg).`,
  'performance-coach:2:1': `Climbing-specific strength work: antagonist training (push-ups, wrist extension), shoulder stability, core stiffness. Integrate with climbing load, not in addition to it.`,
  'performance-coach:2:2': `Visualisation: athlete mentally climbs the route in real time, feeling holds and body positions. Focus cues: a single word or phrase that triggers optimal state.`,
  'performance-coach:2:3': `Use session RPE multiplied by session duration as an acute load metric. Track rolling 7-day load and acute:chronic workload ratio. Target ratio 0.8–1.3.`,
  'performance-coach:2:4': `Build relationships with physio, S&C coach and sport psychologist. Attend joint case reviews. Share data. Agree communication protocols with athlete consent.`,

  // Section 3 – Athlete Management
  'performance-coach:3:0': `Invest time in understanding the athlete's values and motivations. Be consistent, follow through on commitments and be honest about performance.`,
  'performance-coach:3:1': `Know the RED-S indicators in climbing: low energy availability, stress fractures, hormonal disruption. Know when to refer to clinical support.`,
  'performance-coach:3:2': `Build a 4-year developmental pathway not a 1-year plan. Include transition points: junior to senior, domestic to international, training to competing.`,
  'performance-coach:3:3': `Keep parents informed at junior level without undermining athlete autonomy. With federations, understand selection criteria and communicate progress clearly.`,
  'performance-coach:3:4': `Athlete welfare is always the primary priority. Know how to push for this within an organisation even when commercial or competitive pressures conflict with it.`,

  // ─── INDOOR CLIMBING ASSISTANT ───────────────────────────────────────────────

  // Section 0 – Safeguarding and Duty of Care
  'indoor-climbing-assistant:0:0': `An ICA assists a qualified instructor. They do not lead sessions independently. Know exactly what decisions you can and cannot make in the role.`,
  'indoor-climbing-assistant:0:1': `Know your organisation's safeguarding policy. Hold a current DBS check. Do not be alone with a young person. Know who the DSL is at the wall.`,
  'indoor-climbing-assistant:0:2': `Know recommended ratios for the age group and wall rules. If ratio is exceeded, inform the lead instructor before the session starts.`,
  'indoor-climbing-assistant:0:3': `Cover: helmets, harness checks, belay device use, falling safely, no running, no jumping off the wall and the wall's specific rules. Keep it brief and clear.`,
  'indoor-climbing-assistant:0:4': `Know where the first aid kit is, who holds the first aid certificate and how to summon help. Know the wall's emergency evacuation route and muster point.`,

  // Section 1 – Belaying
  'indoor-climbing-assistant:1:0': `Grigri or similar: know lock-off position, controlled lowering and when to assist the device. Pass your competency check before assisting with any belaying.`,
  'indoor-climbing-assistant:1:1': `Take in consistently, keep brake hand in the brake position at all times. Heavy climbers need more controlled lowering. Light climbers may need extra friction.`,
  'indoor-climbing-assistant:1:2': `Common errors: brake hand leaving the rope, incorrect loading, creeping device. Know how to give a brief, clear correction without causing a safety incident.`,
  'indoor-climbing-assistant:1:3': `Check every harness before every climb: buckles doubled back or auto-lock, leg loops snug but not tight. Check tie-in knot is correct and dressed properly.`,
  'indoor-climbing-assistant:1:4': `One hand on the rope always, smooth consistent control. Lower at a speed the climber can control their feet against the wall. Not too fast, not too slow.`,
  'indoor-climbing-assistant:1:5': `If equipment appears damaged, harness is incorrectly fitted or a participant appears unsafe, the correct answer is always to stop and refer to the lead instructor.`,

  // Section 2 – Basic Movement Instruction
  'indoor-climbing-assistant:2:0': `Keep it simple: look at your feet, stand on the holds, keep arms straight. Use encouragement and demonstration before description.`,
  'indoor-climbing-assistant:2:1': `Short, direct sentences. Demonstrate where possible. Use the climber's name. Give one instruction at a time and wait for them to attempt it before adding more.`,
  'indoor-climbing-assistant:2:2': `Be patient with nervous or hesitant participants. Use small achievable challenges. Celebrate any progress. Never project your own comfort level onto the participant.`,
  'indoor-climbing-assistant:2:3': `With young children: use story and play. With adults: be matter-of-fact and avoid being patronising. Know the communication approaches for your typical participant group.`,
  'indoor-climbing-assistant:2:4': `Watch for fatigue, distress, physical trembling and reluctance to engage. Know how to escalate concerns to the lead instructor without alarming the participant.`,

  // Section 3 – Emergency Procedures
  'indoor-climbing-assistant:3:0': `Know the evacuation route and assembly point from memory. Know how to help participants down from the wall safely if the evacuation alarm sounds.`,
  'indoor-climbing-assistant:3:1': `Talk calmly, maintain eye contact, give clear simple instructions. Do not rush the participant. If stuck due to equipment issue, call the lead instructor.`,
  'indoor-climbing-assistant:3:2': `Know the location of the first aid station and the name of the duty first aider. Do not attempt treatment beyond your competence. Call clearly for help.`,
  'indoor-climbing-assistant:3:3': `Record: time, location, persons involved, what happened, witnesses and action taken. Submit to the duty manager before leaving the building.`,

  // ─── BOULDERING WALL INSTRUCTOR ──────────────────────────────────────────────

  // Section 0 – Participant Management
  'bouldering-wall-instructor:0:0': `Structure: warm-up traverse, skill focus (e.g. footwork), problem-solving phase and cool-down. Match problem difficulty to the range of abilities in the group.`,
  'bouldering-wall-instructor:0:1': `Cover: no jumping off, land on both feet with bent knees, no sitting under problems being climbed, spotter role and etiquette for using the bouldering area.`,
  'bouldering-wall-instructor:0:2': `Landing zones must be clear throughout. Spotting: hands up, not pushing the climber, protecting head and spine, staying on balance. Practice before using it.`,
  'bouldering-wall-instructor:0:3': `Constantly scan for collisions, unsafe landings and fatigue-related risk-taking. Know how to intervene without embarrassing the participant.`,
  'bouldering-wall-instructor:0:4': `Know how to simplify or modify problems for beginners. Know how to increase challenge without simply picking harder problems: body position restrictions, etc.`,

  // Section 1 – Bouldering Movement Teaching
  'bouldering-wall-instructor:1:0': `Footwork, body position and balance before any dynamic movement. Use a low, easy traverse as the initial teaching vehicle. Demonstrate clearly and repeatedly.`,
  'bouldering-wall-instructor:1:1': `Typical beginner errors: pulling with arms, ignoring feet, stiff hips. Know the corrective cue for each and apply it in order of priority.`,
  'bouldering-wall-instructor:1:2': `Introduce route reading from the ground: identify sequence, rest positions and crux. Progress to setting their own sequences on simple terrain.`,
  'bouldering-wall-instructor:1:3': `Landing technique: tuck chin, land on both feet simultaneously, absorb into a crouch. Practice on the mat at low height before applying on problems.`,
  'bouldering-wall-instructor:1:4': `Increase difficulty by: reducing hold size, increasing wall angle, changing body position constraints, or reducing foot options. Manage progression individually.`,
  'bouldering-wall-instructor:1:5': `Examples: silent feet competition, memory boulder (remember and repeat a sequence), add-on game. Know at least five games for your participant age group.`,

  // Section 2 – Session Design
  'bouldering-wall-instructor:2:0': `Warm-up: easy traversing 10 min. Skill focus: targeted drill 15–20 min. Problems: apply skill to varied problems 20–25 min. Cool-down: easy movement and stretch.`,
  'bouldering-wall-instructor:2:1': `Know the grade system at your wall. Select a spread of problems that keeps the group challenged without frustrating anyone. Modify for outliers.`,
  'bouldering-wall-instructor:2:2': `At the end of the skill focus phase, check: are participants applying the skill unprompted? If not, simplify. If yes, progress to harder problems.`,
  'bouldering-wall-instructor:2:3': `One page, five minutes to write. Objectives in behaviour terms. Activity sequence with timings. Resource list. Success criteria.`,
  'bouldering-wall-instructor:2:4': `Write three things that worked and one thing to change after every session. Review trends monthly. Discuss with a mentor or peer coach quarterly.`,

  // Section 3 – Safety Management
  'bouldering-wall-instructor:3:0': `Check mats are flush with no gaps at the base. Inspect for damage. Check no loose hold spinners at low height. Confirm the landing zone is clear of obstacles.`,
  'bouldering-wall-instructor:3:1': `Brief at the start and reinforce throughout. Mats are for landing, not sitting. Only one person in the landing zone of a problem at a time.`,
  'bouldering-wall-instructor:3:2': `Fatigue increases risk of misplaced feet and unexpected falls. Overconfidence: participants attempt problems significantly beyond their ability. Intervene early.`,
  'bouldering-wall-instructor:3:3': `Know the location of first aid kit, who the duty first aider is, the evacuation route and emergency contact numbers. Review before every session.`,
  'bouldering-wall-instructor:3:4': `Accurate record: time, location, what happened, who was involved, action taken, witnesses. Submit to the duty manager immediately.`,

  // ─── CWI ABSEIL MODULE ────────────────────────────────────────────────────────

  // Section 0 – Abseil Setup
  'cwi-abseil-module:0:0': `Use two independent anchor points where available. Know the rigging options: direct anchor, redirect and retrievable rope system. Check all connections before loading.`,
  'cwi-abseil-module:0:1': `Grigri or figure-of-eight for beginners. Check device is rated for the expected load. Inspect harnesses for wear, correct fitting and correct device attachment.`,
  'cwi-abseil-module:0:2': `Cover: how the device works, brake hand position, how to stop, what to do at the bottom and the consequence of letting go of the brake hand.`,
  'cwi-abseil-module:0:3': `Check harness buckles, belay loop and abseil device connection before each abseil. Do this as a routine check, not a one-off before the first participant.`,
  'cwi-abseil-module:0:4': `Supervise the top anchor area closely. Keep participants seated and clipped to the anchor until it is their turn. Manage transitions efficiently.`,

  // Section 1 – Participant Management on Abseil
  'cwi-abseil-module:1:0': `Demonstrate from a safe position while talking through each step. Use a low practice section before participants go over the edge for the first time.`,
  'cwi-abseil-module:1:1': `Operate a bottom safety rope or Prusik backup. Know the hand position for the backup and when to apply it. Never leave a participant unsupervised on abseil.`,
  'cwi-abseil-module:1:2': `Acknowledge fear, give information and small achievable steps. Never force or pressure. Know when to stop and bring a participant down a different way.`,
  'cwi-abseil-module:1:3': `Adjust the device for different participant weights: lighter participants may need an additional friction component. Heavier participants need a brake-assist approach.`,
  'cwi-abseil-module:1:4': `Designate a landing zone and a clear exit route. Keep non-abseiling participants well away from the base of the drop. Confirm zone is clear before each abseil.`,

  // Section 2 – Emergency Procedures
  'cwi-abseil-module:2:0': `Lock off the device using the mule hitch or device-specific lockdown. Communicate calmly with the participant. Call for assistance if the situation is beyond CWI scope.`,
  'cwi-abseil-module:2:1': `Bottom safety rope: applied, device locked off, participant lowered under control. Know the correct sequence for your device. Practice before the course.`,
  'cwi-abseil-module:2:2': `Record: participant name, what happened, time, action taken and any injury. Submit to wall management immediately. Know the RIDDOR reporting criteria.`,
  'cwi-abseil-module:2:3': `Know the signs that conditions or participant state require stopping the activity. Have a clear protocol for securing all participants and communicating the decision.`,

  // ─── CLIMBING WALL DEVELOPMENT INSTRUCTOR ─────────────────────────────────────

  // Section 0 – Lead Climbing Instruction
  'climbing-wall-development-instructor:0:0': `Introduce lead on easy, well-bolted routes first. Cover: clip timing, positioning before clipping, managing slack and rope management as the route is climbed.`,
  'climbing-wall-development-instructor:0:1': `Brief thoroughly on the dynamics of lead falls: rope stretch, the direction of pull, back-clipping and Z-clipping consequences. Check understanding before leading begins.`,
  'climbing-wall-development-instructor:0:2': `Fall practice: start with small controlled falls from a good position. Increase gradually over multiple sessions. Monitor anxiety and do not rush.`,
  'climbing-wall-development-instructor:0:3': `Assess using an observation checklist: clip technique, foot management above clips, fall awareness and belay positioning. Progress is individual, not time-based.`,
  'climbing-wall-development-instructor:0:4': `Lead-specific risks: deck-out from lower clips, back-clip creating a gate-open situation, Z-clip, rope behind leg. Know how to brief, spot and correct each.`,
  'climbing-wall-development-instructor:0:5': `Use a range of routes and difficulty levels. Give increasing autonomy over route choice. Build a culture where falling is normalised and not feared.`,

  // Section 1 – Advanced Ropework
  'climbing-wall-development-instructor:1:0': `Lead belay device: Grigri or similar. Know correct loading, the thumb-wrap technique and how to feed rope dynamically without losing brake position.`,
  'climbing-wall-development-instructor:1:1': `Observe belay position: directly below the first clip, not too close to the wall. Watch for hard catches (jumping toward the wall) and slack management errors.`,
  'climbing-wall-development-instructor:1:2': `Rope drag: clip into quickdraws in the direction of travel. Communicate rope drag awareness to lead climbers as a tactical as well as safety concept.`,
  'climbing-wall-development-instructor:1:3': `Test belay competence before allowing unsupervised lead belaying: both correct technique and appropriate situational awareness under load.`,
  'climbing-wall-development-instructor:1:4': `Know how to rig an abseil anchor from lead bolts or top anchors. Brief the participant on clove hitch to masterpoint and the retrieval sequence.`,

  // Section 2 – Movement for Lead Climbers
  'climbing-wall-development-instructor:2:0': `Clip from a stable position, arms relaxed. Know the hip-turn technique for clips on the opposite side. Resting on good feet before clipping preserves energy.`,
  'climbing-wall-development-instructor:2:1': `Route reading: identify rests, crux location, clip positions and foot sequences from the ground. Know how to coach this as a skill, not just demonstrate it.`,
  'climbing-wall-development-instructor:2:2': `Fall position: hips and feet away from the wall, hands in front, look down briefly, absorb landing on feet. Coach this explicitly, not by implication.`,
  'climbing-wall-development-instructor:2:3': `Know the cognitive load of leading: managing fear, making decisions and climbing simultaneously. Teach process focus as a skill to manage this load.`,
  'climbing-wall-development-instructor:2:4': `Transition: start leading on top-rope familiar routes. Progress to unfamiliar routes at the same grade. Then move to lead routes at a slightly lower grade.`,

  // Section 3 – Risk Management
  'climbing-wall-development-instructor:3:0': `CWDI-specific risks: deck-out potential at low clips, harder falls from upper routes and increased skill range in unsupervised participants.`,
  'climbing-wall-development-instructor:3:1': `Lead falls are larger and more dynamic. The consequences of belay errors are greater. Know the specific hazard profile and communicate it to trainees.`,
  'climbing-wall-development-instructor:3:2': `CWDI scope: lead climbing instruction at indoor walls. For outdoor lead or multi-pitch, refer to RCI. Know the boundary clearly and apply it.`,
  'climbing-wall-development-instructor:3:3': `Designated fall zones, no spectators below active lead climbers, clear communication protocol between climber and belayer during fall practice.`,
  'climbing-wall-development-instructor:3:4': `Session plan, risk assessment, participant assessment record and incident report template. Know what is required and keep records up to date.`,

  // ─── ROCK CLIMBING INSTRUCTOR ─────────────────────────────────────────────────

  // Section 0 – Ropework at the Crag
  'rock-climbing-instructor:0:0': `Know the systems for single and multi-anchor top ropes. Assess stance geometry, rope run and load direction before rigging. Inspect in-situ gear critically.`,
  'rock-climbing-instructor:0:1': `Bolts: check for spin, corrosion and hanger condition. Threads: check for sharp rock edges on the cord. Spikes: test stability. Natural: assess size and soundness.`,
  'rock-climbing-instructor:0:2': `Flake and stack ropes to prevent tangles. Carry ropes in a bag or tied butterfly coil. Know how to deploy a rope quickly on the ground at the base.`,
  'rock-climbing-instructor:0:3': `Direct belay from above: know Italian hitch to a masterpoint or autobloc device. Bottom-rope: standard anchor with rope to participant at the base.`,
  'rock-climbing-instructor:0:4': `At the base: keep group away from rockfall zones and directly below active climbers. At the top: keep group back from the edge and attached to the anchor.`,
  'rock-climbing-instructor:0:5': `Lowering from above: Italian hitch or autobloc to masterpoint. Smooth, consistent speed. Know how to stop mid-lower if required.`,

  // Section 1 – Anchors and Belay Systems
  'rock-climbing-instructor:1:0': `Use a minimum of two independent placements. Each must be individually assessed before being combined. Know sling size and load path for each placement type.`,
  'rock-climbing-instructor:1:1': `Magic X: sliding, self-equalising but not redundant against pull direction change. Sliding X: adds limiter knots. Pre-equalised: fixed, redundant and simple.`,
  'rock-climbing-instructor:1:2': `Direct belay from above: Italian hitch on HMS to masterpoint. Assess the geometry before climbing: can you belay safely and lower with control?`,
  'rock-climbing-instructor:1:3': `Use an additional sling or wire to back up a single dodgy placement. Assess and record before using. Know when to walk away from an unsafe anchor.`,
  'rock-climbing-instructor:1:4': `Rule of thumb: a fully loaded system sees 2–3x the body weight of the falling climber. A shock load can exceed 5–10kN. Build redundancy accordingly.`,
  'rock-climbing-instructor:1:5': `Figure-of-eight on a bight: know the correct form and check it is dressed. Clove hitch: both strands parallel and tight. Italian hitch: know which orientation for lowering.`,

  // Section 2 – Instructing Movement
  'rock-climbing-instructor:2:0': `Prioritise footwork, balance and body position before hand strength. Use easy slabs as the primary teaching vehicle for beginners outdoors.`,
  'rock-climbing-instructor:2:1': `Outdoor environment: use the rock itself as a demonstration aid. Point out features, demonstrate on a boulder before the route, use the route to illustrate cues.`,
  'rock-climbing-instructor:2:2': `Route reading: look from the ground, identify sequences, rest positions and the crux zone. Develop the habit of planning before moving.`,
  'rock-climbing-instructor:2:3': `Progress route grade, length and technical demand incrementally. Know when a participant has plateaued and needs a different approach.`,
  'rock-climbing-instructor:2:4': `Know the adaptations needed for children (shorter reach, different cues), older adults (strength-endurance profile) and less confident adults.`,

  // Section 3 – Descent and Abseiling
  'rock-climbing-instructor:3:0': `Abseil anchor: two independent points, a masterpoint at a manageable height. Check rope reaches the ground or a ledge. Know retrievable abseil setups.`,
  'rock-climbing-instructor:3:1': `Demonstrate technique at low height first. Supervise closely as participants go over the edge. Operate a bottom safety rope or Prusik backup for beginners.`,
  'rock-climbing-instructor:3:2': `Know the walking descent for every crag you operate at. Check the path condition seasonally. Walking off is often faster and safer than abseiling for groups.`,
  'rock-climbing-instructor:3:3': `In wet conditions, walking descents are often preferable to abseiling. Brief the group before departure on the likely descent method and contingencies.`,
  'rock-climbing-instructor:3:4': `Abseiling is appropriate when: participants have been taught the technique, the anchor is solid and the crag has no practical walking descent.`,

  // Section 4 – Group Management at the Crag
  'rock-climbing-instructor:4:0': `Designate a base area away from rockfall zones. At the top: group clipped to a safety line before any movement near the edge.`,
  'rock-climbing-instructor:4:1': `Brief before the first climb. Cover: helmet on, no running at the base, no one under a climber without a helmet, lowering procedure and emergency signals.`,
  'rock-climbing-instructor:4:2': `Use a rotation system. Keep waiting participants engaged and warm. Brief clearly and quickly before each participant climbs.`,
  'rock-climbing-instructor:4:3': `Manage pace, give personal attention to anxious participants and use natural features to maintain engagement. Plan the day with clear start and finish times.`,
  'rock-climbing-instructor:4:4': `Loose rock: brief group never to stand directly below a climbing section. Rockfall helmets on throughout. Know the local quarried or loose rock crags to avoid.`,

  // Section 5 – Access and Environment
  'rock-climbing-instructor:5:0': `Check the BMC regional access database or local club information before visiting. Know the approach and any parking restrictions. Have an alternative in mind.`,
  'rock-climbing-instructor:5:1': `Use existing belaying spots. Do not scratch holds or mark rock. Carry out all waste including food, tape and packaging. Keep the base tidy.`,
  'rock-climbing-instructor:5:2': `Brief groups specifically on the local considerations: chalk use, vegetation at the base, toilet etiquette and leaving the crag as found.`,
  'rock-climbing-instructor:5:3': `Know the nesting season for peregrine and other raptors (March to July typically). Check for seasonal closures on the BMC or RSPB database before visiting.`,
  'rock-climbing-instructor:5:4': `Know your local BMC or regional club access officer. Participate in crag clean-up days. Brief groups that their behaviour affects future access for all.`,

  // ─── ROCK CLIMBING DEVELOPMENT INSTRUCTOR ────────────────────────────────────

  // Section 0 – Multi-pitch Techniques
  'rock-climbing-development-instructor:0:0': `Lead consistently at least two grades above the client route. Know route selection, protection placement and stance identification in advance.`,
  'rock-climbing-development-instructor:0:1': `Know the butterfly coil for moving together, direct from belay device feeding techniques and communication signals for each system in use.`,
  'rock-climbing-development-instructor:0:2': `Pitching: stop at stances, build anchors, belay the second. Simul-climbing: both moving, use of running belays. Know when each is appropriate.`,
  'rock-climbing-development-instructor:0:3': `Know direct belay from above, assisted-braking device on anchor, and guide mode. Know how to manage a heavy second on a sustained pitch.`,
  'rock-climbing-development-instructor:0:4': `Retreat options: abseil from existing gear, leave gear on natural features, descend a different route. Know the specific retreat for every route you guide.`,
  'rock-climbing-development-instructor:0:5': `Brief before leaving the ground: rope signals, rest steps, anchor clipping on arrival. Check comprehension before committing to pitch one.`,

  // Section 1 – Advanced Anchor Systems
  'rock-climbing-development-instructor:1:0': `Know cams (placement angle, stem direction), wires (nut selection by shape and channel) and natural threads in multi-pitch contexts.`,
  'rock-climbing-development-instructor:1:1': `Sound rock: hard, not hollow, no visible cracking. Friable rock: red sandstone, some limestone. Adjust protection type and stance accordingly.`,
  'rock-climbing-development-instructor:1:2': `Use the minimum number of points for maximum efficiency. Know the difference between a bomber two-point and an acceptable three-point stance.`,
  'rock-climbing-development-instructor:1:3': `A poorly equalized anchor multiplies force on the weakest point. Know the trigonometry of equalisation angles: above 60° combined angle, forces increase sharply.`,
  'rock-climbing-development-instructor:1:4': `Check in-situ pegs and bolts critically. Carry a sling to back up any doubtful placement before transferring load to the system.`,

  // Section 2 – Route Selection and Risk
  'rock-climbing-development-instructor:2:0': `Match route grade, length and seriousness to the client's trad or sport climbing background. A grade 4 multi-pitch is different from a single-pitch grade 4.`,
  'rock-climbing-development-instructor:2:1': `Identify loose sections on the guidebook description and pre-inspect from the ground. Note weather windows and whether afternoon sun will increase risk.`,
  'rock-climbing-development-instructor:2:2': `Allow 45–60 min per pitch as a minimum. Add time for clients who are nervous or slow. Know the last abseil point for a committed retreat.`,
  'rock-climbing-development-instructor:2:3': `Brief before the approach: objectives, grades, likely descent route, weather window and the specific signals you will use on the route.`,
  'rock-climbing-development-instructor:2:4': `Go/no-go criteria: client ability vs route grade, weather forecast, team speed vs daylight and client fatigue at the base. Make the call at the base, not mid-route.`,

  // Section 3 – Retreat and Rescue
  'rock-climbing-development-instructor:3:0': `Know at which point on each route retreat becomes more serious than continuing. Identify this in advance from the guidebook and your knowledge of the route.`,
  'rock-climbing-development-instructor:3:1': `In-situ: inspect before committing full weight. Self-placed: know thread, spike and nut anchor options for retreat in varied rock types. Leave gear without hesitation if required.`,
  'rock-climbing-development-instructor:3:2': `If a second is injured on a stance: make them safe, assess injury, communicate with MR and manage their comfort while awaiting rescue.`,
  'rock-climbing-development-instructor:3:3': `Know the MR number for the area, the grid reference of the route and a description of the route name and approximate position on it.`,
  'rock-climbing-development-instructor:3:4': `Assisted hoist: z-pulley system using the rope in hand. Passing a knot through a belay device. Know both techniques and practice them on the ground regularly.`,

  // ─── MOUNTAINEERING AND CLIMBING INSTRUCTOR ──────────────────────────────────

  // Section 0 – Mountain Navigation
  'mountaineering-and-climbing-instructor:0:0': `Navigate on approaches and descents using the same standards as a Mountain Leader. In poor weather, navigation to and from the crag may be the crux of the day.`,
  'mountaineering-and-climbing-instructor:0:1': `Plan approach and descent before leaving. Know the time required for both in good and poor conditions. Have a bailed descent identified before reaching the crag.`,
  'mountaineering-and-climbing-instructor:0:2': `Hold full Mountain Leader navigation standard. Know the specific hazards on mountain crag approaches: loose scree, bogs, crags above and below the path.`,
  'mountaineering-and-climbing-instructor:0:3': `Use GPS as a backup to map and compass. Know the specific grid reference of the crag and the descent path. Test battery life before departure.`,
  'mountaineering-and-climbing-instructor:0:4': `Manage group on path and off path with the same discipline as on the hill. Brief on terrain hazards before leaving the base.`,

  // Section 1 – Technical Rock
  'mountaineering-and-climbing-instructor:1:0': `Maintain consistent trad leading ability at appropriate grade. Know how to place gear efficiently in mountain rock types: granite, gabbro, sandstone, gritstone.`,
  'mountaineering-and-climbing-instructor:1:1': `Cams: full stem engagement, trigger retracted to allow loading. Wires: seated in the widest part of the channel. Hexes: camming placement for directional hold.`,
  'mountaineering-and-climbing-instructor:1:2': `Mountain trad anchors need to be fast to build. Know how to assess a stance and build a two or three-point anchor in under five minutes.`,
  'mountaineering-and-climbing-instructor:1:3': `Manage a client in guide mode or direct belay. Know how to help a second who is struggling on steep terrain without creating a pendulum fall risk.`,
  'mountaineering-and-climbing-instructor:1:4': `Keep the rope system as simple as possible. Avoid unnecessary complexity. A clean rope run prevents drag and keeps communication accurate.`,
  'mountaineering-and-climbing-instructor:1:5': `Know several routes of varying grades at each crag you operate on. Have an easier alternative if conditions or client ability require it on the day.`,

  // Section 2 – Mountain Rescue
  'mountaineering-and-climbing-instructor:2:0': `Primary survey: DR ABCDE on a technical stance. Secure the casualty to the anchor first. Then assess and treat in order of priority.`,
  'mountaineering-and-climbing-instructor:2:1': `Z-pulley: redirect the rope through a pulley or carabiner on the anchor. Practice until it can be assembled quickly. A hoist is most useful in the first 3–5m of lift.`,
  'mountaineering-and-climbing-instructor:2:2': `On mountain crags, GPS location plus crag name and pitch number is the most useful information for MR. Know the MR team contact for the area.`,
  'mountaineering-and-climbing-instructor:2:3': `Identify the most suitable open site within 300m of the crag and mark the grid reference. Use high-visibility clothing or emergency signals to guide the aircraft.`,
  'mountaineering-and-climbing-instructor:2:4': `Keep non-casualties safe on the stance or a convenient ledge. Communicate clearly and regularly. Manage the emotional state of the group as well as the physical.`,

  // Section 3 – Group Management in Mountain Terrain
  'mountaineering-and-climbing-instructor:3:0': `Know the approach, route, descent, bail options and emergency procedures thoroughly before departure. Brief the group at each stage.`,
  'mountaineering-and-climbing-instructor:3:1': `On long mountain routes, the descent is where most incidents happen. Monitor fatigue throughout the climb. Know when to speed up and when to stop.`,
  'mountaineering-and-climbing-instructor:3:2': `Build weather windows into the plan from the start. Know the conditions that will trigger retreat (wind, electrical storm, poor visibility on descent).`,
  'mountaineering-and-climbing-instructor:3:3': `Know the specific techniques for managing two clients on a single-pitch route vs. managing a group of four across multiple pitches.`,
  'mountaineering-and-climbing-instructor:3:4': `Keep the debrief short and focused. Acknowledge what was hard. Invite reflection on key decisions. Be honest about your own choices on the day.`,

  // Section 4 – Campcraft and Bivouac
  'mountaineering-and-climbing-instructor:4:0': `Criteria: level, durable surface, sheltered from prevailing wind, away from watercourses and drainage lines, no overhead hazard.`,
  'mountaineering-and-climbing-instructor:4:1': `Know how to pitch a tent or construct a basic shelter in wind and rain. Be able to do this quickly and confidently after a long day on the hill.`,
  'mountaineering-and-climbing-instructor:4:2': `Plan calorie intake for the effort level of the day. Carry enough stove fuel. Know the water sources on route and carry adequate treatment.`,
  'mountaineering-and-climbing-instructor:4:3': `LNT: camp on durable ground, cat-holes for waste, no fires above the tree line, carry out all rubbish, scatter grey water.`,
  'mountaineering-and-climbing-instructor:4:4': `Multi-day itinerary: daily target, camp location, food supply, approach and descent for each climbing day, contingency for weather days.`,

  // ─── WINTER MOUNTAINEERING AND CLIMBING INSTRUCTOR ───────────────────────────

  // Section 0 – Winter Technical Skills
  'winter-mountaineering-and-climbing-instructor:0:0': `Move confidently on 50°+ snow and grade II ice. Footwork is the priority: maintain balance and composure on the steepest terrain you will guide on.`,
  'winter-mountaineering-and-climbing-instructor:0:1': `Self-arrest: reach arrest position within two seconds from any start orientation. Step cutting: know when it is faster than placing screws. Snow stakes: T-stake placement in consolidated snow.`,
  'winter-mountaineering-and-climbing-instructor:0:2': `Ice screws: 16–22cm into solid ice, angled 10° back from perpendicular. Deadman: buried at 40° below slope surface. Both must be practiced in varied snow and ice conditions.`,
  'winter-mountaineering-and-climbing-instructor:0:3': `Lead at least two grades above the client route. Know winter route grades (I–V for Scottish winter). Know the specific crags and routes you plan to guide.`,
  'winter-mountaineering-and-climbing-instructor:0:4': `French, German and mixed technique for crampons. Know when front-pointing slows you and when it is essential. Vertical ice: dagger, dry-tool and mixed footwork.`,
  'winter-mountaineering-and-climbing-instructor:0:5': `Running belay management on winter routes: efficient gear placement, rope management in cold hands, communication in high wind. Practice in realistic conditions.`,

  // Section 1 – Ice and Mixed Climbing Instruction
  'winter-mountaineering-and-climbing-instructor:1:0': `Start on a safe snow slope: axe carry, self-arrest, then introduce crampon walking on low-angle terrain before any steeper ground.`,
  'winter-mountaineering-and-climbing-instructor:1:1': `Top anchor: ice screws or deadman in solid snow. Direct belay from the anchor in guide mode. Test before allowing clients to climb.`,
  'winter-mountaineering-and-climbing-instructor:1:2': `Teach crampon walking before introducing the ice axe as a tool. Progress: walking axe, dagger, hooking. Never rush to steep terrain before basics are consolidated.`,
  'winter-mountaineering-and-climbing-instructor:1:3': `Introduce lead fall practice in winter conditions only after thorough grounding in technique and equipment. Know the specific mental challenges of leading in the cold.`,
  'winter-mountaineering-and-climbing-instructor:1:4': `On steep winter terrain: all group members roped, clear signals agreed, positions such that you can observe all group members simultaneously.`,

  // Section 2 – Avalanche Management
  'winter-mountaineering-and-climbing-instructor:2:0': `Know SAIS and international avalanche terrain classification. Apply avoidance in all planning: not just avalanche paths but also run-out zones and deposit areas.`,
  'winter-mountaineering-and-climbing-instructor:2:1': `AAIRS: Assess conditions, Avoid terrain, Identify hazards, Recognise decision points, Select safest line. Practice the framework as a decision-making tool.`,
  'winter-mountaineering-and-climbing-instructor:2:2': `Rescue leader role: deploy searchers, call for help, manage probe line, direct strategic shovelling. Know the 15-minute survival statistics and act accordingly.`,
  'winter-mountaineering-and-climbing-instructor:2:3': `Teach avalanche awareness as an integrated part of route briefing: terrain selection, snow assessment and rescue procedure. Not a separate module.`,
  'winter-mountaineering-and-climbing-instructor:2:4': `Slope meter: 30–45° is the primary avalanche danger zone. Rutschblock: test at a representative test slope before committing to the main route. Know how to record and use the result.`,

  // Section 3 – Winter Emergency Procedures
  'winter-mountaineering-and-climbing-instructor:3:0': `Hypothermia: stop heat loss immediately (vapour barrier, insulation, shelter). Frostbite: protect from re-freezing, do not rub. Both require rapid evacuation.`,
  'winter-mountaineering-and-climbing-instructor:3:1': `Snow hole: choose a consolidated bank, dig in horizontally then rise to sleep on a platform. Minimum 1m of snow overhead. Ventilation hole essential. Leave marker above entrance.`,
  'winter-mountaineering-and-climbing-instructor:3:2': `Know the MR number, have the grid reference and route name ready, and if using PLB know how to activate it and what happens next.`,
  'winter-mountaineering-and-climbing-instructor:3:3': `Improvised rescue on ice: z-pulley on ice screw anchors. On steep snow: buried deadman anchors. Practice both on the ground before needing them in an emergency.`,
  'winter-mountaineering-and-climbing-instructor:3:4': `Assign roles immediately: casualty care, group shelter, communications, navigation. Keep the non-involved group warm, occupied and informed throughout.`,
}
