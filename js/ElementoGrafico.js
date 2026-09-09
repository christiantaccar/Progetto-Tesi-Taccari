import { zoomMinLivelli } from "./Zoom.js";

const nomiColori = ['red', 'blue', 'green', 'violet', 'orange'];
const colori = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];

const coloriCustom = {
    blue: "#007bff",
    red: "#dc3545",
    green: "#28a745"
};

export function creaElementoGrafico(feature, perc, indiceSerie, config, livello, zoom) {
    const coordinate = calcolaPosizione(feature, indiceSerie, perc, livello, zoom);
    const mod = config.objects[`serie${indiceSerie + 1}`].modalita;

    if (mod === "a")  return evidenziaArea(feature, perc, indiceSerie, config);
    if (mod === "mp") return markerDist(coordinate, perc, indiceSerie, config);
    if (mod === "cm") return cerchiMarker(coordinate, perc, indiceSerie);
    if (mod === "t")  return triangoloMarker(coordinate, perc, indiceSerie);
    if (mod === "q")  return quadratoMarker(coordinate, perc, indiceSerie);

    console.error("Non è stata selezionata un'opzione di visualizzazione");
}

/* Aree colorate secondo una scala cromatica a soglie.
 * Il colore del bordo è quello configurato per la serie, così l'area
 * resta riconducibile alla serie anche a colpo d'occhio.
 */
function evidenziaArea(feature, perc, indiceSerie, config) {
    const coloreConfine = config.objects[`serie${indiceSerie + 1}`].colore_confini;

    const geojsonLayer = L.geoJson(feature, {
        interactive: true,
        area: true,
        style: {
            color: getColore(coloreConfine),
            fillColor: scalaColore(perc),
            weight: 1,
            fillOpacity: 0.6
        }
    });

    geojsonLayer.options.area = true;
    return geojsonLayer;
}

/* Soglie contigue: ogni valore ricade sempre in una sola fascia,
 * senza intervalli scoperti.
 */
function scalaColore(perc) {
    if (perc > 90) return "#800026";
    if (perc > 50) return "#E31A1C";
    if (perc > 30) return "#FC4E2A";
    if (perc > 10) return "#FEB24C";
    return "#FED976";
}

function getColore(colore) {
    return coloriCustom[colore] || colore;
}

// MARKER ESCLUSIVO PERSONALIZZATO
function markerDist(coordinate, perc, indiceSerie, config) {
    const minSize = 10;
    const maxSize = 45;
    const sWidth = Math.max(minSize, maxSize * perc / 100);
    const sHeight = sWidth * 1.6; // il marker è più alto che largo

    const Icon = new L.Icon({
        iconUrl: config.objects[`serie${indiceSerie + 1}`].icona,
        iconSize: [sWidth, sHeight],
        iconAnchor: [sWidth / 2, sHeight],
        popupAnchor: [1, -sHeight],
        shadowSize: [sHeight, sHeight]
    });

    const m = L.marker(coordinate, { icon: Icon });
    m.perc = perc;
    m.indiceSerie = indiceSerie;
    m.Icon = Icon.options.iconUrl;
    return m;
}

function calcolaPosizione(feature, i, perc, livello, zoom) {
    const center = feature._center;

    const fattore = 0.4;
    const zoomMin = zoomMinLivelli[livello];
    const scale = 1 + fattore * (zoom - zoomMin);

    // raggio minimo per evitare sovrapposizione
    const minOffsetLivello = {
        continenti: 4,
        nazioni: 1.5,
        regioni: 0.25,
        province: 0.05,
        comuni: 0.010
    };

    const baseOffset = minOffsetLivello[livello] || 0.1;

    const r = baseOffset * scale * (0.5 + perc / 100);
    const angle = (i / 5) * Math.PI * 2;

    return L.latLng(
        center.lat + Math.sin(angle) * r,
        center.lng + Math.cos(angle) * r
    );
}

// CERCHIO
function cerchiMarker(coordinate, perc, indiceSerie) {
    const minSize = 5;
    const maxSize = 35;

    const c = L.circleMarker(coordinate, {
        radius: Math.max(minSize, maxSize * perc / 100),
        fillColor: colori[indiceSerie],
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    });

    c.perc = perc;
    c.indiceSerie = indiceSerie;
    return c;
}

function triangoloMarker(coordinate, perc, indiceSerie) {
    const minSize = 5;
    const maxSize = 35;

    const t = L.starCircleMarker(coordinate, {
        radius: Math.max(minSize, maxSize * perc / 100),
        star: 3,
        rotation: -Math.PI / 2,
        fillColor: colori[indiceSerie],
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    });

    t.perc = perc;
    t.indiceSerie = indiceSerie;
    return t;
}

function quadratoMarker(coordinate, perc, indiceSerie) {
    const minSize = 5;
    const maxSize = 35;

    const q = L.starCircleMarker(coordinate, {
        radius: Math.max(minSize, maxSize * perc / 100),
        star: 4,
        rotation: Math.PI / 4,
        fillColor: colori[indiceSerie],
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    });

    q.perc = perc;
    q.indiceSerie = indiceSerie;
    return q;
}