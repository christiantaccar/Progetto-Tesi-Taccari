// resa grafica condivisa dalle due modalità di visualizzazione dei punti
const COLORE_DETTAGLI = "yellow";
const RAGGIO_FISSO = 6;   // layer dettagli: dimensione costante
const RAGGIO_MIN = 6;     // livello inferiore: raggio proporzionale
const RAGGIO_MAX = 30;

/* Layer di dettaglio: un marker per ogni punto, indipendente dalle serie.
 * Viene esposto nel layer control come checkbox, quindi resta attivabile
 * a qualsiasi livello di zoom.
 */
export function creaLayerDettagli(data) {
    const gruppo = L.layerGroup();

    for (const [coordinate, dettagli] of Object.entries(data.punti)) {
        const coords = parseCoordinate(coordinate);
        if (!coords) continue;

        const marker = L.starCircleMarker(coords, {
            radius: RAGGIO_FISSO,
            star: 1,
            fillColor: COLORE_DETTAGLI,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7,
            dettaglio: true
        });

        marker.bindTooltip(dettagli.RAGCOMP || "");
        gruppo.addLayer(marker);
    }

    return gruppo;
}

/* Livello inferiore: sostituisce i marker delle aree con i singoli punti,
 * mantenendo i contorni delle aree già disegnati.
 * La dimensione del marker è proporzionale alla percentuale più alta
 * tra le serie attive su quel punto.
 */
export function mostraLivelloInferiore(attivi, layers, data, label, config) {
    // pulizia dei soli marker: i contorni delle aree restano
    layers.forEach(layer => {
        layer.eachLayer(l => {
            if (!l.options.contorno) layer.removeLayer(l);
        });
    });

    for (const [coordinate, dettagli] of Object.entries(data.punti)) {
        const coords = parseCoordinate(coordinate);
        if (!coords) {
            console.error("Coordinate non valide:", coordinate);
            continue;
        }

        // percentuale massima tra le serie attive
        let maxPerc = 0;
        attivi.forEach(i => {
            const perc = Number(dettagli.perc[i]) || 0;
            if (perc > maxPerc) maxPerc = perc;
        });

        // maxPerc > 100 indica record privi di coordinate accumulati in (0;0)
        if (maxPerc <= 0 || maxPerc > 100) continue;

        // stessa resa grafica del layer dettagli, così lo stesso dato
        // resta riconoscibile da qualunque strada lo si raggiunga;
        // qui però il raggio è proporzionale alla percentuale
        const marker = L.starCircleMarker(coords, {
            radius: Math.max(RAGGIO_MIN, RAGGIO_MAX * maxPerc / 100),
            star: 1,
            fillColor: COLORE_DETTAGLI,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7,
            dettaglio: true
        });

        marker.perc = maxPerc;

        marker.bindTooltip(costruisciTooltip(dettagli, attivi, label));

        // il marker è unico ma viene aggiunto a tutti i layer delle serie attive,
        // così resta visibile qualunque serie l'utente stia consultando
        attivi.forEach(i => {
            if (layers[i]) layers[i].addLayer(marker);
        });
    }
}

function costruisciTooltip(dettagli, attivi, label) {
    let tooltip = `<b>${dettagli.RAGCOMP || ""}</b><br>`;

    attivi.forEach(i => {
        const perc = dettagli.perc[i];
        if (perc > 0) {
            tooltip += `Serie ${i + 1}: ${perc}% ${label[`labelv${i + 1}`]}<br>`;
        }
    });

    return tooltip;
}

function parseCoordinate(chiave) {
    const coords = chiave.split(',').map(Number);

    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return null;
    return coords;
}