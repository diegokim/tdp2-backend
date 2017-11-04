# Taller de desarrollo de proyectos 2 - Server - Link Up

Servidor web en NodeJs con arquitectura de microservicios que utiliza MongoDB como base de datos.


## Tutos

Es conveniente ver este video antes, es el tutorial en el que se basó la implementación:

https://www.youtube.com/playlist?list=PLillGF-RfqbZMNtaOXJQiDebNXjVapWPZ

## Como instalarlo

Instalar Node JS (también se instalará NPM):
https://nodejs.org/es/

Instalar mongodb:
https://www.mongodb.com/download-center?jmp=nav#community


Una vez instalado, ejecutar desde el directorio raiz:

> $ npm install

Esto instala las dependencias del proyecto (bibliotecas externas definidas en el package.json).

## Cómo levantar el servidor

### Levantar el motor de Base de Datos primero:

> $ sudo mongod

Si este error ocurrre:
exception in initAndListen: 29 Data directory /data/db not found., terminating

Ejecutar como root:
> $ mkdir -p /data/db

### Levantar el servidor:

Para correr el servidor:

> $ npm start

### Correr las pruebas:

> $ npm test

# API publica

## Status

### GET /ping

Mensaje:

    body: {}

Respuesta:

	respuesta --> 200
	body: {
		status: "ok"
	}

## Login

### GET /login

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 200
	body: {
    photos: [
      'photo-link-1',
      'photo-link-2',
      'photo-link-3'
    ]
  }

  #o si ya estás logueado

	  body: {
      profile: {},
      setting: {},
      links: [],
      candidates: []
    }

## Perfil

### GET /users/me/profile

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 200
	  body: {
	    photo: 'http://google.com',
	    photos: [
	      'http://google.com',
	      'http://imagen-perfil.com'
	    ],
	    description: 'description'
	    work: 'maestro',
	    id: '1411063048948357',
	    name: 'papa noel',
	    gender: 'male',
	    birthday: '08/13/1993',
	    interests: [
	      'futbol',
	      'mas futbol'
	    ],
	    education: 'High School'
	  }

### GET /users/{id}/profile

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 200
	  body: {
	    photo: 'http://google.com',
	    photos: [
	      'http://google.com',
	      'http://imagen-perfil.com'
	    ],
	    description: 'description'
	    work: 'maestro',
	    id: '1411063048948357',
	    name: 'papa noel',
	    gender: 'male',
	    birthday: '08/13/1993',
	    interests: [
	      'futbol',
	      'mas futbol'
	    ],
	    education: 'High School'
	  }

### PATCH /users/me/profile (update)

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: { // alguno de estos campos, no hace falta que sean todos
      photo: 'http://google.com',
      photos: [
        'http://google.com',
        'http://imagen-perfil.com'
      ],
      description: 'description'
    }

Respuesta:

	respuesta --> 200

  body: // profile


## Settings

### GET /users/me/settings

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 200
	  body: {
	    ageRange: {
        min: 18,
        max: 32
      },
      distRange: {
        min: 1,
        max: 500
      },
      invisible: true,
      interestType: 'female', // male, both, friends
      accountType: 'free',
      superLinksCount: 1
	  }


### PATCH /users/me/settings (update)

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: { // alguno de estos campos, no hace falta que sean todos
      ageRange: {
        min: 18,
        max: 32
      },
      distRange: {
        min: 1,
        max: 500
      },
      invisible: true,
      interestType: 'female', // male, both, friends
      accountType: 'premium'
	  }

Respuesta:

	respuesta --> 200

  body: // settings


## Users (candidates)

### GET /users/me/candidates

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 200
	  body: {
	    profiles: []
	  }

## Links

### PUT /users/{id}/actions

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {
      action: 'link', // 'super-link', 'reject', 'block', 'report'
      message: ''     // 'Reporto al usuario por irrespetuoso e ignorante'
    }

Respuesta:

	respuesta --> 201
	  body: { link: false }


### GET /users/me/links

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 200
	  body: {
	    profiles: []
	  }

### DELETE /users/{id}

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 204
	  body: {}


## CHAT

### POST /users/{id}/chats/message

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {
      message: 'message to user'
    }

Respuesta:

	respuesta --> 200
	  body: {}


## DENOUNCES

### GET /users/denounces

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {}

Respuesta:

	respuesta --> 200
	  body: [{
      sendUID: 'id-1',
      recUID: 'id-2',
      sendUName: 'user-name-1',
      recUName: 'user-name-2',
      message: 'malo malo',
      status: 'pendiente'
    }]

### PUT /users/denounces

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {
      sendUID: 'id-1',
      recUID: 'id-2',
      status: 'aceptada'
    }

Respuesta:

	respuesta --> 200
	  body: {}


## REPORTS

### POST /users/reports

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {
      startDate: '', // filters
      endDate: ''
    }

Respuesta:

	respuesta --> 200
	  body: {
      activeUsers: {
        sampling: [{
          x: 0,
          y: 10
        }, {
          x: 1,
          y: 20
        }, {
          x: 2,
          y: 30
        }]
      },
      denounces: {
        otro: {
          count: 150,
          percentage: 40
        },
        spam: {
          count: 75,
          percentage: 20
        },
        comp: {
          count: 150,
          percentage: 40
        }
      }
    }

## PROJECT

### GET /project/configs

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: { }

Respuesta:

	respuesta --> 201
	  body: [ 
      { prettyName: 'Candidatos maximos para mostrar',
        name: 'maxCandidatesToShow',
        value: 5 },
      { prettyName: 'Fotos minimas para loguearte',
        name: 'minPhotosToLogin',
        value: 5 },
      { prettyName: 'Intereses maximos para mostrar en login',
        name: 'maxInterestsToLogin',
        value: 5 },
      { prettyName: 'Links para cuenta Premium',
        name: 'linksForPremiumAccount',
        value: 5 },
      { prettyName: 'Fotos maximas para mostrar en login',
        name: 'maxPhotosToLogin',
        value: 7 },
      { prettyName: 'Links para cuenta Free',
        name: 'linksForFreeAccount',
        value: 1
      }
    ]

### PUT /project/configs/{configName}

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {
      value: 10
    }

Respuesta:

	respuesta --> 204
	  body: {}

## GET /projects/advertising

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: { }

Respuesta:

	respuesta --> 200
	  body: [{
      id:    'id1'
      image: 'image in base 64'
    }, {
      id:    'id2'
      image: 'image in base 64'
    }]

## POST /projects/advertising

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: {
      image: 'image in base 64'
    }

Respuesta:

	respuesta --> 200
	  body: {
      id:    'id1'
      image: 'image in base 64'
    }

## DELETE /projects/advertising/{advertId}

Mensaje:

    headers: {
      Authorization: 'access_token'
    }
    body: { }

Respuesta:

	respuesta --> 204
	  body: {}


## ADMIN

### POST /admin/login

Mensaje:

    headers: {}
    body: {
      user: 'admin',
      password: 'here-my-password'
    }

Respuesta:

	respuesta --> 201
	  body: {
      token: 'access-token'
    }
