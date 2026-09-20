# Pipeline de datos

El flujo conserva cuatro capas:

1. `data/sources`: contrato, mapeo, huella y valores oficiales de control.
2. `data/raw`: ZIP oficial inmutable, excluido de Git.
3. `data/work`: fichero tabulado y registros canónicos, excluidos de Git.
4. `data/derived`: JSON compacto y validado que consume la web.

## Ejecución

```text
npm run data:fetch
npm run data:normalize -- --input data/work/ine-ees-2022/EES_2022.tab
npm run data:build
npm run data:validate:official
npm run data:validate
npm test
```

El normalizador falla ante columnas ausentes, códigos desconocidos, valores no numéricos o días remunerados incompatibles. Calcula `SALANUAL` con la fórmula oficial y conserva salario, ponderación, sexo, edad, jornada y región laboral.

El constructor filtra jornada completa, crea cohortes reales, calcula media y cuantiles, aplica los umbrales muestrales y genera escalones compactos que reproducen exactamente el porcentaje entero publicado.

La validación oficial contrasta media y percentiles 10, 25, 50, 75 y 90 para España, mujeres y hombres con la tabla 36832. Solo después cambia el estado a `validated`.

GitHub Actions reproduce el proceso en `.github/workflows/build-official-data.yml` y solo versiona el JSON derivado si todas las comprobaciones pasan.
