Seed-UI for Angular4 
================
This seed-ui uses a new tech stack and development process:
- Angular 4, see http://angularjs.blogspot.com/2017/03/angular-400-now-available.html
- Typescript, see https://www.typescriptlang.org/docs/tutorial.html
- VMware Clarity, see https://vmware.github.io/clarity/
- Angular-CLI, see https://github.com/angular/angular-cli


Getting started
---------------
#### Installation
*Prerequisites*:
- Install node.js version 6.9 or higher (https://nodejs.org/en/)
- Install Angular-CLI by following [these instructions](https://github.com/angular/angular-cli#installation).
- Install [json-server](https://github.com/typicode/json-server) globally with `npm install -g json-server`

```bash
# install the project's dependencies
npm install

# start json-server to get mock data and load local message bundles
npm run json-server

# run the H5 UI on port 4201 in dev mode and watches your files for live-reload
npm start
```

#### Standalone dev mode - test and build

```bash
# running unit tests
# Go to http://localhost:9876/debug.html for reviewing the report of tests results
ng test (or npm test)

# running unit tests with coverage => output in coverage/index.html
ng test --code-coverage

# dev build
ng build (or npm run build)

# prod build
ng build --prod --aot (or npm run build:prod)
```

#### Plugin mode - build
```bash
cd tools
# Build the package with UI .war bundle
./build-war.sh (or .bat)
```

#### Using Angular-CLI

See full doc at https://github.com/angular/angular-cli

```bash
# Linting code
ng lint

# generating a new component
ng g component my-new-component

# generating a new directive
ng g directive my-new-directive

# to learn more about Angular-CLI commands and their usages
ng help
```

#### Directory structure summary (see doc for full details)
```
.
├── coverage      <- output coverage directory, see index.html
├── dist          <- output build directory  
├── node_modules  <- node modules repository (used only in dev mode)
├── src
│   ├── app
│   │   └── services    <- services specific to the plugin (data, navigation)
│   │       └── chassis          <- chassis specific services
│   │       
│   │   └── shared               <- common utilities that are not plugin-specific
│   │       └── dev              <- common utilities used only in dev mode (see doc for details)
│   │    
│   │       └── app-alert.component.ts <- displays info and alerts at the top
│   │       └── app-config.ts          <- app level constants
│   │       └── appErrorHandler.ts     <- centralized error handling
│   │       └── globals.service.ts     <- globals to handle dev mode
│   │       └── i18n.service.ts        <- i18n support
│   │       └── refresh.service.ts     <- simple refresh service using Observable
│   │       └── util.service.ts        <- various utilities
│   │       └── vSphereClientSdkTypes.ts  <- Interface for WebPlatform API
│   │    
│   │   └── testing              <- test stubs
│   │    
│   │   └── views
│   │       └── <component> ...        <- each view is an Ng2 component
│   │          └── index.ts                        <- barrel index
│   │          └── <component>.component.html      <- UI template
│   │          └── <component>.component.sccs      <- component styles
│   │          └── <component>.component.spec.ts   <- unit tests
│   │          └── <component>.component.ts        <- Typescript code
│   │   └── app.component.html         <- top component
│   │   └── app.module.ts              <- main module
│   │   └── app-routing.component.ts   <- initial routing of plugin views
│   │   └── app-routing.module.ts      <- routing logic
│   ├── assets
│   │   └── css               <- global styles
│   │   └── images             
│   ├── environments          <- Angular-CLI environment
│   ├── webapp
│   │   └── locales           <- i18n json file
│   ├── index.html
│   ├── main.ts               <- boostrap file for the angular app
│   │
├── target                    <- output dir for the ant build and testing coverage
│   └── coverage              <- output coverage directory, see index.html
├── tools                     <- ant build scripts
├── angular-cli.json          <- Angular-CLI configuration
├── db.json                   <- Mock data used with json-server
├── karma.conf.js             <- configuration of the test runner
├── package.json              <- dependencies of the project
├── tslint.json               <- rules for linting code

```
