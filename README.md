# SICA - Sistema de Control de Asistencia (versión sencilla)

Prototipo universitario pequeño hecho con HTML, CSS y JavaScript. No necesita instalar programas ni conectar una base de datos.

## Los tres módulos

1. **Empleados:** registrar y eliminar empleados.
2. **Asistencia:** guardar entrada o salida con la fecha y hora del equipo.
3. **Reportes:** consultar registros, filtrar por fecha y descargar un archivo CSV.

Se incluyen tres empleados de ejemplo. La información que se agregue se guarda en el almacenamiento local del navegador; no se comparte entre computadoras y se puede perder si se borran los datos del navegador.

## Publicarlo en GitHub Pages

1. Descargue y descomprima la carpeta `SICA-Simple`.
2. En su repositorio de GitHub, entre a **Add file → Upload files**.
3. Suba el contenido de la carpeta, incluyendo `index.html`, `style.css`, `app.js` y la carpeta oculta `.github/workflows`.
4. Confirme los cambios con **Commit changes** en la rama `main`.
5. Abra la pestaña **Actions** y espere a que el flujo **Publicar SICA en GitHub Pages** termine correctamente.
6. En **Settings → Pages**, revise la dirección publicada.

La carpeta `.github/workflows` contiene el archivo `deploy.yml`, que publica los archivos estáticos. Si el repositorio ya tiene otro flujo de publicación, revise que este archivo lo reemplace y no queden dos flujos incompatibles.
