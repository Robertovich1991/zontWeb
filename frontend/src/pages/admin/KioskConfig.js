import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import {
  ArrowLeft, GripVertical, ChevronUp, ChevronDown, Trash2, Star, Eye, EyeOff,
  Plane, TrainFront, MapPin, Sparkles, Plus, Monitor, CreditCard, RefreshCw,
  Wifi, WifiOff, Loader2, Link2, Save, Languages,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const ICONS = { plane: Plane, train: TrainFront, star: Sparkles, map: MapPin };
const ICON_OPTIONS = [
  { value: 'plane', label: 'Aéroport' },
  { value: 'train', label: 'Gare' },
  { value: 'star', label: 'Disney / Loisir' },
  { value: 'map', label: 'Autre' },
];
const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
];

const StatusBadge = ({ status }) => {
  const map = {
    online: { cls: 'bg-emerald-100 text-emerald-700', icon: Wifi, txt: 'En ligne' },
    offline: { cls: 'bg-red-100 text-red-600', icon: WifiOff, txt: 'Hors ligne' },
    unregistered: { cls: 'bg-gray-100 text-gray-500', icon: WifiOff, txt: 'Jamais connectée' },
  };
  const c = map[status] || map.unregistered;
  const Icon = c.icon;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}><Icon className="w-3 h-3" />{c.txt}</span>;
};

const KioskConfig = ({ slug, hotelName, onBack }) => {
  const { authFetch } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState('fr');
  const [devices, setDevices] = useState([]);
  const [savingDest, setSavingDest] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // Add-destination form
  const [newDest, setNewDest] = useState({ name: '', address: '', lat: null, lng: null, icon: 'map' });
  const [newDeviceLabel, setNewDeviceLabel] = useState('');

  // Device dialogs
  const [readerDialog, setReaderDialog] = useState(null); // { device, mode: 'register'|'link' }
  const [readerForm, setReaderForm] = useState({ code: '', addressLine1: '', city: '', postalCode: '', country: 'FR', readerId: '' });
  const [readerBusy, setReaderBusy] = useState(false);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await authFetch(`/api/admin/kiosk/${slug}/config`);
      if (res.status === 404) { setNotConfigured(true); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDestinations(data.destinations || []);
      setDefaultLanguage(data.default_language || 'fr');
      setDevices(data.devices || []);
    } catch { toast.error('Erreur de chargement de la configuration'); }
    finally { if (initial) setLoading(false); }
  }, [authFetch, slug]);

  useEffect(() => { load(true); }, [load]);

  // Refresh only the devices list (no full-page spinner, keeps the active tab)
  const refreshDevices = useCallback(async () => {
    try {
      const res = await authFetch(`/api/admin/kiosk/${slug}/devices`);
      if (res.ok) setDevices(await res.json());
    } catch {}
  }, [authFetch, slug]);

  // ── Destinations ──
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= destinations.length) return;
    const arr = [...destinations];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setDestinations(arr);
  };
  const onDrop = (i) => {
    if (dragIndex === null || dragIndex === i) return;
    const arr = [...destinations];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(i, 0, moved);
    setDestinations(arr);
    setDragIndex(null);
  };
  const toggleField = (i, field) => {
    const arr = [...destinations];
    arr[i] = { ...arr[i], [field]: !arr[i][field] };
    setDestinations(arr);
  };
  const removeDest = (i) => setDestinations(destinations.filter((_, idx) => idx !== i));

  const addDest = () => {
    if (!newDest.name.trim()) { toast.error('Nom de destination requis'); return; }
    if (newDest.lat == null || newDest.lng == null) { toast.error('Sélectionnez une adresse (coordonnées manquantes)'); return; }
    setDestinations([...destinations, { ...newDest, name: newDest.name.trim(), highlighted: false, hidden: false }]);
    setNewDest({ name: '', address: '', lat: null, lng: null, icon: 'map' });
    toast.success('Destination ajoutée (pensez à Enregistrer)');
  };

  const saveDestinations = async () => {
    setSavingDest(true);
    try {
      const res = await authFetch(`/api/admin/kiosk/${slug}/destinations`, {
        method: 'PUT',
        body: JSON.stringify({ destinations: destinations.map(d => ({
          name: d.name, address: d.address || '', lat: d.lat, lng: d.lng,
          icon: d.icon || 'map', highlighted: !!d.highlighted, hidden: !!d.hidden,
        })) }),
      });
      if (!res.ok) throw new Error();
      toast.success('Destinations enregistrées');
    } catch { toast.error('Échec de l\'enregistrement'); }
    finally { setSavingDest(false); }
  };

  // ── Settings ──
  const saveLanguage = async (lang) => {
    setDefaultLanguage(lang);
    try {
      const res = await authFetch(`/api/admin/kiosk/${slug}/settings`, {
        method: 'PUT', body: JSON.stringify({ default_language: lang }),
      });
      if (!res.ok) throw new Error();
      toast.success('Langue par défaut mise à jour');
    } catch { toast.error('Échec'); }
  };

  // ── Devices ──
  const addDevice = async () => {
    const label = newDeviceLabel.trim() || 'Borne';
    try {
      const res = await authFetch(`/api/admin/kiosk/${slug}/devices`, {
        method: 'POST', body: JSON.stringify({ label }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail); }
      toast.success('Borne créée');
      setNewDeviceLabel('');
      refreshDevices();
    } catch (e) { toast.error(e.message || 'Échec de création'); }
  };

  const deleteDevice = async (device) => {
    if (!window.confirm(`Supprimer la borne ${device.device_code} ?`)) return;
    const res = await authFetch(`/api/admin/kiosk/devices/${device.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Borne supprimée'); refreshDevices(); } else toast.error('Échec');
  };

  const refreshStatus = async (device) => {
    const res = await authFetch(`/api/admin/kiosk/devices/${device.id}/reader-status`);
    if (res.ok) {
      const s = await res.json();
      toast.message(`Borne ${device.device_code}`, {
        description: s.registered ? `Reader ${s.reader_status || '—'} · ${s.device_type || ''}` : 'Aucun lecteur rattaché',
      });
    }
  };

  const openReaderDialog = (device, mode) => {
    setReaderForm({ code: '', addressLine1: '', city: '', postalCode: '', country: 'FR', readerId: '' });
    setReaderDialog({ device, mode });
  };

  const submitReader = async () => {
    const { device, mode } = readerDialog;
    setReaderBusy(true);
    try {
      let res;
      if (mode === 'link') {
        res = await authFetch(`/api/admin/kiosk/devices/${device.id}/link-reader`, {
          method: 'POST', body: JSON.stringify({ readerId: readerForm.readerId.trim() }),
        });
      } else {
        res = await authFetch(`/api/admin/kiosk/devices/${device.id}/register-reader`, {
          method: 'POST', body: JSON.stringify({
            code: readerForm.code.trim(), addressLine1: readerForm.addressLine1.trim(),
            city: readerForm.city.trim(), postalCode: readerForm.postalCode.trim(), country: readerForm.country.trim() || 'FR',
          }),
        });
      }
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail); }
      toast.success('Lecteur Stripe rattaché');
      setReaderDialog(null);
      refreshDevices();
    } catch (e) { toast.error(e.message || 'Échec du rattachement'); }
    finally { setReaderBusy(false); }
  };

  const unlinkReader = async (device) => {
    if (!window.confirm('Détacher le lecteur actuel (en cas de panne / remplacement) ?')) return;
    const res = await authFetch(`/api/admin/kiosk/devices/${device.id}/unlink-reader`, { method: 'POST' });
    if (res.ok) { toast.success('Lecteur détaché — vous pouvez en rattacher un nouveau'); refreshDevices(); } else toast.error('Échec');
  };

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 -m-4 lg:-m-6 p-4 lg:p-6 space-y-6" data-testid="kiosk-config">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800" data-testid="kiosk-config-back">
        <ArrowLeft className="w-4 h-4" /> Retour à la gestion des hôtels
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900" data-testid="kiosk-config-title">Configuration Borne — {hotelName}</h1>
        <p className="text-gray-500 text-sm mt-1">Slug : <code className="bg-gray-100 px-1.5 py-0.5 rounded">{slug}</code></p>
      </div>

      {notConfigured ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800" data-testid="kiosk-not-configured">
          Cet hôtel n'a pas encore de fiche kiosque (aucune borne). Il doit d'abord être créé via l'inscription <code>/kiosk</code> (ou par import), afin de disposer de ses coordonnées GPS.
        </div>
      ) : (
        <Tabs defaultValue="destinations" className="w-full">
          <TabsList data-testid="kiosk-config-tabs">
            <TabsTrigger value="destinations" data-testid="tab-destinations">Destinations</TabsTrigger>
            <TabsTrigger value="devices" data-testid="tab-devices">Bornes</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* ── DESTINATIONS ── */}
          <TabsContent value="destinations" className="space-y-4 mt-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100" data-testid="destinations-list">
              {destinations.length === 0 && <p className="p-6 text-gray-400 text-sm">Aucune destination. Ajoutez-en une ci-dessous.</p>}
              {destinations.map((d, i) => {
                const Icon = ICONS[d.icon] || MapPin;
                return (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(i)}
                    className={`flex items-center gap-3 px-4 py-3 ${d.hidden ? 'opacity-50' : ''}`}
                    data-testid={`dest-row-${i}`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab flex-shrink-0" />
                    <div className="flex flex-col">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30" data-testid={`dest-up-${i}`}><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === destinations.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30" data-testid={`dest-down-${i}`}><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-emerald-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{d.name}</p>
                        {d.highlighted && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Star className="w-3 h-3 mr-1" />Mise en avant</Badge>}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{d.address}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                        <Star className="w-3.5 h-3.5" />
                        <Switch checked={!!d.highlighted} onCheckedChange={() => toggleField(i, 'highlighted')} data-testid={`dest-highlight-${i}`} />
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                        {d.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <Switch checked={!d.hidden} onCheckedChange={() => toggleField(i, 'hidden')} data-testid={`dest-visible-${i}`} />
                      </label>
                      <button onClick={() => removeDest(i)} className="text-red-400 hover:text-red-600" data-testid={`dest-delete-${i}`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add destination */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3" data-testid="add-destination">
              <p className="text-sm font-semibold text-gray-700">Ajouter une destination</p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <div>
                  <Label className="text-xs text-gray-500">Rechercher une adresse (Google)</Label>
                  <PlacesAutocomplete
                    value={newDest.address}
                    onChange={(p) => setNewDest(prev => ({
                      ...prev,
                      address: p.address,
                      name: prev.name || (p.address || '').split(',')[0],
                      lat: p.latitude, lng: p.longitude,
                    }))}
                    placeholder="Aéroport, gare, lieu…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="w-full md:w-40">
                  <Label className="text-xs text-gray-500">Catégorie</Label>
                  <Select value={newDest.icon} onValueChange={(v) => setNewDest(prev => ({ ...prev, icon: v }))}>
                    <SelectTrigger className="text-gray-900" data-testid="new-dest-icon"><SelectValue /></SelectTrigger>
                    <SelectContent className="text-gray-900">{ICON_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Nom affiché</Label>
                <Input value={newDest.name} onChange={(e) => setNewDest(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex. Orly (ORY)" data-testid="new-dest-name" />
              </div>
              <Button onClick={addDest} variant="outline" className="text-gray-700" data-testid="add-dest-btn"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveDestinations} disabled={savingDest} className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="save-destinations-btn">
                {savingDest ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Enregistrer les destinations
              </Button>
            </div>
          </TabsContent>

          {/* ── DEVICES ── */}
          <TabsContent value="devices" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-sm text-gray-500">Chaque borne physique a son propre Terminal ID et son lecteur Stripe.</p>
              <div className="flex gap-2">
                <Input value={newDeviceLabel} onChange={(e) => setNewDeviceLabel(e.target.value)} placeholder="Nom de la borne (ex. Lobby)" className="w-52" data-testid="new-device-label" />
                <Button onClick={addDevice} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0" data-testid="add-device-btn"><Plus className="w-4 h-4 mr-1" /> Ajouter une borne</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="devices-list">
              {devices.length === 0 && <p className="text-gray-400 text-sm">Aucune borne. Ajoutez-en une.</p>}
              {devices.map((dev) => (
                <div key={dev.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3" data-testid={`device-card-${dev.device_code}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center"><Monitor className="w-5 h-5 text-emerald-400" /></div>
                      <div>
                        <p className="font-bold text-gray-900">{dev.device_code}</p>
                        <p className="text-xs text-gray-500">{dev.label}</p>
                      </div>
                    </div>
                    <StatusBadge status={dev.status} />
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 bg-gray-50 rounded-lg p-3">
                    <p><span className="text-gray-400">Reader ID :</span> <code>{dev.stripe_terminal_reader_id || '—'}</code></p>
                    <p><span className="text-gray-400">Location ID :</span> <code>{dev.stripe_terminal_location_id || '—'}</code></p>
                    <p><span className="text-gray-400">Dernière connexion :</span> {dev.last_seen_at ? new Date(dev.last_seen_at).toLocaleString('fr-FR') : 'Jamais'}</p>
                    <p className="pt-1"><span className="text-gray-400">Lien borne :</span> <code>/kiosk/{slug}?device={dev.device_code}</code></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!dev.stripe_terminal_reader_id ? (
                      <>
                        <Button size="sm" onClick={() => openReaderDialog(dev, 'register')} className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid={`register-reader-${dev.device_code}`}><CreditCard className="w-3.5 h-3.5 mr-1" /> Rattacher un lecteur</Button>
                        <Button size="sm" variant="outline" className="text-gray-700" onClick={() => openReaderDialog(dev, 'link')} data-testid={`link-reader-${dev.device_code}`}><Link2 className="w-3.5 h-3.5 mr-1" /> Lier un ID existant</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => unlinkReader(dev)} className="text-amber-600 border-amber-300" data-testid={`replace-reader-${dev.device_code}`}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Remplacer le lecteur</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => refreshStatus(dev)} data-testid={`refresh-reader-${dev.device_code}`}><RefreshCw className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteDevice(dev)} className="text-red-500 ml-auto" data-testid={`delete-device-${dev.device_code}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── SETTINGS ── */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-md space-y-3">
              <div className="flex items-center gap-2 text-gray-700"><Languages className="w-5 h-5 text-emerald-600" /><p className="font-semibold">Langue par défaut de la borne</p></div>
              <p className="text-xs text-gray-500">Le client peut toujours changer de langue manuellement sur la borne (FR / EN / RU).</p>
              <Select value={defaultLanguage} onValueChange={saveLanguage}>
                <SelectTrigger className="text-gray-900" data-testid="default-language-select"><SelectValue /></SelectTrigger>
                <SelectContent className="text-gray-900">{LANGS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Reader dialog */}
      <Dialog open={!!readerDialog} onOpenChange={(o) => !o && setReaderDialog(null)}>
        <DialogContent className="text-gray-900" data-testid="reader-dialog">
          <DialogHeader>
            <DialogTitle>{readerDialog?.mode === 'link' ? 'Lier un lecteur existant' : 'Rattacher un lecteur Stripe'}</DialogTitle>
          </DialogHeader>
          {readerDialog?.mode === 'link' ? (
            <div className="space-y-3">
              <Label className="text-sm">Reader ID Stripe (tmr_...)</Label>
              <Input value={readerForm.readerId} onChange={(e) => setReaderForm(p => ({ ...p, readerId: e.target.value }))} placeholder="tmr_xxx" data-testid="link-reader-id" />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Code de pairing (affiché sur le terminal)</Label>
                <Input value={readerForm.code} onChange={(e) => setReaderForm(p => ({ ...p, code: e.target.value }))} placeholder="ex. super-content-greatly" data-testid="reader-code" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label className="text-sm">Adresse</Label><Input value={readerForm.addressLine1} onChange={(e) => setReaderForm(p => ({ ...p, addressLine1: e.target.value }))} data-testid="reader-address" /></div>
                <div><Label className="text-sm">Ville</Label><Input value={readerForm.city} onChange={(e) => setReaderForm(p => ({ ...p, city: e.target.value }))} data-testid="reader-city" /></div>
                <div><Label className="text-sm">Code postal</Label><Input value={readerForm.postalCode} onChange={(e) => setReaderForm(p => ({ ...p, postalCode: e.target.value }))} data-testid="reader-postal" /></div>
                <div><Label className="text-sm">Pays</Label><Input value={readerForm.country} onChange={(e) => setReaderForm(p => ({ ...p, country: e.target.value }))} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="text-gray-700" onClick={() => setReaderDialog(null)}>Annuler</Button>
            <Button onClick={submitReader} disabled={readerBusy} className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="reader-submit">
              {readerBusy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null} Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KioskConfig;
