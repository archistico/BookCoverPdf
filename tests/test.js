const assert = require('assert');

require('../isbn.js');
require('../geometry.js');
require('../tipografie.js');

const isbn = globalThis.BookCoverISBN;
const geometry = globalThis.BookCoverGeometry;
const tipografie = globalThis.BookCoverTipografie;

function testISBN() {
    assert.strictEqual(isbn.calcolaCheckDigitEAN13('978889719209'), '1');
    assert.strictEqual(isbn.completaISBN13('978889719209'), '9788897192091');
    assert.strictEqual(isbn.completaISBN13('9788897192090'), '9788897192091');

    let esito = isbn.validaISBN13('9788897192091');
    assert.strictEqual(esito.valido, true);
    assert.strictEqual(esito.isbn, '9788897192091');

    esito = isbn.validaISBN13('9788897192090');
    assert.strictEqual(esito.valido, false);
    assert.ok(esito.errori.some(x => x.includes('check digit')));

    esito = isbn.validaISBN13('1234567890128');
    assert.strictEqual(esito.valido, false);
    assert.ok(esito.errori.some(x => x.includes('978 o 979')));

    const bits = isbn.codificaEAN13('9400000000000');
    assert.strictEqual(bits.length, 95);
    assert.strictEqual(bits.substring(3, 10), '0100011'); // cifra 4 in codifica A / left odd
}

function testTipografie() {
    const lista = tipografie.getTipografie();
    assert.ok(lista.some(t => t.id === 'universalbook'));
    assert.ok(lista.some(t => t.id === 'elui-tipografia'));
    assert.ok(lista.some(t => t.id === 'generica'));

    const universalBook = tipografie.getTipografia('universalbook');
    assert.strictEqual(universalBook.carte.length, 12);

    const usoManoBianca100 = tipografie.getSpessore('universalbook', 'uso-mano-bianca-100g');
    assert.strictEqual(usoManoBianca100.fresata, 125);
    assert.strictEqual(usoManoBianca100.cucita, 140);
    assert.strictEqual(usoManoBianca100.provvisorio, false);

    const elui = tipografie.getSpessore('elui-tipografia', 'uso-mano-bianca-100g');
    assert.strictEqual(elui.fresata, 125);
    assert.strictEqual(elui.cucita, 140);
    assert.strictEqual(elui.provvisorio, true);

    const compatibile = tipografie.trovaPrimaCartaCompatibile('generica', 'uso-mano-bianca-100g');
    assert.strictEqual(compatibile.carta, 'uso-mano-bianca-100g');
}

function testGeometriaConAlette() {
    const g = geometry.calcolaGeometriaCopertina({
        w_pagina: 150,
        h_pagina: 210,
        w_dorso: 10,
        aletta: 85,
        abbondanza: 3,
        taglio: 3,
        margine: 5,
        w_isbn: 42,
        h_isbn: 25,
        h_asse: 35,
    });

    assert.strictEqual(g.dimensioni.w_foglio, 492);
    assert.strictEqual(g.dimensioni.h_foglio, 222);
    assert.strictEqual(g.coordinate.xf, 91);
    assert.strictEqual(g.coordinate.xj, 241);
    assert.strictEqual(g.coordinate.xl, 251);
    assert.strictEqual(g.coordinate.xp, 401);
    assert.strictEqual(g.coordinate.xs, 486);
    assert.strictEqual(g.coordinate.ye, 181);
}

function testGeometriaSenzaAlette() {
    const g = geometry.calcolaGeometriaCopertina({
        w_pagina: 150,
        h_pagina: 210,
        w_dorso: 10,
        aletta: 0,
        abbondanza: 3,
        taglio: 3,
        margine: 5,
        w_isbn: 42,
        h_isbn: 25,
        h_asse: 35,
    });

    assert.strictEqual(g.dimensioni.w_foglio, 322);
    assert.strictEqual(g.dimensioni.h_foglio, 222);
    assert.strictEqual(g.coordinate.xf, 6);
    assert.strictEqual(g.coordinate.xj, 156);
    assert.strictEqual(g.coordinate.xl, 166);
    assert.strictEqual(g.coordinate.xp, 316);
    assert.strictEqual(g.coordinate.xs, 316);
}

testISBN();
testTipografie();
testGeometriaConAlette();
testGeometriaSenzaAlette();

console.log('Tutti i test sono passati.');
