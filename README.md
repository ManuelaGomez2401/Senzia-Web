# Senzia
Página web académica de un emprendimiento de inteligencia organizacional y bienestar laboral.

## Estructura
- `index.html`: página principal, ubicada en la raíz para GitHub Pages.
- `css/styles.css`: diseño responsive.
- `js/script.js`: menú, animaciones y formulario.
- `assets/`: imágenes del proyecto.
- `google-apps-script/Code.gs`: backend para guardar contactos en Google Sheets.
- `docs/`: documentación del trabajo.

## Formulario
1. Cree una hoja de Google Sheets.
2. Abra Extensiones > Apps Script.
3. Pegue `google-apps-script/Code.gs`.
4. Implemente como aplicación web, acceso para cualquier persona.
5. Copie la URL terminada en `/exec`.
6. Péguela en `const FORM_ENDPOINT=''` dentro de `js/script.js`.

## GitHub Pages
En GitHub: Settings > Pages > Deploy from a branch > `main` > `/(root)` > Save.
