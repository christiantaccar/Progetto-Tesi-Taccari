<!DOCTYPE html> <!-- Equivalente di setup.html -->
<html>

<head>
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
                <tr>
                    <td>Serie 1</td>
                    <td><input type="checkbox" class="usa" data-i="1"></td>
                    <td><input type="checkbox" class="comp" data-i="1"></td>
                    <td><input type="checkbox" class="escl" data-i="1"></td>
                    <td><input type="file" class="icon" data-i="1"></td>
                    <td><select class="colore" data-i="1">
                            <option value="" selected disabled hidden></option>
                            <option value="blue">blue</option>
                            <option value="red">red</option>
                            <option value="green">green</option>
                        </select>
                    </td>
                    <td><select class="modalita" data-i="1" >
                            <option value="" selected disabled hidden></option>
                            <option value="a">Evidenzia Area</option>
                            <option value="mp">Marker Personalizzato</option>
                            <option value="cm">Marker Cerchio</option>
                            <option value="t">Marker Triangolo</option>
                            <option value="q">Marker Quadrato</option>

                        </select>
                    </td>
                </tr>
                <tr>
                    <td>Serie 2</td>
                    <td><input type="checkbox" class="usa" data-i="2"></td>
                    <td><input type="checkbox" class="comp" data-i="2"></td>
                    <td><input type="checkbox" class="escl" data-i="2"></td>
                    <td><input type="file" class="icon" data-i="2"></td>
                    <td><select class="colore" data-i="2">
                            <option value="" selected disabled hidden></option>
                            <option value="blue">blue</option>
                            <option value="red">red</option>
                            <option value="green">green</option>
                        </select>
                    </td>
                    <td><select class="modalita" data-i="2" >
                            <option value="" selected disabled hidden></option>
                            <option value="a">Evidenzia Area</option>
                            <option value="mp">Marker Personalizzato</option>
                            <option value="cm">Marker Cerchio</option>
                            <option value="t">Marker Triangolo</option>
                            <option value="q">Marker Quadrato</option>

                        </select>
                    </td>
                </tr>
                <tr>
                    <td>Serie 3</td>
                    <td><input type="checkbox" class="usa" data-i="3"></td>
                    <td><input type="checkbox" class="comp" data-i="3"></td>
                    <td><input type="checkbox" class="escl" data-i="3"></td>
                    <td><input type="file" class="icon" data-i="3"></td>
                    <td><select class="colore" data-i="3">
                            <option value="" selected disabled hidden></option>
                            <option value="blue">blue</option>
                            <option value="red">red</option>
                            <option value="green">green</option>
                        </select>
                    </td>
                    <td><select class="modalita" data-i="3" >
                            <option value="" selected disabled hidden></option>
                            <option value="a">Evidenzia Area</option>
                            <option value="mp">Marker Personalizzato</option>
                            <option value="cm">Marker Cerchio</option>
                            <option value="t">Marker Triangolo</option>
                            <option value="q">Marker Quadrato</option>

                        </select>
                    </td>
                </tr>
                <tr>
                    <td>Serie 4</td>
                    <td><input type="checkbox" class="usa" data-i="4"></td>
                    <td><input type="checkbox" class="comp" data-i="4"></td>
                    <td><input type="checkbox" class="escl" data-i="4"></td>
                    <td><input type="file" class="icon" data-i="4"></td>
                    <td><select class="colore" data-i="4">
                            <option value="" selected disabled hidden></option>
                            <option value="blue">blue</option>
                            <option value="red">red</option>
                            <option value="green">green</option>
                        </select>
                    </td>
                    <td><select class="modalita" data-i="4" >
                            <option value="" selected disabled hidden></option>
                            <option value="a">Evidenzia Area</option>
                            <option value="mp">Marker Personalizzato</option>
                            <option value="cm">Marker Cerchio</option>
                            <option value="t">Marker Triangolo</option>
                            <option value="q">Marker Quadrato</option>

                        </select>
                    </td>
                </tr>
                <tr>
                    <td>Serie 5</td>
                    <td><input type="checkbox" class="usa" data-i="5"></td>
                    <td><input type="checkbox" class="comp" data-i="5"></td>
                    <td><input type="checkbox" class="escl" data-i="5"></td>
                    <td><input type="file" class="icon" data-i="5"></td>
                    <td><select class="colore" data-i="5">
                            <option value="" selected disabled hidden></option>
                            <option value="blue">blue</option>
                            <option value="red">red</option>
                            <option value="green">green</option>
                        </select>
                    </td>
                    <td><select class="modalita" data-i="5" >
                            <option value="" selected disabled hidden></option>
                            <option value="a">Evidenzia Area</option>
                            <option value="mp">Marker Personalizzato</option>
                            <option value="cm">Marker Cerchio</option>
                            <option value="t">Marker Triangolo</option>
                            <option value="q">Marker Quadrato</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2>Opzioni di visualizzazione</h2>
        <label>Drill: </label><input type="checkbox" id="drill"> <br>
        <label>Evidenzia Area: </label><input type="checkbox" id="evi"><br>
        <label>Livello massimo:</label><select id="lvlmax">
            <option value="continenti" selected disabled hidden>continenti</option>
            <option value="nazioni">nazioni</option>
            <option value="regioni">regioni</option>
            <option value="province">province</option>
            <option value="comuni">comuni</option>
        </select>
        <label>Livello minimo:</label><select id="lvlmin">
            <option value="continenti">continenti</option>
            <option value="nazioni">nazioni</option>
            <option value="regioni">regioni</option>
            <option value="province">province</option>
            <option value="comuni" selected disabled hidden>comuni</option>
        </select> <br>
        <label>Livello di paragone</label> <select id="lvlpara">
            <option value="superiore" selected>Superiore</option>
            <option value="massimo">Massimo</option>
        </select>
        <h2>Opzioni di comparazione</h2>
        <label>Modalità</label> <select id="comp" >
            <option value="" selected disabled hidden></option>
            <option value="c">Cerchi concentrici</option>
            <option value="m">Marker colorati</option>
        </select><br>
        <label>Colore Confini </label><select id="confcomp">
            <option value="" selected disabled hidden></option>
            <option value="blue">blue</option>
            <option value="red">red</option>
            <option value="green">green</option>
        </select> <br>
        <label>Esclusività: </label> 
        <input type="checkbox" id="esclcomp">

        <br><br>
        <button type="submit">Salva configurazione</button>
    </form>
    <script src="setup/change.js"></script>
    <script>
        document.getElementById("setupForm").addEventListener("submit", function (e) {
            e.preventDefault();

            const objects = {};
            const formData = new FormData();

            for (let i = 1; i <= 5; i++) {
                const fileInput = document.querySelector(`.icon[data-i="${i}"]`);
                const file = fileInput.files[0];
                if (file) {
                formData.append(`icon_${i}`, file);
                }


                objects[`serie${i}`] = {
                    usa: document.querySelector(`.usa[data-i="${i}"]`).checked,
                    comparabile: document.querySelector(`.comp[data-i="${i}"]`).checked,
                    esclusivo: document.querySelector(`.escl[data-i="${i}"]`).checked,
                    colore_confini: document.querySelector(`.colore[data-i="${i}"]`).value,
                    modalita: document.querySelector(`.modalita[data-i="${i}"]`).value
                };
            }
            const comparable_options = {
                modalita: document.querySelector("#comp").value,
                colore_confini:document.querySelector("#confcomp").value,
                esclusivo:document.getElementById("esclcomp").checked
            };
            const livello_di_paragone=document.getElementById("lvlpara").value;
            const drill_down=document.querySelector("#drill").checked;
            const livello_massimo=document.getElementById("lvlmax").value;
            const livello_minimo=document.getElementById("lvlmin").value;
            const mostra_area=document.getElementById("evi").checked;

           const payload = {
    objects: objects,
    comparable_options: comparable_options,
    livello_di_paragone: livello_di_paragone,
    drill_down: drill_down,
    livello_massimo: livello_massimo,
    livello_minimo: livello_minimo,
    mostra_area: mostra_area
};

formData.append("data", JSON.stringify(payload));

    fetch("setup/salva_config.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(res => {
        console.log("Risposta server:", res);
        window.location.href = "../PaginaMappa.php";
    })
    .catch(err => console.error(err));
});
    </script>

</body>

</html>