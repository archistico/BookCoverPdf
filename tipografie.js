// Profili tipografia / spessori carta
// Unita' spessori: micron per foglio.
// Dorso = (numero pagine / 2) * spessore_micron / 1000.

(function (global) {
    "use strict";

    const CARTE_UNIVERSALBOOK = [
        { carta: 'uso-mano-avorio-80g', nome: 'Uso Mano (Avorio - 80g)', fresata: 98, cucita: 108 },
        { carta: 'uso-mano-avorio-100g', nome: 'Uso Mano (Avorio - 100g)', fresata: 122, cucita: 140 },
        { carta: 'uso-mano-avorio-120g', nome: 'Uso Mano (Avorio - 120g)', fresata: 137, cucita: 160 },
        { carta: 'uso-mano-bianca-80g', nome: 'Uso Mano (Bianca - 80g)', fresata: 94, cucita: 107 },
        { carta: 'uso-mano-bianca-90g', nome: 'Uso Mano (Bianca - 90g)', fresata: 111, cucita: 127 },
        { carta: 'uso-mano-bianca-100g', nome: 'Uso Mano (Bianca - 100g)', fresata: 125, cucita: 140 },
        { carta: 'uso-mano-bianca-120g', nome: 'Uso Mano (Bianca - 120g)', fresata: 150, cucita: 165 },
        { carta: 'freelife-bianca-100g', nome: 'FreeLife (Bianca - 100g)', fresata: 112, cucita: 122 },
        { carta: 'lux-cream-avorio-80g', nome: 'Lux Cream (Avorio - 80g)', fresata: 140, cucita: 155 },
        { carta: 'uso-mano-spessorata-avorio-100g', nome: 'Uso Mano Spessorata (Avorio - 100g)', fresata: 157, cucita: 174 },
        { carta: 'tintoretto-avorio-95g', nome: 'Tintoretto (Avorio - 95g)', fresata: 117, cucita: 140 },
        { carta: 'tintoretto-bianca-95g', nome: 'Tintoretto (Bianca - 95g)', fresata: 117, cucita: 140 },
    ];

    // Profilo predisposto per Elui Tipografia.
    // I valori sono volutamente separati da UniversalBook: quando hai i dati corretti,
    // modifica solo questo blocco senza toccare il resto dell'applicazione.
    const CARTE_ELUI_TIPOGRAFIA = [
        { carta: 'uso-mano-avorio-80g', nome: 'Uso Mano (Avorio - 80g)', fresata: 98, cucita: 108, provvisorio: true },
        { carta: 'uso-mano-avorio-100g', nome: 'Uso Mano (Avorio - 100g)', fresata: 122, cucita: 140, provvisorio: true },
        { carta: 'uso-mano-avorio-120g', nome: 'Uso Mano (Avorio - 120g)', fresata: 137, cucita: 160, provvisorio: true },
        { carta: 'uso-mano-bianca-80g', nome: 'Uso Mano (Bianca - 80g)', fresata: 94, cucita: 107, provvisorio: true },
        { carta: 'uso-mano-bianca-90g', nome: 'Uso Mano (Bianca - 90g)', fresata: 111, cucita: 127, provvisorio: true },
        { carta: 'uso-mano-bianca-100g', nome: 'Uso Mano (Bianca - 100g)', fresata: 125, cucita: 140, provvisorio: true },
        { carta: 'uso-mano-bianca-120g', nome: 'Uso Mano (Bianca - 120g)', fresata: 150, cucita: 165, provvisorio: true },
        { carta: 'freelife-bianca-100g', nome: 'FreeLife (Bianca - 100g)', fresata: 112, cucita: 122, provvisorio: true },
        { carta: 'lux-cream-avorio-80g', nome: 'Lux Cream (Avorio - 80g)', fresata: 140, cucita: 155, provvisorio: true },
        { carta: 'uso-mano-spessorata-avorio-100g', nome: 'Uso Mano Spessorata (Avorio - 100g)', fresata: 157, cucita: 174, provvisorio: true },
        { carta: 'tintoretto-avorio-95g', nome: 'Tintoretto (Avorio - 95g)', fresata: 117, cucita: 140, provvisorio: true },
        { carta: 'tintoretto-bianca-95g', nome: 'Tintoretto (Bianca - 95g)', fresata: 117, cucita: 140, provvisorio: true },
    ];

    // Profilo generico: utile per prove o preventivi quando la tipografia non ha ancora
    // comunicato una tabella precisa. Da verificare sempre prima della stampa definitiva.
    const CARTE_GENERICHE = [
        { carta: 'uso-mano-bianca-80g', nome: 'Uso Mano (Bianca - 80g)', fresata: 100, cucita: 110, provvisorio: true },
        { carta: 'uso-mano-bianca-90g', nome: 'Uso Mano (Bianca - 90g)', fresata: 110, cucita: 125, provvisorio: true },
        { carta: 'uso-mano-bianca-100g', nome: 'Uso Mano (Bianca - 100g)', fresata: 125, cucita: 140, provvisorio: true },
        { carta: 'uso-mano-bianca-120g', nome: 'Uso Mano (Bianca - 120g)', fresata: 150, cucita: 165, provvisorio: true },
        { carta: 'uso-mano-avorio-80g', nome: 'Uso Mano (Avorio - 80g)', fresata: 100, cucita: 110, provvisorio: true },
        { carta: 'uso-mano-avorio-100g', nome: 'Uso Mano (Avorio - 100g)', fresata: 125, cucita: 140, provvisorio: true },
        { carta: 'uso-mano-spessorata-avorio-100g', nome: 'Uso Mano Spessorata (Avorio - 100g)', fresata: 155, cucita: 175, provvisorio: true },
    ];

    const TIPOGRAFIE = [
        {
            id: 'universalbook',
            nome: 'UniversalBook',
            descrizione: 'Spessori forniti da UniversalBook.',
            provvisorio: false,
            carte: CARTE_UNIVERSALBOOK,
        },
        {
            id: 'elui-tipografia',
            nome: 'Elui Tipografia',
            descrizione: 'Profilo predisposto. Valori da sostituire quando la tipografia comunica la tabella definitiva.',
            provvisorio: true,
            carte: CARTE_ELUI_TIPOGRAFIA,
        },
        {
            id: 'generica',
            nome: 'Generica / da verificare',
            descrizione: 'Valori indicativi per prove interne. Non usare come dato definitivo senza conferma della tipografia.',
            provvisorio: true,
            carte: CARTE_GENERICHE,
        },
    ];

    function getTipografie() {
        return TIPOGRAFIE.slice();
    }

    function getTipografia(tipografiaId) {
        return TIPOGRAFIE.find(t => t.id === tipografiaId) || null;
    }

    function getTipografiaDefault() {
        return TIPOGRAFIE[0];
    }

    function getCarte(tipografiaId) {
        const tipografia = getTipografia(tipografiaId) || getTipografiaDefault();
        return tipografia.carte.slice();
    }

    function trovaCarta(tipografiaId, cartaId) {
        const tipografia = getTipografia(tipografiaId) || getTipografiaDefault();
        return tipografia.carte.find(c => c.carta === cartaId) || null;
    }

    function trovaPrimaCartaCompatibile(tipografiaId, cartaId) {
        const tipografia = getTipografia(tipografiaId) || getTipografiaDefault();
        if (cartaId) {
            const stessaCarta = tipografia.carte.find(c => c.carta === cartaId);
            if (stessaCarta) {
                return stessaCarta;
            }
        }
        return tipografia.carte.length > 0 ? tipografia.carte[0] : null;
    }

    function getSpessore(tipografiaId, cartaId) {
        const carta = trovaCarta(tipografiaId, cartaId);
        if (!carta) {
            return null;
        }
        return {
            carta: carta.carta,
            nome: carta.nome,
            fresata: carta.fresata,
            cucita: carta.cucita,
            provvisorio: Boolean(carta.provvisorio),
        };
    }

    function formattaEtichettaCarta(carta) {
        if (!carta) {
            return '';
        }
        const prefisso = carta.nome || carta.carta;
        return prefisso + ' — fresata ' + carta.fresata + ' / cucita ' + carta.cucita + ' micron';
    }

    const api = {
        TIPOGRAFIE: TIPOGRAFIE,
        getTipografie: getTipografie,
        getTipografia: getTipografia,
        getTipografiaDefault: getTipografiaDefault,
        getCarte: getCarte,
        trovaCarta: trovaCarta,
        trovaPrimaCartaCompatibile: trovaPrimaCartaCompatibile,
        getSpessore: getSpessore,
        formattaEtichettaCarta: formattaEtichettaCarta,
    };

    global.BookCoverTipografie = api;

    // Compatibilita' con eventuale codice precedente che leggeva SPESSORI_CARTA globale.
    global.SPESSORI_CARTA = CARTE_UNIVERSALBOOK;
})(typeof window !== "undefined" ? window : globalThis);
