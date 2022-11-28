# Quick Source Overview

This document serves as a short summary of the entire codebase and how it's different parts communicate to each other.

* `server.js`: This is the starting point of the application, calling on `main.js` to initiate the ExpressJS Server.
* `config.js`: This module handles collecting the current configuration from configuration files and system Environment Variables, providing them to most modules as they request them.
  * `main.js`: Defines every single API endpoint, as well as some axhillary data, such as global `404` methods, and RateLimiting features. Each endpoint here then calls the respective handler function.
    * `package_handler.js`: Handles all endpoints relating to packages specifically, generally any API endpoint with its starting slug of `packages` is handled here.
    * `star_handler.js`: Handles all endpoints relating to stars specifically, generally any API endpoint with its starting slug of `stars` is handled here.
    * `theme_handler.js`: Handles all endpoints relating to themes specifically, generally any API endpoint with it's starting slug of `theme` is handled here.
    * `user_handler.js`: Handles all endpoints relating to users specifically, generally any API endpoint with it's starting slug of `users` is handled here.
    * `update_handler.js`: Handles the update endpoint, as there is only one. But generally any API endpoint with it's starting slug of `update` is handled here.
    * `oauth_handler.js`: Handles all endpoints relating to OAuth or Authentication in general.
      * `common_handler.js`: All the above listed files have a large dependency on this module, as it provides all common returns to users, such as providing `Server Error` messages, or `Not Found` messages.
      * `query.js`: Required by any endpoint handler that contians query parameters. Provides interfaces to decode and safely handle all query parameters. Generally the individual handlers should never be managing their own query parameters, and should instead offload that to here.
  * Utility Modules:
    * `auth.js`: This module provides the means to authenticate a user on the system, and should be the go to for any type of authentication.
    * `debug_utils.js`: This module provides some simple functions to aid in development of the backend server.
    * `utils.js`: This module provides some functions that aid in common tasks that must be completed throughout the system.
    * `logger.js`: This module provides the logging interface. This should be the only module to handle logging. Except when within a dev envrironment.
  * Data Collection/Handling:
    * `cache.js`: This module provides a class to setup and handle caching of data locally.
    * `git.js`: This module handles all data collection from GitHub specifically.
    * `storage.js`: This module handles all data collection from Google Storage APIs.
    * `database.js`: This module, of which it's the largest within the whole codebase, handles all actions relating to the backend server database.
  * Tests
    * `dev_server.js`: This module is what is called to start up the server when in development mode. Acting the same as `server.js` except relying on a local dev database instance to be spun up by it.
