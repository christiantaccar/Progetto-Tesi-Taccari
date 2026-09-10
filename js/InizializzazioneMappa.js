import { organizzaDati, organizzaLabel } from './OrganizzaDati.js';
import { mostraDatiLivello2 } from "./MostraDati.js";
import { creaLayerDettagli, mostraLivelloInferiore } from "./Punti.js";
import {
    ricavazoomDaLivello,
    aggiornaMarkerZoom,
    getLivelloDaZoom,
    getLivelloSuccessivo,
    getLivelloPrecedente
} from "./Zoom.js";

var map = null;
var ultimoLivelloCaricato = null;
var zoomlivello = null;
var sottoLivelloMinimo = false;

export async function inizializzaMappa(config, dati, idDiv) {
    const livelloIniziale = config.livello_massimo;
    const zoomIniziale = ricavazoomDaLivello(livelloIniziale);
    zoomlivello = ricavazoomDaLivello(livelloIniziale);

    map = L.map(idDiv).setView([0, 0], zoomIniziale);
    map.setMinZoom(2);

    const data = organizzaDati(dati, config);
    const label = organizzaLabel(dati);

    const objectsArray = Object.values(config.objects);
    const layers = objectsArray.map(() => L.layerGroup());
    const layersAttivi = objectsArray
        .map((obj, i) => obj.usa ? i : -1)
        .filter(i => i !== -1);

    ultimoLivelloCaricato = livelloIniziale;

    // MAPPE DI BASE
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Tiles &copy; Esri' }
    );

    const etichette = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
    );

    const satelliteEtichette = L.layerGroup([satellite, etichette]);

    // CENTRA MAPPA E CARICA LIVELLO INIZIALE
    const zoom = map.getZoom();
    const bounds = await mostraDatiLivello2(
        layersAttivi, layers, livelloIniziale, data, label, config, zoom
    );

    if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: zoomIniziale });
    }

    // LAYER CONTROL
    const complays = {};
    const execlays = {};
    const l = L.layerGroup();
    let i = 0;

    for (let obj in config.objects) {
        if (config.objects[obj].usa) {
            const nome = etichettaUnivoca(dati[0][`LBL${i + 1}`], i + 1, execlays, complays);

            if (config.objects[obj].comparabile && config.comparable_options.esclusivo) {
                l.addLayer(layers[i]);
            }
            else if (config.objects[obj].esclusivo) execlays[nome] = layers[i];
            else complays[nome] = layers[i];
        }
        i++;
    }

    if (l.getLayers().length > 0) execlays["comparabili"] = l;

    // Livello dettagli: checkbox indipendente, attivabile a qualsiasi zoom.
    // Compare solo se abilitato in configurazione (default: attivo).
    if (config.mostra_dettagli !== false) {
        complays["Dettagli"] = creaLayerDettagli(data);
    }

    // Mappe di base: controllo dedicato, altrimenti finirebbero nello stesso
    // gruppo radio delle serie esclusive escludendosi a vicenda
    const mappeBase = {
        "OpenStreetMap": osm,
        "Satellite": satelliteEtichette
    };

    L.control.layers(mappeBase, {}, { position: 'topleft' }).addTo(map);

    // Serie: esclusive come gruppo radio, comparabili come checkbox
    L.control.layers(execlays, complays, { collapsed: false }).addTo(map);

    // senza una selezione iniziale il gruppo radio resta vuoto e la mappa appare priva di dati
    const primaEsclusiva = Object.values(execlays)[0];
    if (primaEsclusiva) primaEsclusiva.addTo(map);

    // le comparabili sono checkbox: vanno attivate esplicitamente
    for (let nome in complays) {
        if (nome !== "Dettagli") complays[nome].addTo(map);
    }

    const lvlminimo = config.livello_minimo;
    const modalitaDrill = normalizzaDrillDown(config.drill_down);

    // DRILL-DOWN AUTOMATICO: il livello segue lo zoom
    if (modalitaDrill === "automatico") {
        let zoomTimeout;

        map.on("zoomend", () => {
            clearTimeout(zoomTimeout);

            zoomTimeout = setTimeout(() => {
                gestisciCambioZoom(
                    layersAttivi, layers, livelloIniziale, lvlminimo, data, label, config
                );
            }, 150);
        });
    }

    // DRILL-DOWN MANUALE: doppio click scende, pulsante o click destro risale
    if (modalitaDrill === "manuale") {
        map.doubleClickZoom.disable();

        const controlloRisali = creaControlloRisali(() => risali());
        controlloRisali.addTo(map);

        async function scendi() {
            const succ = getLivelloSuccessivo(ultimoLivelloCaricato, lvlminimo);

            if (succ) {
                await cambiaLivello(succ, layersAttivi, layers, data, label, config);
            } else if (!sottoLivelloMinimo) {
                // già al livello minimo: si scende ai singoli punti
                sottoLivelloMinimo = true;
                mostraLivelloInferiore(layersAttivi, layers, data, label, config);
            }

            aggiornaStatoRisali();
        }

        async function risali() {
            if (sottoLivelloMinimo) {
                // dai punti si risale al livello minimo
                await cambiaLivello(lvlminimo, layersAttivi, layers, data, label, config);
                aggiornaStatoRisali();
                return;
            }

            const prec = getLivelloPrecedente(ultimoLivelloCaricato, livelloIniziale);
            if (prec) await cambiaLivello(prec, layersAttivi, layers, data, label, config);

            aggiornaStatoRisali();
        }

        // il pulsante si disabilita quando non c'è più un livello superiore
        function aggiornaStatoRisali() {
            const puoRisalire = sottoLivelloMinimo ||
                getLivelloPrecedente(ultimoLivelloCaricato, livelloIniziale) !== null;

            controlloRisali.setAbilitato(puoRisalire);
            controlloRisali.setLivello(
                sottoLivelloMinimo ? "dettagli" : ultimoLivelloCaricato
            );
        }

        map.on("dblclick", async (e) => {
            L.DomEvent.stop(e);
            await scendi();
        });

        map.on("contextmenu", async (e) => {
            L.DomEvent.stop(e);
            await risali();
        });

        aggiornaStatoRisali();
    }

    // aggiornamento dimensione marker
    map.on('zoom', () => {
        aggiornaMarkerZoom(layers, map.getZoom(), config);
    });
}

/* Pulsante di risalita per il drill-down manuale.
 * Mostra anche il livello corrente, altrimenti l'utente non ha modo
 * di sapere dove si trova nella gerarchia.
 */
function creaControlloRisali(onClick) {
    const controllo = L.control({ position: 'topleft' });

    controllo.onAdd = function () {
        const contenitore = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        const bottone = L.DomUtil.create('a', '', contenitore);
        bottone.href = '#';
        bottone.title = 'Torna al livello superiore';
        bottone.innerHTML = '&#8593;';
        bottone.style.fontWeight = 'bold';
        bottone.style.textAlign = 'center';

        const etichetta = L.DomUtil.create('div', '', contenitore);
        etichetta.style.padding = '2px 6px';
        etichetta.style.background = '#fff';
        etichetta.style.fontSize = '11px';
        etichetta.style.textAlign = 'center';

        // evita che il click sul controllo si propaghi alla mappa
        L.DomEvent.disableClickPropagation(contenitore);
        L.DomEvent.on(bottone, 'click', function (e) {
            L.DomEvent.preventDefault(e);
            if (bottone.style.pointerEvents !== 'none') onClick();
        });

        this._bottone = bottone;
        this._etichetta = etichetta;

        return contenitore;
    };

    controllo.setAbilitato = function (abilitato) {
        if (!this._bottone) return;

        this._bottone.style.opacity = abilitato ? '1' : '0.4';
        this._bottone.style.pointerEvents = abilitato ? 'auto' : 'none';
    };

    controllo.setLivello = function (livello) {
        if (this._etichetta) this._etichetta.textContent = livello || '';
    };

    return controllo;
}

/* Le voci del layer control sono indicizzate per etichetta: due serie con la
 * stessa etichetta si sovrascriverebbero, facendone sparire una dalla mappa.
 * In caso di omonimia (o di etichetta mancante) si ricade sul numero di serie.
 */
function etichettaUnivoca(etichetta, numeroSerie, execlays, complays) {
    if (!etichetta) return `Serie ${numeroSerie}`;

    if (etichetta in execlays || etichetta in complays) {
        return `${etichetta} (serie ${numeroSerie})`;
    }

    return etichetta;
}

/* Le tre modalità si escludono a vicenda.
 * I valori booleani sono accettati per compatibilità con le configurazioni
 * precedenti, in cui il drill-down era solo automatico.
 */
function normalizzaDrillDown(valore) {
    if (valore === true) return "automatico";
    if (valore === false || valore === "no" || valore == null) return "no";

    return valore;
}

async function cambiaLivello(livello, attivi, layers, data, label, config) {
    ultimoLivelloCaricato = livello;
    sottoLivelloMinimo = false;
    zoomlivello = map.getZoom();

    return await mostraDatiLivello2(
        attivi, layers, livello, data, label, config, map.getZoom()
    );
}

async function gestisciCambioZoom(attivi, layers, livellomassimo, livellominimo, data, label, config) {
    const zoom = map.getZoom();
    const zoomMinimoLivello = ricavazoomDaLivello(livellominimo);

    // oltre il livello minimo si passa ai singoli punti
    if (zoom > zoomMinimoLivello + 2) {
        if (!sottoLivelloMinimo) {
            sottoLivelloMinimo = true;
            mostraLivelloInferiore(attivi, layers, data, label, config);
        }
        return;
    }

    // rientrando sopra la soglia si ricarica il livello amministrativo
    if (sottoLivelloMinimo) {
        sottoLivelloMinimo = false;
        ultimoLivelloCaricato = null;
    }

    if (ultimoLivelloCaricato === livellomassimo && zoom <= zoomlivello) return;
    if (ultimoLivelloCaricato === livellominimo && zoom > zoomlivello) return;

    const livello = getLivelloDaZoom(zoom);
    zoomlivello = zoom;

    if (ultimoLivelloCaricato === livello) return;
    ultimoLivelloCaricato = livello;

    return await mostraDatiLivello2(attivi, layers, livello, data, label, config, zoom);
}