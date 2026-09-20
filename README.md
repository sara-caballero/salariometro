# Salariometro

Salariometro compara un salario bruto anual con personas asalariadas a jornada completa incluidas en la Encuesta de Estructura Salarial 2022 del INE.

La versión 1.0 incluye:

- percentil nacional ponderado;
- comparaciones por sexo, edad, sexo y edad;
- comparación por las siete macroregiones NUTS1 del centro de trabajo;
- media y mediana de cada grupo;
- cálculo íntegro en el navegador, sin enviar ni guardar los datos introducidos;
- trazabilidad del fichero oficial por URL, tamaño y SHA-256;
- contraste automatizado con 18 cifras de la tabla oficial 36832 del INE.

No presenta resultados por ciudad ni por comunidad de residencia porque el microdato oficial no permite calcularlos con el mismo contrato estadístico.

## Desarrollo

Requiere Node.js 20 o posterior y no tiene dependencias externas.

```text
npm test
npm run preview
```

## Pipeline oficial

El flujo completo descarga el ZIP oficial, verifica su huella, normaliza las variables, crea las cohortes, contrasta los agregados y publica únicamente el JSON derivado validado.

```text
npm run data:fetch
npm run data:normalize -- --input data/work/ine-ees-2022/EES_2022.tab
npm run data:build
npm run data:validate:official
npm run data:validate
```

La automatización reproducible está en `.github/workflows/build-official-data.yml`.
