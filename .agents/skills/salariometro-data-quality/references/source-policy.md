# Politica de fuentes y procedencia

## Prioridad de fuentes

Usar este orden salvo justificacion documentada:

1. API o tabla oficial estructurada.
2. CSV, XLSX u otro fichero oficial descargable.
3. Metodologia, nota tecnica o PDF oficial.
4. Nota de prensa o resumen oficial.
5. Fuente secundaria, solo para descubrir o corroborar.

Productores habituales: INE, AEAT, Seguridad Social, Ministerio de Trabajo, Banco de Espana e institutos estadisticos autonomicos. Que dos fuentes sean oficiales no implica que midan la misma poblacion ni el mismo concepto.

## Registro minimo de procedencia

Cada recurso debe registrar:

- clave estable interna;
- organismo, titulo y codigo de tabla o API;
- URL de la pagina y URL de descarga;
- fecha de consulta;
- periodo de referencia, publicacion y revision;
- formato, tamano y SHA-256 del fichero original;
- unidad y estadistico;
- universo, cobertura y exclusiones;
- base geografica: residencia, trabajo u otra;
- versiones de clasificaciones;
- convenciones de valores ausentes, provisionales o suprimidos;
- licencia o condiciones de reutilizacion;
- transformaciones aplicadas y version del codigo.

## Conservacion y reproducibilidad

- Tratar las descargas originales como inmutables.
- Guardar datos normalizados y derivados por separado.
- Hacer que cada salida pueda remontarse al recurso original y a una version concreta de la transformacion.
- No sustituir silenciosamente un fichero revisado: registrar la nueva version y comprobar el impacto.

## Comprobacion de compatibilidad

Antes de unir o comparar, comprobar:

- euros nominales o reales y ano de precios;
- bruto o neto;
- anual, mensual u horario;
- asalariados, ocupados, declarantes u otra poblacion;
- jornada completa, parcial o equivalente;
- inclusion de pagas extraordinarias y pagos en especie;
- tratamiento de multiples empleadores;
- residencia frente a lugar de trabajo;
- marco muestral y exclusiones;
- versiones de edad, sexo, ocupacion, actividad y territorio.

No usar renta imponible municipal como si fuera salario. No presentar datos provinciales o autonomicos como datos de ciudad.
