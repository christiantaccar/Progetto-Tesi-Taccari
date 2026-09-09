<?php
// Opzioni disponibili, definite una sola volta e riusate per tutte le serie
$colori = ["blue" => "blue", "red" => "red", "green" => "green"];

$modalita = [
    "a"  => "Evidenzia Area",
    "mp" => "Marker Personalizzato",
    "cm" => "Marker Cerchio",
    "t"  => "Marker Triangolo",
    "q"  => "Marker Quadrato"
];

$modalitaComparabili = [
    "c" => "Cerchi concentrici",
    "m" => "Marker colorati"
];

$livelli = ["continenti", "nazioni", "regioni", "province", "comuni"];
?>
<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="utf-8">
    <title>SetUp</title>
    <style>
        table {
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid black;
            padding: 6px;
        }

        .errore {
            color: #b00020;
            font-weight: bold;
            margin-top: 10px;
        }

        input:disabled,
        select:disabled {
            background: #eee;
        }
    </style>
</head>

<body>

    <h1>SetUP</h1>

    <form id="setupForm">
        <table>
            <thead>
                <tr>
                    <th>Serie</th>
                    <th>Usa</th>
                    <th>Comparabile</th>
                    <th>Esclusiva</th>
                    <th>Icona</th>
                    <th>Colore Confini</th>
                    <th>Modalità</th>
                </tr>
            </thead>
            <tbody>
                <?php for ($i = 1; $i <= 5; $i++): ?>
                    <tr>
                        <td>Serie <?= $i ?></td>
                        <td><input type="checkbox" class="usa" data-i="<?= $i ?>"></td>
                        <td><input type="checkbox" class="comp" data-i="<?= $i ?>"></td>
                        <td><input type="checkbox" class="escl" data-i="<?= $i ?>"></td>
                        <td><input type="file" class="icon" data-i="<?= $i ?>" accept="image/png,image/jpeg,image/gif,image/webp"></td>
                        <td>
                            <select class="colore" data-i="<?= $i ?>">
                                <option value="" selected disabled hidden></option>
                                <?php foreach ($colori as $valore => $etichetta): ?>
                                    <option value="<?= $valore ?>"><?= $etichetta ?></option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                        <td>
                            <select class="modalita" data-i="<?= $i ?>">
                                <option value="" selected disabled hidden></option>
                                <?php foreach ($modalita as $valore => $etichetta): ?>
                                    <option value="<?= $valore ?>"><?= $etichetta ?></option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                    </tr>
                <?php endfor; ?>
            </tbody>
        </table>

        <h2>Opzioni di visualizzazione</h2>
        <label>Drill down: </label>
        <select id="drill">
            <option value="no" selected>Disattivato</option>
            <option value="automatico">Automatico (segue lo zoom)</option>
            <option value="manuale">Manuale (doppio click / click destro)</option>
        </select><br>
        <label>Evidenzia Area: </label><input type="checkbox" id="evi"><br>
        <label>Mostra livello dettagli: </label><input type="checkbox" id="dett"><br>

        <label>Livello massimo:</label>
        <select id="lvlmax">
            <?php foreach ($livelli as $l): ?>
                <option value="<?= $l ?>" <?= $l === "continenti" ? "selected" : "" ?>><?= $l ?></option>
            <?php endforeach; ?>
        </select>

        <label>Livello minimo:</label>
        <select id="lvlmin">
            <?php foreach ($livelli as $l): ?>
                <option value="<?= $l ?>" <?= $l === "comuni" ? "selected" : "" ?>><?= $l ?></option>
            <?php endforeach; ?>
        </select><br>

        <label>Livello di paragone</label>
        <select id="lvlpara">
            <option value="superiore" selected>Superiore</option>
            <option value="massimo">Massimo</option>
        </select>

        <h2>Opzioni di comparazione</h2>
        <label>Modalità</label>
        <select id="comp">
            <option value="" selected disabled hidden></option>
            <?php foreach ($modalitaComparabili as $valore => $etichetta): ?>
                <option value="<?= $valore ?>"><?= $etichetta ?></option>
            <?php endforeach; ?>
        </select><br>

        <label>Colore Confini </label>
        <select id="confcomp">
            <option value="" selected disabled hidden></option>
            <?php foreach ($colori as $valore => $etichetta): ?>
                <option value="<?= $valore ?>"><?= $etichetta ?></option>
            <?php endforeach; ?>
        </select><br>

        <label>Esclusività: </label>
        <input type="checkbox" id="esclcomp">

        <br><br>
        <button type="submit">Salva configurazione</button>
        <div id="errori" class="errore"></div>
    </form>

    <script src="setup/change.js"></script>
    <script>
        // Ordine gerarchico usato per validare i livelli
        const GERARCHIA = <?= json_encode($livelli) ?>;

        document.getElementById("setupForm").addEventListener("submit", function (e) {
            e.preventDefault();

            const errori = [];
            const objects = {};
            const formData = new FormData();

            const livello_massimo = document.getElementById("lvlmax").value;
            const livello_minimo = document.getElementById("lvlmin").value;

            // il livello minimo non può essere più generale del massimo
            if (GERARCHIA.indexOf(livello_minimo) < GERARCHIA.indexOf(livello_massimo)) {
                errori.push("Il livello minimo deve essere uguale o più specifico del livello massimo.");
            }

            let almenoUnaSerie = false;

            for (let i = 1; i <= 5; i++) {
                const usa = document.querySelector(`.usa[data-i="${i}"]`).checked;
                const comparabile = document.querySelector(`.comp[data-i="${i}"]`).checked;
                const esclusivo = document.querySelector(`.escl[data-i="${i}"]`).checked;
                const colore = document.querySelector(`.colore[data-i="${i}"]`).value;
                const modalita = document.querySelector(`.modalita[data-i="${i}"]`).value;

                const fileInput = document.querySelector(`.icon[data-i="${i}"]`);
                const file = fileInput.files[0];

                if (usa) {
                    almenoUnaSerie = true;

                    // una serie esclusiva deve avere una modalità di rappresentazione
                    if (!comparabile && !modalita) {
                        errori.push(`Serie ${i}: selezionare una modalità di visualizzazione.`);
                    }

                    // il marker personalizzato richiede l'icona
                    if (modalita === "mp" && !file) {
                        errori.push(`Serie ${i}: la modalità "Marker Personalizzato" richiede il caricamento di un'icona.`);
                    }
                }

                if (file && modalita === "mp") {
                    formData.append(`icon_${i}`, file);
                }

                objects[`serie${i}`] = {
                    usa: usa,
                    comparabile: comparabile,
                    esclusivo: esclusivo,
                    colore_confini: colore,
                    modalita: modalita,
                    icona: ""
                };
            }

            if (!almenoUnaSerie) {
                errori.push("Selezionare almeno una serie da visualizzare.");
            }

            const comparable_options = {
                modalita: document.querySelector("#comp").value,
                colore_confini: document.querySelector("#confcomp").value,
                esclusivo: document.getElementById("esclcomp").checked
            };

            // se ci sono serie comparabili attive serve una modalità comune
            const comparabiliAttive = Object.values(objects).some(o => o.usa && o.comparabile);
            if (comparabiliAttive && !comparable_options.modalita) {
                errori.push("Selezionare una modalità per le serie comparabili.");
            }

            const contenitoreErrori = document.getElementById("errori");
            if (errori.length > 0) {
                contenitoreErrori.innerHTML = errori.join("<br>");
                return;
            }
            contenitoreErrori.innerHTML = "";

            const payload = {
                objects: objects,
                comparable_options: comparable_options,
                livello_di_paragone: document.getElementById("lvlpara").value,
                drill_down: document.querySelector("#drill").value,
                livello_massimo: livello_massimo,
                livello_minimo: livello_minimo,
                mostra_area: document.getElementById("evi").checked,
                mostra_dettagli: document.getElementById("dett").checked
            };

            formData.append("data", JSON.stringify(payload));

            fetch("setup/salva_config.php", {
                method: "POST",
                body: formData
            })
                .then(res => res.text())
                .then(res => {
                    if (res.trim().startsWith("Errore")) {
                        contenitoreErrori.textContent = res;
                        return;
                    }
                    window.location.href = "PaginaMappa.php";
                })
                .catch(err => {
                    contenitoreErrori.textContent = "Errore di rete: " + err.message;
                });
        });
    </script>

</body>

</html>