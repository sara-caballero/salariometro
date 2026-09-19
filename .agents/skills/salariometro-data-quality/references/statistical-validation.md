# Validacion estadistica

## Calculos y lenguaje

La diferencia relativa es:

`diferencia_pct = ((salario / referencia) - 1) * 100`

Ejemplo correcto: "30 % por encima de la mediana salarial de la poblacion comparada".

Un percentil necesita una distribucion o puntos de corte. Ejemplo correcto si procede: "aproximadamente en el percentil 70". No decir "gana mas que el 70 %" a partir de una simple diferencia respecto de la media o la mediana.

## Interpolacion

- Interpolar solo dentro del intervalo cubierto por puntos publicados.
- No asignar percentiles exactos fuera de los extremos disponibles.
- En los extremos, usar afirmaciones acotadas como "por encima del percentil 90 publicado".
- Registrar puntos de anclaje, formula y supuestos.
- Etiquetar el resultado como aproximado.

## Invariantes de datos

Comprobar como minimo:

- valores numericos finitos y salarios no negativos;
- clave unica al grano declarado;
- procedencia obligatoria para cada fila o bloque;
- codigos oficiales mapeados sin categorias huerfanas;
- `P10 <= P25 <= P50 <= P75 <= P90` cuando existan;
- participaciones que reconcilian con el total, permitiendo el redondeo publicado;
- valores suprimidos o no disponibles conservados como tales, nunca convertidos en cero;
- fallo explicito ante columnas, categorias o tipos inesperados.

No imponer `media >= mediana` como regla universal: es frecuente en salarios, pero no es una identidad matematica.

## Cruces multidimensionales

No inferir una distribucion conjunta a partir de marginales. Tener una tabla por sexo y otra por edad no permite calcular el percentil de una combinacion sexo-edad. Solo publicar el cruce si una fuente lo proporciona o si existe un modelo validado, documentado y claramente etiquetado como estimacion.

## Pruebas minimas del calculador

- valores exactamente iguales a cada punto de corte;
- valores inmediatamente por debajo y por encima;
- valores entre puntos de corte;
- valores fuera del rango publicado;
- unidades incompatibles y denominadores cero;
- datos ausentes, provisionales y suprimidos;
- cambios de esquema y categorias nuevas;
- diferencia relativa positiva, negativa y cero;
- redondeo y formato en euros;
- renderizado de organismo, periodo, universo, geografia y etiqueta de estimacion.
