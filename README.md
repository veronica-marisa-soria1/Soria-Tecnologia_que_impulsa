# SORIA — Tecnología que impulsa

Sitio web estático de **SORIA**, una marca de tecnología, desarrollo y soluciones digitales.
Está construido con HTML, CSS y JavaScript sin frameworks ni dependencias de instalación.

## Secciones del sitio

- Página principal de SORIA.
- Presentación de MH Gestión.
- Presentación de ChacoAgro IA.
- Micrositio institucional de la E.P.G.S. N.º 12, con inicio, noticias e inscripciones.

## Estructura

```text
/
├── index.html                         # Redirige al sitio principal
├── html/
│   ├── index.html                     # Página principal de SORIA
│   ├── mh-gestion.html                # Proyecto MH Gestión
│   ├── chacoagro.html                 # Proyecto ChacoAgro IA
│   └── academico/
│       ├── index.html                 # Inicio institucional
│       ├── noticias.html              # Generado desde plantilla
│       ├── inscripciones.html          # Generado desde plantilla
│       └── templates/                 # Contenido compartido y plantillas
├── css/                               # Estilos del sitio y de los proyectos
├── js/                                # Comportamiento de las páginas
├── assets/img/                        # Logotipos de SORIA
├── scripts/build-academico.mjs        # Genera noticias e inscripciones
└── .github/workflows/deploy-pages.yml # Publicación en GitHub Pages
```

## Desarrollo local

Primero generá las dos páginas institucionales que comparten encabezado y pie:

```bash
node scripts/build-academico.mjs
```

Luego iniciá cualquier servidor estático desde la raíz:

```bash
python -m http.server 8000
```

Abrí `http://localhost:8000/html/` en el navegador. Usar un servidor local evita problemas de rutas que pueden ocurrir al abrir los archivos directamente.

## Páginas institucionales compartidas

`noticias.html` e `inscripciones.html` se generan para que sigan siendo páginas estáticas normales en el navegador. Para modificar su contenido:

- Editá `html/academico/templates/shared-header.html` para el encabezado común.
- Editá `html/academico/templates/shared-footer.html` para el pie común.
- Editá las plantillas de cada página en `html/academico/templates/`.
- Ejecutá `node scripts/build-academico.mjs` antes de revisar o publicar los cambios.

El flujo de GitHub Pages ejecuta esa generación automáticamente antes de publicar.

## Formulario de contacto

El formulario principal abre el cliente de correo de la persona visitante con el mensaje preparado. No envía información a un servidor propio.

## Publicación

El workflow de GitHub Actions publica el sitio al subir cambios a la rama `main`. En GitHub, configurá **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Desarrollado por

Verónica · SORIA · Tecnología que impulsa · Quitilipi, Chaco, Argentina
