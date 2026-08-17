import { organizzaDati, organizzaLabel } from './OrganizzaDati.js';
import { mostraDatiLivello2 } from "./MostraDati.js";
import{ricavazoomDaLivello,aggiornaMarkerZoom} from "./Zoom.js"
var map = null;
var ultimoLivelloCaricato = null;
var zoomlivello = null;

export async function inizializzaMappa(config, dati, idDiv) {
    const livelloIniziale = config.livello_massimo;
    const zoomIniziale = ricavazoomDaLivello(livelloIniziale);
    zoomlivello=ricavazoomDaLivello(livelloIniziale);
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
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
//CENTRA MAPPA E CARICA LIVELLO INIZIALE
const zoom=map.getZoom();
    const bounds = await mostraDatiLivello2(
        layersAttivi,
        layers,
        livelloIniziale,
        data,
        label,
        config,
        zoom
    );
    // Caricamento iniziale
    if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: zoomIniziale
        });
}
    //LAYER CONTROL
    const complays = {};
    const execlays = {};
    const l=L.layerGroup();
    let i = 0;
    for (let obj in config.objects) {
        if (config.objects[obj].usa) {
            if(config.objects[obj].comparabile && config.comparable_options.esclusivo){
                l.addLayer(layers[i]);
            }
            else if (config.objects[obj].esclusivo) execlays[dati[0][`LBL${i + 1}`]] = layers[i];
            else complays[dati[0][`LBL${i + 1}`]] = layers[i];
        }
        i++;
    }
    if(l.getLayers().length>0)execlays["comparabili"]=l;
    L.control.layers(execlays, complays).addTo(map);


    const lvlminimo = config.livello_minimo;
    //se l'opzione drill_down è attiva =>
    if (config.drill_down ) {
       let zoomTimeout;

map.on("zoomend", () => {
    clearTimeout(zoomTimeout);

    zoomTimeout = setTimeout(() => {
        gestisciCambioZoom(
            layersAttivi,
            layers,
            livelloIniziale,
            lvlminimo,
            data,
            label,
            config
        );
    }, 150);
});
    }
    //aggiornamento marker
    map.on('zoom', () => {
    aggiornaMarkerZoom(layers, zoom,config);
    });
    
}   
 async function gestisciCambioZoom(attivi,layers,livellomassimo, livellominimo, data, label, config) {
    const zoom = map.getZoom();
    let livello;
    if (ultimoLivelloCaricato === livellomassimo && zoom <= zoomlivello) return;
    if (ultimoLivelloCaricato === livellominimo && zoom > zoomlivello) return;
    if (zoom <= 3) {
        livello = "continenti";
    } else if (zoom <= 5) {
        livello = "nazioni";
    } else if (zoom <= 8) {
        livello = "regioni";
    } else if (zoom <= 10) {
        livello = "province";
    } else {
        livello = "comuni";
    }
    zoomlivello = zoom;

    if (ultimoLivelloCaricato === livello) return;
    ultimoLivelloCaricato = livello;

    const bounds = await mostraDatiLivello2(attivi,layers, livello, data, label, config,zoom);
    return bounds;
}


