# Salariometro: direccion de experiencia e interfaz

Estado: primera version implementada.

## Idea de producto

La interfaz debe hacer que una estadistica compleja se sienta comprensible, sobria y humana. El concepto editorial es:

> Tu sueldo, puesto en contexto.

La pagina no presenta el sueldo como una puntuacion moral ni promete explicar el nivel de vida. Explica una posicion dentro de una poblacion salarial concreta y deja visibles sus limites.

## Jerarquia

1. Una introduccion breve explica para que sirve la herramienta.
2. La calculadora pide primero unicamente el salario bruto anual.
3. El resultado nacional ocupa el area visual principal.
4. Edad, sexo y residencia aparecen bajo `Afina la comparacion`.
5. Cada filtro genera una comparacion independiente; sexo y edad solo se cruzan si existe la cohorte conjunta.
6. Fuente, periodo, poblacion y limitaciones permanecen accesibles desde el resultado.

## Lenguaje

- Titular: `Tu sueldo, puesto en contexto.`
- Apoyo: `Una cifra dice poco hasta que sabes con quien la comparas.`
- Campo: `Tu salario bruto anual`.
- Ayuda: `Incluye pagas extra, bonus y variable de todo el año.`
- Resultado: `Ganas mas que el X % de los asalariados a jornada completa en Espana.`
- Sin fuente validada: `El calculo aun no esta publicado.`
- Ciudad: `No hay datos disponibles para esta ciudad.`

No se utilizan frases como `estas en el top` ni se confunde percentil con diferencia respecto de la media.

## Sistema visual

La referencia recibida inspira el tono editorial y el uso de espacios amplios, pero la solucion cambia deliberadamente:

- composicion asimetrica en dos paneles;
- resultado sobre un campo verde oscuro en lugar de una tarjeta blanca horizontal;
- matriz de cien puntos en lugar de un porcentaje aislado;
- acento amarillo calido y fondos marfil;
- serif solo en titulares y cifras; interfaz en tipografia del sistema;
- controles rectangulares suaves, evitando una acumulacion de capsulas.

Paleta principal:

- tinta: `#17221c`;
- bosque: `#194f42`;
- marfil: `#f3f0e7`;
- papel: `#fffdf8`;
- azafran: `#f2bd62`;
- salvia: `#d7e2d5`.

## Estados esenciales

- **Inicial:** no muestra ninguna cifra; explica que el resultado aparecera tras introducir el salario.
- **Calculado:** percentil, frase completa, matriz visual, calidad muestral y procedencia.
- **Fuente pendiente:** bloquea el numero e indica que los datos del INE siguen en validacion.
- **Comparacion no disponible:** conserva la tarjeta, explica el motivo y no sustituye la geografia.
- **Demostracion:** solo mediante `?demo=1`, con aviso persistente de datos ficticios.
- **Error de entrada:** mensaje junto al campo, sin borrar el valor introducido.

## Accesibilidad y privacidad

- Etiquetas visibles, foco de teclado, regiones `aria-live` y contraste suficiente.
- La matriz de puntos tiene una descripcion textual equivalente.
- El movimiento se reduce cuando el sistema lo solicita.
- El salario y los datos opcionales se procesan en el navegador y no se guardan ni se envian.
- La interfaz se adapta a movil sin ocultar metodologia ni limitaciones.
