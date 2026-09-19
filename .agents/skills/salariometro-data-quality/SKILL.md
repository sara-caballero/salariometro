---
name: salariometro-data-quality
description: Valida fuentes, transformaciones, estadisticas, logica de comparacion y textos publicables de Salariometro. Usar al importar o actualizar datos salariales espanoles, combinar conjuntos de datos, implementar comparaciones por sexo, edad, territorio o profesion, y revisar resultados antes de publicarlos. No usar para cambios exclusivamente visuales.
---

# Salariometro Data Quality

Protege la fiabilidad estadistica y la trazabilidad de Salariometro. Una cifra plausible no es suficiente: cada resultado debe ser reproducible, comparable y explicable.

## Fijar el contrato de comparacion

Antes de calcular, documentar para el salario introducido y para la referencia:

- bruto o neto;
- anual, mensual u horario, y numero de pagas;
- jornada completa, parcial o equivalente a tiempo completo;
- media, mediana, percentil u otra medida;
- poblacion cubierta y exclusiones;
- lugar de residencia o lugar de trabajo;
- periodo de referencia y, si procede, base de precios;
- dimensiones aplicadas: sexo, edad, territorio, ocupacion, actividad u otras.

No comparar valores hasta que las definiciones sean compatibles o exista una transformacion defendible y documentada.

## Reglas no negociables

1. Priorizar fuentes primarias oficiales. Usar fuentes secundarias solo para descubrir o contrastar.
2. Conservar los datos originales sin modificar y separar datos normalizados y derivados.
3. Mantener un manifiesto de procedencia siguiendo [references/source-policy.md](references/source-policy.md).
4. No construir una cohorte conjunta a partir de tablas marginales separadas. Por ejemplo, sexo, edad y ocupacion por separado no permiten estimar con rigor "mujeres de 30 anos en marketing".
5. Conservar marcas de supresion, errores muestrales, advertencias de fiabilidad, rupturas de serie y versiones de clasificaciones.
6. Si dos fuentes discrepan, reconciliar poblacion, unidad, geografia, periodo y version. Si la discrepancia persiste, bloquear la publicacion o mostrar una comparacion mas amplia que si sea valida.
7. Etiquetar como estimacion cualquier interpolacion, imputacion, actualizacion por inflacion o extrapolacion. No presentar precision falsa.
8. Mantener el salario y los datos demograficos del usuario en el navegador salvo que exista una decision explicita y documentada de privacidad para almacenarlos.

## Validar una incorporacion o cambio

1. Leer la metodologia y la ficha de la fuente antes de transformar datos.
2. Registrar procedencia, periodo, unidad, universo, geografia y clasificaciones.
3. Validar tipos, unidades, categorias, unicidad, valores ausentes y rangos.
4. Ejecutar las invariantes y pruebas de [references/statistical-validation.md](references/statistical-validation.md).
5. Recalcular de forma independiente ejemplos o totales publicados por el organismo oficial.
6. Probar valores por debajo, exactamente en, entre y por encima de los puntos de referencia.
7. Conservar precision completa internamente y redondear solo en la presentacion.
8. Revisar que cada frase de la interfaz describa exactamente la estadistica calculada.

## Diferenciar porcentaje relativo y percentil

- `((salario / referencia) - 1) * 100` responde a "cuanto mas o menos que la referencia".
- Un percentil responde a "que proporcion de la poblacion queda por debajo" y requiere una distribucion o puntos de corte suficientes.
- No convertir "30 % por encima de la mediana" en "percentil 80". Son afirmaciones distintas.
- Si el percentil se interpola entre puntos publicados, mostrarlo como aproximado y conservar los puntos y la formula usados.

## Informacion visible para el usuario

Cada resultado debe poder desplegar:

- organismo y conjunto de datos;
- periodo de referencia y fecha de actualizacion de Salariometro;
- poblacion y unidad comparadas;
- nivel geografico real;
- si es dato oficial directo o estimacion;
- limitaciones relevantes y enlace a la fuente.

Preferir "No hay datos fiables para este cruce" a fabricar una cifra. Cuando un cruce no sea valido, ofrecer una comparacion mas amplia valida.

## Criterio de finalizacion

Dar por validado un cambio solo cuando datos originales, manifiesto, transformacion reproducible, pruebas y nota de fuente coincidan. Si falta una pieza, comunicar el bloqueo y la comparacion segura disponible.
