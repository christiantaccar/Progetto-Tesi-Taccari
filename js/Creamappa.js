import { inizializzaMappa } from "./InizializzazioneMappa.js";
async function creamappa(){
    try {
        // Esegue i fetch in parallelo (più veloce)
        const [rispostaConfig, rispostaDati] = await Promise.all([
            fetch('./setup/SetUp.json'),
            fetch('./NAVmaps.json')
        ]);
    
        const config = await rispostaConfig.json();
        const dati = await rispostaDati.json();

        // Ora che hai tutto, chiami la funzione "pura"
        inizializzaMappa(config,dati,'map');

    } catch (errore) {
        console.error("Errore nel caricamento dei JSON:", errore);
    }
}

// Avvia il processo
creamappa();
