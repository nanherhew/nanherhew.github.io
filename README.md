# Nanher Hew — reemplazo del portafolio

Sitio estático para GitHub Pages. Usa HTML, CSS y JavaScript sin paso de compilación, framework, formularios, analítica ni píxeles de marketing.

## Publicar

Cuando quieras publicarlo, copia el contenido de esta carpeta a la raíz del repositorio de GitHub Pages y conserva la carpeta `arts/`. Este paquete no modifica el sitio en línea.

## Archivos

- `index.html`: portafolio, galería, mapa de conexiones por categorías, visor accesible, avisos de edad y privacidad, estimador de comisiones.
- `style.css`: diseño adaptable y soporte para movimiento reducido.
- `script.js`: filtros, visor con teclado, declaración 18+, preferencias, estimador, monitor de sesión, audio opcional y movimiento.
- `legal.html`: aviso de privacidad y términos con campos pendientes visibles.
- `arts/`: ilustraciones y audio originales. Las vistas previas optimizadas están en `arts/thumbs/`; el visor conserva los archivos completos.

## Antes de publicar

Completa todos los campos `[DATO PENDIENTE...]` en `legal.html`. Confirma moneda, configuración de alojamiento, contacto y domicilio para privacidad/ARCO, y las condiciones faltantes de comisiones. Revisa que las obras y atribuciones de clientes puedan mostrarse públicamente. La puerta 18+ es una declaración, no verifica la edad. El estimador no crea encargos ni acepta pagos.

## Privacidad y funcionamiento

- La declaración de edad se guarda en `sessionStorage` durante la sesión actual.
- La elección esencial de privacidad se guarda en `localStorage`.
- El filtro de galería y nivel de audio solo se recuerdan si la visita activa Preferencias.
- Analítica y Marketing figuran como categorías inactivas; el sitio no carga proveedores de esas categorías.
- El audio nunca inicia automáticamente. El movimiento del dispositivo solo se activa después de una acción expresa.
- Los enlaces sociales salen del sitio solo después de que la visita los selecciona.
- El mapa conecta únicamente obras con la misma categoría existente; desde una pieza se puede abrir ese hilo para ver las obras relacionadas.

## Ilustraciones

Se conservaron los archivos de arte que usa la página publicada. La galería contiene 12 registros, incluidos los dos ejemplos de comisión y dos trabajos en proceso originales.
