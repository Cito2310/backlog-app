# Instrucciones del Proyecto

## Reglas generales

- Trabajar solo dentro de la carpeta del proyecto actual, no explorar otras partes del PC.
- Stack principal: **TypeScript, Node.js, Express, React, TailwindCSS, Electron**.
- Indentación de **4 espacios**.
- Antes de realizar algo, presentar un plan al usuario y esperar su confirmación
- Usar arrow functions: `const fn = () => {}` en lugar de `function fn() {}`
- Siempre programar en ingles aún si las instrucciones hayan sido en español, a excepción de los comentarios que deben ser en español
- Solo realizar comentarios si son complentamente necesario para comprender, si la funcion es auto-explicativa no es necesario comentar

## Estructura de archivos

- Separar archivos por **features** (no por tipo de archivo global).
- Mantener archivos pequeños: si algo puede separarse en otro archivo, hacerlo.
- No mezclar HTML/CSS con lógica: separar con **custom hooks**.
