# Nanher Hew — The contained consciousness

Sitio estático para GitHub Pages. El visitante establece una conexión mediante una pantalla de acceso clasificado y una declaración de mayoría de edad. El archivo mental organiza el resto de la experiencia: identidad (Core), ilustraciones (Memory Bank), el directorio de pensamientos, procesos WIP, asociaciones, conexiones externas, encargos y documentos del sistema.

## Publicar

Cuando quieras publicarlo, copia el contenido de esta carpeta a la raíz del repositorio de GitHub Pages y conserva `arts/`. Este paquete no modifica el sitio en línea.

El sitio espera `favicon.png` en esta misma raíz. Súbelo junto con los archivos del sitio para que aparezca en la pestaña del navegador.

## Archivos

- `index.html`: secuencia de entrada de tres fases inspirada en el boceto, aviso de acceso 18+, ventanas HUD, módulo de voz opcional, directorio del sistema, ilustraciones, procesos WIP, asociaciones, encargos, conexiones y preferencias de privacidad.
- `style.css`: sistema visual cyberpunk negro/naranja/rojo/cian, capas CRT, barridos, marcos de archivo, tipografía editorial, ventanas flotantes, interferencias por niveles, adaptación móvil, estados de foco y movimiento reducido.
- `script.js`: entrada con clic o tecla, búsqueda y filtros locales, visor accesible, autorización 18+ revocable durante la sesión, privacidad, estimador, traza de visita, audio opcional, movimiento voluntario, voz sintetizada al pulsar y una ruta secreta desde el símbolo 文 hacia una obra aleatoria.
- `legal.html`: privacidad, cookies, términos del sitio y términos de comisiones con campos pendientes visibles.
- `arts/`: ilustraciones y audio originales. Las vistas previas optimizadas están en `arts/thumbs/`; el visor conserva los archivos completos.

## Antes de publicar

Completa todos los campos `[DATO PENDIENTE...]` en `legal.html`. Confirma moneda, configuración de alojamiento, contacto y domicilio para privacidad/ARCO, y las condiciones faltantes de comisiones. Revisa que las obras y atribuciones de clientes puedan mostrarse públicamente. La puerta 18+ es una declaración, no verifica la edad. El estimador no crea encargos ni acepta pagos.

## Privacidad y funcionamiento

- La declaración de edad se guarda en `sessionStorage` durante la sesión actual.
- La declaración puede revisarse desde Documentos del sistema y revocarse para volver a bloquear el archivo durante esa sesión.
- La elección esencial de privacidad se guarda en `localStorage`.
- Las preferencias opcionales pueden recordar el filtro del archivo y el nivel de audio; búsqueda y recorrido no se envían a un servidor.
- Analítica y Marketing figuran como categorías inactivas; el sitio no carga proveedores de esas categorías.
- El audio nunca inicia automáticamente. El movimiento del dispositivo solo se activa después de una acción expresa.
- La voz de introducción solo se reproduce tras pulsar Play; utiliza la síntesis de voz disponible en el navegador y puede detenerse desde el mismo control.
- Tocar el símbolo 文 cinco veces seguidas activa un eco visual y abre una obra aleatoria del archivo existente.
- Las interferencias son transiciones visuales breves asociadas a acciones del archivo; no simulan errores permanentes ni bloquean controles.
- La traza describe el área o registro abierto y el tiempo de esta visita en el navegador; no mide la actividad del artista ni envía datos.

## Archivo

Se conservaron los recursos reales del sitio. El banco contiene 12 registros, incluidos dos ejemplos de comisión y dos imágenes etiquetadas como WIP. El mapa conecta registros solo por sus categorías existentes. El Archivo de pensamientos permanece vacío hasta que el artista comparta contenido para esa sección.
