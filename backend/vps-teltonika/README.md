# Teltonika TCP Gateway

Décodeur TCP pour traceurs GPS Teltonika (FMB/FMC) — reçoit les données Codec8/Codec8E et les envoie au webhook Emergent.

## Architecture

```
Teltonika FMB920 ──TCP:5055──► VPS (ce script) ──HTTP POST──► Emergent Backend
                                                               /api/fleet/gps/webhook
```

## Fichiers

| Fichier | Description |
|---------|-------------|
| `teltonika-decoder.js` | Serveur TCP principal (décodeur Codec8/8E) |
| `test-simulator.js` | Simulateur de traceur pour tests |
| `.env.example` | Template de configuration |
| `install.sh` | Script d'installation Ubuntu 22.04 |

## Installation rapide (Ubuntu 22.04)

```bash
# 1. Copier les fichiers sur votre VPS
scp -r vps-teltonika/ user@votre-vps:/tmp/

# 2. Sur le VPS:
cd /tmp/vps-teltonika
chmod +x install.sh
sudo ./install.sh

# 3. Configurer
sudo nano /opt/teltonika-gateway/.env

# 4. Démarrer
sudo systemctl start teltonika-gateway
```

## Installation manuelle

```bash
# Copier les fichiers
mkdir -p /opt/teltonika-gateway
cp teltonika-decoder.js test-simulator.js /opt/teltonika-gateway/
cp .env.example /opt/teltonika-gateway/.env

# Configurer
nano /opt/teltonika-gateway/.env

# Lancer
cd /opt/teltonika-gateway
node teltonika-decoder.js
```

## Test avec le simulateur

```bash
# Terminal 1: Lancer le décodeur
node teltonika-decoder.js

# Terminal 2: Lancer le simulateur
node test-simulator.js localhost 5055
```

Le simulateur envoie:
- 1 handshake IMEI (350424063817592)
- 1 paquet Codec8 avec 2 positions GPS (Nice, France)
- 1 paquet Codec8E avec 1 position GPS

## Configuration FMB920

Dans le Teltonika Configurator :
1. **GPRS → Server Settings**
   - Domain: `<IP de votre VPS>`
   - Port: `5055`
   - Protocol: `TCP`
2. **GPRS → Data Acquisition**
   - Codec: `Codec8` ou `Codec8 Extended`

Ou par SMS :
```
setparam 2004:<IP_VPS>;2005:5055
```

## Commandes utiles

```bash
# Voir les logs en temps réel
sudo journalctl -u teltonika-gateway -f

# Redémarrer le service
sudo systemctl restart teltonika-gateway

# Vérifier le statut
sudo systemctl status teltonika-gateway

# Arrêter
sudo systemctl stop teltonika-gateway
```

## Format de données envoyé au webhook

```json
{
  "imei": "350424063817592",
  "positions": [
    {
      "timestamp": "2026-02-15T14:30:00.000Z",
      "lat": 43.2965,
      "lng": 5.3698,
      "speed": 45,
      "heading": 180,
      "altitude": 12,
      "satellites": 8,
      "ignition": true
    }
  ]
}
```
