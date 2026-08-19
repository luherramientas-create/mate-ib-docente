# Lu Herramientas · Mate-IB · Panel docente

Panel de consulta para los resultados de `mate-ib`, conectado al proyecto Firebase `registro-edu-aa4c8`.

## Primera versión

- Autenticación docente mediante correo/contraseña o Google.
- Selección de sección.
- Lista de estudiantes activos.
- Progreso de P01–P08.
- Detalle de respuestas e intentos.
- Pistas, puntuación y tiempo.
- Solo lectura sobre los datos de la evaluación.

## Firebase

La aplicación usa el mismo proyecto Firebase que `mate-ib`. Antes de ponerla en uso real, configure:

1. Authentication → habilitar el proveedor que utilizará el docente.
2. Firestore Security Rules → restringir las lecturas del panel a las cuentas docentes autorizadas.
3. Agregar el dominio de GitHub Pages a Authentication → Authorized domains.

No se almacenan contraseñas ni secretos en este repositorio.

## GitHub Pages

El repositorio incluye `.github/workflows/pages.yml`. En Settings → Pages seleccione **GitHub Actions** como fuente si GitHub todavía no la ha configurado automáticamente.

## Seguridad

El panel está diseñado para lectura. La interfaz no contiene operaciones para editar o borrar resultados. La protección definitiva de los datos debe hacerse con Security Rules de Firestore; ocultar botones o rutas en JavaScript no constituye seguridad.
