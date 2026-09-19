# Salariometro

Salariometro contextualiza un salario con datos oficiales de Espana y explica con claridad la fuente, el periodo, la poblacion comparada y las limitaciones de cada resultado.

El proyecto esta en su fase inicial. Ya incluye:

- la especificacion funcional y el contrato estadistico;
- un inventario versionado de fuentes oficiales;
- un pipeline reproducible para descargar, normalizar y validar microdatos;
- un motor de percentiles ponderados con pruebas automatizadas.

## Desarrollo

Requiere Node.js 20 o posterior y no tiene dependencias externas.

```text
npm test
npm run data:fetch
npm run data:inspect -- --input data/work/ine-ees-2022/archivo.csv
npm run data:normalize -- --input data/work/ine-ees-2022/archivo.csv --mapping data/sources/ine-ees-2022.mapping.json
npm run data:build
```

El build de produccion permanece bloqueado hasta descargar, revisar y fijar la huella SHA-256 del fichero oficial. El procedimiento completo esta en `docs/pipeline-datos.md`.
