# Visualizzazione configurabile di dati geolocalizzati

Applicazione web per la visualizzazione su mappa di dati aziendali geolocalizzati,
basata su OpenStreetMap e Leaflet.

Il progetto nasce dall'esigenza di rendere consultabile su mappa l'informazione
geografica già presente nei gestionali aziendali, che di norma resta confinata in
un campo indirizzo all'interno di una tabella. I dati possono essere aggregati e
visualizzati a diversi livelli amministrativi (continenti, nazioni, regioni,
province, comuni) fino ad arrivare ai singoli punti, con modalità di
rappresentazione scelte dall'utilizzatore.

## Requisiti

- **PHP 7.4 o superiore** (per il server locale e il salvataggio della configurazione)
- Un browser moderno con supporto ai moduli ES6
- Connessione a internet: le tile cartografiche e alcune librerie sono caricate da CDN

Non serve un web server completo: è sufficiente il server integrato di PHP.

## Avvio della simulazione

Dalla cartella del progetto:

```bash
php -S localhost:8000
```

Poi aprire nel browser:

```
http://localhost:8000/index.php
```

> **Importante:** l'applicazione non funziona aprendo i file con un doppio click.
> I moduli JavaScript e il caricamento dei dati richiedono il protocollo HTTP;
> con `file://` il browser li blocca per motivi di sicurezza.

### Flusso di utilizzo

1. **`index.php`** — pagina di configurazione: si scelgono le serie da
   visualizzare, le modalità di rappresentazione e le opzioni generali della mappa.
2. Al salvataggio la configurazione viene scritta in **`setup/config.json`** e le
   eventuali icone personalizzate caricate in `images/`.
3. **`PaginaMappa.php`** — la mappa vera e propria, che legge la configurazione
   appena salvata e i dati di `NAVmaps.json`.

Per rivedere la mappa senza rifare la configurazione basta aprire direttamente
`http://localhost:8000/PaginaMappa.php`.

## Struttura del progetto

```
├── index.php              Pagina di configurazione
├── PaginaMappa.php        Pagina della mappa
├── NAVmaps.json           Dati di input (esempio incluso)
├── Mappe/                 Confini amministrativi in formato TopoJSON
├── images/                Icone dei marker
├── setup/
│   ├── config.json        Configurazione attiva (generata)
│   ├── salva_config.php   Validazione e scrittura della configurazione
│   └── change.js          Logica dei controlli della pagina di configurazione
└── js/
    ├── Creamappa.js               Punto di ingresso: carica dati e configurazione
    ├── InizializzazioneMappa.js   Costruzione mappa, layer control, drill-down
    ├── OrganizzaDati.js           Aggregazione per livello e calcolo percentuali
    ├── MostraDati.js              Caricamento TopoJSON e rendering delle aree
    ├── ElementoGrafico.js         Rappresentazione delle serie esclusive
    ├── ElementoGraficoComparabile.js  Rappresentazione delle serie comparabili
    ├── Punti.js                   Livello di dettaglio dei singoli record
    ├── Zoom.js                    Corrispondenza zoom/livello e ridimensionamento
    └── leaflet-starcircle.js      Estensione Leaflet per triangoli e quadrati
```

## Formato dei dati in ingresso

`NAVmaps.json` è un array di record. Ogni record rappresenta un punto e contiene
i riferimenti geografici, fino a cinque valori numerici e i relativi metadati:

```json
{
  "CN_D_RAGCOMP": "NOME AZIENDA",
  "GEO_LAT": 45.0334222,
  "GEO_LNG": 7.6205909,
  "CONTINENTE": "EUROPA",
  "NAZIONE": "IT",
  "REGIONE": "01",
  "PROV": "001",
  "COMUNE": "272",
  "LBL1": "2024", "UM1": "EUR", "VAL1": 800.016,
  "LBL2": "2025", "UM2": "EUR", "VAL2": 0
}
```

- `LBL` è l'etichetta della serie, usata come nome nel controllo dei livelli
- `UM` è l'unità di misura, condivisa da tutti i record della stessa serie
- `VAL` è il valore da rappresentare

I record con gli stessi riferimenti geografici vengono sommati automaticamente.
Non è necessario che tutti i campi siano valorizzati: un dato incompleto produce
una rappresentazione meno dettagliata, non un errore.

## Configurazione

La configurazione è separata dai dati e risiede in `setup/config.json`. Si
compila dalla pagina `index.php`, ma può anche essere modificata a mano.

### Opzioni per ciascuna serie

| Campo | Descrizione |
|---|---|
| `usa` | se la serie deve essere visualizzata |
| `comparabile` | la serie può essere mostrata insieme alle altre comparabili |
| `esclusivo` | la serie può essere mostrata solo da sola |
| `colore_confini` | colore del bordo delle aree |
| `modalita` | tipo di rappresentazione (vedi tabella sotto) |
| `icona` | percorso dell'icona, solo per la modalità `mp` |

### Modalità di rappresentazione

**Serie esclusive** (una alla volta):

| Codice | Rappresentazione |
|---|---|
| `a` | Evidenzia area: l'area viene colorata secondo una scala a soglie |
| `mp` | Marker personalizzato: icona caricata dall'utente |
| `cm` | Marker cerchio |
| `t` | Marker triangolo |
| `q` | Marker quadrato |

**Serie comparabili** (più di una insieme), configurate in `comparable_options`:

| Codice | Rappresentazione |
|---|---|
| `c` | Cerchi concentrici |
| `m` | Marker colorati |

In tutte le modalità la dimensione dell'elemento è proporzionale alla percentuale
rappresentata, e viene ricalcolata a ogni variazione di zoom.

### Opzioni generali

| Campo | Valori | Descrizione |
|---|---|---|
| `livello_massimo` | continenti … comuni | livello più generale esplorabile |
| `livello_minimo` | continenti … comuni | livello più specifico esplorabile |
| `livello_di_paragone` | `superiore`, `massimo` | rispetto a cosa si calcolano le percentuali |
| `drill_down` | `no`, `automatico`, `manuale` | modalità di navigazione tra livelli |
| `mostra_area` | `true`, `false` | riempimento di sfondo delle aree |
| `mostra_dettagli` | `true`, `false` | disponibilità del livello dei singoli punti |

## Navigazione tra livelli

Le tre modalità di `drill_down` sono alternative tra loro:

- **`no`** — la mappa resta sul livello massimo impostato; lo zoom cambia solo la
  dimensione degli elementi.
- **`automatico`** — il livello segue lo zoom: allargando si sale verso i
  continenti, avvicinandosi si scende fino ai comuni e poi ai singoli punti.
- **`manuale`** — si scende con un doppio click sulla mappa e si risale con il
  pulsante in alto a sinistra, che riporta anche il livello corrente. Il click
  destro funziona come scorciatoia per risalire.

Indipendentemente dalla modalità scelta, il livello **Dettagli** resta
attivabile in qualsiasi momento dalla casella nel controllo dei livelli, se
abilitato in configurazione.

## Basi cartografiche

Sono disponibili due sfondi, selezionabili dal controllo in alto a sinistra:
la cartografia standard di OpenStreetMap e una vista satellitare (Esri World
Imagery) con le etichette dei confini sovrapposte.

## Limitazioni note

- I record privi dei riferimenti geografici richiesti dal livello minimo
  configurato non vengono rappresentati nel livello di dettaglio. È una scelta
  deliberata: rappresentarli comunque darebbe una precisione che il dato non ha.
- I dataset cartografici in `Mappe/` devono usare il campo `leo_id` come
  identificativo, secondo la codifica ISO 3166-2.
- L'applicazione utilizza i server di tile pubblici di OpenStreetMap, soggetti a
  limiti d'uso: non è adatta così com'è a un traffico elevato.

## Licenze

- Dati cartografici: © OpenStreetMap contributors, ODbL
- Leaflet: BSD-2-Clause
- Leaflet.StarCircle: estensione della community
- Tile satellitari: © Esri
