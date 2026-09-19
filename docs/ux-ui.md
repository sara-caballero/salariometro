# Salariometro: interfaz funcional

Estado: primera version implementada.

## Objetivo

La pagina debe permitir introducir un salario y obtener una comparacion estadistica con el minimo contenido adicional necesario. No es una pagina comercial y no utiliza reclamos, beneficios promocionales ni llamadas a registro.

## Estructura

1. Cabecera con acceso a la calculadora y a `Fuentes y metodologia`.
2. Descripcion breve del calculo y resumen de unidad, poblacion y ambito.
3. Calculadora de salario bruto anual.
4. Resultado nacional y comparaciones opcionales.
5. Resumen del metodo con enlace a una unica pagina publica de documentacion.

## Textos principales

- Titulo: `Compara tu salario.`
- Descripcion: `Introduce tu salario bruto anual para calcular que porcentaje de personas asalariadas a jornada completa tiene un salario inferior.`
- Campo: `Tu salario bruto anual`.
- Ayuda: `Incluye pagas extra, bonus y variable de todo el año.`
- Accion: `Calcular`.
- Resultado: `Ganas mas que el X % de los asalariados a jornada completa en España.`
- Sin fuente validada: `El calculo aun no esta publicado.`
- Ciudad: `No hay datos disponibles para esta ciudad.`

## Estados

- **Inicial:** solicita el salario sin mostrar cifras.
- **Calculado:** muestra percentil, frase completa, matriz visual, calidad y procedencia.
- **Fuente pendiente:** bloquea la cifra hasta completar la validacion.
- **Comparacion no disponible:** explica el motivo sin sustituir territorios o poblaciones.
- **Demostracion:** solo mediante `?demo=1`, con avisos persistentes de datos ficticios.
- **Error de entrada:** aparece junto al campo y conserva el valor introducido.

## Documentacion publica

`metodologia.html` concentra en una unica pagina:

- formula y regla para empates;
- poblacion, unidad y exclusiones;
- fuente primaria;
- cobertura de cada comparacion;
- fuentes alternativas evaluadas;
- umbrales y reglas de publicacion.

Los documentos Markdown permanecen como documentacion interna del repositorio, pero no se enlazan desde la interfaz publica.

## Accesibilidad y privacidad

- Etiquetas visibles, foco de teclado, regiones `aria-live` y contraste suficiente.
- La matriz de puntos tiene una descripcion textual equivalente.
- Diseño adaptable a movil y escritorio.
- Salario y datos opcionales procesados exclusivamente en el navegador.
