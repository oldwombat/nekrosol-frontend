export type PlayerProfile = {
  id?: string | number;
  email?: string;
  displayName?: string | null;
  credits?: number | null;
  creditsMax?: number | null;
  energy?: number | null;
  energyMax?: number | null;
  lastEnergyUpdate?: string | null;
  health?: number | null;
  healthMax?: number | null;
  radiation?: number | null;
  radiationMax?: number | null;
  thug?: number | null;
  thief?: number | null;
  grifter?: number | null;
  pilot?: number | null;
  medic?: number | null;
  hacker?: number | null;
  technician?: number | null;
  chemist?: number | null;
  physicist?: number | null;
  scavenger?: number | null;
  mechanic?: number | null;
  smuggler?: number | null;
  // Prestige levels (0 = never prestiged, 4 = max)
  thugPrestige?: number | null;
  thiefPrestige?: number | null;
  grifterPrestige?: number | null;
  pilotPrestige?: number | null;
  medicPrestige?: number | null;
  hackerPrestige?: number | null;
  technicianPrestige?: number | null;
  chemistPrestige?: number | null;
  physicistPrestige?: number | null;
  scavengerPrestige?: number | null;
  mechanicPrestige?: number | null;
  smugglerPrestige?: number | null;
  lastRadiationUpdate?: string | null;
  displayTitle?: string | null;
};

export type StatItem = {
  key: 'credits' | 'energy' | 'health' | 'radiation';
  label: string;
  value: number;
  max: number;
};

export const getStatItems = (player: PlayerProfile | null): StatItem[] => {
  if (!player) {
    return [];
  }

  return [
    { key: 'credits', label: 'Credits', value: player.credits ?? 0, max: player.creditsMax ?? 1000000 },
    { key: 'energy', label: 'Energy', value: player.energy ?? 0, max: player.energyMax ?? 10 },
    { key: 'health', label: 'Health', value: player.health ?? 0, max: player.healthMax ?? 100 },
    { key: 'radiation', label: 'Radiation', value: player.radiation ?? 0, max: player.radiationMax ?? 100 },
  ];
};

export type SkillKey =
  | 'thug'
  | 'thief'
  | 'grifter'
  | 'pilot'
  | 'medic'
  | 'hacker'
  | 'technician'
  | 'chemist'
  | 'physicist'
  | 'scavenger'
  | 'mechanic'
  | 'smuggler';

export type SkillItem = {
  key: SkillKey;
  label: string;
  tip: string;
};

// Rank tiers: ordered by prestige level (index 0 = prestige 0, index 4 = prestige 4).
// Skills cap at 100. At value=100, player may prestige: rank advances, value resets to 1.
// 5 prestige levels × 100 skill points = 500 total investment per skill.
type SkillRankTier = { rank: string };

const skillRankTables: Record<SkillKey, SkillRankTier[]> = {
  thug:        [{ rank: 'Scrapper' }, { rank: 'Brawler' }, { rank: 'Bruiser' }, { rank: 'Enforcer' }, { rank: 'Juggernaut' }],
  thief:       [{ rank: 'Pickpocket' }, { rank: 'Prowler' }, { rank: 'Cutpurse' }, { rank: 'Shadowstep' }, { rank: 'Phantom' }],
  grifter:     [{ rank: 'Hustler' }, { rank: 'Schemer' }, { rank: 'Con Artist' }, { rank: 'Mastermind' }, { rank: 'Architect' }],
  pilot:       [{ rank: 'Joyrider' }, { rank: 'Freelancer' }, { rank: 'Ace' }, { rank: 'Vanguard' }, { rank: 'Ghost' }],
  medic:       [{ rank: 'Patcher' }, { rank: 'Field Medic' }, { rank: 'Surgeon' }, { rank: 'Trauma Specialist' }, { rank: 'Miracle Worker' }],
  hacker:      [{ rank: 'Script Kiddie' }, { rank: 'Logic Bomber' }, { rank: 'Zero-Day' }, { rank: 'Ghost Wire' }, { rank: 'Null Pointer' }],
  technician:  [{ rank: 'Tinkerer' }, { rank: 'Rigger' }, { rank: 'Engineer' }, { rank: 'Artificer' }, { rank: 'Forge Sage' }],
  chemist:     [{ rank: 'Mixer' }, { rank: 'Alchemist' }, { rank: 'Synthesist' }, { rank: 'Toxicologist' }, { rank: 'Plague Savant' }],
  physicist:   [{ rank: 'Student' }, { rank: 'Researcher' }, { rank: 'Theorist' }, { rank: 'Radiomancer' }, { rank: 'Void Entropist' }],
  scavenger:   [{ rank: 'Drifter' }, { rank: 'Scrounger' }, { rank: 'Salvager' }, { rank: 'Wraith Walker' }, { rank: 'Dust Prophet' }],
  mechanic:    [{ rank: 'Grease Monkey' }, { rank: 'Wrenchhead' }, { rank: 'Machinist' }, { rank: 'Forge Hand' }, { rank: 'Iron Sage' }],
  smuggler:    [{ rank: 'Mule' }, { rank: 'Runner' }, { rank: 'Operator' }, { rank: 'Ghost Liner' }, { rank: 'Shadow Broker' }],
};

/**
 * Returns the rank name for a skill based on its prestige level.
 * Prestige 0 + value 0 = unranked (null). Prestige 0 + value > 0 = Tier 1 rank.
 * Each prestige level unlocks the next rank name.
 */
export function getSkillRank(key: SkillKey, value: number, prestige: number): string | null {
  if (value <= 0 && prestige <= 0) return null;
  const tiers = skillRankTables[key];
  // prestige 0 → tier index 0, prestige 1 → tier index 1, etc.
  const tierIndex = Math.min(prestige, tiers.length - 1);
  return tiers[tierIndex].rank;
}

export const skillItems: SkillItem[] = [
  { key: 'thug', label: 'Thug', tip: 'Physical, combat, defence' },
  { key: 'thief', label: 'Thief', tip: 'Physical, agile, nimble' },
  { key: 'grifter', label: 'Grifter', tip: 'Skill, crime, cunning' },
  { key: 'pilot', label: 'Pilot', tip: 'Skill, courage, speed' },
  { key: 'medic', label: 'Medic', tip: 'Skill, intelligence, healer' },
  { key: 'hacker', label: 'Hacker', tip: 'Skill, intelligence, technical' },
  { key: 'technician', label: 'Technician', tip: 'Skill, intelligence, mechanical, biotech' },
  { key: 'chemist', label: 'Chemist', tip: 'Skill, compounds, toxins, antidotes' },
  {
    key: 'physicist',
    label: 'Physicist',
    tip: 'Skill, control radiation effects and mutations caused by Nekrosol solar radiation',
  },
  { key: 'scavenger', label: 'Scavenger', tip: 'Physical, salvage, field survival' },
  { key: 'mechanic', label: 'Mechanic', tip: 'Skill, repair systems, maintain rigs and vehicles' },
  { key: 'smuggler', label: 'Smuggler', tip: 'Skill, stealth logistics, route contraband safely' },
];

export type LocationItem = {
  id: string;
  name: string;
  summary: string;
  details: string;
};

export const locationItems: LocationItem[] = [
  {
    id: 'dustline-tavern',
    name: 'Dustline Tavern',
    summary: 'Crowded neutral den for rumors and jobs.',
    details: 'A key social hub where factions exchange intel, mercenaries gather, and contracts circulate.',
  },
  {
    id: 'ember-bank',
    name: 'Ember Bank',
    summary: 'Primary credit exchange and debt registry.',
    details: 'Handles account settlements, loan ledgers, and high-value escrow under strict armed oversight.',
  },
  {
    id: 'blackglass-market',
    name: 'Blackglass Market',
    summary: 'Open bazaar for rare salvage and contraband.',
    details: 'You can source uncommon components and broker risky trades through intermediaries and fixers.',
  },
  {
    id: 'reactor-district',
    name: 'Reactor District',
    summary: 'Industrial zone with heavy radiation influence.',
    details: 'Core power infrastructure region with high hazard levels, technical opportunities, and restricted access.',
  },
];
