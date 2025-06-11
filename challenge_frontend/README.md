# ChallengeFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.14.

######

Prueba técnica desarrollador Front End.

1. Construir una aplicación con Angular y NodeJS (angular universal). Eres libre de decir que
   versiones utilizar.
2. Construir un servicio en NodeJs que reciba una cadena de texto y devuelva una cadena
   encriptada. El servicio deberá encriptar la cadena recibida con el algoritmo
   “RSA/ECB/PKCS1Padding encoding UTF-8” y devolver el resultado.
3. Desarrollar una pantalla donde debamos incluir un input de texto inhabilitado como se
   muestra en la imagen.
4. Desarrollar un botón con icono de micrófono el cual te permita iniciar un reconocimiento
   de voz para conocer tu nombre o cómo quieres que te llamen. El input se tiene que llenar
   en tiempo real, cuando estemos haciendo el dictado.
   Considerar las siguientes validaciones, solo podemos recibir caracteres alfanuméricos y el
   nombre no puede ser mayor a 15 caracteres.
5. Consumir el servicio creado en NodeJs para enviar el nombre dictado y encriptarlo.
6. Se espera que la cadena generada la podemos desencriptar correctamente por lo que
   necesitaremos la llave privada.
7. Subir tu código a un repositorio el cual nos puedas compartir.

######

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# challenge_frontend
