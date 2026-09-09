/* Gestione dello stato dei controlli della pagina di configurazione.
 * Regole:
 *  - i campi di una serie sono attivi solo se la serie è in uso;
 *  - "comparabile" ed "esclusivo" si escludono a vicenda;
 *  - colore, modalità e icona riguardano solo le serie non comparabili,
 *    perché le comparabili condividono le impostazioni comuni;
 *  - l'icona è richiesta solo dalla modalità "Marker Personalizzato".
 */

function initRow(i) {
    const usa = document.querySelector(`.usa[data-i="${i}"]`);
    const comp = document.querySelector(`.comp[data-i="${i}"]`);
    const escl = document.querySelector(`.escl[data-i="${i}"]`);
    const icon = document.querySelector(`.icon[data-i="${i}"]`);
    const colore = document.querySelector(`.colore[data-i="${i}"]`);
    const modalita = document.querySelector(`.modalita[data-i="${i}"]`);

    // stato iniziale: tutto disattivato tranne "usa"
    aggiornaRiga();

    usa.addEventListener("change", () => {
        if (!usa.checked) {
            comp.checked = false;
            escl.checked = false;
            svuotaCampi();
        }
        aggiornaRiga();
        aggiornaCompData();
    });

    comp.addEventListener("change", () => {
        // comparabile ed esclusivo non possono coesistere
        if (comp.checked) {
            escl.checked = false;
            svuotaCampi();
        }
        aggiornaRiga();
        aggiornaCompData();
    });

    escl.addEventListener("change", () => {
        if (escl.checked) comp.checked = false;
        aggiornaRiga();
        aggiornaCompData();
    });

    modalita.addEventListener("change", aggiornaRiga);

    function svuotaCampi() {
        icon.value = "";
        colore.value = "";
        modalita.value = "";
    }

    function aggiornaRiga() {
        const attiva = usa.checked;
        const comparabile = comp.checked;

        comp.disabled = !attiva;
        escl.disabled = !attiva;

        // le comparabili usano le impostazioni comuni, non quelle di riga
        const campiRiga = attiva && !comparabile;
        colore.disabled = !campiRiga;
        modalita.disabled = !campiRiga;

        // l'icona serve solo al marker personalizzato
        const serveIcona = campiRiga && modalita.value === "mp";
        icon.disabled = !serveIcona;
        if (!serveIcona) icon.value = "";
    }
}

for (let i = 1; i <= 5; i++) {
    initRow(i);
}

aggiornaCompData();

/* Le opzioni di comparazione hanno senso solo se almeno una serie
 * attiva è marcata come comparabile.
 */
function aggiornaCompData() {
    const compdata = document.querySelector("#comp");
    const confdata = document.querySelector("#confcomp");
    const esclcomp = document.getElementById("esclcomp");

    let almenoUnaChecked = false;
    for (let i = 1; i <= 5; i++) {
        const usa = document.querySelector(`.usa[data-i="${i}"]`);
        const comp = document.querySelector(`.comp[data-i="${i}"]`);
        if (usa.checked && comp.checked) {
            almenoUnaChecked = true;
            break;
        }
    }

    compdata.disabled = !almenoUnaChecked;
    confdata.disabled = !almenoUnaChecked;
    esclcomp.disabled = !almenoUnaChecked;

    if (!almenoUnaChecked) {
        compdata.value = "";
        confdata.value = "";
        esclcomp.checked = false;
    }
}