<?php

/* =========================
   🟢 LETTURA JSON DA FORM
   ========================= */

if (!isset($_POST["data"])) {
    die("Errore: dati mancanti");
}

$data = json_decode($_POST["data"], true);
if (!is_array($data)) {
    die("Errore: JSON non valido");
}


$uploadDir = __DIR__ . "/../imgs/";  // 👈 FUORI dalla cartella PHP

// sicurezza: anche se già esiste non rompe nulla
if (!is_dir($uploadDir)) {
    die("Errore: cartella imgs non trovata");
}

/* =========================
   🟢 UPLOAD FILE
   ========================= */

for ($i = 1; $i <= 5; $i++) {

    $key = "icon_$i";

    if (isset($_FILES[$key]) && $_FILES[$key]["error"] === 0) {

        $file = $_FILES[$key];
        $name = basename($file["name"]);

        // evita collisioni nomi
        $uniqueName = time() . "_" . $name;
        $target = $uploadDir . $uniqueName;

        if (move_uploaded_file($file["tmp_name"], $target)) {

            // URL che userai in Leaflet
            $data["objects"]["serie$i"]["icona"] = "imgs/" . $uniqueName;
        }
    }
}

/* =========================
   🟢 SALVATAGGIO CONFIG.JSON
   ========================= */

$percorso = __DIR__ . "/config.json";

$json = json_encode($data, JSON_PRETTY_PRINT);

if ($json === false) {
    die("Errore encoding JSON");
}

$result = file_put_contents($percorso, $json);

if ($result === false) {
    die("Errore scrittura config.json (permessi?)");
}

echo "Configurazione salvata!";