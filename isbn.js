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

codificaISBN(9788897192091);