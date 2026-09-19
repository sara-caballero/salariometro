# Salariometro: especificacion funcional

Estado: definicion inicial aprobada  
Ambito: primera version del producto

## 1. Objetivo

Salariometro permite a una persona asalariada entender su posicion en la distribucion salarial espanola mediante comparaciones basadas en datos oficiales.

La promesa principal es:

> Descubre como se compara tu sueldo.

El resultado central se expresa como:

> Ganas mas que el 72 % de los asalariados a jornada completa en Espana.

El porcentaje cambia segun el salario y el grupo de comparacion. El numero solo se muestra cuando puede calcularse a partir de una distribucion oficial compatible; no se deduce de la media ni de la mediana.

## 2. Publico principal

Personas asalariadas en Espana que quieren comprender como se compara su sueldo. La primera version no esta orientada a empresas, departamentos de recursos humanos ni trabajadores autonomos.

## 3. Flujo principal

1. La persona introduce su salario bruto anual.
2. Salariometro muestra inmediatamente la comparacion con el total de Espana.
3. La persona puede anadir, de forma opcional y progresiva:
   - edad;
   - sexo;
   - comunidad autonoma de residencia;
   - ciudad de residencia.
4. Cada dato opcional genera su propia comparacion cuando existe una distribucion oficial compatible.
5. Las fuentes, el periodo y la poblacion comparada se pueden consultar junto a cada resultado.

El formulario no pedira profesion, sector, experiencia ni nivel de estudios en la primera version.

## 4. Datos introducidos

### 4.1 Salario

- Campo obligatorio.
- Unidad principal: euros brutos al ano.
- Debe incluir el total salarial de un ano completo: salario fijo, pagas extraordinarias, bonus y retribucion variable.
- No incluye cotizaciones pagadas por la empresa ni reembolsos de gastos.
- La definicion final se alineara con la metodologia de la fuente oficial seleccionada y cualquier exclusion se explicara en la interfaz.

### 4.2 Jornada

La herramienta se limita a personas asalariadas a jornada completa. No se pregunta el tipo de jornada: se muestra un aviso visible y permanente cerca del campo de salario.

Texto inicial:

> Esta herramienta compara exclusivamente salarios de personas asalariadas a jornada completa.

### 4.3 Edad

- Campo opcional.
- Se solicita la edad exacta.
- La aplicacion asigna esa edad al tramo oficial correspondiente.
- El resultado indica siempre el tramo utilizado, por ejemplo, `25 a 34 anos`.

### 4.4 Sexo

Campo opcional con estas opciones:

- Mujer.
- Hombre.
- Prefiero no indicarlo.

`Prefiero no indicarlo` no genera una comparacion por sexo. Las etiquetas disponibles reflejaran las categorias publicadas por la fuente oficial y la limitacion se explicara en la metodologia.

### 4.5 Residencia

- Comunidad autonoma de residencia: opcional.
- Ciudad de residencia: opcional y dependiente de la comunidad seleccionada.
- No se utilizaran datos basados en el lugar de trabajo como si fueran datos de residencia.

## 5. Resultados

### 5.1 Comparaciones separadas

Los resultados se muestran en tarjetas independientes:

1. Espana total.
2. Grupo de edad.
3. Sexo.
4. Comunidad autonoma de residencia.
5. Ciudad de residencia.

Una tarjeta solo aparece como resultado numerico si existe una distribucion salarial oficial compatible con ese grupo.

### 5.2 Combinaciones

Se pueden anadir algunas comparaciones combinadas, por ejemplo sexo y edad, unicamente cuando:

- una misma fuente oficial contiene la distribucion conjunta;
- la poblacion, unidad, periodo y geografia son compatibles;
- la muestra o cobertura supera los criterios de fiabilidad definidos para esa fuente;
- no se construye el cruce combinando tablas marginales independientes.

Si no se cumplen estas condiciones, se mantienen las comparaciones separadas.

### 5.3 Ciudad sin datos

Si no existe una distribucion oficial valida para la ciudad seleccionada, se muestra:

> No hay datos disponibles para esta ciudad.

No se sustituye el resultado de ciudad por el de la comunidad autonoma, provincia u otra geografia.

### 5.4 Informacion de apoyo

Cada resultado debe mostrar o permitir desplegar:

- organismo y conjunto de datos;
- ano o periodo de referencia;
- fecha de actualizacion de Salariometro;
- poblacion y unidad comparadas;
- dimension y geografia exactas;
- principales exclusiones o limitaciones;
- enlace a la fuente oficial.

## 6. Estados de la interfaz

- **Inicial:** campo de salario y aviso de jornada completa.
- **Valido:** resultado nacional y controles opcionales.
- **Dato opcional incompleto:** no se calcula esa tarjeta.
- **Sin distribucion compatible:** mensaje de ausencia de datos, sin aproximacion numerica.
- **Dato invalido:** explicacion concreta para corregirlo.
- **Fuente temporalmente no disponible:** se conserva la ultima version validada y se muestra su fecha.

## 7. Privacidad

- No se requiere cuenta ni registro.
- El salario, la edad, el sexo y la ubicacion se procesan en el navegador.
- Estos datos no se envian a un servidor ni se almacenan.
- La analitica futura no puede registrar los valores introducidos ni permitir reconstruirlos.

## 8. Fuera de alcance de la primera version

- Trabajadores autonomos.
- Jornada parcial o conversion a equivalente de jornada completa.
- Salario neto.
- Profesion y sector.
- Experiencia laboral y estudios.
- Recomendaciones de negociacion salarial.
- Cuentas de usuario e historial personal.
- Estimaciones de ciudad basadas en provincia, comunidad o renta fiscal.

## 9. Criterios de aceptacion

La primera version funcional se considera completa cuando:

- calcula el percentil nacional desde una distribucion oficial admitida;
- aplica correctamente edad, sexo y comunidad cuando hay datos validos;
- trata cada comparacion de forma independiente;
- solo muestra combinaciones respaldadas por una distribucion conjunta;
- nunca presenta una media o mediana como percentil;
- muestra `No hay datos disponibles para esta ciudad` cuando corresponde;
- explica fuente, periodo, poblacion y limitaciones;
- funciona en movil y escritorio;
- mantiene los datos personales dentro del navegador.

