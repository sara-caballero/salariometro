# Pipeline de datos

El pipeline conserva cuatro capas separadas:

1. **Catalogo:** decisiones y metadatos versionados en `data/sources`.
2. **Raw:** descargas inmutables en `data/raw`, excluidas de Git.
3. **Work:** ficheros extraidos y registros normalizados, tambien excluidos de Git.
4. **Derived:** distribuciones compactas que la web puede cargar sin recibir datos del usuario.

## 1. Descargar y fijar la fuente

```text
npm run data:fetch
```

La descarga se guarda en `data/raw/ine-ees-2022/datos_2022.zip` y genera un recibo con URL, fecha, tamano y SHA-256. Nunca se sobrescribe un fichero existente.

Antes de crear datos de produccion hay que:

1. revisar que el ZIP procede de la URL oficial y abre correctamente;
2. comparar su contenido con el diseno de registro incluido;
3. copiar el SHA-256 y el tamano revisados a `data/sources/ine-ees-2022.lock.json`;
4. cambiar el estado del lock a `approved` mediante un cambio revisable en Git.

El builder rechaza una fuente sin lock aprobado o cuya huella no coincide.

## 2. Extraer e inspeccionar

El ZIP oficial contiene versiones para varios programas. Se debe extraer fuera de `data/raw`, por ejemplo en `data/work/ine-ees-2022`, y escoger el CSV oficial.

```text
npm run data:inspect -- --input data/work/ine-ees-2022/archivo.csv
```

El inspector solo muestra cabeceras, separador probable y valores de muestra. No transforma datos. Con el diseno de registro oficial se completan los nombres y codigos de `data/sources/ine-ees-2022.mapping.json`. El mapeo inicial esta vacio deliberadamente: adivinar codigos seria un fallo de calidad.

## 3. Normalizar

```text
npm run data:normalize -- --input data/work/ine-ees-2022/archivo.csv --mapping data/sources/ine-ees-2022.mapping.json
```

La salida canonica es `data/work/ine-ees-2022/canonical.ndjson`. Cada registro conserva unicamente:

- salario bruto anual en euros;
- ponderacion oficial;
- sexo en la categoria publicada;
- tramo oficial de edad;
- indicador de jornada completa.

El proceso falla ante columnas ausentes, codigos desconocidos, numeros invalidos o un mapeo no aprobado. No convierte valores ausentes en cero.

## 4. Construir distribuciones

```text
npm run data:build
```

El builder:

- verifica el lock y el SHA-256 del fichero raw;
- conserva solo registros validos a jornada completa;
- genera distribuciones separadas para total, sexo y edad;
- genera sexo + edad solo desde los mismos microdatos, nunca desde marginales;
- suprime celdas con menos de 100 registros;
- marca como `caution` las celdas de 100 a 499 registros;
- agrupa salarios iguales y guarda pesos acumulados para el navegador;
- produce `data/derived/distributions-ees-2022.json` con procedencia y limitaciones.

## 5. Validar y publicar

```text
npm run data:validate
npm test
```

La validacion comprueba esquema, identificadores, orden salarial, pesos acumulados, total ponderado, tamano muestral, dimensiones permitidas y metadatos. Las pruebas del motor cubren empates, ponderaciones, limites, redondeo y ausencia de cohortes.

Los datos derivados no pasan a `validated` automaticamente. Primero se contrastan agregados reproducibles con las tablas oficiales compatibles, se documentan las diferencias esperables por el filtro de jornada y se revisa manualmente el informe. Hasta entonces la aplicacion debe mostrar la fuente como no disponible.
