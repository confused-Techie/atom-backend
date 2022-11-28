
This document details the steps and information needed to build, deploy, or test the backend.

## Get Started

### Requirements

#### Docker

If you plan to run the full test suite or Integration tests you need to have:

* Docker installed
* Docker running
* Docker accessible to the user that owns the directory where the repo is stored.


Since the scripts within `package.json` are run with the same permissions as the user that owns the file itself `sudo` won't change running any Docker commands, which is commonly needed on Linux Distros, so you likely will need to add your user to the Docker Group.

```bash
# Needs to be <19.3
docker --version

# Check to see if you are a part of the Docker Group already
getent group | grep docker

# If not, you'll need to add your user account
sudo gpasswd -a $USER docker

# If you want to avoid logging out and back in again
# this will start a new shell that is aware of you new group membership
newgrp docker
```

Source: [confused-Techie/atom-backend#65](https://github.com/confused-Techie/atom-backend/issues/65)

#### Ensuring you have a Config

This repo contains an `app.example.yaml` this is to describe the configuration options, as well as show how to set them.

The backend server will search for `app.yaml` when it starts up and will produce many errors if it's not able to find it. So you need to create an `app.yaml` manually, or rename [`app.example.yaml`](../app.example.yaml) to `app.yaml`.

Inside this file you can see many variables that can be changed to effect how the server runs. Any new configuration options have to be added to the `env_variables` object since this backend server is intended to be run on the Google App Engine. Otherwise this file is standard YAML.

### Setup & Running

In the root folder for the downloaded repo:

```bash
npm install .
```

The above command installs all dependencies.

Now, time to start the server.

It's recommended to use the built in scripts to run the server, of which there are several that can all be run with the following:

```bash
npm run $SCRIPT_NAME
```

Below are the available scripts:

* `start`: Starts the Backend Server normally. Using your `app.yaml` for all needed values. This is what's used in production but is not recommended for development purposes.
* `test`: This runs all tests written, which isn't always wanted. For the requirements and expectations when running `test` read the documentation for both `test:unit` and `test:integration`.
* `test:unit`: This is used for unit testing, where all calls to other APIs or data sources are intentionally served false static data instead of completing the normal API call.
  - Sets `NODE_ENV=test`
  - Sets `PULSAR_STATUS=test`
  - Runs the unit tests located in `./src/tests` using `jest`
  - Requires that there will be no calls to the Database. This does not handle the loading of the Database in any way.
  - Uses mocked responses for all functions in `./src/storage.js` to avoid having to contact Google Storage APIs.
  - Returns static data for all functions in `./src/git.js` to avoid contacting GitHub APIs.
* `test:integration`: This is used exclusively for Integration testing. As in tests that require a Database to connect to.
  - Sets `NODE_ENV=test`
  - Sets `PULSAR_STATUS=test`
  - Runs the integration tests located in `./src/tests_integration` using `jest`.
  - Requires the ability to spin up a local Database that it will connect to, ignoring the values in your `app.yaml`. This Database is run using your local Docker service.
  - Uses mocked responses for all functions in `./src/storage.js` to avoid having to contact Google Storage APIs.
  - Spins up a mock GitHub API Server to respond to requests from `git.js` (Only when running tests located in `./src/tests_integration/git.js`).
* `start:dev`: This can be used for local development of the backend, if you don't have access to the production database. This will spin up a local Database using Docker and will mock external requests for all other services such as GitHub and Google Storage.
  - Sets `PULSAR_STATUS=dev`
  - Starts up the server using `./src/dev_server.js` instead of `./src/server.js`
  - Requires the ability to spin up a local Database that it will connect to, ignoring the values in your `app.yaml`
  - Uses mocked responses for all functions in `./src/storage.js` to avoid having to contact Google Storage APIs.
  - Uses mocked responses for all functions in `./src/git.js` to avoid having to contact GitHub APIs.
* `api-docs`: Uses `@confused-techie/quick-webserver-docs` to generate documentation based off the JSDoc style comments, only documenting the API endpoints. This should be done automatically by GitHub Actions.
* `lint`: Uses `prettier` to format and lint the codebase. This should be done automatically by GitHub Actions.
* `complex`: Uses `complexity-report` to generate complexity reports of the JavaScript. Keep in mind this does not support ES6 yet, so not all functions are documented. This should be done automatically by GitHub Actions.
* `js-docs`: Uses `jsdoc2md` to generate documentation from the JSDoc comments within the codebase. This should be done automatically by GitHub Actions.

There are some additional scripts that you likely won't encounter or need during normal development of the backend, but are documented here for posterity.

* `contributors:add`: Uses `all-contributors` to add a new contributor to the README.md
* `test_search`: Uses the `./scripts/tools/search.js` to run the different search methods against a pre-set amount of data, and return the scores. It's important to note, that these search algorithms are no longer used within the backend in favour of natively supported Fuzzy Matching.
* `migrations`: This is used by `@database/pg-migrations` to run the SQL scripts found in `./src/dev-runner/migrations/001-initial-migration.sql` to populate the local database when in use by certain scripts mentioned above.

## Development with a Local Database

To make development as easy as possible, and to ensure everyone can properly test their code, the ability for a local database to be automatically spun up is now included in the Backend Server.

This means that if you run any of the following scripts it will assume you have meet the requirements listed above, to run a local database.

* `test:integration`
* `test`
* `start:dev`

Again, the ability to spin up this local database means that your system has Docker setup and running, as well as is available to the user that owns the repo folder on your system.

Using this development database means you have the ability to safely write, delete, edit any data stored within your database. The database is created from scratch on each run based on the SQL Commands found in `./src/dev-runner/migrations/001-initial-migration.sql` and there will be no persistence each time the development backend server is shut down.

If you experience any issues with this feature feel free to open an issue.
