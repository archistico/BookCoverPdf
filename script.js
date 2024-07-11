function onChangeValue() {
	let pagine = parseInt(document.getElementById("html_pagine").value)
	let carta = document.getElementById("html_carta").value
	let rilegatura = document.getElementById("html_rilegatura").value
	calculate(pagine, carta, rilegatura)
}

function calculate(pagine, carta, rilegatura) {
	let dorso = 0
	const spessori = [
		{ carta: 'uso-mano-avorio-80g', fresata: 98, cucita: 108 },
		{ carta: 'uso-mano-avorio-100g', fresata: 122, cucita: 140 },
		{ carta: 'uso-mano-avorio-120g', fresata: 137, cucita: 160 },
		{ carta: 'uso-mano-bianca-80g', fresata: 94, cucita: 107 },
		{ carta: 'uso-mano-bianca-90g', fresata: 111, cucita: 127 },
		{ carta: 'uso-mano-bianca-100g', fresata: 125, cucita: 140 },
		{ carta: 'uso-mano-bianca-120g', fresata: 150, cucita: 165 },
		{ carta: 'freelife-bianca-100g', fresata: 112, cucita: 122 },
		{ carta: 'lux-cream-avorio-80g', fresata: 140, cucita: 155 },
		{ carta: 'uso-mano-spessorata-avorio-100g', fresata: 157, cucita: 174 },
		{ carta: 'tintoretto-avorio-95g', fresata: 117, cucita: 140 },
		{ carta: 'tintoretto-bianca-95g', fresata: 117, cucita: 140 },
	]

	let fresata = 0
	let cucita = 0

	spessori.forEach(s => {
		if (s.carta === carta) {
			fresata = s.fresata
			cucita = s.cucita
		}
	});

	const fogli = pagine / 2

	if (rilegatura == 'fresata') {
		dorso = (fogli * fresata) / 1000
	} else {
		dorso = (fogli * cucita) / 1000
	}

	const html_dorso = document.getElementById('html_dorso')
	html_dorso.value = dorso.toFixed(1)
}

let num = document.querySelector('#html_pagine');
num.addEventListener('input', function() {
	let pagine = parseInt(document.getElementById("html_pagine").value)
	let carta = document.getElementById("html_carta").value
	let rilegatura = document.getElementById("html_rilegatura").value
	calculate(pagine, carta, rilegatura)
});

function rounded(input, digits) {
	var rounder = Math.pow(10, digits);
	return Math.round(input * rounder) / rounder;
}

function arrotonda(input) {
	return rounded(input, 2);
}

function crea_svg() {
	//https://svgjs.dev/docs/3.2/
}

function crea_pdf() {
	let w_pagina = parseFloat(document.getElementById("html_larghezza_pagina").value);
	let h_pagina = parseFloat(document.getElementById("html_altezza_pagina").value);
	let w_dorso = parseFloat(document.getElementById("html_dorso").value);
	let aletta = parseFloat(document.getElementById("html_aletta").value);
	let abbondanza = parseFloat(document.getElementById("html_abbondanza").value);
	let taglio = parseFloat(document.getElementById("html_taglio").value);
	let margine = parseFloat(document.getElementById("html_margine").value);
	let w_isbn = parseFloat(document.getElementById("html_larghezza_isbn").value);
	let h_isbn = parseFloat(document.getElementById("html_altezza_isbn").value);
	let isbn = document.getElementById("html_isbn").value;
	let h_asse = parseFloat(document.getElementById("html_asse_orizzontale").value);

	// Pulisci isbn
	isbn = isbn.replace(/[^0-9]/g, "")

	const xa = arrotonda(0);
	const xb = arrotonda(xa + taglio);
	const xc = arrotonda(xa + taglio + abbondanza);
	const xd = arrotonda(xa + taglio + abbondanza + margine);
	const xe = arrotonda(xa + taglio + abbondanza + aletta - margine);
	const xf = arrotonda(xa + taglio + abbondanza + aletta);
	const xg = arrotonda(xa + taglio + abbondanza + aletta + margine);
	const xh = arrotonda(xa + taglio + abbondanza + aletta + w_pagina - margine - w_isbn);
	const xi = arrotonda(xa + taglio + abbondanza + aletta + w_pagina - margine);
	const xj = arrotonda(xa + taglio + abbondanza + aletta + w_pagina);
	const xk = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso / 2);
	const xl = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso);
	const xm = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + margine);
	const xn = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina / 2);
	const xo = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina - margine);
	const xp = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina);
	const xq = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina + margine);
	const xr = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina + aletta - margine);
	const xs = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina + aletta);
	const xt = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina + aletta + abbondanza);
	const xu = arrotonda(xa + taglio + abbondanza + aletta + w_pagina + w_dorso + w_pagina + aletta + abbondanza + taglio);

	const ya = arrotonda(0);
	const yb = arrotonda(ya + taglio);
	const yc = arrotonda(ya + taglio + abbondanza);
	const yd = arrotonda(ya + taglio + abbondanza + margine);
	const ye = arrotonda(ya + taglio + abbondanza + h_pagina - h_asse);
	const yf = arrotonda(ya + taglio + abbondanza + h_pagina - margine - h_isbn);
	const yg = arrotonda(ya + taglio + abbondanza + h_pagina - margine);
	const yh = arrotonda(ya + taglio + abbondanza + h_pagina);
	const yi = arrotonda(ya + taglio + abbondanza + h_pagina + abbondanza);
	const yj = arrotonda(ya + taglio + abbondanza + h_pagina + abbondanza + taglio);

	const w_foglio = arrotonda(xu - xa)
	const h_foglio = arrotonda(yj - ya)

	const w_abbondanza = arrotonda(xt - xb)
	const h_abbondanza = arrotonda(yi - yb)

	const w_taglio = arrotonda(xt - xb)
	const h_taglio = arrotonda(yi - yb)

	const w_aletta = aletta
	const h_aletta = h_pagina

	const { jsPDF } = window.jspdf;
	// https://artskydj.github.io/jsPDF/docs/jsPDF.html#line

	const doc = new jsPDF({
		orientation: arrotonda(xu - xa) > arrotonda(yj - ya) ? "landscape" : "portrait",
		unit: "mm",
		format: [w_foglio, h_foglio]
	});

	doc.setFont("Courier", "bold");
	doc.setFontSize(10);
	doc.text("Dimensioni: " + w_foglio.toFixed(2) + ", " + h_foglio.toFixed(2), xn, arrotonda(h_pagina / 2), null, null, "center");

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

	doc.line(xc, ya, xc, yb);
	doc.line(xc, yi, xc, yj);

	doc.line(xj, ya, xj, yb);
	doc.line(xj, yi, xj, yj);

	doc.line(xl, ya, xl, yb);
	doc.line(xl, yi, xl, yj);

	doc.line(xp, ya, xp, yb);
	doc.line(xp, yi, xp, yj);

	doc.line(xs, ya, xs, yb);
	doc.line(xs, yi, xs, yj);

	if (aletta > 0) {
		doc.line(xf, ya, xf, yb);
		doc.line(xf, yi, xf, yj);

		doc.line(xp, ya, xp, yb);
		doc.line(xp, yi, xp, yj);
	}

	// Rettangolo ISBN 
	doc.setLineWidth(0.1);
	doc.setDrawColor(0, 0, 0);
	doc.setLineDash();

	//doc.rect(xh, yf, w_isbn, h_isbn);

	// Creazione ISBN
	const nISBN = codificaISBN(isbn);
	const aISBN = nISBN.toString().split("");
	const sISBN = isbn.toString().split("");

	const Lmodulo = 0.35;
	const Hmodulo = 16;
	const bordo = 4;
	const Htesto = 2;
	const Mtesto = 1; // margine dal codice
	const Xtesto = -1; // correzione partenza testo

	const posX = xh + bordo;
	const posY = yf + bordo + Htesto;

	const min_w_isbn = Lmodulo * 95 + 2 * bordo
	const min_h_isbn = Hmodulo + 2 * bordo - 2

	// Rettangolo sicurezza ISBN
	doc.setFillColor(255, 255, 255);
	doc.rect(xh, yf, w_isbn, h_isbn, 'F');

	doc.setLineWidth(0);
	doc.setFillColor(0, 0, 0);

	for (let c = 0; c < aISBN.length; c++) {
		if (aISBN[c] == '1') {
			if (c <= 3 || c >= 92 || (c >= 46 && c <= 49)) {
				doc.rect(posX + c * Lmodulo, posY, Lmodulo, Hmodulo, 'F');
			} else {
				doc.rect(posX + c * Lmodulo, posY, Lmodulo, Hmodulo - 2, 'F');
			}
		}
	}

	doc.setFont("Courier", "normal");
	doc.setFontSize(8);
	doc.text(posX - 2.75, posY + Hmodulo + 0.75, sISBN[0]);
	for (let c = 1; c <= 6; c++) { doc.text(posX + 1.75 + (c - 1) * 2.40, posY + Hmodulo + 0.75, sISBN[c]); }
	for (let c = 1; c <= 6; c++) { doc.text(posX + 17.75 + (c - 1) * 2.40, posY + Hmodulo + 0.75, sISBN[c + 6]); }

	doc.setFont("Courier", "normal");
	doc.setFontSize(8);
	doc.text(posX + Xtesto, posY - Mtesto, "ISBN " + isbn.substring(0, 3) + "-" + isbn.substring(3, 5) + "-" + isbn.substring(5, 12) + "-" + isbn.substring(12, 13));

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

	window.open(doc.output('bloburl'));
}

onChangeValue()

// Funzione ISBN
// Author : Emilie Rollandin
// https://github.com/archistico/bookCover/blob/master/ISBN.php

function codificaISBN(ISBN) {
	let ISBNn = [];
	let ISBNc = [];
	let ini = "101";
	let med = "01010";
	let fin = "101";

	// Verifica che il codice sia numerico
	if (isNaN(ISBN)) {
		throw new Error("ISBN deve essere composto solo da numeri");
	}

	// Converti la stringa in un array
	ISBNn = ISBN.toString().split("");

	// Verifica che sia un ISBN
	if (ISBNn[0] !== "9") {
		throw new Error("ISBN deve cominciare con un 9");
	}

	// 0=A, 1=B
	const codI = [
		"000000",
		"001011",
		"001101",
		"001110",
		"010011",
		"011001",
		"011100",
		"010101",
		"010110",
		"011010",
	];

	// CODIFICA A
	const codA = [
		"0001101",
		"0011001",
		"0010011",
		"0111101",
		"0110001",
		"0110001",
		"0101111",
		"0111011",
		"0110111",
		"0001011",
	];

	// CODIFICA B
	const codB = [
		"0100111",
		"0110011",
		"0011011",
		"0100001",
		"0011101",
		"0111001",
		"0000101",
		"0010001",
		"0001001",
		"0010111",
	];

	// CODIFICA C
	const codC = [
		"1110010",
		"1100110",
		"1101100",
		"1000010",
		"1011100",
		"1001110",
		"1010000",
		"1000100",
		"1001000",
		"1110100",
	];

	// SE INIZIA CON 9 "011010" -> ABBABA
	ISBNc[2] = codA[parseInt(ISBNn[2 - 1])];
	ISBNc[3] = codB[parseInt(ISBNn[3 - 1])];
	ISBNc[4] = codB[parseInt(ISBNn[4 - 1])];
	ISBNc[5] = codA[parseInt(ISBNn[5 - 1])];
	ISBNc[6] = codB[parseInt(ISBNn[6 - 1])];
	ISBNc[7] = codA[parseInt(ISBNn[7 - 1])];

	ISBNc[8] = codC[parseInt(ISBNn[8 - 1])];
	ISBNc[9] = codC[parseInt(ISBNn[9 - 1])];
	ISBNc[10] = codC[parseInt(ISBNn[10 - 1])];
	ISBNc[11] = codC[parseInt(ISBNn[11 - 1])];
	ISBNc[12] = codC[parseInt(ISBNn[12 - 1])];
	ISBNc[13] = codC[parseInt(ISBNn[13 - 1])];

	// CREA ARRAY CON I VARI 7 bit
	let risultato = [
		ini,
		ISBNc[2],
		ISBNc[3],
		ISBNc[4],
		ISBNc[5],
		ISBNc[6],
		ISBNc[7],
		med,
		ISBNc[8],
		ISBNc[9],
		ISBNc[10],
		ISBNc[11],
		ISBNc[12],
		ISBNc[13],
		fin,
	];

	// COPIA NELLA VARIABILE PRIVATA
	ISBNc = risultato;
	return risultato.join("");
}

