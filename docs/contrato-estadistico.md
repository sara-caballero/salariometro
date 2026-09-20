# Contrato estadístico 1.0

## Población y medida

- Población: personas asalariadas a jornada completa incluidas en la EES 2022.
- Medida: ganancia bruta anual equivalente en euros.
- Ponderación: `FACTOTAL`.
- Periodo: 2022.
- Fuente primaria: microdatos anonimizados del INE.

La EES excluye las secciones A, T y U de la CNAE-09 y no cubre por completo la Administración pública. Es una encuesta muestral, por lo que los resultados son estimaciones ponderadas y no un censo.

## Fórmula salarial

El paquete oficial indica:

```text
DIASRELABA = min(365, DRELABAM * 30.42 + DRELABAD)
DIASANO = DIASRELABA - DSIESPA2 - DSIESPA4
SALANUAL = (365 / DIASANO) * (RETRINOIN + RETRIIN + VESPNOIN + VESPIN)
```

Los registros con `TIPOJOR = 1` forman la población de jornada completa.

## Percentil

Para un salario `s`:

```text
100 * suma de FACTOTAL cuando SALANUAL < s / suma total de FACTOTAL
```

Los empates no cuentan como salarios inferiores. El valor se redondea al entero más cercano para mostrarlo. La distribución publicada conserva exactamente todos los cambios posibles de ese entero.

## Estadísticos

La media es ponderada. La mediana es el primer salario cuya ponderación acumulada alcanza al menos el 50 % del total. También se calculan los percentiles 10, 25, 50, 75 y 90 para control.

## Cohortes

- España.
- Sexo.
- Tramo de edad oficial del microdato.
- Sexo y edad observados conjuntamente.
- Región NUTS1 del centro de trabajo.

Una cohorte con menos de 100 registros se suprime. De 100 a 499 se marca con cautela. Nunca se crean cruces a partir de tablas marginales.

Los resultados que redondearían al 100 % se presentan como «más del 99 %» para no convertir una estimación muestral en una afirmación absoluta.

## Validación

La publicación exige:

1. Fuente, periodo y versión de los datos fijados.
2. Esquema y códigos contrastados con el diseño de registro y los formatos SAS.
3. Fórmula contrastada con las instrucciones incluidas por el INE.
4. Pruebas de empates, límites, redondeo, ponderación y cohortes.
5. Contraste de 18 agregados con la tabla oficial 36832.
