# SORIA — Tecnología que impulsa

Sitio web personal de Verónica, desarrolladora de software junior bajo la marca **SORIA**.
Construido con HTML5, CSS3 y JavaScript vanilla — sin frameworks, sin dependencias, sin build.

## Demo

🔗 https://veronica-marisa-soria1.github.io/Soria-Tecnologia_que_impulsa/ — *GitHub Pages*

## Stack

- HTML5 semántico y accesible
- CSS3 con variables personalizadas y diseño responsivo
- JavaScript vanilla (sin jQuery ni librerías)
- Tipografías: Inter + JetBrains Mono (Google Fonts)

## Funcionalidades

- Navegación fija con detección de sección activa (IntersectionObserver)
- Menú hamburguesa para mobile
- Efecto typewriter en el hero
- Toggle modo oscuro / claro (guarda la preferencia en `localStorage`)
- Animaciones de entrada al hacer scroll (respetan `prefers-reduced-motion`)
- Filtro de proyectos por categoría, con estado vacío
- Formulario de contacto con validación en tiempo real

## Estructura

```
/
├── html/
│   ├── index.html
│   └── academico.html
├── robots.txt
├── sitemap.xml
├── .gitignore
├── .gitattributes
├── css/
│   ├── styles.css
│   └── academico.css
├── js/
│   ├── main.js
│   ├── academico-app.js
│   ├── academico-data.js
│   ├── academico-sql.js
│   └── academico-tests.js
└── assets/
    └── img/
        ├── soria-logo-principal.svg logo principal
        ├── soria-logo-principal.png preview para redes
        ├── soria-logo-claro.svg     logo para fondos oscuros
        ├── soria-isotipo.svg        isotipo y favicon principal
        ├── favicon-32.png          32×32
        ├── favicon-16.png          16×16
        ├── apple-touch-icon.png    180×180, ícono en iOS
        ├── perfil.jpg              foto de la sección "Sobre mí"
        ├── perfil2.jpg             foto del hero
        ├── perfil1.jpg             sin uso
        └── hero-pattern.svg        sin uso
```

## Desarrollo local

No hay build ni dependencias. Para levantarlo alcanza con cualquier servidor estático:

```bash
python -m http.server 8000
```

Abrir http://localhost:8000/html/. Conviene usar un servidor en lugar de abrir el
archivo directamente: con `file://` no funcionan correctamente las rutas ni el
iframe del mapa.

## Demo del proyecto académico

En `html/academico.html` hay un demo interactivo: un motor SQL escrito en
JavaScript vanilla que resuelve consultas contra un modelo relacional de
biblioteca (autores, libros, socios y préstamos), enteramente en el navegador.

Soporta `SELECT`, `JOIN`, `LEFT JOIN`, `WHERE`, `GROUP BY`, `HAVING`,
`ORDER BY`, `LIMIT`, `DISTINCT` y los agregados `COUNT`, `SUM`, `AVG`, `MIN` y
`MAX`, con la lógica de tres valores de SQL para los `NULL`.

```
html/academico.html       interfaz
css/academico.css         estilos propios del demo
js/academico-data.js      esquema, datos y consultas de ejemplo
js/academico-sql.js       motor: tokenizador, parser y evaluador
js/academico-app.js       interfaz: esquema, ejemplos y tabla de resultados
js/academico-tests.js     40 pruebas del motor
```

Para correr las pruebas hace falta Node:

```bash
node js/academico-tests.js
```

Para adaptar el demo a otro conjunto de datos alcanza con reemplazar
`js/academico-data.js`: ni el motor ni la interfaz tienen el esquema escrito,
lo leen de ahí.

## Formulario de contacto

Por defecto el formulario **no envía nada a un servidor**: abre el cliente de
correo del visitante con el mensaje ya redactado.

Para activar el envío en segundo plano, crear un formulario en
[Formspree](https://formspree.io) o [Web3Forms](https://web3forms.com) y pegar
la URL en la constante de `js/main.js`:

```js
const CONTACT_ENDPOINT = "https://formspree.io/f/TU-ID";
```

Con la constante cargada, el formulario hace `POST` con JSON y maneja los
errores de red y las respuestas no-2xx. Sin ella, usa el fallback `mailto:`.

## Analítica de visitas

El sitio es estático y no tiene backend, así que **no puede contar visitas por
sí solo**: hace falta un servicio externo que guarde el número.

Está preparado para [GoatCounter](https://www.goatcounter.com) (gratuito para
uso personal), pero **desactivado**: el snippet está comentado al final de
`html/index.html`. Para activarlo hay que crear la cuenta, copiar el snippet que
GoatCounter entrega y descomentarlo.

Es analítica privada: los visitantes no ven ningún contador. Los números se
consultan desde el panel de GoatCounter.

> Los datos los procesa GoatCounter, no este sitio. Conviene revisar su política
> de privacidad antes de activarlo y evaluar si hace falta algún aviso.

## Deploy en GitHub Pages

```bash
git push -u origin main
```

El workflow `.github/workflows/deploy-pages.yml` publica el contenido de la raíz en cada push a `main`. En GitHub, seleccionar **Settings → Pages → Build and deployment → Source: GitHub Actions**.

La raíz `https://veronica-marisa-soria1.github.io/Soria-Tecnologia_que_impulsa/` redirige a `html/`; el sitio principal queda en `https://veronica-marisa-soria1.github.io/Soria-Tecnologia_que_impulsa/html/`.

> Si más adelante se usa un dominio propio, hay que actualizar la URL en cuatro
> lugares: `<link rel="canonical">` y las etiquetas `og:`/`twitter:` de
> `html/index.html` y `html/academico.html`, `robots.txt` y `sitemap.xml`.

## Pendientes

- [ ] Seleccionar GitHub Actions como source en Settings → Pages
- [ ] Conectar el formulario a un endpoint real (`CONTACT_ENDPOINT`)
- [ ] Activar la analítica de GoatCounter (snippet comentado en `html/index.html`)
- [ ] Reemplazar los "Demo pendiente" / "Código pendiente" de MH Gestión y ChacoAgro IA por links reales
- [ ] Adaptar el esquema y los datos del demo académico a los del trabajo real de la Tecnicatura
- [ ] Decidir qué datos personales del CV se publican: `assets/cv.pdf` incluye teléfono, fecha de nacimiento y estado civil
- [ ] Corregir en el CV el año mal escrito: "AWS | Abr 2026 – May 20265"
- [ ] Alinear las certificaciones y el stack de la portada con los que figuran en el CV
- [ ] Actualizar `<lastmod>` en `sitemap.xml` tras cada cambio importante

## Desarrollado por

Verónica · SORIA · Tecnología que impulsa · Quitilipi, Chaco, Argentina
