# Inventario de fuentes oficiales

Estado de revision: 19 de septiembre de 2026.

El inventario ejecutable se encuentra en `data/sources/catalog.json`. Este documento resume las decisiones de producto; no sustituye a la metodologia de cada organismo.

## Fuente primaria: EES 2022

La Encuesta de Estructura Salarial 2022 del INE es la unica fuente localizada que combina, en microdatos publicos anonimizados, salario bruto anual, ponderacion, sexo, edad y tipo de jornada. Por ello es la fuente primaria para calcular una funcion de distribucion empirica ponderada de personas asalariadas a jornada completa.

Permite habilitar, una vez validado el fichero:

- Espana total;
- sexo;
- tramo de edad;
- sexo y edad conjuntamente cuando la celda supera el umbral de fiabilidad.

No permite presentar la comunidad autonoma como residencia: su diseno territorial parte del centro o cuenta de cotizacion. Tampoco contiene municipio. Se mantienen ademas todas las exclusiones sectoriales y de cobertura que declara el INE.

## Fuentes de contraste

- **EAES 2024 (INE):** fuente anual mas reciente. Se usara para comprobar ordenes de magnitud y explicar actualidad, no para inventar percentiles de subgrupos desde medias o bandas.
- **Deciles salariales EPA 2024 (INE):** utiles como contraste mensual por perfiles, pero incompatibles con el contrato anual y demasiado agregados para un percentil entero arbitrario.
- **Mercado de Trabajo y Pensiones 2024 (AEAT):** registro administrativo muy amplio, pero sus tablas no separan de forma compatible la jornada completa y mezclan duraciones y pagadores.
- **Salarios territoriales 2024 (Idescat):** aporta medias para Cataluna y municipios de mas de 50.000 habitantes. Es experimental, territorialmente parcial y no ofrece la distribucion necesaria para el percentil municipal.

## Cobertura aprobada para la primera version

| Comparacion | Estado | Motivo |
| --- | --- | --- |
| Espana | Pendiente de validar EES 2022 | Distribucion individual ponderada disponible |
| Sexo | Pendiente de validar EES 2022 | Variable incluida en el mismo fichero |
| Edad | Pendiente de validar EES 2022 | Se usan los tramos oficiales |
| Sexo + edad | Condicional | Solo celdas con al menos 100 registros muestrales |
| Comunidad de residencia | No disponible | EES no acredita residencia y EPA no da percentil anual exacto |
| Ciudad de residencia | No disponible | No existe una fuente nacional compatible localizada |

No se mezclan fuentes para construir cruces. Una comparacion no disponible se comunica como tal y nunca se reemplaza por una media, una provincia o una estimacion modelada.

## Regla de actualizacion

Cada fuente nueva se evalua primero contra `docs/contrato-estadistico.md`. Una revision solo se promociona a produccion cuando quedan fijados su URL, periodo, fecha de consulta, huella SHA-256, esquema, transformacion, controles y resultado de las pruebas.
