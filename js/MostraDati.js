import{creaElementoGraficoComparabile} from './ElementoGraficoComparabile.js'
import { creaElementoGrafico } from './ElementoGrafico.js';
let renderId = 0;
export async function mostraDatiLivello2(attivi,layers, livello, data,label, config,zoom) {
    const currentRenderId = ++renderId;
    layers.forEach(layer => layer.clearLayers());
    // cache dati geospaziali per ogni "Padre"
    const cacheTopo = {};
    const cacheGeo = {};
    const cacheIndex = {};
    let elemento;
    let bounds = L.latLngBounds();
    console.log(data)

    for (const [nomeRegione, dettagli] of Object.entries(data[livello])) {
        if (currentRenderId !== renderId) return;

        const Padre = dettagli.Padre;
        const url =dettagli.URL;

        //  CARICAMENTO UNA SOLA VOLTA
        if (!cacheTopo[Padre]) {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            console.error(`File non trovato: ${url}`);
            cacheTopo[Padre] = null;
            continue;
        }

        cacheTopo[Padre] = await res.json();

        cacheGeo[Padre] = topojson.feature(
            cacheTopo[Padre],
            cacheTopo[Padre].objects.regions
        );

        cacheIndex[Padre] = {};
        cacheGeo[Padre].features.forEach(f => {
            cacheIndex[Padre][f.properties.leo_id] = f;
        });

    } catch (err) {
        console.error(`Errore completo (${url}):`, err);
        cacheTopo[Padre] = null;
        continue;
    }
}

        if (!cacheIndex[Padre]) continue;
        const feature = cacheIndex[Padre][nomeRegione];
        if (!feature) continue;
        // centro già calcolato una sola volta (o fallback dinamico)
       bounds.extend(L.geoJson(feature).getBounds());

        if (!feature._center) {
            const punto = turf.pointOnFeature(feature);
            const [lon, lat] = punto.geometry.coordinates;
            feature._center = L.latLng(lat, lon);
        }
       
        // dati serie
        for (let i of attivi) {

    const percArray = data[livello][nomeRegione].perc;

    const perc = percArray[i];
    const valore = data[livello][nomeRegione].v[i];
    const comp=config.objects[`serie${i+1}`].comparabile
    const colore = comp? 
        config.comparable_options.colore_confini:
        config.objects[`serie${i+1}`].colore_confini;

    if (layers[i] && perc > 0) {
        if(comp)
         elemento = creaElementoGraficoComparabile(
            feature,
            perc,
            valore,
            label[`labelv${i+1}`],
            i,
            config
        );
        else elemento=creaElementoGrafico(
            feature,
            perc,
            i,
            config,
            livello,
            zoom
            );

        elemento.bindTooltip(`<b>${feature.properties.name}</b><br>Serie ${i+1}: ${perc}% <br>v:${valore} ${label[`labelv${i+1}`]}`);
        layers[i].addLayer(contorno(feature, config.mostra_area, getColore(colore)));
        layers[i].addLayer(elemento);
       
    }
}
    }
    return bounds;
}


function contorno(feature,fill,colore){
    const geojsonLayer = L.geoJson(feature, {
            interactive:false,
            style: {
                color: colore,
                weight: 1,
                fill:fill,
                fillOpacity:0.2
            },//CREAZIONE POP-UP PER REGIONE
            onEachFeature: function (feature, layer) {
                if (feature.properties.name) {
                    layer.bindPopup(
                        "<strong>Regione:</strong> " + feature.properties.name
                    );
                }
            }
        });
        return geojsonLayer;
}
const coloriCustom = {
    blue: "#007bff",
    red: "#dc3545",
    green: "#28a745"
};

function getColore(colore) {
    return coloriCustom[colore] || colore;
}
