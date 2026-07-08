const FORMATI_PAGINA = {
	"120x190": { w: 120, h: 190 },
	"130x200": { w: 130, h: 200 },
	"135x210": { w: 135, h: 210 },
	"140x210": { w: 140, h: 210 },
	"148x210": { w: 148, h: 210 },
	"150x210": { w: 150, h: 210 },
	"160x230": { w: 160, h: 230 },
	"170x240": { w: 170, h: 240 },
};

const STORAGE_KEY_PARAMETRI = "BookCoverPdf.parametri.v4";
const PARAMETRI_INTERFACCIA = [
	"html_formato_pagina",
	"html_larghezza_pagina",
	"html_altezza_pagina",
	"html_pagine",
	"html_tipografia",
	"html_carta",
	"html_rilegatura",
	"html_dorso",
	"html_blocca_dorso_manual",
	"html_abbondanza",
	"html_taglio",
	"html_margine",
	"html_aletta",
	"html_larghezza_isbn",
	"html_altezza_isbn",
	"html_isbn",
	"html_asse_orizzontale",
	"html_disegna_guide",
	"html_mostra_dati_tecnici",
	"html_nome_file_pdf",
	"html_scarica_pdf",
];

const ISBN_LAYOUT = {
	moduleWidth: 0.35,
	barHeight: 16,
	boxMarginX: 4,
	barTopInMinBox: 6,
	minBoxWidth: 41.25,
	minBoxHeight: 25,
};

const SOGLIA_DORSO_TESTO_MM = 6;
const MARGINE_SICUREZZA_DORSO_MM = 2;

let aggiornamentoDorsoAutomatico = false;
let ultimoDorsoCalcolato = null;

function byId(id) {
	return document.getElementById(id);
}

function rounded(input, digits) {
	if (window.BookCoverGeometry) {
		return window.BookCoverGeometry.rounded(input, digits);
	}
	var rounder = Math.pow(10, digits);
	return Math.round(input * rounder) / rounder;
}

function arrotonda(input) {
	if (window.BookCoverGeometry) {
		return window.BookCoverGeometry.arrotonda(input);
	}
	return rounded(input, 2);
}

function normalizzaNumeroInput(value) {
	return String(value || "").trim().replace(",", ".");
}

function creaNomeFileAutomatico(valori) {
	const dorso = Number.isFinite(valori.w_dorso) ? valori.w_dorso.toFixed(1).replace(".", "-") : "dorso";
	return "copertina_" + valori.w_pagina + "x" + valori.h_pagina + "_dorso_" + dorso + "mm.pdf";
}

function normalizzaNomeFilePdf(nome, valori) {
	let risultato = String(nome || "").trim();

	if (risultato === "") {
		risultato = creaNomeFileAutomatico(valori);
	}

	risultato = risultato
		.replace(/[\\/:*?"<>|]/g, "-")
		.replace(/\s+/g, "_")
		.replace(/_+/g, "_");

	if (!risultato.toLowerCase().endsWith(".pdf")) {
		risultato += ".pdf";
	}

	return risultato;
}

function applicaFormatoPagina() {
	const formato = byId("html_formato_pagina") ? byId("html_formato_pagina").value : "custom";
	const dimensioni = FORMATI_PAGINA[formato];
	if (!dimensioni) {
		return;
	}

	byId("html_larghezza_pagina").value = dimensioni.w;
	byId("html_altezza_pagina").value = dimensioni.h;
	aggiornaDorsoDaParametri();
	mostraMessaggi([], ["Formato pagina applicato: " + dimensioni.w + " x " + dimensioni.h + " mm."]);
}

function aggiornaFormatoPaginaDaDimensioni() {
	const select = byId("html_formato_pagina");
	if (!select) {
		return;
	}

	const w = Number(normalizzaNumeroInput(byId("html_larghezza_pagina") ? byId("html_larghezza_pagina").value : ""));
	const h = Number(normalizzaNumeroInput(byId("html_altezza_pagina") ? byId("html_altezza_pagina").value : ""));

	for (const [chiave, dimensioni] of Object.entries(FORMATI_PAGINA)) {
		if (w === dimensioni.w && h === dimensioni.h) {
			select.value = chiave;
			return;
		}
	}

	select.value = "custom";
}

function getModuloTipografie() {
	return window.BookCoverTipografie || null;
}

function getTipografiaSelezionataId() {
	const select = byId("html_tipografia");
	if (select && select.value) {
		return select.value;
	}

	const modulo = getModuloTipografie();
	return modulo ? modulo.getTipografiaDefault().id : "universalbook";
}

function getCartaSelezionataId() {
	const select = byId("html_carta");
	return select ? select.value : "";
}

function popolaTipografie(tipografiaDaSelezionare) {
	const modulo = getModuloTipografie();
	const select = byId("html_tipografia");
	if (!modulo || !select) {
		return;
	}

	const tipografie = modulo.getTipografie();
	const idDaSelezionare = tipografiaDaSelezionare || select.value || modulo.getTipografiaDefault().id;

	select.replaceChildren();
	for (const tipografia of tipografie) {
		const option = document.createElement("option");
		option.value = tipografia.id;
		option.textContent = tipografia.nome;
		select.appendChild(option);
	}

	if (tipografie.some(t => t.id === idDaSelezionare)) {
		select.value = idDaSelezionare;
	} else {
		select.value = modulo.getTipografiaDefault().id;
	}
}

function popolaCarte(tipografiaId, cartaDaSelezionare) {
	const modulo = getModuloTipografie();
	const select = byId("html_carta");
	if (!modulo || !select) {
		return;
	}

	const cartaCompatibile = modulo.trovaPrimaCartaCompatibile(tipografiaId, cartaDaSelezionare || select.value);
	const carte = modulo.getCarte(tipografiaId);

	select.replaceChildren();
	if (carte.length === 0) {
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "Nessuna carta configurata";
		select.appendChild(option);
		select.disabled = true;
		return;
	}

	select.disabled = false;
	for (const carta of carte) {
		const option = document.createElement("option");
		option.value = carta.carta;
		option.textContent = modulo.formattaEtichettaCarta(carta);
		select.appendChild(option);
	}

	select.value = cartaCompatibile ? cartaCompatibile.carta : carte[0].carta;
}

function onChangeTipografia() {
	const tipografiaId = getTipografiaSelezionataId();
	const cartaCorrente = getCartaSelezionataId();
	popolaCarte(tipografiaId, cartaCorrente);
	onChangeValue();
}

function calcolaAvvisiTipografiaCarta() {
	const avvisi = [];
	const modulo = getModuloTipografie();

	if (!modulo) {
		return avvisi;
	}

	const tipografiaId = getTipografiaSelezionataId();
	const cartaId = getCartaSelezionataId();
	const tipografia = modulo.getTipografia(tipografiaId);
	const carta = modulo.trovaCarta(tipografiaId, cartaId);

	if (tipografia && tipografia.provvisorio) {
		avvisi.push('Profilo tipografia "' + tipografia.nome + '" da verificare: controllare gli spessori in tipografie.js prima della stampa definitiva.');
	}

	if (carta && carta.provvisorio && !(tipografia && tipografia.provvisorio)) {
		avvisi.push('Carta "' + (carta.nome || carta.carta) + '" con spessori provvisori: verificare con la tipografia.');
	}

	return avvisi;
}

function completa_isbn() {
	if (!window.BookCoverISBN) {
		mostraMessaggi(["Modulo ISBN non caricato: impossibile calcolare il check digit."], []);
		return;
	}

	try {
		const isbnCompleto = window.BookCoverISBN.completaISBN13(byId("html_isbn").value);
		byId("html_isbn").value = isbnCompleto;
		mostraMessaggi([], ["ISBN completato/corretto: " + window.BookCoverISBN.formattaISBN13(isbnCompleto) + "."]);
	} catch (errore) {
		mostraMessaggi([errore.message], []);
	}
}

function raccogliParametriInterfaccia() {
	const parametri = {};
	for (const id of PARAMETRI_INTERFACCIA) {
		const elemento = byId(id);
		if (!elemento) {
			continue;
		}

		if (elemento.type === "checkbox") {
			parametri[id] = elemento.checked;
		} else {
			parametri[id] = elemento.value;
		}
	}
	return parametri;
}

function applicaParametriInterfaccia(parametri) {
	if (!parametri || typeof parametri !== "object") {
		throw new Error("File parametri non valido.");
	}

	const valori = parametri.parametri && typeof parametri.parametri === "object" ? parametri.parametri : parametri;
	for (const id of PARAMETRI_INTERFACCIA) {
		if (!Object.prototype.hasOwnProperty.call(valori, id)) {
			continue;
		}

		const elemento = byId(id);
		if (!elemento) {
			continue;
		}

		if (elemento.type === "checkbox") {
			elemento.checked = Boolean(valori[id]);
		} else {
			elemento.value = valori[id];
		}
	}

	popolaTipografie(valori.html_tipografia || getTipografiaSelezionataId());
	popolaCarte(getTipografiaSelezionataId(), valori.html_carta || getCartaSelezionataId());
	aggiornaFormatoPaginaDaDimensioni();
	onChangeValue();
}

function salva_preset_locale() {
	try {
		localStorage.setItem(STORAGE_KEY_PARAMETRI, JSON.stringify({
			versione: 4,
			salvatoIl: new Date().toISOString(),
			parametri: raccogliParametriInterfaccia(),
		}));
		mostraMessaggi([], ["Preset salvato nel browser."]);
	} catch (errore) {
		mostraMessaggi(["Impossibile salvare il preset nel browser: " + errore.message], []);
	}
}

function carica_preset_locale() {
	try {
		const json = localStorage.getItem(STORAGE_KEY_PARAMETRI);
		if (!json) {
			mostraMessaggi(["Nessun preset salvato in questo browser."], []);
			return;
		}
		applicaParametriInterfaccia(JSON.parse(json));
		mostraMessaggi([], ["Preset caricato dal browser."]);
	} catch (errore) {
		mostraMessaggi(["Impossibile caricare il preset: " + errore.message], []);
	}
}

function esporta_parametri_json() {
	const dati = {
		tipo: "BookCoverPdfParametri",
		versione: 4,
		esportatoIl: new Date().toISOString(),
		parametri: raccogliParametriInterfaccia(),
	};
	const blob = new Blob([JSON.stringify(dati, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "parametri_copertina.json";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function apri_importa_parametri_json() {
	const input = byId("html_importa_parametri_json");
	if (input) {
		input.value = "";
		input.click();
	}
}

function importa_parametri_json(event) {
	const file = event && event.target && event.target.files ? event.target.files[0] : null;
	if (!file) {
		return;
	}

	const reader = new FileReader();
	reader.onload = function () {
		try {
			applicaParametriInterfaccia(JSON.parse(String(reader.result || "{}")));
			mostraMessaggi([], ["Parametri importati dal file JSON."]);
		} catch (errore) {
			mostraMessaggi(["Impossibile importare i parametri: " + errore.message], []);
		}
	};
	reader.readAsText(file);
}

function leggiNumero(id, nomeCampo, min, max, obbligatorio = true) {
	const elemento = byId(id);
	const testo = elemento ? normalizzaNumeroInput(elemento.value) : "";
	const errori = [];

	if (testo === "") {
		if (obbligatorio) {
			errori.push(nomeCampo + ": campo obbligatorio.");
		}
		return { valore: NaN, errori: errori };
	}

	const valore = Number(testo);

	if (!Number.isFinite(valore)) {
		errori.push(nomeCampo + ": inserire un numero valido.");
		return { valore: NaN, errori: errori };
	}

	if (min !== null && valore < min) {
		errori.push(nomeCampo + ": il valore minimo consentito e' " + min + ".");
	}

	if (max !== null && valore > max) {
		errori.push(nomeCampo + ": il valore massimo consentito e' " + max + ".");
	}

	return { valore: valore, errori: errori };
}

function leggiIntero(id, nomeCampo, min, max) {
	const letto = leggiNumero(id, nomeCampo, min, max);
	if (letto.errori.length === 0 && !Number.isInteger(letto.valore)) {
		letto.errori.push(nomeCampo + ": inserire un numero intero.");
	}
	return letto;
}

function calcolaDorso(pagine, carta, rilegatura, tipografiaId) {
	const modulo = getModuloTipografie();
	if (!modulo) {
		throw new Error("Modulo tipografie non caricato.");
	}

	const idTipografia = tipografiaId || getTipografiaSelezionataId();
	const spessore = modulo.getSpessore(idTipografia, carta);
	if (!spessore) {
		throw new Error("Tipo di carta non riconosciuto per la tipografia selezionata.");
	}

	if (rilegatura !== "fresata" && rilegatura !== "cucita") {
		throw new Error("Tipo di rilegatura non riconosciuto.");
	}

	const fogli = pagine / 2;
	const spessoreMicron = rilegatura === "fresata" ? spessore.fresata : spessore.cucita;
	return (fogli * spessoreMicron) / 1000;
}

function calculate(pagine, carta, rilegatura, tipografiaId) {
	return calcolaDorso(pagine, carta, rilegatura, tipografiaId || "universalbook");
}

function aggiornaDorsoDaParametri() {
	const pagineLette = leggiIntero("html_pagine", "Numero di pagine", 2, 2000);
	const tipografia = getTipografiaSelezionataId();
	const carta = getCartaSelezionataId();
	const rilegatura = byId("html_rilegatura").value;

	if (pagineLette.errori.length > 0) {
		ultimoDorsoCalcolato = null;
		aggiornaTestoDorsoCalcolato();
		return;
	}

	try {
		ultimoDorsoCalcolato = calcolaDorso(pagineLette.valore, carta, rilegatura, tipografia);
		aggiornaTestoDorsoCalcolato();

		const bloccaDorso = byId("html_blocca_dorso_manual");
		if (!bloccaDorso || !bloccaDorso.checked) {
			aggiornamentoDorsoAutomatico = true;
			byId("html_dorso").value = ultimoDorsoCalcolato.toFixed(1);
			aggiornamentoDorsoAutomatico = false;
		}
	} catch (errore) {
		ultimoDorsoCalcolato = null;
		aggiornaTestoDorsoCalcolato();
	}
}

function aggiornaTestoDorsoCalcolato() {
	const info = byId("html_dorso_calcolato");
	if (!info) {
		return;
	}

	if (ultimoDorsoCalcolato === null) {
		info.textContent = "Dorso calcolato: non disponibile";
	} else {
		info.textContent = "Dorso calcolato: " + ultimoDorsoCalcolato.toFixed(1) + " mm";
	}
}

function onChangeValue() {
	aggiornaDorsoDaParametri();
	mostraMessaggi([], calcolaAvvisiPagina());
}

function calcolaAvvisiPagina() {
	const avvisi = [];
	const pagineLette = leggiIntero("html_pagine", "Numero di pagine", 2, 2000);

	if (pagineLette.errori.length === 0) {
		if (pagineLette.valore % 2 !== 0) {
			avvisi.push("Numero pagine dispari: verificare con la tipografia prima di usare il dorso calcolato.");
		}
		if (pagineLette.valore % 4 !== 0) {
			avvisi.push("Numero pagine non multiplo di 4: e' ammesso, ma per molti libri conviene verificare segnature e allestimento.");
		}
	}

	avvisi.push(...calcolaAvvisiTipografiaCarta());
	return avvisi;
}

function mostraMessaggi(errori, avvisi) {
	const contenitore = byId("html_messaggi");
	if (!contenitore) {
		if (errori.length > 0) {
			alert(errori.join("\n"));
		}
		return;
	}

	contenitore.replaceChildren();
	contenitore.className = "messaggi";

	if (errori.length === 0 && avvisi.length === 0) {
		contenitore.hidden = true;
		return;
	}

	contenitore.hidden = false;

	if (errori.length > 0) {
		contenitore.classList.add("messaggi-errore");
		const titolo = document.createElement("strong");
		titolo.textContent = "Correggere prima di creare il PDF:";
		contenitore.appendChild(titolo);
		contenitore.appendChild(creaLista(errori));
	}

	if (avvisi.length > 0) {
		contenitore.classList.add("messaggi-avviso");
		const titolo = document.createElement("strong");
		titolo.textContent = errori.length > 0 ? "Avvisi:" : "Avvisi:";
		contenitore.appendChild(titolo);
		contenitore.appendChild(creaLista(avvisi));
	}
}

function creaLista(voci) {
	const ul = document.createElement("ul");
	for (const voce of voci) {
		const li = document.createElement("li");
		li.textContent = voce;
		ul.appendChild(li);
	}
	return ul;
}

function validaParametriPdf() {
	const errori = [];
	const avvisi = calcolaAvvisiPagina();

	function aggiungiNumero(nome, letto) {
		errori.push(...letto.errori);
		return letto.valore;
	}

	const valori = {
		w_pagina: aggiungiNumero("w_pagina", leggiNumero("html_larghezza_pagina", "Larghezza pagina", 1, 10000)),
		h_pagina: aggiungiNumero("h_pagina", leggiNumero("html_altezza_pagina", "Altezza pagina", 1, 10000)),
		pagine: aggiungiNumero("pagine", leggiIntero("html_pagine", "Numero di pagine", 2, 2000)),
		w_dorso: aggiungiNumero("w_dorso", leggiNumero("html_dorso", "Larghezza dorso", 0, 10000)),
		aletta: aggiungiNumero("aletta", leggiNumero("html_aletta", "Aletta", 0, 10000)),
		abbondanza: aggiungiNumero("abbondanza", leggiNumero("html_abbondanza", "Abbondanza", 0, 100)),
		taglio: aggiungiNumero("taglio", leggiNumero("html_taglio", "Dimensione segni di taglio", 0, 1000)),
		margine: aggiungiNumero("margine", leggiNumero("html_margine", "Margine interno di sicurezza", 0, 1000)),
		w_isbn: aggiungiNumero("w_isbn", leggiNumero("html_larghezza_isbn", "Larghezza ISBN", ISBN_LAYOUT.minBoxWidth, 10000)),
		h_isbn: aggiungiNumero("h_isbn", leggiNumero("html_altezza_isbn", "Altezza ISBN", ISBN_LAYOUT.minBoxHeight, 10000)),
		h_asse: aggiungiNumero("h_asse", leggiNumero("html_asse_orizzontale", "Asse orizzontale dal bordo inferiore", 0, 10000)),
		isbn: "",
		disegnaGuide: byId("html_disegna_guide") ? byId("html_disegna_guide").checked : true,
		mostraDatiTecnici: byId("html_mostra_dati_tecnici") ? byId("html_mostra_dati_tecnici").checked : false,
		scaricaPdf: byId("html_scarica_pdf") ? byId("html_scarica_pdf").checked : false,
	};

	const tipografia = getTipografiaSelezionataId();
	const carta = getCartaSelezionataId();
	const rilegatura = byId("html_rilegatura") ? byId("html_rilegatura").value : "";
	valori.tipografia = tipografia;
	valori.carta = carta;
	valori.rilegatura = rilegatura;

	const moduloTipografie = getModuloTipografie();
	if (!moduloTipografie) {
		errori.push("Modulo tipografie non caricato: verificare che tipografie.js sia incluso prima di script.js.");
	} else {
		const tipografiaConfig = moduloTipografie.getTipografia(tipografia);
		const cartaConfig = moduloTipografie.trovaCarta(tipografia, carta);

		if (!tipografiaConfig) {
			errori.push("Tipografia non riconosciuta.");
		}

		if (!cartaConfig) {
			errori.push("Tipo di carta non riconosciuto per la tipografia selezionata.");
		}
	}

	if (rilegatura !== "fresata" && rilegatura !== "cucita") {
		errori.push("Tipo di rilegatura non riconosciuto.");
	}

	if (errori.length === 0) {
		if (valori.margine * 2 >= valori.w_pagina) {
			errori.push("Margine interno troppo grande rispetto alla larghezza pagina.");
		}
		if (valori.margine * 2 >= valori.h_pagina) {
			errori.push("Margine interno troppo grande rispetto all'altezza pagina.");
		}
		if (valori.aletta > 0 && valori.margine * 2 >= valori.aletta) {
			errori.push("Margine interno troppo grande rispetto alla larghezza aletta.");
		}
		if (valori.w_isbn > valori.w_pagina - valori.margine * 2) {
			errori.push("ISBN troppo largo: deve stare dentro la quarta di copertina rispettando il margine di sicurezza.");
		}
		if (valori.h_isbn > valori.h_pagina - valori.margine * 2) {
			errori.push("ISBN troppo alto: deve stare dentro la quarta di copertina rispettando il margine di sicurezza.");
		}
		if (valori.h_asse > valori.h_pagina) {
			errori.push("Asse orizzontale fuori pagina: il valore deve essere compreso tra 0 e l'altezza pagina.");
		}
		if (valori.w_dorso > 0 && valori.w_dorso < SOGLIA_DORSO_TESTO_MM) {
			avvisi.push("Dorso inferiore a " + SOGLIA_DORSO_TESTO_MM + " mm: testo sul dorso sconsigliato o da verificare con la tipografia.");
		}
	}

	if (!window.BookCoverGeometry) {
		errori.push("Modulo geometria non caricato: verificare che geometry.js sia incluso prima di script.js.");
	}

	if (!window.BookCoverISBN) {
		errori.push("Modulo ISBN non caricato: verificare che isbn.js sia incluso prima di script.js.");
	} else {
		const esitoISBN = window.BookCoverISBN.validaISBN13(byId("html_isbn").value);
		if (!esitoISBN.valido) {
			errori.push(...esitoISBN.errori);
		}
		valori.isbn = esitoISBN.isbn;
	}

	valori.nomeFilePdf = normalizzaNomeFilePdf(byId("html_nome_file_pdf") ? byId("html_nome_file_pdf").value : "", valori);

	return {
		valido: errori.length === 0,
		errori: errori,
		avvisi: avvisi,
		valori: valori,
	};
}

function crea_svg() {
	// Funzione lasciata intenzionalmente vuota: il flusso di lavoro attuale genera il PDF.
}

function crea_pdf() {
	const validazione = validaParametriPdf();
	mostraMessaggi(validazione.errori, validazione.avvisi);

	if (!validazione.valido) {
		return;
	}

	const w_pagina = validazione.valori.w_pagina;
	const h_pagina = validazione.valori.h_pagina;
	const w_dorso = validazione.valori.w_dorso;
	const aletta = validazione.valori.aletta;
	const abbondanza = validazione.valori.abbondanza;
	const taglio = validazione.valori.taglio;
	const margine = validazione.valori.margine;
	const w_isbn = validazione.valori.w_isbn;
	const h_isbn = validazione.valori.h_isbn;
	const isbn = validazione.valori.isbn;
	const h_asse = validazione.valori.h_asse;

	const geometria = window.BookCoverGeometry.calcolaGeometriaCopertina(validazione.valori);
	const { xa, xb, xc, xd, xf, xg, xh, xj, xl, xm, xn, xp, xq, xs, xt, xu, ya, yb, yc, yd, ye, yf, yh, yi, yj } = geometria.coordinate;
	const { w_foglio, h_foglio, w_abbondanza, h_abbondanza, w_aletta, h_aletta } = geometria.dimensioni;

	const { jsPDF } = window.jspdf;

	const doc = new jsPDF({
		orientation: w_foglio > h_foglio ? "landscape" : "portrait",
		unit: "mm",
		format: [w_foglio, h_foglio]
	});

	if (typeof doc.setProperties === "function") {
		doc.setProperties({
			title: validazione.valori.nomeFilePdf.replace(/\.pdf$/i, ""),
			subject: "Base tecnica copertina editoriale",
			author: "BookCover PDF",
			creator: "BookCover PDF",
		});
	}

	if (validazione.valori.mostraDatiTecnici) {
		doc.setFont("Courier", "bold");
		doc.setFontSize(10);
		doc.text("Dimensioni: " + w_foglio.toFixed(2) + ", " + h_foglio.toFixed(2), xn, arrotonda(h_pagina / 2), null, null, "center");
	}

	if (validazione.valori.disegnaGuide) {
		// ASSE ORIZZONTALE
		doc.setLineWidth(0.1);
		doc.setDrawColor(128, 128, 128);
		doc.setLineDash([3, 1, 0.1, 1]);
		doc.line(xb, ye, xt, ye);

		// ASSE CENTRO COPERTINA
		doc.setLineWidth(0.1);
		doc.setDrawColor(128, 128, 128);
		doc.setLineDash([3, 1, 0.1, 1]);
		doc.line(xn, yb, xn, yi);

		// ALETTE
		if (aletta > 0) {
			doc.setLineWidth(0.1);
			doc.setDrawColor(255, 0, 0);
			doc.setLineDash();
			doc.rect(xc, yc, w_aletta, h_aletta);
			doc.rect(xp, yc, w_aletta, h_aletta);
		}

		// PAGINE
		doc.setLineWidth(0.1);
		doc.setDrawColor(255, 0, 0);
		doc.setLineDash();
		doc.rect(xf, yc, w_pagina, h_pagina);
		doc.rect(xl, yc, w_pagina, h_pagina);

		// DORSO
		doc.setLineWidth(0.1);
		doc.setDrawColor(255, 0, 0);
		doc.setLineDash();
		doc.rect(xj, yc, w_dorso, h_pagina);

		// RETTANGOLO DI ABBONDANZA
		doc.setLineWidth(0.1);
		doc.setDrawColor(164, 164, 164);
		doc.setLineDash();
		doc.rect(xb, yb, w_abbondanza, h_abbondanza);

		// LINEE DI TAGLIO E DI PIEGA
		doc.setLineWidth(0.1);
		doc.setDrawColor(0, 0, 0);
		doc.setLineDash();

		doc.line(xa, yc, xb, yc);
		doc.line(xa, yh, xb, yh);
		doc.line(xt, yc, xu, yc);
		doc.line(xt, yh, xu, yh);

		doc.line(xc, ya, xc, yb);
		doc.line(xc, yi, xc, yj);
		doc.line(xj, ya, xj, yb);
		doc.line(xj, yi, xj, yj);
		doc.line(xl, ya, xl, yb);
		doc.line(xl, yi, xl, yj);
		doc.line(xs, ya, xs, yb);
		doc.line(xs, yi, xs, yj);

		if (aletta > 0) {
			doc.line(xf, ya, xf, yb);
			doc.line(xf, yi, xf, yj);
			doc.line(xp, ya, xp, yb);
			doc.line(xp, yi, xp, yj);
		} else {
			doc.line(xp, ya, xp, yb);
			doc.line(xp, yi, xp, yj);
		}

	}

	// ISBN
	disegnaISBN(doc, isbn, xh, yf, w_isbn, h_isbn);

	if (validazione.valori.disegnaGuide) {
		// MARGINI DI SICUREZZA
		doc.setLineWidth(0.1);
		doc.setDrawColor(0, 0, 128);
		doc.setLineDash([1, 1]);

		if (aletta > 0) {
			doc.rect(xd, yd, arrotonda(aletta - margine * 2), arrotonda(h_pagina - margine * 2));
			doc.rect(xq, yd, arrotonda(aletta - margine * 2), arrotonda(h_pagina - margine * 2));
		}

		doc.rect(xg, yd, arrotonda(w_pagina - margine * 2), arrotonda(h_pagina - margine * 2));
		doc.rect(xm, yd, arrotonda(w_pagina - margine * 2), arrotonda(h_pagina - margine * 2));

		// SICUREZZA DORSO
		if (w_dorso > MARGINE_SICUREZZA_DORSO_MM * 2 && h_pagina > margine * 2) {
			doc.rect(
				arrotonda(xj + MARGINE_SICUREZZA_DORSO_MM),
				yd,
				arrotonda(w_dorso - MARGINE_SICUREZZA_DORSO_MM * 2),
				arrotonda(h_pagina - margine * 2)
			);
		}
	}

	if (validazione.valori.scaricaPdf) {
		doc.save(validazione.valori.nomeFilePdf);
	} else {
		window.open(doc.output('bloburl'));
	}
}

function disegnaISBN(doc, isbn, x, y, w, h) {
	const bits = window.BookCoverISBN.codificaISBN(isbn).split("");
	const cifre = window.BookCoverISBN.normalizzaISBN(isbn).split("");
	const extraX = Math.max(0, w - ISBN_LAYOUT.minBoxWidth) / 2;
	const extraY = Math.max(0, h - ISBN_LAYOUT.minBoxHeight) / 2;
	const posX = x + ISBN_LAYOUT.boxMarginX + extraX;
	const posY = y + ISBN_LAYOUT.barTopInMinBox + extraY;

	// Rettangolo bianco di protezione ISBN.
	doc.setFillColor(255, 255, 255);
	doc.rect(x, y, w, h, 'F');

	doc.setLineWidth(0);
	doc.setFillColor(0, 0, 0);

	for (let c = 0; c < bits.length; c++) {
		if (bits[c] === '1') {
			const altezzaBarra = c <= 3 || c >= 92 || (c >= 46 && c <= 49)
				? ISBN_LAYOUT.barHeight
				: ISBN_LAYOUT.barHeight - 2;
			doc.rect(posX + c * ISBN_LAYOUT.moduleWidth, posY, ISBN_LAYOUT.moduleWidth, altezzaBarra, 'F');
		}
	}

	doc.setFont("Courier", "normal");
	doc.setFontSize(8);
	doc.text(posX - 2.75, posY + ISBN_LAYOUT.barHeight + 0.75, cifre[0]);
	for (let c = 1; c <= 6; c++) {
		doc.text(posX + 1.75 + (c - 1) * 2.40, posY + ISBN_LAYOUT.barHeight + 0.75, cifre[c]);
	}
	for (let c = 1; c <= 6; c++) {
		doc.text(posX + 17.75 + (c - 1) * 2.40, posY + ISBN_LAYOUT.barHeight + 0.75, cifre[c + 6]);
	}

	doc.setFont("Courier", "normal");
	doc.setFontSize(8);
	doc.text(posX - 1, posY - 1, "ISBN " + window.BookCoverISBN.formattaISBN13(isbn));
}

function inizializzaInterfaccia() {
	const formatoPagina = byId('html_formato_pagina');
	const larghezzaPagina = byId('html_larghezza_pagina');
	const altezzaPagina = byId('html_altezza_pagina');
	const pagine = byId('html_pagine');
	const tipografia = byId('html_tipografia');
	const carta = byId('html_carta');
	const rilegatura = byId('html_rilegatura');
	const dorso = byId('html_dorso');
	const bloccaDorso = byId('html_blocca_dorso_manual');

	popolaTipografie(tipografia ? tipografia.value : "universalbook");
	popolaCarte(getTipografiaSelezionataId(), carta ? carta.value : "uso-mano-bianca-100g");

	if (formatoPagina) {
		formatoPagina.addEventListener('change', applicaFormatoPagina);
	}
	if (larghezzaPagina) {
		larghezzaPagina.addEventListener('input', aggiornaFormatoPaginaDaDimensioni);
	}
	if (altezzaPagina) {
		altezzaPagina.addEventListener('input', aggiornaFormatoPaginaDaDimensioni);
	}
	if (pagine) {
		pagine.addEventListener('input', onChangeValue);
	}
	if (tipografia) {
		tipografia.addEventListener('change', onChangeTipografia);
	}
	if (carta) {
		carta.addEventListener('change', onChangeValue);
	}
	if (rilegatura) {
		rilegatura.addEventListener('change', onChangeValue);
	}
	if (dorso) {
		dorso.addEventListener('input', function () {
			if (!aggiornamentoDorsoAutomatico && bloccaDorso) {
				bloccaDorso.checked = true;
			}
		});
	}
	if (bloccaDorso) {
		bloccaDorso.addEventListener('change', function () {
			if (!bloccaDorso.checked && ultimoDorsoCalcolato !== null) {
				aggiornamentoDorsoAutomatico = true;
				byId("html_dorso").value = ultimoDorsoCalcolato.toFixed(1);
				aggiornamentoDorsoAutomatico = false;
			}
		});
	}

	onChangeValue();
}

window.onChangeValue = onChangeValue;
window.onChangeTipografia = onChangeTipografia;
window.applicaFormatoPagina = applicaFormatoPagina;
window.completa_isbn = completa_isbn;
window.salva_preset_locale = salva_preset_locale;
window.carica_preset_locale = carica_preset_locale;
window.esporta_parametri_json = esporta_parametri_json;
window.apri_importa_parametri_json = apri_importa_parametri_json;
window.importa_parametri_json = importa_parametri_json;
window.crea_pdf = crea_pdf;
window.calculate = calculate;
window.crea_svg = crea_svg;
window.validaParametriPdf = validaParametriPdf;
window.normalizzaNomeFilePdf = normalizzaNomeFilePdf;

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", inizializzaInterfaccia);
} else {
	inizializzaInterfaccia();
}
