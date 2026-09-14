import Image from "next/image";
import styles from "./valle.module.css";

/*
  EL VALLE DE LOS CUENTOS — escena del hero de la Biblioteca.

  Misma gramática que el paisaje del inicio: un lienzo 1440×600 estirado al
  hero dibuja cielo, montañas, colinas y camino; encima, una aldea con
  proporción fija (casas hechas de libros apilados y un árbol-biblioteca con
  farol) se posa sobre el borde inferior derecho. Todo es ambientación:
  aria-hidden, sin texto pedagógico dentro de la imagen.

  Los pictogramas son Twemoji locales (CC BY 4.0, ver public/images/portal).
*/
export function ValleDeCuentos() {
  return (
    <div className={styles.valle} aria-hidden="true">
      {/* Cielo: sol de tarde y nubes lejanas */}
      <div className={styles.cielo}>
        <Image className={styles.sol} src="/images/portal/2600.svg" alt="" width={54} height={54} />
        <Image className={`${styles.nube} ${styles.nubeA}`} src="/images/portal/2601.svg" alt="" width={56} height={56} />
        <Image className={`${styles.nube} ${styles.nubeB}`} src="/images/portal/2601.svg" alt="" width={40} height={40} />
        <Image className={`${styles.nube} ${styles.nubeC}`} src="/images/portal/2601.svg" alt="" width={48} height={48} />
        <Image className={`${styles.estrella} ${styles.estrellaA}`} src="/images/portal/2b50.svg" alt="" width={22} height={22} />
        <Image className={`${styles.estrella} ${styles.estrellaB}`} src="/images/portal/1f31f.svg" alt="" width={26} height={26} />
        <Image className={`${styles.estrella} ${styles.estrellaC}`} src="/images/portal/2b50.svg" alt="" width={16} height={16} />
      </div>

      {/* Terreno: un solo sistema de coordenadas para montañas, colinas y camino */}
      <svg className={styles.tierra} viewBox="0 0 1440 600" preserveAspectRatio="none" focusable="false">
        <g className={styles.montanas}>
          <path fill="#efdde0" d="M 380 470 L 470 388 L 530 424 L 600 360 L 700 470 Z" />
          <path fill="#e4c9cf" d="M 620 470 L 712 350 L 764 392 L 850 284 L 930 378 L 990 330 L 1090 470 Z" />
          <path fill="#d3b2bd" d="M 960 476 L 1064 306 L 1136 368 L 1220 262 L 1310 368 L 1368 336 L 1440 436 L 1440 476 Z" />
          <path fill="#fff6ec" opacity=".92" d="M 850 284 L 870 308 L 856 312 L 844 306 L 834 312 L 826 310 Z M 1220 262 L 1242 290 L 1228 294 L 1216 286 L 1204 294 L 1196 290 Z M 1064 306 L 1082 328 L 1068 332 L 1058 326 L 1048 332 L 1042 328 Z" />
        </g>
        <path className={`${styles.colina} ${styles.colinaLejos}`} fill="#e2eeb4" d="M 0 468 C 160 438, 300 438, 470 460 S 760 418, 940 444 S 1200 414, 1440 446 V 600 H 0 Z" />
        <path className={`${styles.colina} ${styles.colinaMedia}`} fill="#b7e090" d="M 0 512 C 200 480, 380 500, 600 498 S 940 468, 1140 486 S 1360 470, 1440 476 V 600 H 0 Z" />
        <path className={`${styles.colina} ${styles.colinaCerca}`} fill="#98d970" d="M 0 556 C 280 536, 620 548, 900 538 S 1280 526, 1440 532 V 600 H 0 Z" />
        <g className={styles.camino}>
          <path d="M -20 570 C 120 556, 260 540, 400 536 S 640 552, 780 540 S 960 506, 1060 512" />
          <path d="M -20 570 C 120 556, 260 540, 400 536 S 640 552, 780 540 S 960 506, 1060 512" />
        </g>
      </svg>

      {/* Props sueltos sobre las colinas */}
      <Image className={`${styles.prop} ${styles.arbolA}`} src="/images/portal/1f333.svg" alt="" width={56} height={56} />
      <Image className={`${styles.prop} ${styles.arbolB}`} src="/images/portal/1f332.svg" alt="" width={56} height={56} />
      <Image className={`${styles.prop} ${styles.arbolC}`} src="/images/portal/1f333.svg" alt="" width={56} height={56} />
      <Image className={`${styles.prop} ${styles.pila}`} src="/images/portal/1f4da.svg" alt="" width={48} height={48} />
      <Image className={`${styles.prop} ${styles.abierto}`} src="/images/portal/1f4d6.svg" alt="" width={48} height={48} />
      <Image className={`${styles.prop} ${styles.brote}`} src="/images/portal/1f331.svg" alt="" width={24} height={24} />

      {/* La aldea de libros: proporción fija, se posa en la esquina derecha */}
      <svg className={styles.aldea} viewBox="0 0 560 340" focusable="false">
        <defs>
          <radialGradient id="valle-farol" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd671" stopOpacity=".95" />
            <stop offset=".45" stopColor="#ffc95a" stopOpacity=".45" />
            <stop offset="1" stopColor="#ffc95a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="300" cy="326" rx="250" ry="12" fill="#5fb455" opacity=".45" />
        <ellipse className={styles.farolSuelo} cx="184" cy="318" rx="70" ry="14" fill="#ffd671" opacity=".35" />

        {/* Árbol-biblioteca */}
        <g className={styles.arbol}>
          <path d="M 92 322 C 96 260, 90 220, 98 178 L 122 178 C 128 220, 124 260, 128 322 Z" fill="#8a5a36" />
          <path d="M 98 178 L 122 178 L 118 152 L 102 152 Z" fill="#7a4d2c" />
          <circle cx="110" cy="112" r="64" fill="#5fae55" />
          <circle cx="66" cy="132" r="42" fill="#79c265" />
          <circle cx="156" cy="128" r="46" fill="#79c265" />
          <circle cx="110" cy="84" r="44" fill="#98d970" />
          <circle cx="84" cy="98" r="14" fill="#b6e69a" opacity=".8" />
          {/* nicho con libros dentro del tronco */}
          <rect x="99" y="236" width="22" height="34" rx="6" fill="#5a381e" />
          <rect x="102" y="246" width="5" height="22" rx="1.2" fill="#e0673b" />
          <rect x="108" y="243" width="5" height="25" rx="1.2" fill="#3b6fa0" />
          <rect x="114" y="248" width="4" height="20" rx="1.2" fill="#f2b134" />
          {/* rama y farol */}
          <path d="M 122 190 C 150 184, 168 180, 190 176" stroke="#7a4d2c" strokeWidth="7" strokeLinecap="round" fill="none" />
          <line x1="184" y1="178" x2="184" y2="196" stroke="#5a381e" strokeWidth="3" />
          <circle className={styles.farolGlow} cx="184" cy="214" r="46" fill="url(#valle-farol)" />
          <rect x="172" y="196" width="24" height="30" rx="7" fill="#3c2a1e" />
          <rect x="176" y="200" width="16" height="22" rx="5" fill="#ffd671" className={styles.farolLuz} />
          <rect x="178" y="226" width="12" height="4" rx="2" fill="#3c2a1e" />
        </g>

        {/* Casa grande: cuatro libros apilados con tejado de libro abierto */}
        <g className={`${styles.casa} ${styles.casaA}`}>
          <rect x="228" y="288" width="156" height="34" rx="5" fill="#3b6fa0" />
          <rect x="228" y="288" width="12" height="34" rx="4" fill="#2d5680" />
          <rect x="248" y="296" width="120" height="3" rx="1.5" fill="#dbe8f4" opacity=".55" />
          <rect x="222" y="254" width="164" height="34" rx="5" fill="#e0673b" />
          <rect x="222" y="254" width="12" height="34" rx="4" fill="#b84f2a" />
          <rect x="242" y="262" width="128" height="3" rx="1.5" fill="#ffe1cf" opacity=".6" />
          <rect x="232" y="220" width="150" height="34" rx="5" fill="#6aa84f" />
          <rect x="232" y="220" width="12" height="34" rx="4" fill="#4f8a38" />
          <rect x="252" y="228" width="112" height="3" rx="1.5" fill="#e3f4d8" opacity=".6" />
          <rect x="226" y="186" width="158" height="34" rx="5" fill="#f2b134" />
          <rect x="226" y="186" width="12" height="34" rx="4" fill="#d1961f" />
          <rect x="246" y="194" width="122" height="3" rx="1.5" fill="#fff2cf" opacity=".7" />
          {/* tejado: libro abierto boca abajo */}
          <path d="M 214 190 L 304 128 L 394 190 Z" fill="#c9453a" />
          <path d="M 226 188 L 304 138 L 382 188 Z" fill="#fff3dd" />
          <path d="M 304 138 L 304 188" stroke="#c9453a" strokeWidth="3" />
          <path d="M 262 165 L 296 146 M 258 176 L 296 156 M 346 165 L 312 146 M 350 176 L 312 156" stroke="#d9c7a5" strokeWidth="2" strokeLinecap="round" />
          {/* puerta y ventana */}
          <path d="M 288 322 L 288 276 A 16 16 0 0 1 320 276 L 320 322 Z" fill="#5a381e" />
          <circle cx="314" cy="300" r="2.4" fill="#f2b134" />
          <circle cx="330" cy="237" r="11" fill="#fff0c2" />
          <circle cx="330" cy="237" r="11" fill="none" stroke="#c9453a" strokeWidth="3" />
          <path d="M 319 237 L 341 237 M 330 226 L 330 248" stroke="#c9453a" strokeWidth="2" />
          {/* chimenea con página que sale */}
          <rect x="352" y="146" width="14" height="26" rx="2" fill="#a24a1a" />
        </g>

        {/* Casa pequeña: tres libros con tejado de cono de papel */}
        <g className={`${styles.casa} ${styles.casaB}`}>
          <rect x="426" y="290" width="110" height="32" rx="5" fill="#e0673b" />
          <rect x="426" y="290" width="10" height="32" rx="4" fill="#b84f2a" />
          <rect x="430" y="258" width="104" height="32" rx="5" fill="#3b6fa0" />
          <rect x="430" y="258" width="10" height="32" rx="4" fill="#2d5680" />
          <rect x="424" y="226" width="112" height="32" rx="5" fill="#8fbf6a" />
          <rect x="424" y="226" width="10" height="32" rx="4" fill="#6c9d4c" />
          <path d="M 414 230 L 480 168 L 546 230 Z" fill="#fff3dd" />
          <path d="M 424 228 L 480 176 L 536 228 Z" fill="none" stroke="#e0673b" strokeWidth="4" strokeLinejoin="round" />
          <rect x="468" y="292" width="24" height="30" rx="10" fill="#5a381e" />
          <rect x="470" y="238" width="20" height="14" rx="3" fill="#fff0c2" stroke="#3b6fa0" strokeWidth="2.5" />
        </g>

        {/* Poste de señales, sin texto */}
        <g className={styles.poste}>
          <rect x="190" y="262" width="6" height="60" rx="2" fill="#7a4d2c" />
          <path d="M 170 268 L 214 268 L 222 276 L 214 284 L 170 284 Z" fill="#f2b134" />
          <path d="M 220 290 L 176 290 L 168 298 L 176 306 L 220 306 Z" fill="#e0673b" />
        </g>

        {/* Páginas que vuelan hacia el cielo */}
        <g className={`${styles.pagina} ${styles.paginaA}`}>
          <rect x="0" y="0" width="34" height="42" rx="4" fill="#fffaf0" stroke="#e9dcc4" strokeWidth="1.5" />
          <path d="M 7 11 H 27 M 7 18 H 27 M 7 25 H 27 M 7 32 H 19" stroke="#d9c7a5" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <g className={`${styles.pagina} ${styles.paginaB}`}>
          <rect x="0" y="0" width="28" height="36" rx="4" fill="#fffaf0" stroke="#e9dcc4" strokeWidth="1.5" />
          <path d="M 6 10 H 22 M 6 16 H 22 M 6 22 H 22 M 6 28 H 15" stroke="#d9c7a5" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className={`${styles.pagina} ${styles.paginaC}`}>
          <rect x="0" y="0" width="24" height="30" rx="4" fill="#fffaf0" stroke="#e9dcc4" strokeWidth="1.5" />
          <path d="M 5 8 H 19 M 5 13 H 19 M 5 18 H 19 M 5 23 H 13" stroke="#d9c7a5" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
