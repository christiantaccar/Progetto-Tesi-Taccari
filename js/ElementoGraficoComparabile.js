    const nomiColori = ['red', 'blue', 'green', 'violet', 'orange'];
    const colori = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];
export function creaElementoGraficoComparabile(feature,perc,valore,label, indiceSerie,config) {
        const coordinate = feature._center;
        const nome=feature.properties.name;
        const mod=config.comparable_options.modalita;

        if(mod==="c") return circleMarker(coordinate,perc,indiceSerie);
        if(mod==="m") return creamarkerComp(coordinate,perc,indiceSerie);
        if(mod==="tc") return triangoloComp(coordinate,perc,indiceSerie);
        console.error("Non è stata selezionata un opzione di visualizzazione")
    }
    
//Marcker colorati tutti su uno stesso punto
function creamarkerComp(coordinate,perc,indiceSerie){
     const coloreNome = nomiColori[indiceSerie] || 'grey';
        const minSize = 10;
        const maxSize = 40;  //minSize + Math.sqrt(perc / 100) * (maxSize - minSize)
        const sWidth = Math.max(minSize, maxSize * perc / 100);
        const sHeight = sWidth * 1.6; // Altezza proporzionata (il marker è più alto che largo)
        const redIcon = new L.Icon({
        iconUrl: `./images/${coloreNome}-marker.png`,
        iconSize: [sWidth, sHeight],
        iconAnchor: [sWidth / 2, sHeight], 
        popupAnchor: [1, -sHeight],
        shadowSize: [sHeight, sHeight]
        });
        const m=L.marker(coordinate,{icon:redIcon,perc,indiceSerie});
        m.perc=perc;
        m.indiceSerie=indiceSerie;
        m.Icon=redIcon.options.iconUrl;
        return m;
    }

// CERCHIO CONCENTRICO  
function circleMarker(coordinate,perc,indiceSerie){ 
    const minSize = 5;
    const maxSize = 50; 
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
//TRIANGOLO CONCENTRICO
function triangoloComp(coordinate,perc,indiceSerie){
    const minSize = 5;
    const maxSize = 50; 
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


