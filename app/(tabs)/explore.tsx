import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useCallback, useState } from 'react';

import { base, buttons, Colors, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api, type BankDeposit, type BankTerm, type ShopItem } from '@/lib/api';
import { locationItems } from './home-data';

type RadiationLevel = 'LOW' | 'MEDIUM' | 'HIGH';

type LocationRadiation = {
  level: RadiationLevel;
  percent: number;
  flavour: string;
};

const LOCATION_RADIATION: Record<string, LocationRadiation> = {
  'dustline-tavern': {
    level: 'LOW',
    percent: 5,
    flavour:
      'Where deals are struck and debts are called in. The safest place in the Fringe, if you know who to avoid.',
  },
  'ember-bank': {
    level: 'LOW',
    percent: 5,
    flavour:
      'The Ministry-controlled credit exchange. Every transaction logged. Every debt tracked. They always collect.',
  },
  'blackglass-market': {
    level: 'LOW',
    percent: 5,
    flavour: 'Salvage, contraband, stolen tech. No questions asked if the credits are real.',
  },
  'reactor-district': {
    level: 'MEDIUM',
    percent: 35,
    flavour:
      "Restricted. Irradiated. Industrial. The only place to find reactor parts — and the only place that'll kill you slowly for trying.",
  },
};

/** Locations that have an active shop */
const SHOP_LOCATIONS = new Set(['blackglass-market']);
/** Locations that have a bank */
const BANK_LOCATIONS = new Set(['ember-bank']);
/** Locations that have NPC interactions */
const NPC_LOCATIONS = new Set(['dustline-tavern']);
/** Locations that have scavenging (runs via player-actions mission) */
const SCAVENGE_LOCATIONS = new Set(['reactor-district']);

function radiationBadgeColor(percent: number): string {
  if (percent < 20) return StatusColors.safe;
  if (percent <= 60) return StatusColors.warning;
  return StatusColors.danger;
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    medicine: '💉 Medicine',
    consumable: '🧪 Consumable',
    material: '🔩 Material',
    weapon: '🗡 Weapon',
    armour: '🛡 Armour',
    misc: '📦 Misc',
  };
  return labels[cat] ?? cat;
}

type ShopModalProps = {
  locationName: string;
  visible: boolean;
  onClose: () => void;
  palette: (typeof Colors)['light'];
};

function BlackglassShopModal({ locationName, visible, onClose, palette }: ShopModalProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingShop, setLoadingShop] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [playerCredits, setPlayerCredits] = useState<number | null>(null);

  const loadShop = useCallback(async () => {
    setLoadingShop(true);
    setLoadError(null);
    setFeedback(null);
    try {
      const [shopResult, meResult] = await Promise.all([api.game.shop(), api.players.me()]);
      if (shopResult.ok && shopResult.data?.items) {
        setItems(shopResult.data.items);
      } else {
        setLoadError('Failed to load items.');
      }
      if (meResult.ok) {
        setPlayerCredits(meResult.data?.user?.credits ?? null);
      }
    } catch {
      setLoadError('Network error loading shop.');
    } finally {
      setLoadingShop(false);
    }
  }, []);

  // Load on first open
  const [hasLoaded, setHasLoaded] = useState(false);
  if (visible && !hasLoaded) {
    setHasLoaded(true);
    void loadShop();
  }
  if (!visible && hasLoaded) {
    setHasLoaded(false);
  }

  const handleBuy = async (item: ShopItem) => {
    setPurchasing(item.key);
    setFeedback(null);
    try {
      const result = await api.game.purchase(item.key, 1);
      if (result.ok && result.data?.ok) {
        setPlayerCredits(result.data.credits ?? playerCredits);
        setFeedback({ msg: `Bought 1× ${item.name} for ${item.value} credits.`, ok: true });
      } else {
        const errMsg = result.ok ? (result.data?.error ?? 'Purchase failed.') : result.error;
        setFeedback({ msg: errMsg, ok: false });
      }
    } catch {
      setFeedback({ msg: 'Network error.', ok: false });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: palette.background,
            borderTopWidth: 1,
            borderTopColor: palette.tabIconDefault,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80%',
            padding: 20,
            gap: 14,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[base.title, { color: palette.text, fontSize: 20 }]}>
                {locationName}
              </Text>
              {playerCredits !== null ? (
                <Text style={[base.comments, { color: palette.icon, fontStyle: 'normal' }]}>
                  💳 {playerCredits.toLocaleString()} credits
                </Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: palette.icon, fontSize: 20, fontWeight: '700' }}>✕</Text>
            </Pressable>
          </View>

          {/* Feedback banner */}
          {feedback ? (
            <View
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: feedback.ok ? `${StatusColors.safe}22` : `${StatusColors.danger}22`,
                borderWidth: 1,
                borderColor: feedback.ok ? StatusColors.safe : StatusColors.danger,
              }}
            >
              <Text style={{ color: feedback.ok ? StatusColors.safe : StatusColors.danger, fontSize: 13 }}>
                {feedback.msg}
              </Text>
            </View>
          ) : null}

          {/* Item list */}
          {loadingShop ? (
            <Text style={[base.comments, { color: palette.icon }]}>Loading inventory…</Text>
          ) : loadError ? (
            <Text style={[base.comments, { color: StatusColors.danger }]}>{loadError}</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator contentContainerStyle={{ gap: 10 }}>
              {items.map((item) => {
                const canAfford = playerCredits === null || playerCredits >= item.value;
                const isBuying = purchasing === item.key;
                return (
                  <View
                    key={item.key}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.tabIconDefault,
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: palette.background,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[base.comments, { color: palette.text, fontWeight: '700', fontStyle: 'normal' }]}>
                        {item.name}
                      </Text>
                      <Text style={[base.comments, { color: palette.icon, fontSize: 11 }]}>
                        {categoryLabel(item.category)}
                      </Text>
                      {item.description ? (
                        <Text style={[base.comments, { color: palette.icon, fontSize: 11 }]}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={[base.comments, { color: palette.text, fontWeight: '700', fontStyle: 'normal' }]}>
                        {item.value > 0 ? `${item.value} ₵` : 'Free'}
                      </Text>
                      <Pressable
                        onPress={() => void handleBuy(item)}
                        disabled={!canAfford || isBuying || purchasing !== null}
                        style={[
                          buttons.secondary,
                          {
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderColor: canAfford ? palette.link : palette.tabIconDefault,
                            borderWidth: 1,
                            backgroundColor: palette.background,
                            opacity: (!canAfford || purchasing !== null) ? 0.45 : 1,
                          },
                        ]}
                      >
                        <Text style={[buttons.text, { color: canAfford ? palette.link : palette.icon }]}>
                          {isBuying ? 'Buying…' : 'Buy'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Ember Bank Modal ─────────────────────────────────────────────────────────

type BankModalProps = {
  locationName: string;
  visible: boolean;
  onClose: () => void;
  palette: (typeof Colors)['light'];
};

function EmberBankModal({ locationName, visible, onClose, palette }: BankModalProps) {
  const [terms, setTerms] = useState<BankTerm[]>([]);
  const [activeDeposit, setActiveDeposit] = useState<BankDeposit | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [amountText, setAmountText] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [acting, setActing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadBank = useCallback(async () => {
    setLoading(true); setLoadError(null); setFeedback(null);
    const result = await api.game.bank();
    if (result.ok && result.data?.ok) {
      setTerms(result.data.terms ?? []);
      setActiveDeposit(result.data.activeDeposit ?? null);
      setCredits(result.data.credits ?? null);
    } else {
      setLoadError(result.ok ? 'Failed to load bank.' : result.error);
    }
    setLoading(false);
  }, []);

  if (visible && !hasLoaded) { setHasLoaded(true); void loadBank(); }
  if (!visible && hasLoaded) { setHasLoaded(false); }

  const handleDeposit = async () => {
    const amount = parseInt(amountText, 10);
    if (!selectedTerm || !amount || amount < 1) {
      setFeedback({ msg: 'Choose a term and enter an amount.', ok: false }); return;
    }
    setActing(true); setFeedback(null);
    const result = await api.game.bankDeposit(selectedTerm, amount);
    if (result.ok && result.data?.ok) {
      setActiveDeposit(result.data.deposit ?? null);
      setCredits(result.data.credits ?? null);
      setAmountText(''); setSelectedTerm(null);
      setFeedback({ msg: `Deposited ${amount} credits. The Ministry will hold them.`, ok: true });
    } else {
      setFeedback({ msg: result.ok ? (result.data?.error ?? 'Deposit failed.') : result.error, ok: false });
    }
    setActing(false);
  };

  const handleWithdraw = async () => {
    setActing(true); setFeedback(null);
    const result = await api.game.bankWithdraw();
    if (result.ok && result.data?.ok) {
      setActiveDeposit(null);
      setCredits(result.data.credits ?? null);
      setFeedback({ msg: `Collected ${result.data.returned} credits (+${result.data.earned} interest).`, ok: true });
    } else {
      setFeedback({ msg: result.ok ? (result.data?.error ?? 'Withdrawal failed.') : result.error, ok: false });
    }
    setActing(false);
  };

  const maturityCountdown = activeDeposit && !activeDeposit.matured
    ? `Matures: ${new Date(activeDeposit.maturesAt).toLocaleString()}`
    : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.tabIconDefault, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%', padding: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[base.title, { color: palette.text, fontSize: 20 }]}>{locationName}</Text>
              {credits !== null ? (
                <Text style={[base.comments, { color: palette.icon, fontStyle: 'normal' }]}>💳 {credits.toLocaleString()} credits</Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: palette.icon, fontSize: 20, fontWeight: '700' }}>✕</Text>
            </Pressable>
          </View>
          {feedback ? (
            <View style={{ padding: 10, borderRadius: 8, backgroundColor: feedback.ok ? `${StatusColors.safe}22` : `${StatusColors.danger}22`, borderWidth: 1, borderColor: feedback.ok ? StatusColors.safe : StatusColors.danger }}>
              <Text style={{ color: feedback.ok ? StatusColors.safe : StatusColors.danger, fontSize: 13 }}>{feedback.msg}</Text>
            </View>
          ) : null}
          {loading ? (
            <Text style={[base.comments, { color: palette.icon }]}>Loading…</Text>
          ) : loadError ? (
            <Text style={[base.comments, { color: StatusColors.danger }]}>{loadError}</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator contentContainerStyle={{ gap: 12 }}>
              {activeDeposit ? (
                <View style={{ borderWidth: 1, borderColor: StatusColors.warning, borderRadius: 8, padding: 14, gap: 8 }}>
                  <Text style={[base.comments, { color: palette.text, fontWeight: '700', fontStyle: 'normal' }]}>Active Deposit</Text>
                  <Text style={[base.comments, { color: palette.icon }]}>Amount: {activeDeposit.amount} credits</Text>
                  <Text style={[base.comments, { color: palette.icon }]}>Return: {activeDeposit.return} credits ({Math.round(activeDeposit.interestRate * 100)}% interest)</Text>
                  {maturityCountdown ? (
                    <Text style={[base.comments, { color: StatusColors.warning }]}>{maturityCountdown}</Text>
                  ) : (
                    <Text style={[base.comments, { color: StatusColors.safe }]}>✓ Matured — ready to collect</Text>
                  )}
                  <Pressable
                    onPress={() => void handleWithdraw()}
                    disabled={!activeDeposit.matured || acting}
                    style={[buttons.secondary, { borderColor: activeDeposit.matured ? StatusColors.safe : palette.tabIconDefault, borderWidth: 1, backgroundColor: palette.background, opacity: (!activeDeposit.matured || acting) ? 0.45 : 1, alignSelf: 'flex-start', paddingHorizontal: 16 }]}
                  >
                    <Text style={[buttons.text, { color: activeDeposit.matured ? StatusColors.safe : palette.icon }]}>
                      {acting ? 'Collecting…' : 'Collect'}
                    </Text>
                  </Pressable>
                  <Text style={[base.comments, { color: palette.icon, fontSize: 11 }]}>
                    The Ministry does not allow early withdrawal.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  <Text style={[base.comments, { color: palette.text, fontWeight: '700', fontStyle: 'normal' }]}>New Deposit</Text>
                  <Text style={[base.comments, { color: palette.icon }]}>Select a term:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {terms.map((t) => (
                      <Pressable
                        key={t.id}
                        onPress={() => setSelectedTerm(t.id)}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: selectedTerm === t.id ? palette.link : palette.tabIconDefault, backgroundColor: palette.background }}
                      >
                        <Text style={{ color: selectedTerm === t.id ? palette.link : palette.icon, fontSize: 13 }}>
                          {t.label} · {Math.round(t.interestRate * 100)}%
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={amountText}
                    onChangeText={setAmountText}
                    placeholder="Amount (credits)"
                    placeholderTextColor={palette.icon}
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: palette.tabIconDefault, borderRadius: 8, padding: 10, color: palette.text, backgroundColor: palette.background }}
                  />
                  <Pressable
                    onPress={() => void handleDeposit()}
                    disabled={acting}
                    style={[buttons.secondary, { borderColor: palette.link, borderWidth: 1, backgroundColor: palette.background, opacity: acting ? 0.45 : 1, alignSelf: 'flex-start', paddingHorizontal: 16 }]}
                  >
                    <Text style={[buttons.text, { color: palette.link }]}>{acting ? 'Depositing…' : 'Deposit'}</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Dustline Tavern Modal ────────────────────────────────────────────────────

type TavernModalProps = {
  locationName: string;
  visible: boolean;
  onClose: () => void;
  palette: (typeof Colors)['light'];
};

const TAVERN_NPCS = [
  { id: 'vex',        name: 'Vex',        role: 'Courier Contact',   icon: '📦' },
  { id: 'the-broker', name: 'The Broker', role: 'Information Dealer', icon: '🕵' },
];

function DustlineTavernModal({ locationName, visible, onClose, palette }: TavernModalProps) {
  const [talked, setTalked] = useState<Set<string>>(new Set());
  const [dialogue, setDialogue] = useState<{ npcId: string; text: string; unlocked: string[] } | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  if (visible && !hasLoaded) { setHasLoaded(true); }
  if (!visible && hasLoaded) { setHasLoaded(false); setDialogue(null); setFeedback(null); }

  const handleTalk = async (npcId: string) => {
    setActing(npcId); setDialogue(null); setFeedback(null);
    const result = await api.game.npcInteract(npcId);
    if (result.ok && result.data?.ok) {
      setTalked((prev) => new Set([...prev, npcId]));
      setDialogue({
        npcId,
        text: result.data.dialogue ?? '',
        unlocked: result.data.unlockedMissions?.map((m) => m.name) ?? [],
      });
    } else {
      setFeedback({ msg: result.ok ? (result.data?.error ?? 'Failed.') : result.error, ok: false });
    }
    setActing(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.tabIconDefault, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%', padding: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[base.title, { color: palette.text, fontSize: 20 }]}>{locationName}</Text>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: palette.icon, fontSize: 20, fontWeight: '700' }}>✕</Text>
            </Pressable>
          </View>
          {feedback ? (
            <View style={{ padding: 10, borderRadius: 8, backgroundColor: `${StatusColors.danger}22`, borderWidth: 1, borderColor: StatusColors.danger }}>
              <Text style={{ color: StatusColors.danger, fontSize: 13 }}>{feedback.msg}</Text>
            </View>
          ) : null}
          {dialogue ? (
            <View style={{ borderWidth: 1, borderColor: palette.tabIconDefault, borderRadius: 8, padding: 14, gap: 8 }}>
              <Text style={[base.comments, { color: palette.text, fontStyle: 'italic' }]}>"{dialogue.text}"</Text>
              {dialogue.unlocked.length > 0 ? (
                dialogue.unlocked.map((name) => (
                  <Text key={name} style={[base.comments, { color: StatusColors.safe }]}>✓ Mission unlocked: {name}</Text>
                ))
              ) : null}
              <Pressable onPress={() => setDialogue(null)} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                <Text style={{ color: palette.link, fontSize: 13 }}>← Back</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator contentContainerStyle={{ gap: 10 }}>
              <Text style={[base.comments, { color: palette.icon }]}>The tavern is dark and loud. A few faces look up, then look away.</Text>
              {TAVERN_NPCS.map((npc) => (
                <View key={npc.id} style={{ borderWidth: 1, borderColor: palette.tabIconDefault, borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 28 }}>{npc.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[base.comments, { color: palette.text, fontWeight: '700', fontStyle: 'normal' }]}>{npc.name}</Text>
                    <Text style={[base.comments, { color: palette.icon, fontSize: 11 }]}>{npc.role}</Text>
                  </View>
                  <Pressable
                    onPress={() => void handleTalk(npc.id)}
                    disabled={acting !== null}
                    style={[buttons.secondary, { borderColor: palette.link, borderWidth: 1, backgroundColor: palette.background, paddingHorizontal: 14, paddingVertical: 6, opacity: acting !== null ? 0.45 : 1 }]}
                  >
                    <Text style={[buttons.text, { color: palette.link }]}>
                      {acting === npc.id ? 'Talking…' : talked.has(npc.id) ? 'Talk again' : 'Talk'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Reactor District Modal ───────────────────────────────────────────────────

type ReactorModalProps = {
  locationName: string;
  visible: boolean;
  onClose: () => void;
  palette: (typeof Colors)['light'];
};

function ReactorDistrictModal({ locationName, visible, onClose, palette }: ReactorModalProps) {
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{ summary: string[]; radiation: number } | null>(null);
  const [playerRadiation, setPlayerRadiation] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadRadiation = useCallback(async () => {
    const me = await api.players.me();
    if (me.ok) setPlayerRadiation((me.data?.user?.radiation as number) ?? null);
  }, []);

  if (visible && !hasLoaded) { setHasLoaded(true); void loadRadiation(); }
  if (!visible && hasLoaded) { setHasLoaded(false); setResult(null); setFeedback(null); }

  const handleSearch = async () => {
    setSearching(true); setResult(null); setFeedback(null);
    const res = await api.game.action('reactor-search');
    if (res.ok && !res.data?.error) {
      const summary = (res.data as { rewardsSummary?: string[] })?.rewardsSummary ?? [];
      const newRad = (res.data?.player as { radiation?: number })?.radiation ?? null;
      if (newRad !== null) setPlayerRadiation(newRad);
      const itemsFound = summary.filter((s) => !s.toLowerCase().includes('radiation'));
      setResult({
        summary: itemsFound,
        radiation: ((res.data as unknown as { statChanges?: { radiation?: number } })?.statChanges?.radiation) ?? 8,
      });
    } else {
      setFeedback({ msg: res.ok ? (res.data?.error ?? 'Search failed.') : res.error ?? 'Network error.', ok: false });
    }
    setSearching(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.tabIconDefault, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%', padding: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[base.title, { color: palette.text, fontSize: 20 }]}>{locationName}</Text>
              {playerRadiation !== null ? (
                <Text style={[base.comments, { color: StatusColors.warning, fontStyle: 'normal' }]}>☢ Radiation: {playerRadiation}</Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: palette.icon, fontSize: 20, fontWeight: '700' }}>✕</Text>
            </Pressable>
          </View>
          <View style={{ borderWidth: 1, borderColor: StatusColors.danger, borderRadius: 8, padding: 12 }}>
            <Text style={[base.comments, { color: StatusColors.danger }]}>
              ⚠ Each search costs 1 energy and exposes you to +8 radiation. The district does not care about your health.
            </Text>
          </View>
          {feedback ? (
            <View style={{ padding: 10, borderRadius: 8, backgroundColor: `${StatusColors.danger}22`, borderWidth: 1, borderColor: StatusColors.danger }}>
              <Text style={{ color: StatusColors.danger, fontSize: 13 }}>{feedback.msg}</Text>
            </View>
          ) : null}
          {result ? (
            <View style={{ borderWidth: 1, borderColor: palette.tabIconDefault, borderRadius: 8, padding: 14, gap: 6 }}>
              <Text style={[base.comments, { color: StatusColors.warning, fontStyle: 'normal' }]}>☢ +{result.radiation} radiation absorbed.</Text>
              {result.summary.length > 0
                ? result.summary.map((s, i) => (
                    <Text key={i} style={[base.comments, { color: StatusColors.safe }]}>✓ {s}</Text>
                  ))
                : <Text style={[base.comments, { color: palette.icon }]}>Nothing useful found this time.</Text>
              }
            </View>
          ) : null}
          <Pressable
            onPress={() => void handleSearch()}
            disabled={searching}
            style={[buttons.secondary, { borderColor: StatusColors.warning, borderWidth: 1, backgroundColor: palette.background, opacity: searching ? 0.45 : 1, alignSelf: 'flex-start', paddingHorizontal: 20 }]}
          >
            <Text style={[buttons.text, { color: StatusColors.warning }]}>{searching ? 'Searching…' : '⚗ Search for Parts'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── World Screen ─────────────────────────────────────────────────────────────

export default function WorldScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];
  const [shopLocation, setShopLocation] = useState<string | null>(null);
  const [bankLocation, setBankLocation] = useState<string | null>(null);
  const [npcLocation, setNpcLocation] = useState<string | null>(null);
  const [scavengeLocation, setScavengeLocation] = useState<string | null>(null);

  return (
    <View style={[base.container, { flex: 1, justifyContent: 'flex-start', width: '100%' }]}>
      <Text style={[base.title, { color: palette.text }]}>World</Text>
      <ScrollView
        style={{ width: '100%', flex: 1 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator
      >
        {locationItems.map((location) => {
          const rad = LOCATION_RADIATION[location.id];
          const badgeColor = rad ? radiationBadgeColor(rad.percent) : '#22a34a';
          const hasShop = SHOP_LOCATIONS.has(location.id);
          const hasBank = BANK_LOCATIONS.has(location.id);
          const hasNpc = NPC_LOCATIONS.has(location.id);
          const hasScavenge = SCAVENGE_LOCATIONS.has(location.id);
          const isInteractive = hasShop || hasBank || hasNpc || hasScavenge;
          return (
            <View
              key={location.id}
              style={{
                borderWidth: 1,
                borderColor: palette.tabIconDefault,
                borderRadius: 10,
                padding: 16,
                backgroundColor: palette.background,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[base.subtitle, { color: palette.text, fontWeight: '700', fontSize: 18 }]}>
                  {location.name}
                </Text>
                {rad ? (
                  <View
                    style={{
                      backgroundColor: badgeColor,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                      ☢ {rad.level} {rad.percent}%
                    </Text>
                  </View>
                ) : null}
              </View>
              {rad ? (
                <Text style={[base.comments, { color: palette.icon }]}>"{rad.flavour}"</Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={[
                    buttons.secondary,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.tabIconDefault,
                      borderWidth: 1,
                      alignSelf: 'flex-start',
                    },
                  ]}
                  onPress={() => {
                    if (hasShop) setShopLocation(location.id);
                    else if (hasBank) setBankLocation(location.id);
                    else if (hasNpc) setNpcLocation(location.id);
                    else if (hasScavenge) setScavengeLocation(location.id);
                    // Otherwise: travel coming soon (no-op)
                  }}
                >
                  <Text style={[buttons.text, { color: palette.text }]}>
                    {isInteractive ? 'Enter →' : 'Travel →'}
                  </Text>
                </Pressable>
                {hasShop ? (
                  <View style={{ alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${StatusColors.safe}22`, borderWidth: 1, borderColor: StatusColors.safe }}>
                    <Text style={{ color: StatusColors.safe, fontSize: 11, fontWeight: '700' }}>🛒 Shop</Text>
                  </View>
                ) : null}
                {hasBank ? (
                  <View style={{ alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${StatusColors.warning}22`, borderWidth: 1, borderColor: StatusColors.warning }}>
                    <Text style={{ color: StatusColors.warning, fontSize: 11, fontWeight: '700' }}>🏦 Bank</Text>
                  </View>
                ) : null}
                {hasNpc ? (
                  <View style={{ alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${palette.link}22`, borderWidth: 1, borderColor: palette.link }}>
                    <Text style={{ color: palette.link, fontSize: 11, fontWeight: '700' }}>💬 NPCs</Text>
                  </View>
                ) : null}
                {hasScavenge ? (
                  <View style={{ alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${StatusColors.danger}22`, borderWidth: 1, borderColor: StatusColors.danger }}>
                    <Text style={{ color: StatusColors.danger, fontSize: 11, fontWeight: '700' }}>⚗ Scavenge</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {shopLocation ? (
        <BlackglassShopModal
          locationName={locationItems.find((l) => l.id === shopLocation)?.name ?? 'Blackglass Market'}
          visible={shopLocation !== null}
          onClose={() => setShopLocation(null)}
          palette={palette}
        />
      ) : null}
      {bankLocation ? (
        <EmberBankModal
          locationName={locationItems.find((l) => l.id === bankLocation)?.name ?? 'Ember Bank'}
          visible={bankLocation !== null}
          onClose={() => setBankLocation(null)}
          palette={palette}
        />
      ) : null}
      {npcLocation ? (
        <DustlineTavernModal
          locationName={locationItems.find((l) => l.id === npcLocation)?.name ?? 'Dustline Tavern'}
          visible={npcLocation !== null}
          onClose={() => setNpcLocation(null)}
          palette={palette}
        />
      ) : null}
      {scavengeLocation ? (
        <ReactorDistrictModal
          locationName={locationItems.find((l) => l.id === scavengeLocation)?.name ?? 'Reactor District'}
          visible={scavengeLocation !== null}
          onClose={() => setScavengeLocation(null)}
          palette={palette}
        />
      ) : null}
    </View>
  );
}


