# Especificación funcional 1.0

## Objetivo

Salariometro sitúa un salario bruto anual dentro de la distribución oficial de personas asalariadas a jornada completa incluida en la EES 2022.

## Entrada

- Salario bruto anual, obligatorio.
- Sexo, opcional: mujer, hombre o no indicado.
- Edad, opcional: entero entre 16 y 120 años.
- Zona NUTS1 del centro de trabajo, opcional.

La equivalencia mensual sobre 12 pagas es informativa. No existe modo de entrada mensual.

## Salida

El resultado principal usa la frase `Ganas más que el X % de los asalariados a jornada completa en España.` También muestra media y mediana del grupo nacional.

Los filtros opcionales producen tarjetas separadas para sexo, edad, sexo y edad, y zona de trabajo. Cada tarjeta contiene porcentaje, media y mediana. No se combinan fuentes o marginales independientes.

## Alcance territorial

La EES anonimizada ofrece siete regiones NUTS1 asociadas al centro de trabajo: Noroeste, Noreste, Comunidad de Madrid, Centro, Este, Sur y Canarias. La interfaz no las presenta como residencia.

No se calcula ciudad ni comunidad autónoma de residencia porque la fuente no contiene una distribución compatible.

## Privacidad

El navegador descarga un fichero derivado sin microdatos personales. El salario, la edad, el sexo y la selección territorial se procesan localmente y no se envían ni guardan.

## Estados

- Inicial: espera una entrada.
- Calculado: muestra el resultado y la procedencia.
- Entrada inválida: explica el problema junto al campo.
- Datos no disponibles: bloquea la cifra si el JSON falta o no supera el esquema.

No existe modo de demostración.
