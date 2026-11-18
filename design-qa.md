# Design QA — Identidad pastel de SORIA

## Comparación

- **Fuente visual:** tercera propuesta seleccionada por la usuaria, copiada en `assets/img/soria-logo-pastel.png`.
- **Dimensiones de la fuente:** 2048 × 768 px, PNG con fondo transparente.
- **Implementación revisada:** `http://localhost:4173/html/#inicio` en navegador local, en modo claro y oscuro.
- **Estado revisado:** cabecera fija, hero, tarjetas de servicios, sección de enfoque, proyectos y contacto; navegación interna, alternancia de tema y animación del isotipo.
- **Densidad y viewport:** captura de escritorio del navegador local; no se aplicó escalado artificial de la interfaz.

## Evidencia visual disponible

- La nueva marca horizontal conserva el isotipo a la izquierda, el wordmark SORIA y el lema en la cabecera y el pie.
- El isotipo pastel se aplica al hero para que no convivan símbolos de dos identidades.
- La paleta implementada usa azul bruma, lavanda, menta y durazno sobre blanco cálido, con azul pizarra suave como superficie de contraste.
- Se revisaron visualmente las variantes clara y oscura. La marca mantiene una superficie crema para preservar su legibilidad en ambos temas.

## Historial de hallazgos

- **[P2 corregido] Isotipo duplicado en cabecera de escritorio.**
  - Evidencia: al aplicar el lockup nuevo, el isotipo móvil heredaba una regla de mayor especificidad y se mostraba junto al logo horizontal.
  - Corrección: `css/pastel-theme.css` oculta el isotipo complementario en escritorio y lo mantiene únicamente para el menú móvil.

- **[P2 corregido] CTA verde heredado en modo oscuro.**
  - Evidencia: el botón “Hablemos” conservaba el color verde del tema anterior al activar el modo oscuro.
  - Corrección: la variante oscura ahora usa un azul pizarra pastel coherente con la nueva escala cromática.

- **[P2 corregido] Tarjetas de servicios desiguales entre temas.**
  - Evidencia: las tarjetas 01 y 03 mantenían blanco mientras la 02 usaba una superficie destacada, lo que desequilibraba la sección al alternar el tema.
  - Corrección: las tres usan el mismo rosa empolvado en modo claro y el mismo malva suave en modo oscuro; sus textos descriptivos y etiquetas también comparten tono.

## Revisión por superficie de fidelidad

- **Tipografía y contenido:** se conservaron Manrope, DM Mono, jerarquías y textos existentes; el lema forma parte del nuevo recurso de marca.
- **Espaciado y composición:** la cabecera ganó una base contenida para destacar el logo sin alterar el menú ni el espacio del hero.
- **Colores y tokens:** los tokens de `css/pastel-theme.css` cubren fondo, tintas, bordes, gradientes, tarjetas, botones, secciones y modo oscuro.
- **Calidad de imagen:** el lockup y el isotipo son PNG generados para esta identidad, de 2048 × 768 px y 1254 × 1254 px respectivamente; se usan sin recortes ni sustitutos CSS/SVG.
- **Accesibilidad y estados:** la navegación conservó sus enlaces semánticos, el botón de tema funciona y el hero mantiene texto claro sobre una superficie de contraste.
- **Interacciones comprobadas:** enlaces de navegación interna, cambio claro/oscuro y animación del isotipo.

## Limitación de la revisión

La política del navegador bloqueó la creación de una página temporal `data:` que reunía la propuesta fuente y la captura de implementación en una misma imagen. Por eso no fue posible completar la comparación lado a lado exigida por este procedimiento, aunque ambas piezas fueron inspeccionadas individualmente en el navegador local.

## Próximo control recomendado

Revisar manualmente la cabecera y el hero en una ventana móvil antes de publicar, para confirmar el comportamiento del isotipo compacto.

final result: blocked
