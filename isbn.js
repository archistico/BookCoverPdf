// Funzioni ISBN / EAN-13
// Author: Emilie Rollandin
// Note: la codifica EAN-13 richiede ISBN-13 numerico valido, con prefisso 978 o 979.

(function (global) {
    "use strict";

    const LEFT_ODD = [
        "0001101", // 0
        "0011001", // 1
        "0010011", // 2
        "0111101", // 3
        "0100011", // 4
        "0110001", // 5
        "0101111", // 6
        "0111011", // 7
        "0110111", // 8
        "0001011", // 9
    ];

    const LEFT_EVEN = [
        "0100111", // 0
        "0110011", // 1
        "0011011", // 2
        "0100001", // 3
        "0011101", // 4
        "0111001", // 5
        "0000101", // 6
        "0010001", // 7
        "0001001", // 8
        "0010111", // 9
    ];

    const RIGHT = [
        "1110010", // 0
        "1100110", // 1
        "1101100", // 2
        "1000010", // 3
        "1011100", // 4
        "1001110", // 5
        "1010000", // 6
        "1000100", // 7
        "1001000", // 8
        "1110100", // 9
    ];

    // Parita' delle sei cifre a sinistra dopo la prima cifra EAN-13.
    // O = odd / codifica A, E = even / codifica B.
    const PARITY_BY_FIRST_DIGIT = [
        "OOOOOO", // 0
        "OOEOEE", // 1
        "OOEEOE", // 2
        "OOEEEO", // 3
        "OEOOEE", // 4
        "OEEOOE", // 5
        "OEEEOO", // 6
        "OEOEOE", // 7
        "OEOEEO", // 8
        "OEEOEO", // 9
    ];

    function normalizzaISBN(isbn) {
        return String(isbn || "").replace(/[^0-9]/g, "");
    }

    function calcolaCheckDigitEAN13(primeDodiciCifre) {
        const digits = String(primeDodiciCifre || "");

        if (!/^\d{12}$/.test(digits)) {
            throw new Error("Per calcolare il check digit servono esattamente 12 cifre.");
        }

        let somma = 0;
        for (let i = 0; i < 12; i++) {
            const cifra = parseInt(digits[i], 10);
            somma += cifra * (i % 2 === 0 ? 1 : 3);
        }

        return String((10 - (somma % 10)) % 10);
    }

    function haPrefissoISBN13Valido(digits) {
        return digits.startsWith("978") || digits.startsWith("979");
    }

    function completaISBN13(isbn) {
        const digits = normalizzaISBN(isbn);

        if (digits.length !== 12 && digits.length !== 13) {
            throw new Error("ISBN: per calcolare o correggere il check digit servono 12 o 13 cifre.");
        }

        const primeDodiciCifre = digits.substring(0, 12);
        if (!haPrefissoISBN13Valido(primeDodiciCifre)) {
            throw new Error("ISBN: il prefisso deve essere 978 o 979.");
        }

        return primeDodiciCifre + calcolaCheckDigitEAN13(primeDodiciCifre);
    }

    function validaISBN13(isbn) {
        const digits = normalizzaISBN(isbn);
        const errori = [];

        if (digits.length !== 13) {
            errori.push("ISBN: inserire esattamente 13 cifre.");
        }

        if (digits.length >= 3 && !haPrefissoISBN13Valido(digits)) {
            errori.push("ISBN: il prefisso deve essere 978 o 979.");
        }

        if (digits.length === 13) {
            const checkDigitAtteso = calcolaCheckDigitEAN13(digits.substring(0, 12));
            const checkDigitInserito = digits.substring(12, 13);

            if (checkDigitInserito !== checkDigitAtteso) {
                errori.push("ISBN: check digit errato. Ultima cifra attesa: " + checkDigitAtteso + ".");
            }
        }

        return {
            valido: errori.length === 0,
            isbn: digits,
            errori: errori,
        };
    }

    function codificaEAN13(ean13) {
        const digits = normalizzaISBN(ean13);

        if (!/^\d{13}$/.test(digits)) {
            throw new Error("EAN-13 deve essere composto da 13 cifre.");
        }

        const firstDigit = parseInt(digits[0], 10);
        const parity = PARITY_BY_FIRST_DIGIT[firstDigit];
        const parts = ["101"];

        for (let i = 1; i <= 6; i++) {
            const cifra = parseInt(digits[i], 10);
            parts.push(parity[i - 1] === "O" ? LEFT_ODD[cifra] : LEFT_EVEN[cifra]);
        }

        parts.push("01010");

        for (let i = 7; i <= 12; i++) {
            const cifra = parseInt(digits[i], 10);
            parts.push(RIGHT[cifra]);
        }

        parts.push("101");

        const risultato = parts.join("");
        if (risultato.length !== 95) {
            throw new Error("Codifica EAN-13 non valida: lunghezza moduli diversa da 95.");
        }

        return risultato;
    }

    function codificaISBN(isbn) {
        const esito = validaISBN13(isbn);

        if (!esito.valido) {
            throw new Error(esito.errori.join("\n"));
        }

        return codificaEAN13(esito.isbn);
    }

    function formattaISBN13(isbn) {
        const digits = normalizzaISBN(isbn);

        if (digits.length !== 13) {
            return digits;
        }

        // Formattazione minimale coerente con la versione precedente.
        // La sillabazione ISBN perfetta richiederebbe le tabelle ufficiali dei prefissi editore.
        return digits.substring(0, 3) + "-" +
            digits.substring(3, 5) + "-" +
            digits.substring(5, 12) + "-" +
            digits.substring(12, 13);
    }

    const api = {
        normalizzaISBN: normalizzaISBN,
        haPrefissoISBN13Valido: haPrefissoISBN13Valido,
        calcolaCheckDigitEAN13: calcolaCheckDigitEAN13,
        completaISBN13: completaISBN13,
        validaISBN13: validaISBN13,
        codificaEAN13: codificaEAN13,
        codificaISBN: codificaISBN,
        formattaISBN13: formattaISBN13,
    };

    global.BookCoverISBN = api;

    // Compatibilita' con il vecchio script.
    global.codificaISBN = codificaISBN;
})(typeof window !== "undefined" ? window : globalThis);
