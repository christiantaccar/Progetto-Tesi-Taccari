export function organizzaDati(rawValues,config) {
    const report = {
        mondo:{},
        continenti:{},
        nazioni: {},
        regioni: {},
        province:{},
        comuni:{}
    };

    rawValues.forEach(item => {
        const mond="Mondo";
        const cont=item.CONTINENTE;
        const naz = item.NAZIONE;
        const reg = item.REGIONE;
        const prov=item.PROV;
        const com=item.PROV+""+item.COMUNE;
        const url="./Mappe/";

        // Inizializza Nazione se non esiste
         if(!report.mondo[mond]){
            report.mondo[mond]={v:[0,0,0,0,0]}; 
         }
         if (!report.continenti[cont]) {
            report.continenti[cont] = { v: [0, 0, 0, 0, 0],Padre:mond ,URL:url+"Mondo.json",
                perc:[0,0,0,0,0]
            };
           
        }
        if (!report.nazioni[naz]) {
            report.nazioni[naz] = { v: [0, 0, 0, 0, 0], Padre:cont, URL:url+cont+".json",
                perc:[0,0,0,0,0] };
             
        }
        if (!report.regioni[reg]) {
            report.regioni[reg] = { v: [0, 0, 0, 0, 0], Padre: naz ,URL:url+cont+"/"+naz+".json",
                perc:[0,0,0,0,0]};
        }
        if (!report.province[prov]) {
            report.province[prov] = { v: [0, 0, 0, 0, 0], Padre: reg,URL:url+cont+"/"+naz+"/"+"Province-"+naz+".json",
                perc:[0,0,0,0,0]};
        }
        if (!report.comuni[com]) {
            report.comuni[com] = { v: [0, 0, 0, 0, 0], Padre: prov,URL:url+cont+"/"+naz+"/"+"Comuni-"+reg+".json" ,
                perc:[0,0,0,0,0]};
        }
        // Aggrega valori
        for(let j=1;j<6;j++){
            let campo = item[`VAL${j}`]; 
            let valRaw = Array.isArray(campo) ? campo[0] : campo;
            const valoreValido = Number(valRaw) || 0;
            report.mondo[mond].v[j-1]+=valoreValido;
            report.continenti[cont].v[j-1]+= valoreValido;
            report.nazioni[naz].v[j-1] += valoreValido;
            report.regioni[reg].v[j-1] += valoreValido;
            report.province[prov].v[j-1] += valoreValido;
            report.comuni[com].v[j-1] += valoreValido;
        }
    });
    if(config.livello_di_paragone==="superiore") calcolaPercentualiLvSuperiore(report);
    if(config.livello_di_paragone==="massimo") calcolaPercentualiLvlMassimo(report,config.livello_massimo);
    return report;
}
export function organizzaLabel(rawValues){
    const report = {
        labelv1:{},
        labelv2: {},
        labelv3: {},
        labelv4:{},
        labelv5:{}
    };
    console.log()
    report.labelv1=rawValues[0].UM1;
    report.labelv2=rawValues[0].UM2;
    report.labelv3=rawValues[0].UM3;
    report.labelv4=rawValues[0].UM4;
    report.labelv5=rawValues[0].UM5;
    return report;
}
function calcolaPercentualiLvSuperiore(report) {
    for (let cont in report.continenti) {
        const padre = report.continenti[cont].Padre;
        for (let j = 0; j < 5; j++) {
            const totPadre = report.mondo[padre].v[j];
            report.continenti[cont].perc[j] = totPadre
                ? (report.continenti[cont].v[j] / totPadre * 100).toFixed(2)
                : 0;
        }
    }

    for (let naz in report.nazioni) {
        const padre = report.nazioni[naz].Padre;
        for (let j = 0; j < 5; j++) {
            const totPadre = report.continenti[padre].v[j];
            report.nazioni[naz].perc[j] = totPadre
                ? (report.nazioni[naz].v[j] / totPadre * 100).toFixed(2)
                : 0;
        }
    }

    for (let reg in report.regioni) {
        const padre = report.regioni[reg].Padre;
        for (let j = 0; j < 5; j++) {
            const totPadre = report.nazioni[padre].v[j];
            report.regioni[reg].perc[j] = totPadre
                ? (report.regioni[reg].v[j] / totPadre * 100).toFixed(2)
                : 0;
        }
    }

    for (let prov in report.province) {
        const padre = report.province[prov].Padre;
        for (let j = 0; j < 5; j++) {
            const totPadre = report.regioni[padre].v[j];
            report.province[prov].perc[j] = totPadre
                ? (report.province[prov].v[j] / totPadre * 100).toFixed(2)
                : 0;
        }
    }

    for (let com in report.comuni) {
        const padre = report.comuni[com].Padre;
        for (let j = 0; j < 5; j++) {
            const totPadre = report.province[padre].v[j];
            report.comuni[com].perc[j] = totPadre
                ? (report.comuni[com].v[j] / totPadre * 100).toFixed(2)
                : 0;
        }
    }
}
function calcolaPercentualiLvlMassimo(report, lvlMassimo) {
    const livelli = ["continenti", "nazioni", "regioni", "province", "comuni"];
    const gerarchia = ["mondo", "continenti", "nazioni", "regioni", "province", "comuni"];
    
    const indexLimite = gerarchia.indexOf(lvlMassimo);

    livelli.forEach(tipoLivello => {
        // Calcoliamo la percentuale solo per i livelli uguali o inferiori al target
        if (gerarchia.indexOf(tipoLivello) >= indexLimite) {
            
            for (let nomeEntita in report[tipoLivello]) {
                const entita = report[tipoLivello][nomeEntita];
                // Recuperiamo i valori del "super-padre" di riferimento
                const valoriRiferimento = getValoreRiferimento(report, tipoLivello, nomeEntita, lvlMassimo);

                if (valoriRiferimento) {
                    for (let j = 0; j < 5; j++) {
                        const totRif = valoriRiferimento[j];
                        entita.perc[j] = totRif 
                            ? ((entita.v[j] / totRif) * 100).toFixed(2) 
                            : 0;
                    }
                }
            }
        }
    });
}
function getValoreRiferimento(report, tipoPartenza, nomePartenza, livelloTarget) {
    const gerarchia = ["mondo", "continenti", "nazioni", "regioni", "province", "comuni"];
    let corrente = report[tipoPartenza][nomePartenza];
    let tipoCorrente = tipoPartenza;

    // Risale la catena dei "Padre" finché non arriviamo al livelloTarget
    while (tipoCorrente !== livelloTarget && corrente.Padre) {
        const nomePadre = corrente.Padre;
        // Determiniamo il tipo del padre (quello precedente nella gerarchia)
        const indexCorrente = gerarchia.indexOf(tipoCorrente);
        tipoCorrente = gerarchia[indexCorrente - 1];
        corrente = report[tipoCorrente][nomePadre];
    }
    
    return corrente ? corrente.v : null;
}