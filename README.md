# Nanher Hew — ENTER THE CONSCIOUSNESS / V8

Sitio estático, sin compilación ni backend. Diseñado para publicarse en GitHub Pages.

## Instalación

1. Sustituye en tu repositorio los archivos `index.html`, `style.css` y `script.js` por los incluidos en este ZIP.
2. **Conserva** tu carpeta original `arts/` con sus imágenes, sin sobrescribirla. El ZIP no trae dibujos originales porque ya están en tu repositorio.
3. Publica como siempre desde GitHub Pages. El proyecto utiliza rutas relativas (`./arts/...`), compatibles con repositorios publicados bajo subrutas.
4. Si modificaste la página y parece no cambiar, recarga sin caché (Ctrl+Shift+R).

## Archivos de arte existentes (conservar nombres y mayúsculas)

- `arts/age-banner.jpg` — advertencia 18+.
- `arts/hero.PNG` — personaje en portada (idealmente con transparencia).
- `arts/01.jpg` a `arts/04.jpg` — Recent Works.
- `arts/05.jpg` a `arts/08.jpg` — Archive.
- `arts/02.jpg`, `arts/03.jpg` — Commission artworks catalogados en Archive (con nombres originales de clientes).
- `arts/wip01.jpg`, `arts/wip02.jpg` — trabajos en progreso.

## Nuevas imágenes opcionales — reemplazo automático

Añade los siguientes archivos a `arts/` cuando tengas las ilustraciones listas:

- **`arts/identity.png`** — reemplaza el símbolo 文 del módulo **Identity**.
- **`arts/commission-sample.png`** — reemplaza el símbolo de muestra en el catálogo de **Commissions**.

No hace falta editar HTML/CSS/JS: el sitio comprueba si existen y, cuando cargan, oculta el símbolo y muestra la nueva imagen. Conserva la extensión `.png` y las minúsculas. Si aún no existen, el símbolo sigue visible.

## Música de fondo

**Audio activado por defecto:** la página intenta comenzar a reproducir música cuando el visitante pulsa **I AM 18+ / ENTER CONSCIOUSNESS**. Los navegadores bloquean el sonido automático antes de una interacción explícita. Si el visitante ya había confirmado su edad en esa sesión y recarga la página, aparecerá `AUDIO READY` y se activará con su siguiente interacción.

- **MP3 opcional:** coloca tu propia pista autorizada en `arts/ambient.mp3`, que se reproducirá en bucle.
- **Sin MP3:** se utiliza el ambiente original generado con Web Audio API.
- **Volumen inicial:** 18%, editable de 0 a 100% desde **MIND MONITOR → AUDIO / MASTER LEVEL**.
- **Persistencia:** el volumen y el estado de encendido/apagado se conservan en `sessionStorage` durante la sesión.
- **Silenciar:** el control global de audio o el botón **MUTE AUDIO** dentro del monitor; cualquiera puede reactivar el sonido.
- **Ambas fuentes:** el deslizador controla el MP3 y también el ambiente sintético. Nunca se mezclan simultáneamente como dos fondos independientes.
- Si incluyes música de otra persona, respeta los permisos y créditos exigidos por su licencia.

## Cambios principales de V7

- Una sola página con desplazamiento y seis apartados: **Overview, Recent Works, Archive, Identity, Commissions y Contact**.
- Home con título gigante, resplandor naranja en HEW, icono 文 al fondo, personaje `hero.PNG` delante del texto, descripción rápida y botones de salto.
- Ventana flotante ACCESS NODES. Seleccionar un nodo desplaza a la sección **sin cerrar el menú**.
- Ventana MIND MONITOR: dibujo vectorial de cerebro, señal de estado, pulso simulado de 74 BPM, temporizador real de sesión y año original de actividad artística (2024). **El BPM es una animación decorativa, no un dato biométrico real**.
- Filtros y lightbox, cursor blanco de cruz en desktop, imagen adaptable y navegación apta para móviles.
- Enlace Discord oficial actualizado: https://discord.gg/KxpdYMte
- Paleta negro `#000000`, rojo `#FF0032` y resplandor naranja solo en HEW.
- Eliminación de Supabase, formularios de comisiones y Commission Status (no hay código ni dependencias residuales).

## Verificaciones realizadas

- Sintaxis JavaScript (`node --check`).
- Pruebas automatizadas en Chromium con HTML, CSS y JS cargados localmente mediante Playwright en ocho anchos: 320, 360, 390, 430, 768, 1024, 1440 y 1920 px.
- Advertencia +18, navegación con ventana persistente, galería Archive/WIPS, apertura/cierre de lightbox, monitor retráctil, y ausencia de desbordamientos horizontales y errores de ejecución en esos escenarios.
- Los originales **no** estaban incluidos aquí; debes comprobar visualmente cómo queda `hero.PNG` y la carga real de `arts/` una vez publicado. También debes verificar tu MP3 y los sensores móviles en un dispositivo real.

## Mantenimiento

Sitio en tres archivos: estructura HTML, estilos CSS y controladores JS. No necesita Node.js, npm, Supabase, frameworks ni bases de datos en producción. El contenido de las comisiones mantiene los nombres y precios del archivo original ($15, $20, $25, $35, $45; extras +$25, +$15 y +50%).

## Cambios de V8

- Slider de volumen real dentro de MIND MONITOR, con lectura porcentual y diseño rojo `#FF0032`.
- Música habilitada por defecto tras el acceso del visitante.
- Control MUTE / ENABLE AUDIO integrado en la misma ventana móvil y desktop.
- Comprobación de sintaxis y pruebas automatizadas del acceso, audio, volumen, persistencia, mute y reanudación en 320, 390, 768 y 1440 píxeles, más prueba de una visita posterior con volumen guardado.
- El MP3 real y las ilustraciones no se incluyen: conserva tu carpeta `arts/` del repositorio.
