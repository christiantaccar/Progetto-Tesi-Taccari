const LIVELLI = ["continenti", "nazioni", "regioni", "province", "comuni"];
const GERARCHIA = ["mondo", "continenti", "nazioni", "regioni", "province", "comuni"];

export function organizzaDati(rawValues, config) {
    const report = {
        mondo: {},
        continenti: {},
        nazioni: {},
        regioni: {},
        province: {},
        comuni: {},
        punti: {}
    };

    const mond = "Mondo";
    const baseUrl = "./Mappe/";
    const livelloMinimo = config.livello_minimo;

    rawValues.forEach(item => {
        const cont = item.CONTINENTE;
        const naz = item.NAZIONE;
        const reg = item.REGIONE;
        const prov = item.PROV;
        const com = item.PROV + "" + item.COMUNE;
        const dettagli = item.CN_D_RAGCOMP;

        const keys = [cont, naz, reg, prov, com];

        if (!report.mondo[mond]) {
            report.mondo[mond] = { v: [0, 0, 0, 0, 0] };
        }

        // il punto viene agganciato al livello minimo configurato
        let keyPadrePunto = null;
        let livelloPadrePunto = null;

        for (let i = 0; i < LIVELLI.length; i++) {
            const livello = LIVELLI[i];
            const key = keys[i];

            if (!key) continue;

            if (livello === livelloMinimo) {
                keyPadrePunto = key;
                livelloPadrePunto = livello;
            }

            const padre = (i === 0) ? mond : keys[i - 1];

            if (!report[livello][key]) {
                report[livello][key] = {
                    v: [0, 0, 0, 0, 0],
                    perc: [0, 0, 0, 0, 0],
                    Padre: padre,
                    URL: costruisciURL(livello, baseUrl, cont, naz, reg)
                };
            }
        }

        // livello punti: chiave = coppia di coordinate
        const p = `${item.GEO_LAT},${item.GEO_LNG}`;
        if (!report.punti[p]) {
            report.punti[p] = {
                v: [0, 0, 0, 0, 0],
                perc: [0, 0, 0, 0, 0],
                Padre: keyPadrePunto,
                LivelloPadre: livelloPadrePunto,
                RAGCOMP: dettagli
            };
        }

        // aggregazione dei valori su tutti i livelli
        for (let j = 1; j <= 5; j++) {
            const campo = item[`VAL${j}`];
            const valRaw = Array.isArray(campo) ? campo[0] : campo;
            const valoreValido = Number(valRaw) || 0;

            report.mondo[mond].v[j - 1] += valoreValido;

            for (let i = 0; i < LIVELLI.length; i++) {
                const key = keys[i];
                if (!key) continue;
                report[LIVELLI[i]][key].v[j - 1] += valoreValido;
            }

            report.punti[p].v[j - 1] += valoreValido;
        }
    });

    if (config.livello_di_paragone === "superiore") {
        calcolaPercentualiLvSuperiore(report, livelloMinimo);
    }
    if (config.livello_di_paragone === "massimo") {
        calcolaPercentualiLvlMassimo(report, config.livello_massimo);
    }

    return report;
}

function costruisciURL(livello, baseUrl, cont, naz, reg) {
    switch (livello) {
        case "continenti": return baseUrl + "Mondo.json";
        case "nazioni":    return baseUrl + cont + ".json";
        case "regioni":    return baseUrl + cont + "/" + naz + ".json";
        case "province":   return baseUrl + cont + "/" + naz + "/Province-" + naz + ".json";
        case "comuni":     return baseUrl + cont + "/" + naz + "/Comuni-" + reg + ".json";
        default:           return "";
    }
}

export function organizzaLabel(rawValues) {
    return {
        labelv1: rawValues[0].UM1,
        labelv2: rawValues[0].UM2,
        labelv3: rawValues[0].UM3,
        labelv4: rawValues[0].UM4,
        labelv5: rawValues[0].UM5
    };
}

function calcolaPercentualiLvSuperiore(report, livelloMinimo) {
    // ogni livello viene confrontato con il livello immediatamente superiore
    for (let i = 0; i < LIVELLI.length; i++) {
        const livello = LIVELLI[i];
        const livelloPadre = GERARCHIA[GERARCHIA.indexOf(livello) - 1];

        for (let key in report[livello]) {
            const padre = report[livello][key].Padre;
            if (!padre || !report[livelloPadre][padre]) continue;

            for (let j = 0; j < 5; j++) {
                const totPadre = report[livelloPadre][padre].v[j];
                report[livello][key].perc[j] = totPadre
                    ? (report[livello][key].v[j] / totPadre * 100).toFixed(2)
                    : 0;
            }
        }
    }

    // i punti si confrontano con il livello minimo configurato
    for (let p in report.punti) {
        const padre = report.punti[p].Padre;
        if (!padre || !report[livelloMinimo] || !report[livelloMinimo][padre]) continue;

        for (let j = 0; j < 5; j++) {
            const totPadre = report[livelloMinimo][padre].v[j];
            report.punti[p].perc[j] = totPadre
                ? (report.punti[p].v[j] / totPadre * 100).toFixed(2)
                : 0;
        }
    }
}

function calcolaPercentualiLvlMassimo(report, lvlMassimo) {
    const livelli = [...LIVELLI, "punti"];
    const indexLimite = GERARCHIA.indexOf(lvlMassimo);

    livelli.forEach(tipoLivello => {
        const indexAttuale = GERARCHIA.indexOf(tipoLivello);

        // i punti vengono sempre processati, gli altri solo se sotto il livello massimo
        if (tipoLivello !== "punti" && indexAttuale < indexLimite) return;

        for (let nomeEntita in report[tipoLivello]) {
            const entita = report[tipoLivello][nomeEntita];
            const valoriRiferimento = getValoreRiferimento(report, tipoLivello, nomeEntita, lvlMassimo);

            if (!valoriRiferimento) continue;

            for (let j = 0; j < 5; j++) {
                const totRif = valoriRiferimento[j];
                entita.perc[j] = totRif
                    ? ((entita.v[j] / totRif) * 100).toFixed(2)
                    : 0;
            }
        }
    });
}

function getValoreRiferimento(report, tipoPartenza, nomePartenza, livelloTarget) {
    let corrente = report[tipoPartenza][nomePartenza];
    let tipoCorrente = tipoPartenza;

    // i punti non hanno un livello padre fisso: va individuato dinamicamente
    if (tipoPartenza === "punti") {
        for (let l of GERARCHIA) {
            if (report[l] && report[l][corrente.Padre]) {
                tipoCorrente = l;
                corrente = report[l][corrente.Padre];
                break;
            }
        }
    }

    while (tipoCorrente !== livelloTarget && corrente && corrente.Padre) {
        const nomePadre = corrente.Padre;
        const indexCorrente = GERARCHIA.indexOf(tipoCorrente);
        if (indexCorrente <= 0) break;

        tipoCorrente = GERARCHIA[indexCorrente - 1];
        corrente = report[tipoCorrente][nomePadre];
    }

    return corrente ? corrente.v : null;
}