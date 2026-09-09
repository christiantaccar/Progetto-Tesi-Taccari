export const GERARCHIA = ["continenti", "nazioni", "regioni", "province", "comuni"];

export function ricavazoomDaLivello(livello) {
    if (livello === "continenti") return 3;
    if (livello === "nazioni") return 4;   // centro del range 4-5
    if (livello === "regioni") return 6;   // centro del range 6-8
    if (livello === "province") return 9;
    return 12; // comuni
}

export function getLivelloDaZoom(zoom) {
    if (zoom <= 3) return "continenti";
    if (zoom <= 5) return "nazioni";
    if (zoom <= 8) return "regioni";
    if (zoom <= 10) return "province";
    return "comuni";
}

export const zoomMinLivelli = {
    continenti: 2,
    nazioni: 4,
    regioni: 6,
    province: 9,
    comuni: 11
};

/* Livello immediatamente più specifico (drill-down manuale verso il basso).
 * Restituisce null se si è già al livello minimo consentito dalla configurazione.
 */
export function getLivelloSuccessivo(livello, livelloMinimo) {
    const i = GERARCHIA.indexOf(livello);
    const limite = GERARCHIA.indexOf(livelloMinimo);

    if (i === -1 || i >= GERARCHIA.length - 1) return null;
    if (limite !== -1 && i >= limite) return null;

    return GERARCHIA[i + 1];
}

/* Livello immediatamente più generale (drill-down manuale verso l'alto).
 * Restituisce null se si è già al livello massimo consentito dalla configurazione.
 */
export function getLivelloPrecedente(livello, livelloMassimo) {
    const i = GERARCHIA.indexOf(livello);
    const limite = GERARCHIA.indexOf(livelloMassimo);

    if (i <= 0) return null;
    if (limite !== -1 && i <= limite) return null;

    return GERARCHIA[i - 1];
}

export function aggiornaMarkerZoom(layers, zoom, config) {
    const zoomlivellomassimo = ricavazoomDaLivello(config.livello_massimo);
    let livello;

    if (zoom < zoomlivellomassimo) livello = config.livello_massimo;
    else livello = getLivelloDaZoom(zoom);

    const fattore = 0.4;
    const zoomMin = zoomMinLivelli[livello];

    layers.forEach(group => {
        group.eachLayer(layer => {

            // cerchi e forme derivate da CircleMarker
            if (layer instanceof L.CircleMarker && layer.perc != null) {
                const base = 8;
                const max = 50;

                const scale = 1 + fattore * (zoom - zoomMin);
                const nuovoRaggio = Math.max(base, (max * layer.perc / 100)) * scale;

                layer.setRadius(nuovoRaggio);
            }

            // marker con icona
            if (layer instanceof L.Marker && layer.perc != null) {
                const perc = layer.perc;

                const minSize = 10;
                const maxSize = 45;

                const scale = 1 + fattore * (zoom - zoomMin);

                const sWidth = Math.max(minSize, maxSize * perc / 100) * scale;
                const sHeight = sWidth * 1.6;

                const newIcon = new L.Icon({
                    iconUrl: layer.Icon,
                    iconSize: [sWidth, sHeight],
                    iconAnchor: [sWidth / 2, sHeight],
                    popupAnchor: [1, -sHeight]
                });

                layer.setIcon(newIcon);
            }

        });
    });
}