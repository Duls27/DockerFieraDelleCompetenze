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

Scarica Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
```
Rendi eseguibile il file
```bash
sudo chmod +x /usr/local/bin/docker-compose
```
3. Verifica le versioni
```bash
docker --version
docker-compose --version
```
4. (Opzionale ma consigliato) Permetti al tuo utente di usare Docker senza sudo
```bash
sudo usermod -aG docker $USER
newgrp docker        # applica subito il gruppo senza scollegarti
```

## Step 6 — Clona il progetto sulla macchina
 1. Posizionarti nella home directory
```bash
cd ~
```
2. Clonare il progetto da GitHub
```bash
git clone https://github.com/Duls27/DockerFieraDelleCompetenze.git

```
3. Vai nella cartella infra del progetto
```bash
cd DockerFieraDelleCompetenze/infra
```
4. Crea il file .env da .env.example

Caricalo direttamente già compilato (da powershell o bash), l'IP inserito è di esempio
```bash
scp "C:\Users\simon\Desktop\.env" root@91.99.153.69:/root/DockerFieraDelleCompetenze/infra/.env
```
oopure crealo da .env.example
```bash
cp .env.example .env
nano .env
```
Modifica solo le variabili di produzione, ad esempio:

- PGUSER=postgres
- PGPASSWORD=
- PGHOST=db
- PGPORT=5432
- PGDATABASE=

- JWT_SECRET=

//COnfigurazione Brevo per email
- SMTP_HOST=smtp-relay.brevo.com
- SMTP_PORT=587
- SMTP_USER=
- SMTP_PASS=
- EMAIL_FROM="Fiera delle Competenze <fieradellecompetenzelombardia@gmail.com>"

//Frontend React (IP pubblico della macchina creata in precedenza)
- REACT_APP_API_BASE_URL=http://<IP_PUBBLICO>:5000

5. Modifica il file di creazione del DB, ed inserisci la tua password personale per l'invio dell'email dell'amministratore.

Entra nella folder db
```bash
cd ~/DockerFieraDelleCompetenze/infra/db 
```
Apri con nano il file init.sql
```bash
nano init.sql
```
Modificala riga ed inserisci la tua email!
```sql
INSERT INTO amministratori
        (nome,  cognome, email, username, password)
VALUES  ('Super', 'Admin', 'tua.email@gmail.com', 'super.admin', '');
```

6. Lancia il build e avvia tutti i servizi con un solo comando
Torna nella folder se non sei più li
```bash
cd ~/DockerFieraDelleCompetenze/infra 
```
Lancia docker compose e build
```bash
docker compose up -d --build
```
Cosa succede ora (step-by-step)?
1. Docker scarica (o aggiorna) l’immagine postgres:15-alpine.
2. Costruisce le immagini del backend e del frontend dai tuoi Dockerfile.
3. Esegue i tre container:
- db (Postgres)
- backend (Node/Express)
- frontend (React + nginx)

⚠️ La primissima build può richiedere qualche minuto—soprattutto lo step npm install / npm run build del frontend.

## Step 7 — Verifica funzionamento servizi

1. Controlla che i container siano attivi:
```bash
docker compose ps
```
Dovresti vedere qualcosa del genere:
```bash
NAME                       SERVICE    STATUS    PORTS
fiera-db-1                db         Up        5432/tcp
fiera-backend-1           backend    Up        0.0.0.0:5000->5000/tcp
fiera-frontend-1          frontend   Up        0.0.0.0:3000->80/tcp
```

2. Prova da browser
- Frontend React:
- http://<IL_TUO_IP_PUBBLICO>:3000

Se tutto va bene, dovresti vedere la tua interfaccia.

- Backend API test (opzionale):
- http://<IL_TUO_IP_PUBBLICO>:5000
oppure prova una rotta nota come:

```bash
NAME                       SERVICE    STATUS    PORTS
curl http://localhost:5000/amministratori
```

3. Invia prima password admin (se non fatto)
Senza questa non potrai creare gli altri amministratori, devi aver prima modificato l'email negli steo precdenti, step 6.5
```bash
curl -X POST http://localhost:5000/amministratori/send-password/1
```
4. Verifica funzionamento login
Dalla pagina web, prova a loggarti con l’admin che hai creato.
Se ottieni errore login, controlla:
- che REACT_APP_API_BASE_URL nel frontend punti a http://<IP>:5000
- che il backend sia effettivamente attivo (docker compose logs backend)
- eventuali errori da F12 → Console nel browser

5. (Facoltativo) Accesso a Postgres da remoto

Ora che esponi 5432, puoi connetterti da pgAdmin o DBeaver dal tuo PC con:
```bash
# === connect_db.sh =========================================
PGAdmin 4
# Parametri di connessione
export PGHOST="91.99.153.69"           # IP pubblico della VPS
export PGPORT="5432"                   # porta mappata nel docker-compose
export PGDATABASE="fieradellecompetenze2025"
export PGUSER="postgres"
export PGPASSWORD="<<<la-password-che-hai-messo-nel-.env>>>"
# ==============================================================
```


# Caricare modifiche una volta effettuato il deploy

1. Connettersi al server Hetzner via SSH
```bash
ssh root@<IP-del-server>
```
2. Entrare nella cartella del progetto
```bash
cd /percorso/del/progetto
```
3. Fermare i container Docker attivi
```bash
docker-compose down
```
Se vi sono grossi cambiamenti, che intaccanoa nche il db allora bisognerà eliminare proprioi container.
```bash
docker-compose down -v
```
Se necessario anche le immagini
```bash
docker image prune -a
```

4. Aggiornare il codice sorgente
E' possbile o riclonare tutto il prgetto da git, oppure iniettare i file cmabiati nelle cartelle corrette
In caso si ricarichiil progetto docker, dovrai ricreare il file .env (vedi punto 4 sezione precedente)
```bash
git pull origin main
```
5. Ricostruire l’immagine Docker (se hai modificato il Dockerfile o codice sorgente)
```bash
docker-compose build
```
6. Riavviare i container
```bash
docker-compose up -d
```
7. Rifare verfiche funzionamento come spieagto sopra
