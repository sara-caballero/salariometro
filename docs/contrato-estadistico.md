# Salariometro: contrato estadistico

Estado: definicion inicial aprobada  
Este documento fija las condiciones que debe cumplir cualquier cifra antes de publicarse.

## 1. Estadistica principal

La estadistica principal es la posicion percentil del salario bruto anual introducido dentro de una poblacion de referencia.

La frase visible adopta esta forma:

> Ganas mas que el X % de los asalariados a jornada completa de [grupo o territorio].

`X` representa la proporcion ponderada de personas de la poblacion de referencia con un salario estrictamente inferior al introducido.

Para un salario `s`, observaciones salariales `y_i` y ponderaciones oficiales `w_i`:

`percentil(s) = 100 * sum(w_i * I(y_i < s)) / sum(w_i)`

Se usa `< s`, no `<= s`, porque la frase dice `ganas mas que`.

## 2. Precision y presentacion

- El calculo conserva toda la precision disponible.
- La interfaz muestra un porcentaje entero redondeado al entero mas cercano.
- El valor mostrado no se obtiene a partir de la media o la mediana.
- No se interpola entre deciles, cuartiles u otros puntos publicados para producir un entero aparentemente exacto.
- Si la fuente no permite determinar el percentil para el salario introducido, no se muestra un porcentaje.

## 3. Datos admisibles

El percentil solo puede calcularse a partir de una fuente primaria oficial que permita obtener directamente la proporcion acumulada para el salario introducido, por ejemplo:

- microdatos oficiales con ponderaciones y variables compatibles; o
- una distribucion oficial publicada con granularidad suficiente para el calculo directo, sin interpolacion.

No son suficientes por si solos:

- la media;
- la mediana;
- unos pocos percentiles de corte;
- bandas salariales que no permiten localizar el salario sin asumir una distribucion interna;
- estimaciones de terceros;
- renta fiscal usada como sustituto de salario.

Las encuestas oficiales pueden ser muestras representativas y no censos. En ese caso se aplican sus ponderaciones, advertencias de muestreo y reglas de fiabilidad.

## 4. Poblacion de referencia

La poblacion inicial debe cumplir simultaneamente:

- personas asalariadas;
- jornada completa segun la definicion de la fuente;
- salario bruto anual;
- territorio y periodo declarados en el resultado.

Quedan fuera autonomos, ocupados no asalariados y personas a jornada parcial.

Las exclusiones adicionales de la fuente —por ejemplo, determinados sectores, tamanos de empresa o colectivos— deben aparecer en la nota metodologica del resultado.

## 5. Concepto salarial

El dato del usuario representa la remuneracion bruta salarial total de un ano completo:

- salario fijo;
- pagas extraordinarias;
- bonus;
- retribucion variable.

No incluye cotizaciones empresariales ni reembolsos de gastos. Los pagos en especie y otros conceptos se trataran exactamente como establezca la fuente seleccionada y se explicaran si afectan a la comparabilidad.

## 6. Tiempo y precios

- Se utiliza el periodo oficial mas reciente que haya superado la validacion.
- No se mezclan periodos dentro de una misma comparacion.
- No se actualiza una distribucion por inflacion ni se extrapola a otro ano para producir un percentil presentado como dato real.
- El ano de referencia debe estar visible junto al resultado.
- Si el salario introducido pertenece a un ano distinto, la interfaz debe advertir de la diferencia temporal.

## 7. Dimensiones

### 7.1 Espana

Distribucion de personas asalariadas a jornada completa para el conjunto de Espana.

### 7.2 Edad

La edad exacta se asigna al tramo publicado por la fuente. No se crea una distribucion para una edad individual si la fuente solo publica intervalos.

### 7.3 Sexo

Se utilizan exclusivamente las categorias y distribuciones publicadas por la fuente. `Prefiero no indicarlo` omite esta comparacion.

### 7.4 Comunidad autonoma

La comparacion debe basarse en residencia. Una fuente clasificada por lugar de trabajo no puede presentarse como residencia.

### 7.5 Ciudad

Solo se publica un percentil municipal si existe una distribucion salarial oficial para esa ciudad y cumple todas las condiciones de este contrato.

No se permite:

- sustituir ciudad por provincia o comunidad;
- asignar a una ciudad la distribucion de otra;
- usar renta media, renta imponible o ingresos del hogar como salario;
- estimar la distribucion municipal desde datos regionales.

En ausencia de datos se muestra `No hay datos disponibles para esta ciudad`.

## 8. Comparaciones separadas y combinadas

Espana, edad, sexo, comunidad y ciudad se calculan como comparaciones separadas.

Una comparacion combinada solo se admite cuando una misma fuente proporciona las observaciones o la distribucion conjunta necesaria. No se puede obtener, por ejemplo, la distribucion de `mujeres de 25 a 34 anos en Madrid` combinando por separado una tabla de sexo, otra de edad y otra territorial.

Cada combinacion aprobada debe superar controles de cobertura, tamano muestral, supresion y error publicados o definidos para esa fuente.

## 9. Ponderaciones, valores iguales y extremos

- Se aplican las ponderaciones oficiales sin sustituirlas por conteos simples.
- Las personas con exactamente el mismo salario que el usuario no cuentan como salarios inferiores.
- Para salarios por debajo o por encima de todas las observaciones validas, el resultado se limita al rango que la fuente permite sostener.
- Los valores suprimidos o no disponibles nunca se convierten en cero.

## 10. Reglas de bloqueo

No se publica un resultado cuando:

- falta una distribucion compatible;
- las definiciones de salario o poblacion no coinciden;
- la geografia representa lugar de trabajo en vez de residencia;
- el cruce se ha construido desde marginales independientes;
- la fuente marca el dato como suprimido o no fiable;
- la muestra no supera el criterio de fiabilidad establecido;
- el esquema o la metodologia han cambiado sin revision;
- no puede reproducirse el resultado desde los datos originales y la transformacion versionada.

## 11. Trazabilidad obligatoria

Cada distribucion debe registrar:

- organismo y conjunto de datos;
- tabla, fichero o identificador de API;
- URL y fecha de consulta;
- periodo de referencia y revision;
- unidad, universo y exclusiones;
- geografia y si corresponde a residencia o trabajo;
- ponderaciones y advertencias de fiabilidad;
- huella SHA-256 de los datos originales;
- version del codigo de transformacion.

## 12. Decisiones pendientes de la fase de fuentes

El inventario de fuentes debe resolver antes de implementar cada tarjeta:

- que organismo ofrece una distribucion admisible para cada dimension;
- que anos y coberturas son compatibles;
- que umbral de muestra o error se aplica a cada fuente;
- que conceptos salariales concretos incluye cada operacion estadistica;
- que ciudades disponen realmente de datos;
- que comparaciones combinadas pueden calcularse sin modelado ni interpolacion.

