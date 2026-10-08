# Salariometro

Salariometro compara un salario bruto anual con personas asalariadas a jornada completa incluidas en la Encuesta de Estructura Salarial 2022 del INE.

La versión 1.0 incluye:

- percentil nacional ponderado;
- comparaciones por sexo, edad, sexo y edad;
- comparación por las siete zonas NUTS1 del centro de trabajo;
- media y mediana de cada grupo;
- cálculo íntegro en el navegador, sin enviar ni guardar los datos introducidos;
- trazabilidad de la fuente, el periodo y las transformaciones aplicadas;
- contraste automatizado con 18 cifras de la tabla oficial 36832 del INE.

No presenta resultados por ciudad ni por comunidad de residencia porque el microdato oficial no permite calcularlos con el mismo contrato estadístico.

## Publicación

La web es estática y se publica directamente con Netlify. No requiere instalación de dependencias, proceso de compilación ni servidor Node en producción. La configuración de despliegue y las cabeceras de seguridad están en `netlify.toml`.

Para comprobar el motor estadístico localmente solo se necesita Node.js 20 o posterior:

```text
node --test
```

## Pipeline oficial

El flujo completo descarga y verifica el ZIP oficial, normaliza las variables, crea las cohortes, contrasta los agregados y publica únicamente el JSON derivado validado.

```text
node scripts/fetch-source.mjs --source ine-ees-2022
node scripts/normalize-ees-2022.mjs --input data/work/ine-ees-2022/EES_2022.tab
node scripts/build-distributions.mjs
node scripts/validate-official-aggregates.mjs
node scripts/validate-derived.mjs
```

La automatización reproducible está en `.github/workflows/build-official-data.yml`.

## Licencias

El código se publica bajo la licencia MIT. Los datos derivados mantienen la atribución y las condiciones de reutilización de la fuente oficial. Consulta `NOTICE.md` para los detalles.
