# Guida Deploy WebApp "Fiera delle Competenze" su Hetzner Cloud

---
## Step 0 — Prerequisiti

- Un account Hetzner Cloud → https://console.hetzner.cloud
- Il pacchetto del tuo progetto Docker completo (infra/, backend/, frontend/)
- Un terminale (es. PowerShell o Git Bash su Windows)



## Step 1 — Creazione VPS su Hetzner

- Vai su [https://console.hetzner.cloud](https://console.hetzner.cloud)
- Crea una nuova VPS con queste impostazioni consigliate:
  - **Location:** Falkenstein (FSN1)
  - **Image:** Ubuntu 22.04 LTS ×64
  - **Type:** CX22 (2 vCPU, 2 GB RAM, 20 GB SSD)
  - **Volume:** lascia vuoto (disco OS basta)
  - **SSH Keys:** seleziona o carica la tua chiave SSH pubblica (contenuto di `~/.ssh/id_ed25519.pub`)
  - **User data:** lascia vuoto
  - **Name:** fiera-prod

Se non hai già l' SSH, crealo e poi ricopialo in hetzer:

```bash
 ssh-keygen -t ed25519 -C "fiera-hetzner"
 ```

Conferma la fingerprint digitando yes alla prima connessione

Apri il file ~/.ssh/id_ed25519.pub, copia il contenuto e incollalo in Hetzner → Add SSH Key

## Step 1.1 — Connessione SSH alla VPS

Connettiti al server, conferma il fingerprint indicando YES

```bash
ssh root@<IP_DEL_SERVER>
```

## Step 2 — Aggiornamento sistema operativo

```bash
sudo apt update && sudo apt upgrade -y

```
## Step 3 — Installazione dipendenze base

```bash
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

```

## Step 4 — Aggiunta chiave GPG Docker e repository Docker

1. Scarica e salva la chiave GPG di Docker:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
2. Aggiungi il repository Docker alla lista di APT:
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

3. Aggiorna ancora la cache di APT (così vede il nuovo repo):
```bash
sudo apt update
```

## Step 5 — Installa Docker Engine e Docker Compose

1. Installa Docker Engine e CLI
```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io
```
2. Installa Docker Compose (plugin standalone)

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
```
```basudo chmod +x /usr/local/bin/docker-compose
```
3. Verifica le versioni
```bash

```
4. (Opzionale ma consigliato) Permetti al tuo utente di usare Docker senza sudo
```bash

```

```bash

```

## Step 6 — Aggiornamento sistema operativo

```bash

```

## Step 7 — Aggiornamento sistema operativo
