<?php

/* =========================
   LETTURA JSON DA FORM
   ========================= */

if (!isset($_POST["data"])) {
    die("Errore: dati mancanti");
}

$data = json_decode($_POST["data"], true);
if (!is_array($data)) {
    die("Errore: JSON non valido");
}

/* =========================
   VALIDAZIONE CONFIGURAZIONE
   ========================= */

$livelli = ["continenti", "nazioni", "regioni", "province", "comuni"];

$max = $data["livello_massimo"] ?? null;
$min = $data["livello_minimo"] ?? null;

if (!in_array($max, $livelli, true) || !in_array($min, $livelli, true)) {
    die("Errore: livelli amministrativi non validi");
}

// il livello minimo non può essere più generale del massimo
if (array_search($min, $livelli) < array_search($max, $livelli)) {
    die("Errore: il livello minimo deve essere uguale o più specifico del livello massimo");
}

// le modalità di drill-down si escludono a vicenda
$drill = $data["drill_down"] ?? "no";

// compatibilità con le configurazioni precedenti, in cui era un booleano
if ($drill === true)  $drill = "automatico";
if ($drill === false) $drill = "no";

if (!in_array($drill, ["no", "automatico", "manuale"], true)) {
    die("Errore: modalità di drill-down non valida");
}

$data["drill_down"] = $drill;

$uploadDir = __DIR__ . "/../images/";

if (!is_dir($uploadDir)) {
    die("Errore: cartella images non trovata");
}

/* =========================
   UPLOAD FILE
   ========================= */

// estensioni ammesse e corrispondenti tipi MIME reali
$estensioniAmmesse = [
    "png"  => "image/png",
    "jpg"  => "image/jpeg",
    "jpeg" => "image/jpeg",
    "gif"  => "image/gif",
    "webp" => "image/webp"
];

$dimensioneMax = 2 * 1024 * 1024; // 2 MB

for ($i = 1; $i <= 5; $i++) {

    $key = "icon_$i";

    if (!isset($_FILES[$key]) || $_FILES[$key]["error"] !== UPLOAD_ERR_OK) {
        continue;
    }

    $file = $_FILES[$key];

    if ($file["size"] > $dimensioneMax) {
        die("Errore: l'icona della serie $i supera i 2 MB");
    }

    $estensione = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

    if (!isset($estensioniAmmesse[$estensione])) {
        die("Errore: formato icona non ammesso per la serie $i (usare PNG, JPG, GIF o WEBP)");
    }

    // il tipo dichiarato dal browser non è affidabile: si verifica il contenuto
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeReale = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    if ($mimeReale !== $estensioniAmmesse[$estensione]) {
        die("Errore: il file caricato per la serie $i non è un'immagine valida");
    }

    // nome generato dal server: evita collisioni e nomi arbitrari
    $uniqueName = time() . "_serie" . $i . "." . $estensione;
    $target = $uploadDir . $uniqueName;

    if (move_uploaded_file($file["tmp_name"], $target)) {
        $data["objects"]["serie$i"]["icona"] = "images/" . $uniqueName;
    } else {
        die("Errore: impossibile salvare l'icona della serie $i");
    }
}

/* =========================
   COERENZA MODALITA' / ICONA
   ========================= */

for ($i = 1; $i <= 5; $i++) {
    $serie = $data["objects"]["serie$i"] ?? null;
    if (!$serie || !$serie["usa"]) {
        continue;
    }

    if (($serie["modalita"] ?? "") === "mp" && empty($serie["icona"])) {
        die("Errore: la serie $i usa il marker personalizzato ma non ha un'icona associata");
    }
}

/* =========================
   SALVATAGGIO CONFIG.JSON
   ========================= */

$percorso = __DIR__ . "/config.json";

$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

if ($json === false) {
    die("Errore encoding JSON");
}

if (file_put_contents($percorso, $json) === false) {
    die("Errore scrittura config.json (permessi?)");
}

echo "Configurazione salvata!";