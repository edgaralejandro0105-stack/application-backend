# Changelog Fase 7 - Exportación de Documentos (Inventario Ciego)

## Objetivo
Implementar la capacidad de generar archivos exportables en formatos estándar (PDF y Excel) que le permitan al personal de La Casona realizar un conteo físico ("Ciego") del inventario actual, comparándolo con el stock teórico registrado en el sistema.

## Dependencias Instaladas
- **`exceljs`**: Elegido por su capacidad de generar archivos Excel (`.xlsx`) reales de forma nativa en Node.js, soportando estilos avanzados como negritas, ajuste de ancho de columnas y formato nativo.
- **`pdfkit`**: Seleccionado por ser el estándar de la industria en Node.js para la generación programática y eficiente de documentos PDF ligeros a través de buffers.

## Componentes Implementados

### 1. Servicio de Reportes (`src/services/report.service.js`)
Se encapsuló la lógica de generación de documentos en un servicio único.
- **`generateInventoryExcel()`**:
  - Consulta los productos activos en orden alfabético.
  - Crea un archivo `.xlsx` en memoria (buffer).
  - Define 5 columnas: ID, Nombre, Categoría, Stock Teórico y Conteo Físico.
  - La columna "Conteo Físico" se deja en blanco intencionalmente para la captura manual.
  - Se le aplica estilo de cabecera (`bold: true`) para mejorar la legibilidad.
- **`generateInventoryPDF()`**:
  - Crea un documento PDF con un título centrado.
  - Utiliza coordenadas exactas (`y`, `x`) para dibujar una tabla con las mismas 5 columnas.
  - Dibuja líneas (`stroke`) para generar un formato de lista lista para imprimir.
  - Implementa un salto de página automático (`doc.addPage()`) si la lista de productos sobrepasa el límite visual de la hoja A4.

### 2. Controlador y Rutas (`src/controllers/report.controller.js` y `src/routes/reports.routes.js`)
Se crearon los endpoints expuestos mediante GET (ideal para descargas directas desde navegadores o botones de frontend):
- **`GET /api/reports/inventory/excel`**: Retorna el buffer del Excel.
  - Cabecera asignada: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Cabecera asignada: `Content-Disposition: attachment; filename=inventario_ciego.xlsx`
- **`GET /api/reports/inventory/pdf`**: Retorna el buffer del PDF.
  - Cabecera asignada: `Content-Type: application/pdf`
  - Cabecera asignada: `Content-Disposition: attachment; filename=inventario_ciego.pdf`

El uso de `Content-Disposition: attachment` es crítico, ya que indica al navegador que debe abrir el cuadro de diálogo de "Guardar Archivo" en lugar de intentar renderizar los bytes crudos en la pantalla.

---

## Archivos Modificados
- `package.json` (Dependencias `pdfkit` y `exceljs`)
- `src/server.js` (Montaje de rutas base `/api/reports`)
- `src/services/report.service.js` (NUEVO - Generación de buffers binarios)
- `src/controllers/report.controller.js` (NUEVO - Control de Headers HTTP y respuesta)
- `src/routes/reports.routes.js` (NUEVO - Enrutamiento GET)

## Guía de Pruebas

Para probar este módulo de exportación, asegúrate de que el servidor esté encendido (`npm start`).

**Opción A (Navegador - Recomendada)**
La forma más fácil de probar es abriendo directamente estas URLs en Chrome, Edge o Firefox, simulando lo que haría el usuario:
- **Descargar PDF:** [http://localhost:3000/api/reports/inventory/pdf](http://localhost:3000/api/reports/inventory/pdf)
- **Descargar Excel:** [http://localhost:3000/api/reports/inventory/excel](http://localhost:3000/api/reports/inventory/excel)
Verás cómo el navegador descarga instantáneamente los archivos.

**Opción B (Postman)**
Si lo haces por Postman, como es un archivo binario, hacer un `Send` normal arrojará letras sin sentido (bytes).
1. Crea una petición `GET` a `http://localhost:3000/api/reports/inventory/pdf`.
2. En lugar de darle click a "Send", haz click en la pequeña flecha hacia abajo al lado de Send.
3. Selecciona la opción **"Send and Download"**.
4. Te pedirá dónde quieres guardar el `.pdf` o el `.xlsx` en tu computadora local.
