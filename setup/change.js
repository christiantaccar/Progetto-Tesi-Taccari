function initRow(i) {
    const usa = document.querySelector(`.usa[data-i="${i}"]`);
    const comp = document.querySelector(`.comp[data-i="${i}"]`);
    const escl = document.querySelector(`.escl[data-i="${i}"]`);
    const icon = document.querySelector(`.icon[data-i="${i}"]`);
    const colore = document.querySelector(`.colore[data-i="${i}"]`);
    const modalita=document.querySelector(`.modalita[data-i="${i}"]`);
    // const modcomp=document.querySelector(`#comp`);

    // 🔴 stato iniziale: tutto off tranne USA
    comp.disabled = true;
    escl.disabled = true;
    icon.disabled = true;
    colore.disabled = true;
    modalita.disabled=true;
    usa.addEventListener("change", () => {
        if (usa.checked) {
            comp.disabled = false;
            escl.disabled = false;
            icon.disabled = false;
            colore.disabled = false;
            modalita.disabled=false;
        } else {
            comp.checked = false;
            escl.checked = false;

            comp.disabled = true;
            escl.disabled = true;
            icon.disabled = true;
            colore.disabled = true;
            modalita.disabled=true;
            icon.value = "";
            colore.value = "";
            modalita.value = "";
        }
        aggiornaCompData();
    });

    comp.addEventListener("change", () => {
        if (comp.checked) {
            escl.checked = false;
            escl.disabled = true;

            icon.disabled = true;
            colore.disabled = true;
            modalita.disabled=true;
            icon.value = "";
            colore.value = "";
            modalita.value = "";
        } else {
            escl.disabled = false;
            icon.disabled = false;
            colore.disabled = false;
            modalita.disabled=false;
        }
        aggiornaCompData();
    });
}

// inizializzazione di tutte le righe
for (let i = 1; i <= 5; i++) {
    initRow(i);
}
aggiornaCompData();
function aggiornaCompData() {
    const tutteComp = document.querySelectorAll(".comp");
    const compdata = document.querySelector("#comp");
    const confdata=document.querySelector("#confcomp");
    const esclcomp=document.getElementById("esclcomp");

    const almenoUnaChecked = Array.from(tutteComp).some(c => c.checked);

    compdata.disabled = !almenoUnaChecked;
    confdata.disabled=!almenoUnaChecked;
    esclcomp.disabled=!almenoUnaChecked;
    if(!almenoUnaChecked) compdata.value="";
    if(!almenoUnaChecked) confdata.value="";
    if(!almenoUnaChecked) esclcomp.checked=false;
}