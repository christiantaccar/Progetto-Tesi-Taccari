import { zoomMinLivelli } from "./Zoom.js";

    const nomiColori = ['red', 'blue', 'green', 'violet', 'orange'];
    const colori = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];
export function creaElementoGrafico(feature,perc, indiceSerie,config,livello,zoom) {
        const coordinate =calcolaPosizione(feature,indiceSerie,perc,livello,zoom);
        const mod= config.objects[`serie${indiceSerie+1}`].modalita;

        //non comparabili
        if(mod==="a") return evidenziaArea(feature,perc);
        if(mod==="mp") return markerDist(coordinate,perc,indiceSerie,config);
        if(mod==="cm") return cerchiMarker(coordinate,perc,indiceSerie);
        if(mod==="t") return triangoloMarker(coordinate,perc,indiceSerie);
        if(mod==="q") return quadratoMarker(coordinate,perc,indiceSerie)
        console.error("Non è stata selezionata un opzione di visualizzazione")
    }
    //Aree colorate in base alla percentuale
function evidenziaArea(feature,perc){
    const geojsonLayer = L.geoJson(feature, {
            interactive:true,
            style: {
                color: "#ffffff",
                fillColor:perc>90?  "#800026":
                    perc>50&&perc<89.99? "#E31A1C":
                    perc>30&&perc<49.99? '#FC4E2A':
                    perc>10&&perc<29.99? "#FEB24C":
                     "#FED976",
                weight: 1,
                fillOpacity: 0.6
            },
        });
        return geojsonLayer;
}
//MARKER ESCLUSIVO PERSONALIZZATO
function markerDist(coordinate,perc,indiceSerie,config){
        const minSize = 10;
        const maxSize = 45;  //minSize + Math.sqrt(perc / 100) * (maxSize - minSize)
        const sWidth = Math.max(minSize, maxSize * perc / 100);
        const sHeight = sWidth * 1.6; // Altezza proporzionata (il marker è più alto che largo)
        const Icon = new L.Icon({
        iconUrl: config.objects[`serie${indiceSerie+1}`].icona,
        iconSize: [sWidth, sHeight],
        iconAnchor: [sWidth / 2, sHeight], 
        popupAnchor: [1, -sHeight],
        shadowSize: [sHeight, sHeight]
        });
        const m=L.marker(coordinate,{icon:Icon});
        m.perc=perc;
        m.indiceSerie=indiceSerie;
        m.Icon=Icon.options.iconUrl;
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

    // raggio finale
    const r = baseOffset * scale * (0.5 + perc / 100);

    const angle = (i / 5) * Math.PI * 2;

    return L.latLng(
        center.lat + Math.sin(angle) * r,
        center.lng + Math.cos(angle) * r
    );
}
//cerchietti
function cerchiMarker(coordinate,perc,indiceSerie){
     const minSize = 5;
    const maxSize = 35; 
    const c=L.circleMarker(coordinate, {
            radius: Math.max(minSize, maxSize * perc / 100), // Scala il raggio in base al perc
            fillColor: colori[indiceSerie],
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        });
        c.perc=perc;
        c.indiceSerie=indiceSerie;
     return c

}
function triangoloMarker(coordinate,perc,indiceSerie){
    const minSize = 5;
    const maxSize = 35; 
    const t=L.starCircleMarker(coordinate,{
        radius: Math.max(minSize, maxSize * perc / 100),
        star: 3,
        rotation: -Math.PI/2,
        fillColor: colori[indiceSerie],
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    })
    t.perc=perc;
    t.indiceSerie=indiceSerie;
    return t;
}
function quadratoMarker(coordinate,perc,indiceSerie){
     const minSize = 5;
    const maxSize = 35; 
    const q=L.starCircleMarker(coordinate,{
        radius: Math.max(minSize, maxSize * perc / 100),
        star: 4,
        rotation: Math.PI/4,
        fillColor: colori[indiceSerie],
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    })
    q.perc=perc;
    q.indiceSerie=indiceSerie;
    return q;

}