# Design QA — Identidad neón de SORIA

## Comparación

- **Fuente visual:** logotipo negro y rosa flúor entregado por la usuaria el 18 de noviembre de 2026, copiado en `assets/img/soria-logo-neon.png`.
- **Dimensiones de la fuente:** 2048 × 768 px, PNG con fondo negro.
- **Implementación revisada:** `http://localhost:4173/html/#inicio` en navegador local, en modo claro y oscuro.
- **Estado revisado:** cabecera, hero, tarjetas de servicios, navegación interna y alternancia de tema.

## Evidencia visual disponible

- El logotipo horizontal se muestra en cabecera y pie; el isotipo derivado del mismo recurso se muestra en hero y navegación móvil.
- La interfaz combina negro profundo, rosa flúor y rosa pálido para texto secundario, sin superficies blancas en las tarjetas de servicios.
- La cabecera conserva el logo visible sobre negro y los botones, bordes y acentos usan el rosa flúor.
- El modo claro y el oscuro mantienen las mismas superficies oscuras y el contraste de la nueva marca.

## Revisión por superficie de fidelidad

- **Tipografía y contenido:** se conservaron Manrope, DM Mono, jerarquías, textos, rutas e interacciones existentes.
- **Espaciado y composición:** no se modificó la estructura de la página; solo se ajustó el contenedor de marca para destacar el nuevo lockup.
- **Colores y tokens:** `css/neon-theme.css` centraliza fondos, tintas, bordes, gradientes, tarjetas, botones y ambos modos de color.
- **Calidad de imagen:** el lockup se utiliza a 2048 × 768 px y el isotipo a 380 × 380 px; ambos cargaron correctamente en la vista local.
- **Accesibilidad y estados:** la navegación conservó sus enlaces semánticos y el botón de tema funcionó al alternar y restaurar el modo oscuro.

## Limitación de la revisión

La política del navegador bloqueó crear una página temporal `data:` para una comparación lado a lado entre la imagen fuente y la implementación. Se inspeccionaron la imagen entregada y la página local por separado.

## Próximo control recomendado

Revisar manualmente la cabecera y el hero en un teléfono antes de publicar para confirmar el comportamiento del isotipo compacto.

final result: visual verification passed; side-by-side comparison blocked
