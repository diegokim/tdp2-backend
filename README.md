# Taller de desarrollo de proyectos 2 - Server

Servidor en NodeJs


## Tutos

Es conveniente ver este video antes, es el tutorial en el que se basó la implementación:

https://www.youtube.com/playlist?list=PLillGF-RfqbZMNtaOXJQiDebNXjVapWPZ

## Como instalarlo

Instalar Node JS (también se instalará NPM):
https://nodejs.org/es/

Instalar postgres:
https://www.postgresql.org/download/


Una vez instalado, ejecutar desde el directorio raiz:

> $ npm install

Esto instala las dependencias del proyecto (bibliotecas externas definidas en el package.json).

## Cómo levantar el servidor

### Levantar el motor de Base de Datos primero:

> $ ...

### Levantar el servidor:

Para correr el servidor:

> $ npm start

### Correr las pruebas:

> $ npm test

# API publica

## Status
Tipo y URI

GET /ping

Mensaje:

    body: {}

Respuesta:

	respuesta --> 200
	body: {
		status: "ok"
	}
