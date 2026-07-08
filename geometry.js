// Calcolo geometria copertina
// Mantiene separato il calcolo delle coordinate dal disegno PDF.

(function (global) {
    "use strict";

    function rounded(input, digits) {
        const rounder = Math.pow(10, digits);
        return Math.round(input * rounder) / rounder;
    }

    function arrotonda(input) {
        return rounded(input, 2);
    }

    function calcolaGeometriaCopertina(parametri) {
        const w_pagina = Number(parametri.w_pagina);
        const h_pagina = Number(parametri.h_pagina);
        const w_dorso = Number(parametri.w_dorso);
        const aletta = Number(parametri.aletta);
        const abbondanza = Number(parametri.abbondanza);
        const taglio = Number(parametri.taglio);
        const margine = Number(parametri.margine);
        const w_isbn = Number(parametri.w_isbn);
        const h_isbn = Number(parametri.h_isbn);
        const h_asse = Number(parametri.h_asse);

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

        const coordinate = {
            xa, xb, xc, xd, xe, xf, xg, xh, xi, xj, xk, xl, xm, xn, xo, xp, xq, xr, xs, xt, xu,
            ya, yb, yc, yd, ye, yf, yg, yh, yi, yj,
        };

        return {
            coordinate: coordinate,
            dimensioni: {
                w_foglio: arrotonda(xu - xa),
                h_foglio: arrotonda(yj - ya),
                w_abbondanza: arrotonda(xt - xb),
                h_abbondanza: arrotonda(yi - yb),
                w_aletta: aletta,
                h_aletta: h_pagina,
            },
        };
    }

    global.BookCoverGeometry = {
        rounded: rounded,
        arrotonda: arrotonda,
        calcolaGeometriaCopertina: calcolaGeometriaCopertina,
    };

    // Compatibilita' con eventuali chiamate esterne.
    global.rounded = global.rounded || rounded;
    global.arrotonda = global.arrotonda || arrotonda;
})(typeof window !== "undefined" ? window : globalThis);
