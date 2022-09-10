## Modules

<dl>
<dt><a href="#module_cache">cache</a></dt>
<dd><p>Provides an interface for helpful caching mechanisms.
Originally created after some circular dependency issues arouse during
rapid redevelopment of the entire storage system.
But this does provide an opportunity to allow multiple caching systems.</p>
</dd>
<dt><a href="#module_collection">collection</a></dt>
<dd><p>Endpoint of all features related to sorting, organizing, or pruning package
collections, to be returned to the user.</p>
</dd>
<dt><a href="#module_config">config</a></dt>
<dd><p>Module that access&#39; and returns the server wide configuration.</p>
</dd>
<dt><a href="#module_data">data</a></dt>
<dd><p>This is likely the most major module within the codebase. Being the handler
for data in general. Containing the <code>Shutdown</code> function, as well as gathering the users,
packages, package_pointer, and additionally handling any modifications of the packages.</p>
</dd>
<dt><a href="#module_database">database</a></dt>
<dd><p>Provides an interface of a large collection of functions to interact
with and retreive data from the cloud hosted database instance.</p>
</dd>
<dt><a href="#module_debug_util">debug_util</a></dt>
<dd><p>A collection of simple functions to help devs debug the application during runtime,
to better assist in tracking down bugs. Since many sets of data cannot be reliably output to the console
this can help to view the transmutations of data as its handled.</p>
</dd>
<dt><a href="#module_error">error</a></dt>
<dd><p>Contains different error messages that can be returned, adding them and their
respective HTTP Status Codes to the <code>Response</code> object provided to them.
Letting them all be defined in one place for ease of modification, and easily route
to them from different handlers.</p>
</dd>
<dt><a href="#module_git">git</a></dt>
<dd><p>Assists in interactions between the backend and GitHub.</p>
</dd>
<dt><a href="#module_logger">logger</a></dt>
<dd><p>Allows easy logging of the server. Allowing it to become simple to add additional
logging methods if a log server is ever implemented.</p>
</dd>
<dt><a href="#module_main">main</a></dt>
<dd><p>The Main functionality for the entire server. Sets up the Express server, providing
all endpoints it listens on. With those endpoints being further documented in <code>api.md</code>.</p>
</dd>
<dt><a href="#module_query">query</a></dt>
<dd><p>Home to parsing all query parameters from the <code>Request</code> object. Ensuring a valid response.</p>
</dd>
<dt><a href="#module_resources">resources</a></dt>
<dd><p>This module provides a way for other functions to read/write/remove data without knowing or
thinking about the underlying file structure. Providing abstraction if the data resides on a local
filesystem, Google Cloud Storage, or something else entirely.</p>
</dd>
<dt><a href="#module_search">search</a></dt>
<dd><p>This module is focused on implementing different search algorithms.
Elsewhere in the code the choice is made of which functions to call, to actual
execute a search function.</p>
</dd>
<dt><a href="#module_server">server</a></dt>
<dd><p>The initializer of <code>main.js</code> starting up the Express Server, and setting the port
to listen on. As well as handling a graceful shutdown of the server.</p>
</dd>
<dt><a href="#module_storage">storage</a></dt>
<dd><p>This module is the second generation of data storage methodology,
in which this provides static access to files stored within regular cloud
file storage. Specifically intended for use with Google Cloud Storage.</p>
</dd>
<dt><a href="#module_users">users</a></dt>
<dd><p>Focused on interacting with User Data only. Provides functions required
to modify, or compile user data specifically.</p>
</dd>
<dt><a href="#module_utils">utils</a></dt>
<dd><p>A helper for any functions that are agnostic in hanlders.</p>
</dd>
<dt><a href="#module_common_handler">common_handler</a></dt>
<dd><p>Provides a simplistic way to refer to implement common endpoint returns.
So these can be called as an async function without more complex functions, reducing
verbosity, and duplication within the codebase.</p>
</dd>
<dt><a href="#module_oauth_handler">oauth_handler</a></dt>
<dd><p>Endpoint Handlers for Authentication URLs</p>
</dd>
<dt><a href="#module_package_handler">package_handler</a></dt>
<dd><p>Endpoint Handlers in all relating to the packages themselves.</p>
</dd>
<dt><a href="#module_star_handler">star_handler</a></dt>
<dd><p>Handler for any endpoints whose slug after <code>/api/</code> is <code>star</code>.</p>
</dd>
<dt><a href="#module_theme_handler">theme_handler</a></dt>
<dd><p>Endpoint Handlers relating to themes only.</p>
</dd>
<dt><a href="#module_update_handler">update_handler</a></dt>
<dd><p>Endpoint Handlers relating to updating the editor.</p>
</dd>
<dt><a href="#module_user_handler">user_handler</a></dt>
<dd><p>Handler for endpoints whose slug after <code>/api/</code> is <code>user</code>.</p>
</dd>
</dl>

<a name="module_cache"></a>

## cache
Provides an interface for helpful caching mechanisms.Originally created after some circular dependency issues arouse duringrapid redevelopment of the entire storage system.But this does provide an opportunity to allow multiple caching systems.


* [cache](#module_cache)
    * [~CacheObject](#module_cache..CacheObject)
        * [new CacheObject([name], contents)](#new_module_cache..CacheObject_new)

<a name="module_cache..CacheObject"></a>

### cache~CacheObject
**Kind**: inner class of [<code>cache</code>](#module_cache)  
<a name="new_module_cache..CacheObject_new"></a>

#### new CacheObject([name], contents)
Allows simple interfaces to handle caching an object in memory. Used to cache data read from the filesystem.


| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | Optional name to assign to the Cached Object. |
| contents | <code>object</code> | The contents of this cached object. Intended to be a JavaScript object. But could be anything. |

<a name="module_collection"></a>

## collection
Endpoint of all features related to sorting, organizing, or pruning packagecollections, to be returned to the user.


* [collection](#module_collection)
    * [~sort(method, packages)](#module_collection..sort) ⇒ <code>Array.&lt;object&gt;</code>
    * [~direction(packages, method)](#module_collection..direction) ⇒ <code>Array.&lt;object&gt;</code> \| <code>string</code>
    * [~deepCopy(obj)](#module_collection..deepCopy) ⇒ <code>object</code>

<a name="module_collection..sort"></a>

### collection~sort(method, packages) ⇒ <code>Array.&lt;object&gt;</code>
Intended for use for a collection of Packages, sort them according to any valid Sorting method.Note this should be called before, any Pruning has taken place.Prioritizes returning packages so if an invalid method is provided returns the packageswithout modification.

**Kind**: inner method of [<code>collection</code>](#module_collection)  
**Returns**: <code>Array.&lt;object&gt;</code> - The provided packages now sorted accordingly.  
**Depreciated**: Since migrating to DB  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The Method to Sort By |
| packages | <code>Array.&lt;object&gt;</code> | The Packages in which to sort. |

<a name="module_collection..direction"></a>

### collection~direction(packages, method) ⇒ <code>Array.&lt;object&gt;</code> \| <code>string</code>
Sorts an array of package objects based on the provided method.Intended to occur after sorting the package. Prioritizes returning packages,so if an invalid method is provided returns the packages with no changes.

**Kind**: inner method of [<code>collection</code>](#module_collection)  
**Returns**: <code>Array.&lt;object&gt;</code> \| <code>string</code> - The array of object packages, now organized, or directlyreturned if an invalid 'method' is supplied.  
**Depreciated**: Since migration to DB  

| Param | Type | Description |
| --- | --- | --- |
| packages | <code>Array.&lt;object&gt;</code> | The array of package objects to work on. |
| method | <code>string</code> | The method of which they should be organized. Either "desc" = Descending, or "asc" = Ascending. |

<a name="module_collection..deepCopy"></a>

### collection~deepCopy(obj) ⇒ <code>object</code>
Originally was a method to create a deep copy of shallow copied complex objects.Which allowed modifications on the object without worry of changing the valuesof the original object, or realistically cached objects.

**Kind**: inner method of [<code>collection</code>](#module_collection)  
**Returns**: <code>object</code> - A Deep Copy of the original object, that should share zero references to the original.  
**Depreciated**: Since migration to DB, and not having to worry about in memory objects.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The Object to Deep Copy. |

<a name="module_config"></a>

## config
Module that access' and returns the server wide configuration.

<a name="module_config..getConfig"></a>

### config~getConfig() ⇒ <code>object</code>
Used to get Server Config data from the `app.yaml` file at the root of the project.Or from environment variables. Prioritizing environment variables.

**Kind**: inner method of [<code>config</code>](#module_config)  
**Returns**: <code>object</code> - The different available configuration values.  
**Example** *(Using &#x60;getConfig()&#x60; during an import for a single value.)*  
```js
const { search_algorithm } = require("./config.js").getConfig();
```
<a name="module_data"></a>

## data
This is likely the most major module within the codebase. Being the handlerfor data in general. Containing the `Shutdown` function, as well as gathering the users,packages, package_pointer, and additionally handling any modifications of the packages.


* [data](#module_data)
    * [~shutdown()](#module_data..shutdown)
    * [~getFeatured()](#module_data..getFeatured) ⇒ <code>object</code>
    * [~getUsers()](#module_data..getUsers) ⇒ <code>object</code>
    * [~getPackagePointer()](#module_data..getPackagePointer) ⇒ <code>object</code>
    * [~getAllPackages()](#module_data..getAllPackages) ⇒ <code>object</code>
    * [~getPackageByID(id)](#module_data..getPackageByID) ⇒ <code>object</code>
    * [~setUsers(data)](#module_data..setUsers) ⇒ <code>object</code>
    * [~setPackagePointer(data)](#module_data..setPackagePointer) ⇒ <code>object</code>
    * [~setPackageByID(id, data)](#module_data..setPackageByID) ⇒ <code>object</code>
    * [~removePackageByPointer(pointer)](#module_data..removePackageByPointer) ⇒ <code>object</code>
    * [~restorePackageByPointer(pointer)](#module_data..restorePackageByPointer) ⇒ <code>objject</code>

<a name="module_data..shutdown"></a>

### data~shutdown()
The function to be called during the a server stop event. Allowing any cacheonly data to be written to disk. Checking the Cached User Data, Cached PointerData, as well as checking for any items marked for deletion, and deleting them.

**Kind**: inner method of [<code>data</code>](#module_data)  
<a name="module_data..getFeatured"></a>

### data~getFeatured() ⇒ <code>object</code>
Gets the featured packages, from the file of `featured_packages.json`.While it isn't planned to always use this file, it helps get us to feature parityfaster, since this is how it was done originally on Atom.ioWill return the cached object if available, or otherwise will read from disk.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>object</code> - An array of packages, that have manually been decided to befeatured.  
<a name="module_data..getUsers"></a>

### data~getUsers() ⇒ <code>object</code>
Used to get the fully Users File. Or all user data. This function will, ifpossible, cache the data read from the disk into `cached_user` variable to refer to later.And if the user data has already been cached, and is not yet expired, or otherwiseinvalidated, it will return this data. If it finds an invalidated cache, it willwrite this cache to disk, then return the new results from disk.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>object</code> - Server Status Object, which on success `content` contains an array ofuser objects.  
<a name="module_data..getPackagePointer"></a>

### data~getPackagePointer() ⇒ <code>object</code>
Used to get the full package_pointer file, will cache an uncached file and returnor will fetch an updated file if the cache has expired, or will write aninvalidated cache, then return the new data from disk.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>object</code> - A Server Status Object, which on success returns the PackagePointer Object within `content`.  
<a name="module_data..getAllPackages"></a>

### data~getAllPackages() ⇒ <code>object</code>
Will attempt to return all available packages in the repository.Caching the results, or if results have already been cached, will check the expiryand if expired, refresh the cache. `GetAllPackages` differs sigificantly from`GetPackagePointer` and `GetUsers` in that it will make no attempt to save invalidated data.Since it is expected that any modifications that occur to the Packages, neverhappens on the full collection, and instead is handled on an individual basis.Thus expecting them to be saved during those individual changes. AdditionallyWhile collected the full list of packages, if a package's data doesn't existas a full file and only within the package_pointer, it will ignore the file,log it, and continue to return data.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Implements**: <code>GetPackagePointer</code>, <code>GetPackageByID</code>  
**Returns**: <code>object</code> - A Server Status Object, which on success `content` contains the fullarray of all package objects, as 'Server Package Objects'.  
<a name="module_data..getPackageByID"></a>

### data~getPackageByID(id) ⇒ <code>object</code>
Will get a specific package, using its provided ID of the package.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Implements**: <code>resources.Read</code>  
**Returns**: <code>object</code> - A Server Status Object, which on success the `content` containsthe package object.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The ID of the package, like `UUIDv4.json`. |

<a name="module_data..setUsers"></a>

### data~setUsers(data) ⇒ <code>object</code>
Will persist user data to the disk. Will first do this by adding to theuser cache object, if it exists, otherwise will write directly to disk.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>object</code> - A Server Status object of success, containing only `ok`.Or bubbling from `resources.write()`.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | The new full user data to persist. |

<a name="module_data..setPackagePointer"></a>

### data~setPackagePointer(data) ⇒ <code>object</code>
Persists Package Pointer Data to disk. By saving to the cache object ifavailable, or otherwise writing directly to disk.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>object</code> - A Server Status Object of success with only `ok` if successul,or otherwise bubbling from `resources.write()`.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | The Package Pointer Object in its entirety. |

<a name="module_data..setPackageByID"></a>

### data~setPackageByID(id, data) ⇒ <code>object</code>
Persists Package Data to disk. Since no cache objects exist for individualpackages, really is a wrapper around `resources.write()` with some presets.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>object</code> - A server status object bubbled directly from `resources.write()`.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The name of the package file to persists. In format `package-uuidv4.json`. |
| data | <code>object</code> | The object data of the package to write. |

<a name="module_data..removePackageByPointer"></a>

### data~removePackageByPointer(pointer) ⇒ <code>object</code>
Marks a package for deletion on server shutdown, using its `package.json`.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>object</code> - A Server Status Object, where if success only has `ok`.  

| Param | Type | Description |
| --- | --- | --- |
| pointer | <code>string</code> | The Package Name to mark, in format `package-uuidv4.json`. |

<a name="module_data..restorePackageByPointer"></a>

### data~restorePackageByPointer(pointer) ⇒ <code>objject</code>
Restores a previously marked package for deletion. Causing it to nolonger be marked for deletion.

**Kind**: inner method of [<code>data</code>](#module_data)  
**Returns**: <code>objject</code> - A Server Status Object, where on success only contains `ok`.  

| Param | Type | Description |
| --- | --- | --- |
| pointer | <code>string</code> | The Package Name to mark, in format `package-uuidv4.json`. |

<a name="module_database"></a>

## database
Provides an interface of a large collection of functions to interactwith and retreive data from the cloud hosted database instance.


* [database](#module_database)
    * [~setupSQL()](#module_database..setupSQL) ⇒ <code>object</code>
    * [~shutdownSQL()](#module_database..shutdownSQL)
    * [~getPackageByID()](#module_database..getPackageByID)
    * [~getPackageByName()](#module_database..getPackageByName)
    * [~getPackageCollectionByName()](#module_database..getPackageCollectionByName)
    * [~getPackageCollectionByID()](#module_database..getPackageCollectionByID)
    * [~getPointerTable()](#module_database..getPointerTable)
    * [~getFeaturedPackages()](#module_database..getFeaturedPackages)
    * [~getFeaturedThemes()](#module_database..getFeaturedThemes)
    * [~getTotalPackageEstimate()](#module_database..getTotalPackageEstimate)
    * [~getSortedPackages()](#module_database..getSortedPackages)

<a name="module_database..setupSQL"></a>

### database~setupSQL() ⇒ <code>object</code>
Initialize the connection to the PostgreSQL database.In order to avoid the initialization multiple times,the logical nullish assignment (??=) can be used in the caller.Exceptions thrown here should be caught and handled in the caller.

**Kind**: inner method of [<code>database</code>](#module_database)  
**Returns**: <code>object</code> - PostgreSQL connection object.  
<a name="module_database..shutdownSQL"></a>

### database~shutdownSQL()
Ensures any Database connection is properly, and safely closed before exiting.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getPackageByID"></a>

### database~getPackageByID()
Takes a package pointer UUID, and returns the package object withina Server Status Object.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getPackageByName"></a>

### database~getPackageByName()
Takes a package name, and returns the raw SQL package data within a Server Status Object.The second parameter details boolean, indicates the type of package object to return.Either a short, or full.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getPackageCollectionByName"></a>

### database~getPackageCollectionByName()
Takes a package name array, and returns an array of the package objects.You must ensure that the packArray passed is compatible. This function does not coerce compatibility.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getPackageCollectionByID"></a>

### database~getPackageCollectionByID()
Takes a package pointer array, and returns an array of the package objects.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getPointerTable"></a>

### database~getPointerTable()
Returns a full package pointer table, allowing the full reference of package namesto package pointer UUIDs.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getFeaturedPackages"></a>

### database~getFeaturedPackages()
Collects the hardcoded featured packages array from the storage.jsmodule. Then uses this.getPackageCollectionByName to retreive details of thepackage.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getFeaturedThemes"></a>

### database~getFeaturedThemes()
Collects the hardcoded featured themes array from the sotrage.js module. Then uses this.getPackageCollectionByName to retreive details of the package.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getTotalPackageEstimate"></a>

### database~getTotalPackageEstimate()
Returns an estimate of how many rows are included in the packages SQL table.Used to aid in trunication and page generation of Link headers for large requests.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_database..getSortedPackages"></a>

### database~getSortedPackages()
Takes the page, direction, and sort method returning the raw sql packagedata for each. This monolithic function handles trunication of the packages,and sorting, aiming to provide back the raw data, and allow later functions tothen reconstruct the JSON as needed.

**Kind**: inner method of [<code>database</code>](#module_database)  
<a name="module_debug_util"></a>

## debug\_util
A collection of simple functions to help devs debug the application during runtime,to better assist in tracking down bugs. Since many sets of data cannot be reliably output to the consolethis can help to view the transmutations of data as its handled.

<a name="module_debug_util..roughSizeOfObject"></a>

### debug_util~roughSizeOfObject(obj) ⇒ <code>integer</code>
Returns the rough size of the object in memory, in Bytes. Can be usedto help determine how an object changes over time.

**Kind**: inner method of [<code>debug\_util</code>](#module_debug_util)  
**Returns**: <code>integer</code> - Returns the integer value of the object in Bytes.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The Object to inspect. |

<a name="module_error"></a>

## error
Contains different error messages that can be returned, adding them and theirrespective HTTP Status Codes to the `Response` object provided to them.Letting them all be defined in one place for ease of modification, and easily routeto them from different handlers.


* [error](#module_error)
    * [~notFoundJSON(res)](#module_error..notFoundJSON)
    * [~siteWide404(res)](#module_error..siteWide404)
    * [~missingAuthJSON(res)](#module_error..missingAuthJSON)
    * [~serverErrorJSON(res)](#module_error..serverErrorJSON)
    * [~publishPackageExists(res)](#module_error..publishPackageExists)
    * [~badRepoJSON(res)](#module_error..badRepoJSON)
    * [~badPackageJSON(res)](#module_error..badPackageJSON)
    * [~unsupportedJSON(res)](#module_error..unsupportedJSON)

<a name="module_error..notFoundJSON"></a>

### error~notFoundJSON(res)
The Standard JSON Handling when an object is not found.###### Setting:* Status Code: 404* JSON Respone Body: message: "Not Found"

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..siteWide404"></a>

### error~siteWide404(res)
The standard Website Page 404 not found handler.

**Kind**: inner method of [<code>error</code>](#module_error)  
**Todo**

- [ ] Currently this returns a JSON object, but in the future should return an HTML Not Found page.###### Setting Currently:* Status Code: 404* JSON Response Body: message: "This is a standin for the proper site wide 404 page."


| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..missingAuthJSON"></a>

### error~missingAuthJSON(res)
JSON Handling when authentication fails.###### Setting:* Status Code: 401* JSON Response Body: message: "Requires authentication. Please update your token if you haven't done so recently."

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..serverErrorJSON"></a>

### error~serverErrorJSON(res)
The Standard Server Error JSON Endpoint.###### Setting:* Status Code: 500* JSON Response Body: message: "Application Error"

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..publishPackageExists"></a>

### error~publishPackageExists(res)
JSON Response announcing a package already exists.###### Setting:* Status Code: 409* JSON Response Body: message: "A Package by that name already exists."

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..badRepoJSON"></a>

### error~badRepoJSON(res)
JSON Response announcing that the repo doesn't exist, or is inaccessible.###### Setting:* Status Code: 400* JSON Response Body: message: That repo does not exist, isn't an atom package, or atombot does not have access.

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..badPackageJSON"></a>

### error~badPackageJSON(res)
JSON Response annoucning that the package.json of a repo is invalid.###### Setting:* Status Code: 400* JSON Response Body: message: The package.json at owner/repo isn't valid.

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..unsupportedJSON"></a>

### error~unsupportedJSON(res)
This is a standard JSON endpoint to define an endpoint that is currently not supported.Used currently to delineate which endpoints have not been fully implemented. Or a specific error endpointthat has not been written yet.###### Setting:* Status Code: 501* JSON Response Body: message: "While under development this feature is not supported."

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_git"></a>

## git
Assists in interactions between the backend and GitHub.


* [git](#module_git)
    * [~ownership(user, repo)](#module_git..ownership)
    * [~createPackage(repo)](#module_git..createPackage) ⇒ <code>object</code>
    * [~doesUserHaveRepo(user, repo, [page])](#module_git..doesUserHaveRepo) ⇒ <code>object</code>
    * [~getRepoExistance(repo)](#module_git..getRepoExistance) ⇒ <code>boolean</code>
    * [~getPackageJSON(repo)](#module_git..getPackageJSON) ⇒ <code>string</code> \| <code>undefined</code>
    * [~getRepoReadMe(repo)](#module_git..getRepoReadMe) ⇒ <code>string</code> \| <code>undefined</code>
    * [~getRepoTags(repo)](#module_git..getRepoTags) ⇒ <code>object</code> \| <code>undefined</code>

<a name="module_git..ownership"></a>

### git~ownership(user, repo)
Allows the ability to check if a user has permissions to write to a repo.<b>MUST</b> Be provided `owner/repo` to successfully function, and expects thefull `user` object. Returns `ok: true` where content is the repo data from GitHubon success, returns `short: "No Repo Access"` if they do not have permisisonto affect said repo or `short: "Server Error"` if any other error has occured.

**Kind**: inner method of [<code>git</code>](#module_git)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>object</code> | The Full User object, including `name`, `github_token`. |
| repo | <code>string</code> | The `owner/repo` of the repo changes are intended to affect. |

<a name="module_git..createPackage"></a>

### git~createPackage(repo) ⇒ <code>object</code>
Creates a compatible `Server Object Full` object, from only receiving a `repo` as in`owner/repo`. With this it contacts GitHub API's and modifies data as needed toreturn back a proper `Server Object Full` object within a `Server Status`.content object.

**Kind**: inner method of [<code>git</code>](#module_git)  
**Returns**: <code>object</code> - A `Server Status` Object where `content` is the `Server Package Full` object.  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>string</code> | The Repo to use in the form `owner/repo`. |

<a name="module_git..doesUserHaveRepo"></a>

### git~doesUserHaveRepo(user, repo, [page]) ⇒ <code>object</code>
Unexported function, that determines if the specified user has accessto the specified repository. Will loop itself through all valid pagesof users repo list, until it finds a match, otherwise returning accordingly.

**Kind**: inner method of [<code>git</code>](#module_git)  
**Returns**: <code>object</code> - A server status object of true if they do have access.And returns false in all other situations.  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>object</code> | A valid user object, from the user file. |
| repo | <code>string</code> | The valid repo in the format `owner/repo` |
| [page] | <code>int</code> | Not intended to be set directly, but is used to track the current results page number, if or when the function needs to loop itself. |

<a name="module_git..getRepoExistance"></a>

### git~getRepoExistance(repo) ⇒ <code>boolean</code>
Intends to determine if a repo exists, or at least is accessible and publicon GitHub.

**Kind**: inner method of [<code>git</code>](#module_git)  
**Returns**: <code>boolean</code> - A true if the repo exists, false otherwise. Including an error.  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>string</code> | A repo in the format `owner/repo`. |

<a name="module_git..getPackageJSON"></a>

### git~getPackageJSON(repo) ⇒ <code>string</code> \| <code>undefined</code>
Intends to retreive the raw text of the GitHub repo package.

**Kind**: inner method of [<code>git</code>](#module_git)  
**Returns**: <code>string</code> \| <code>undefined</code> - Returns a proper string of the readme if successful.And returns `undefined` otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>string</code> | The string of the repo in format `owner/repo`. |

<a name="module_git..getRepoReadMe"></a>

### git~getRepoReadMe(repo) ⇒ <code>string</code> \| <code>undefined</code>
Intends to retreive the GitHub repo readme file. Will look for both`readme.md` and `README.md` just in case.

**Kind**: inner method of [<code>git</code>](#module_git)  
**Returns**: <code>string</code> \| <code>undefined</code> - Returns the raw string of the readme if available,otherwise returns undefined.  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>string</code> | A valid repo in format `owner/repo`. |

<a name="module_git..getRepoTags"></a>

### git~getRepoTags(repo) ⇒ <code>object</code> \| <code>undefined</code>
Intends to get all tags associated with a repo. Since this is how APMnatively publishes new package versions on GitHub.

**Kind**: inner method of [<code>git</code>](#module_git)  
**Returns**: <code>object</code> \| <code>undefined</code> - Returns the JSON parsed object of all tags if successful,and returns undefined otherwise.  
**See**: https://docs.github.com/en/rest/repos/repos#list-repository-tags  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>string</code> | A valid repo in format `owner/repo`. |

<a name="module_logger"></a>

## logger
Allows easy logging of the server. Allowing it to become simple to add additionallogging methods if a log server is ever implemented.

**Implements**: <code>config</code>  

* [logger](#module_logger)
    * [~httpLog(req, res)](#module_logger..httpLog)
    * [~errorLog(req, res, err)](#module_logger..errorLog)
    * [~warningLog([req], [res], err)](#module_logger..warningLog)
    * [~infoLog(value)](#module_logger..infoLog)
    * [~debugLog(value)](#module_logger..debugLog)

<a name="module_logger..httpLog"></a>

### logger~httpLog(req, res)
The standard logger for HTTP calls. Logging in a modified 'Apache Combined Log Format'.

**Kind**: inner method of [<code>logger</code>](#module_logger)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Example** *(Logging Output Format)*  
```js
HTTP:: IP [DATE (as ISO String)] "HTTP_METHOD URL PROTOCOL" STATUS_CODE DURATION_OF_REQUESTms
```
<a name="module_logger..errorLog"></a>

### logger~errorLog(req, res, err)
An endpoint to log errors, as well as exactly where they occured. Allowing some insight into what causedthem, as well as how the server reacted to the end user.

**Kind**: inner method of [<code>logger</code>](#module_logger)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |
| err | <code>object</code> \| <code>string</code> | The error of what happened. Will take a raw error value, or a string created one. |

**Example** *(Logging Output Format)*  
```js
ERROR:: IP "HTTP_METHOD URL PROTOCOL" STATUS_CODE DURATION_OF_REQUESTms ! ERROR
```
<a name="module_logger..warningLog"></a>

### logger~warningLog([req], [res], err)
An endpoint to log warnings. This should be used for when an error recovered, but the serverdid its best to recover from it. Providing no error to the end user.

**Kind**: inner method of [<code>logger</code>](#module_logger)  

| Param | Type | Description |
| --- | --- | --- |
| [req] | <code>object</code> | The Optional `Request` object inherited from the Express endpoint. |
| [res] | <code>object</code> | The Optional `Response` object inherited from the Express endpoint. |
| err | <code>object</code> \| <code>string</code> | The error of what happened. And like `ErrorLog` takes the raw error, or a string created one. |

**Example** *(Logging Output Format w/ Req and Res.)*  
```js
WARNING:: IP "HTTP_METHOD URL PROTOCOL" STATUS_CODE DURATION_OF_REQUESTms ! ERROR
```
**Example** *(Logging Output Format w/o Req and Res.)*  
```js
WARNING:: ERROR
```
<a name="module_logger..infoLog"></a>

### logger~infoLog(value)
An endpoint to log information only. Used sparingly, but may be helpful.

**Kind**: inner method of [<code>logger</code>](#module_logger)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The value of whatever is being logged. |

**Example** *(Logging Output Format)*  
```js
INFO:: VALUE
```
<a name="module_logger..debugLog"></a>

### logger~debugLog(value)
An endpoint to log debug information only. This log will only show if enabled in the Config file.That is if the `app.yaml` file has DEBUG as true.

**Kind**: inner method of [<code>logger</code>](#module_logger)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The value of whatever is being logged. |

**Example** *(Logging Output Format)*  
```js
DEBUG:: VALUE
```
<a name="module_main"></a>

## main
The Main functionality for the entire server. Sets up the Express server, providingall endpoints it listens on. With those endpoints being further documented in `api.md`.

**Implements**: <code>update\_handler</code>, <code>star\_handler</code>, <code>user\_handler</code>, <code>theme\_handler</code>, <code>package\_handler</code>, <code>common\_handler</code>  
<a name="module_query"></a>

## query
Home to parsing all query parameters from the `Request` object. Ensuring a valid response.


* [query](#module_query)
    * [~page(req)](#module_query..page) ⇒ <code>string</code>
    * [~sort(req, [def])](#module_query..sort) ⇒ <code>string</code>
    * [~dir(req)](#module_query..dir) ⇒ <code>string</code>
    * [~query(req)](#module_query..query) ⇒ <code>string</code>
    * [~engine(req)](#module_query..engine) ⇒ <code>string</code> \| <code>boolean</code>
    * [~repo(req)](#module_query..repo) ⇒ <code>string</code>
    * [~tag(req)](#module_query..tag) ⇒ <code>string</code>
    * [~rename(req)](#module_query..rename) ⇒ <code>boolean</code>
    * [~pathTraversalAttempt(data)](#module_query..pathTraversalAttempt) ⇒ <code>boolean</code>

<a name="module_query..page"></a>

### query~page(req) ⇒ <code>string</code>
Parser of the Page query parameter. Defaulting to 1.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>string</code> - Returns the valid page provided in the query parameter or 1, as the default.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="module_query..sort"></a>

### query~sort(req, [def]) ⇒ <code>string</code>
Parser for the 'sort' query parameter. Defaulting usually to downloads.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>string</code> - Either the user provided 'sort' query parameter, or the default specified.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>object</code> |  | The `Request` object inherited from the Express endpoint. |
| [def] | <code>string</code> | <code>&quot;\&quot;downloads\&quot;&quot;</code> | The default provided for sort. Allowing The search function to use "relevance" instead of the default "downloads". |

<a name="module_query..dir"></a>

### query~dir(req) ⇒ <code>string</code>
Parser for either 'direction' or 'order' query parameter, prioritizing'direction'.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>string</code> - The valid direction value from the 'direction' or 'order'query parameter.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="module_query..query"></a>

### query~query(req) ⇒ <code>string</code>
Checks the 'q' query parameter, trunicating it at 50 characters, and checking simplisticly thatit is not a malicious request.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Implements**: <code>pathTraversalAttempt</code>  
**Returns**: <code>string</code> - A valid search string derived from 'q' query parameter. Or '' if invalid.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="module_query..engine"></a>

### query~engine(req) ⇒ <code>string</code> \| <code>boolean</code>
Parses the 'engine' query parameter to ensure its valid, otherwise returning false.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>string</code> \| <code>boolean</code> - Returns the valid 'engine' specified, or if none, returns false.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="module_query..repo"></a>

### query~repo(req) ⇒ <code>string</code>
Parses the 'repository' query parameter, returning it if valid, otherwise returning ''.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>string</code> - Returning the valid 'repository' query parameter, or '' if invalid.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="module_query..tag"></a>

### query~tag(req) ⇒ <code>string</code>
Parses the 'tag' query parameter, returning it if valid, otherwise returning ''.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>string</code> - Returns a valid 'tag' query parameter. Or '' if invalid.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="module_query..rename"></a>

### query~rename(req) ⇒ <code>boolean</code>
Since this is intended to be returning a boolean value, returns falseif invalid, otherwise returns true. Checking for mixed captilization.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>boolean</code> - Returns false if invalid, or otherwise returns the boolean value of the string.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="module_query..pathTraversalAttempt"></a>

### query~pathTraversalAttempt(data) ⇒ <code>boolean</code>
Completes some short checks to determine if the data contains a maliciouspath traversal attempt. Returning a boolean indicating if a path traversal attemptexists in the data.

**Kind**: inner method of [<code>query</code>](#module_query)  
**Returns**: <code>boolean</code> - True indicates a path traversal attempt was found. False otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> | The data to check for possible malicious data. |

<a name="module_resources"></a>

## resources
This module provides a way for other functions to read/write/remove data without knowing orthinking about the underlying file structure. Providing abstraction if the data resides on a localfilesystem, Google Cloud Storage, or something else entirely.

**Implements**: <code>config</code>  

* [resources](#module_resources)
    * [~CacheObject](#module_resources..CacheObject)
        * [new CacheObject([name], contents)](#new_module_resources..CacheObject_new)
    * [~read(type, name)](#module_resources..read) ⇒ <code>object</code>
    * [~readFile(path)](#module_resources..readFile) ⇒ <code>object</code>
    * [~write(type, data, name)](#module_resources..write) ⇒ <code>object</code>
    * [~writeFile(path, data)](#module_resources..writeFile) ⇒ <code>object</code>
    * [~remove(name)](#module_resources..remove) ⇒ <code>object</code>

<a name="module_resources..CacheObject"></a>

### resources~CacheObject
**Kind**: inner class of [<code>resources</code>](#module_resources)  
<a name="new_module_resources..CacheObject_new"></a>

#### new CacheObject([name], contents)
Allows simple interfaces to handle caching an object in memory. Used to cache data read from the filesystem.


| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | Optional name to assign to the Cached Object. |
| contents | <code>object</code> | The contents of this cached object. Intended to be a JavaScript object. But could be anything. |

<a name="module_resources..read"></a>

### resources~read(type, name) ⇒ <code>object</code>
Exported function to read data from the filesystem, whatever that may be.

**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Returns**: <code>object</code> - If type is "package" or "pointer" returns a Server Status Object, with `content`being a `CacheObject` class, already initialized and ready for consumption. Otherwise if type is"package" returns the return from `readFile`. Errors bubble up from `readFile`.  
**Depreciated**: Since migration to DB.  
**Implments**: <code>readFile</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of data we are reading. Valid Types: "user", "pointer", "package". |
| name | <code>string</code> | The name of the file we are reading. Only needed if type is "package", in which case this <b>MUST</b> include `.json` for example `UUID.json`. |

<a name="module_resources..readFile"></a>

### resources~readFile(path) ⇒ <code>object</code>
Non-Exported function to read data from the filesystem. Whatever that may be.

**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Returns**: <code>object</code> - A Server Status Object, with `content` being the read file parsed from JSON.If error returns "Server Error" or "File Not Found".  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The Path to whatever file we want. |

<a name="module_resources..write"></a>

### resources~write(type, data, name) ⇒ <code>object</code>
The Exported Write function, to allow writing of data to the filesystem.

**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Implements**: <code>writeFile</code>  
**Returns**: <code>object</code> - Returns the object returned from `writeFile`. Errors bubble up from `writeFile`.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The Type of data we are writing. Valid Types: "user", "pointer", "package" |
| data | <code>object</code> | A JavaScript Object that will be `JSON.stringify`ed before writing. |
| name | <code>string</code> | The path name of the file we are writing. Only required when type is "package", in which case it should be `UUID.json`, it <b>MUST</b> include the `.json`. |

<a name="module_resources..writeFile"></a>

### resources~writeFile(path, data) ⇒ <code>object</code>
Non-Exported write function. Used to directly write data to the filesystem. Whatever that may be.

**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Returns**: <code>object</code> - A Server Status Object, with `content` only on an error.Errors returned "Server Error".  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to the file we are writing. Including the destination file. |
| data | <code>object</code> | The Data we are writing to the filesystem. Already encoded in a compatible format. |

<a name="module_resources..remove"></a>

### resources~remove(name) ⇒ <code>object</code>
**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Returns**: <code>object</code> - A Server Status Object, with `content` non-existant on a successful deletion.Errors returned as "Server Error".  
**Descc**: Exported function to delete data from the filesystem, whatever that may be. But since we knowwe will only ever be deleting packages, these will only ever attempt to delete a package.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the package we want to delete. <b>MUST</b> include `.json`, as in `UUID.json`. |

<a name="module_search"></a>

## search
This module is focused on implementing different search algorithms.Elsewhere in the code the choice is made of which functions to call, to actualexecute a search function.


* [search](#module_search)
    * [~levenshtein(s1, s2)](#module_search..levenshtein) ⇒ <code>function</code>
    * [~vlSimilarity(s1, s2)](#module_search..vlSimilarity) ⇒ <code>float</code>
    * [~vlEditDistance(s1, s2)](#module_search..vlEditDistance) ⇒ <code>float</code>
    * [~levenshteinWSDM(s1, s2)](#module_search..levenshteinWSDM) ⇒ <code>float</code>
    * [~lcs(s1, s2)](#module_search..lcs) ⇒ <code>float</code>
    * [~lcsTraceBack(matrix, s1, s2, height, width)](#module_search..lcsTraceBack)

<a name="module_search..levenshtein"></a>

### search~levenshtein(s1, s2) ⇒ <code>function</code>
The top level exported function to call, to preform a search based onthe Levenshtein Distance. Sibling functions denotated as vlFUNC, for its creatorVladimir Levenshtein.

**Kind**: inner method of [<code>search</code>](#module_search)  
**Implements**: <code>vlSimilarity</code>  
**Returns**: <code>function</code> - vlSimilarity  

| Param | Type | Description |
| --- | --- | --- |
| s1 | <code>string</code> | The first string, generally inteded to be the actual typed search string. |
| s2 | <code>string</code> | The second string, generally intended to be the string compared against the search. |

<a name="module_search..vlSimilarity"></a>

### search~vlSimilarity(s1, s2) ⇒ <code>float</code>
The un-exported function called by `levenshtein`. Used to preform the actual search.

**Kind**: inner method of [<code>search</code>](#module_search)  
**Implements**: <code>vlEditDistance</code>  
**Returns**: <code>float</code> - The numerical Edit Distance. 1.0 being the highest, and closest match, down to 0.0  

| Param | Type | Description |
| --- | --- | --- |
| s1 | <code>string</code> | Intended to be the search string. |
| s2 | <code>string</code> | Intended to be the string compared against the search string. |

<a name="module_search..vlEditDistance"></a>

### search~vlEditDistance(s1, s2) ⇒ <code>float</code>
The un-exported function called by `vlSimilarity` to actually compute the Edit Distancebetween two strings.

**Kind**: inner method of [<code>search</code>](#module_search)  
**Returns**: <code>float</code> - A numerical Edit Distance, 1.0 being the highest and closest match, down to 0.0  

| Param | Type | Description |
| --- | --- | --- |
| s1 | <code>string</code> | The longest string provided to vlSimilarity. |
| s2 | <code>string</code> | The shortest string provided to vlSimilarity. |

<a name="module_search..levenshteinWSDM"></a>

### search~levenshteinWSDM(s1, s2) ⇒ <code>float</code>
A custom implementation of Levenshtein's Edit Distance, intended to bebetter suited for sentences. Named: 'Levenshtein Distance w/ Word Seperators - Double Mean'.Still relies on base levenshtein functions to reduce duplication.

**Kind**: inner method of [<code>search</code>](#module_search)  
**Implements**: <code>vlSimilarity</code>  
**Returns**: <code>float</code> - A numerical Edit Distance, 1.0 being the highest and closest match, down to 0.0  

| Param | Type | Description |
| --- | --- | --- |
| s1 | <code>string</code> | Intended as the string being searched with. |
| s2 | <code>string</code> | Intended as the string being search against. |

<a name="module_search..lcs"></a>

### search~lcs(s1, s2) ⇒ <code>float</code>
An exported translation of Longest Common Subsequence Algorithm in JavaScript.With a custom twist, where instead of reporting the string of the LCS, reportsa numerical float value of the similarity two its search string.With sibling functions denotated by lcsFUNC.

**Kind**: inner method of [<code>search</code>](#module_search)  
**Implements**: <code>lcsTraceBack</code>  
**Returns**: <code>float</code> - A numerical float similarity index. For example if the string is5 characters long, and the LCS is 4 characters, it will return 0.8 for it's similarity score.  

| Param | Type | Description |
| --- | --- | --- |
| s1 | <code>string</code> | Intended as the string being searched with. |
| s2 | <code>string</code> | Intended as the string being searched against. |

<a name="module_search..lcsTraceBack"></a>

### search~lcsTraceBack(matrix, s1, s2, height, width)
The non-exported recursive traceback function determining the actual Longest CommonSubsequence.

**Kind**: inner method of [<code>search</code>](#module_search)  

| Param | Type | Description |
| --- | --- | --- |
| matrix | <code>Array.&lt;array&gt;</code> | A table storing the matrix of the LCS calculation. |
| s1 | <code>string</code> | Intended as the string being searched with, or row's of the matrix. |
| s2 | <code>string</code> | Intended as the string being searched against, or col's of the matrix. |
| height | <code>int</code> | The numerical height of the matrix, as derived from s1. |
| width | <code>int</code> | The numerical width of the matrix, as derived from s2. |

<a name="module_server"></a>

## server
The initializer of `main.js` starting up the Express Server, and setting the portto listen on. As well as handling a graceful shutdown of the server.

**Implements**: <code>main</code>, <code>config</code>, <code>logger</code>  
<a name="module_server..exterminate"></a>

### server~exterminate(callee)
This is called when the server process receives a `SIGINT` or `SIGTERM` signal.Which this will then handle closing the server listener, as well as calling `data.Shutdown`.

**Kind**: inner method of [<code>server</code>](#module_server)  

| Param | Type | Description |
| --- | --- | --- |
| callee | <code>string</code> | Simply a way to better log what called the server to shutdown. |

<a name="module_storage"></a>

## storage
This module is the second generation of data storage methodology,in which this provides static access to files stored within regular cloudfile storage. Specifically intended for use with Google Cloud Storage.


* [storage](#module_storage)
    * [~checkGCS()](#module_storage..checkGCS)
    * [~getBanList()](#module_storage..getBanList)
    * [~getFeaturedPackages()](#module_storage..getFeaturedPackages)

<a name="module_storage..checkGCS"></a>

### storage~checkGCS()
Sets up the Google Cloud Storage Class, to ensure its ready to use.

**Kind**: inner method of [<code>storage</code>](#module_storage)  
<a name="module_storage..getBanList"></a>

### storage~getBanList()
Reads the ban list from the Google Cloud Storage Space.Returning the cached parsed JSON object.If it has been read before during this instance of hosting just the cachedversion is returned.

**Kind**: inner method of [<code>storage</code>](#module_storage)  
<a name="module_storage..getFeaturedPackages"></a>

### storage~getFeaturedPackages()
Returns the hardcoded featured packages file from Google Cloud Storage.Caching the object once read for this instance of the server run.

**Kind**: inner method of [<code>storage</code>](#module_storage)  
<a name="module_users"></a>

## users
Focused on interacting with User Data only. Provides functions requiredto modify, or compile user data specifically.

**Implements**: <code>data</code>  

* [users](#module_users)
    * [~verifyAuth(token, [callback])](#module_users..verifyAuth) ⇒ <code>object</code>
    * [~getUser(username)](#module_users..getUser) ⇒ <code>object</code>
    * [~addUserStar(packageName, userName)](#module_users..addUserStar) ⇒ <code>object</code>
    * [~removeUserStar(packageName, userName)](#module_users..removeUserStar) ⇒ <code>object</code>
    * [~prune(userObj)](#module_users..prune) ⇒ <code>object</code>

<a name="module_users..verifyAuth"></a>

### users~verifyAuth(token, [callback]) ⇒ <code>object</code>
Checks every existing user within the users file, to see if the token provided exists within their validtokens. If it does will return the entire user object. If an optional callback is provided will invoke thecallback passing the user object, otherwise will just return the user object.If no valid user is found returns null.

**Kind**: inner method of [<code>users</code>](#module_users)  
**Implements**: <code>GetUsers</code>  
**Returns**: <code>object</code> - Error Object bubbled from GetUsers, Error Object of 'Bad Auth', Object containing the User Object.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | Provided Token to check against all valid users. |
| [callback] | <code>function</code> | Optional function to invoke passing the matched user. |

<a name="module_users..getUser"></a>

### users~getUser(username) ⇒ <code>object</code>
Searches for a user within the user file, and if found will return the standard objectcontaining the full User Object. Otherwise an error.

**Kind**: inner method of [<code>users</code>](#module_users)  
**Implements**: <code>GetUsers</code>  
**Returns**: <code>object</code> - An error object bubbled up from GetUsers, Error Object of 'Not Found',Object containing full User Object.  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | The UserName we want to search for. |

<a name="module_users..addUserStar"></a>

### users~addUserStar(packageName, userName) ⇒ <code>object</code>
Adds the desired Package to the list of packages the User has starred.

**Kind**: inner method of [<code>users</code>](#module_users)  
**Implements**: <code>GetUser</code>, <code>GetUsers</code>  
**Returns**: <code>object</code> - Error Object Bubbled from GetUser, Error Object Bubbled from GetUsers,Error Object Bubbled from SetUsers, Short Object of 'ok' if successful.  
**Impmplements**: <code>SetUsers</code>  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The Name of the Package we want to add to the users star list. |
| userName | <code>string</code> | The user we want to make this modification to. |

<a name="module_users..removeUserStar"></a>

### users~removeUserStar(packageName, userName) ⇒ <code>object</code>
Removes the specified Package from the Users list of stars.

**Kind**: inner method of [<code>users</code>](#module_users)  
**Implements**: <code>GetUser</code>, <code>GetUsers</code>, <code>SetUsers</code>  
**Returns**: <code>object</code> - Error Object Bubbled from GetUser, ErrorObject Bubbled from GetUsers,Error Object Bubbled from SetUsers, Error Object of 'Not Found', Short Object of successful write ok.  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The Name of the package we want to remove from the users star list. |
| userName | <code>string</code> | The User we want to make these changes to. |

<a name="module_users..prune"></a>

### users~prune(userObj) ⇒ <code>object</code>
Takes a single User Object, and prunes any server side only data from the object to return to the user.This pruned item should never be written back to disk, as removed the data from it removes any pointers to those values.

**Kind**: inner method of [<code>users</code>](#module_users)  
**Returns**: <code>object</code> - The Pruned userObj.  

| Param | Type | Description |
| --- | --- | --- |
| userObj | <code>object</code> | The object of which to preform the pruning on. |

<a name="module_utils"></a>

## utils
A helper for any functions that are agnostic in hanlders.


* [utils](#module_utils)
    * [~localUserLoggedIn(req, res, params_user, callback)](#module_utils..localUserLoggedIn)
    * [~constructPackageObjectFull()](#module_utils..constructPackageObjectFull)
    * [~constructPackageObjectShort()](#module_utils..constructPackageObjectShort)

<a name="module_utils..localUserLoggedIn"></a>

### utils~localUserLoggedIn(req, res, params_user, callback)
Used as a less verbose way to check if the current user token, is associatedwith a logged in user. If not handles errors automatically, if so calls the callbackfunction passing the Server Status Object, where content is User.

**Kind**: inner method of [<code>utils</code>](#module_utils)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | - |
| res | <code>object</code> | - |
| params_user | <code>string</code> | Usually `params.auth` or otherwise the authorization token within the header field. |
| callback | <code>function</code> | The callback to invoke only if the user is properly authenticated. |

<a name="module_utils..constructPackageObjectFull"></a>

### utils~constructPackageObjectFull()
Takes the raw return of a full row from the packages table,constructs a standardized package object full from it.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
<a name="module_utils..constructPackageObjectShort"></a>

### utils~constructPackageObjectShort()
Takes a single or array of rows from the db, and returns a JSONconstruction of package object shorts

**Kind**: inner method of [<code>utils</code>](#module_utils)  
<a name="module_common_handler"></a>

## common\_handler
Provides a simplistic way to refer to implement common endpoint returns.So these can be called as an async function without more complex functions, reducingverbosity, and duplication within the codebase.

**Implements**: <code>error</code>, <code>logger</code>  

* [common_handler](#module_common_handler)
    * [~authFail(req, res, user)](#module_common_handler..authFail)
    * [~serverError(req, res, err)](#module_common_handler..serverError)
    * [~notFound(req, res)](#module_common_handler..notFound)
    * [~notSupported(req, res)](#module_common_handler..notSupported)
    * [~siteWideNotFound(req, res)](#module_common_handler..siteWideNotFound)
    * [~badRepoJSON(req, res)](#module_common_handler..badRepoJSON)
    * [~badPackageJSON(req, res)](#module_common_handler..badPackageJSON)
    * [~handleError(req, res, obj)](#module_common_handler..handleError)

<a name="module_common_handler..authFail"></a>

### common_handler~authFail(req, res, user)
Will take the <b>failed</b> user object from VerifyAuth, and respond for the endpoint aseither a "Server Error" or a "Bad Auth", whichever is correct based on the Error bubbled from VerifyAuth.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  
**Implements**: <code>error.MissingAuthJSON</code>, <code>error.ServerErrorJSON</code>, <code>logger.HTTPLog</code>, <code>logger.ErrorLog</code>  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |
| user | <code>object</code> | The Raw Status Object of the User, expected to return from `VerifyAuth`. |

<a name="module_common_handler..serverError"></a>

### common_handler~serverError(req, res, err)
Returns a standard Server Error to the user as JSON. Logging the detailed error message to the server.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  
**Implements**: <code>error.ServerErrorJSON</code>, <code>logger.HTTPLog</code>, <code>logger.ErrorLog</code>  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |
| err | <code>string</code> | The detailed error message to log server side. |

<a name="module_common_handler..notFound"></a>

### common_handler~notFound(req, res)
Standard endpoint to return the JSON Not Found error to the user.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  
**Implements**: <code>error.NotFoundJSON</code>, <code>logger.HTTPLog</code>  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_common_handler..notSupported"></a>

### common_handler~notSupported(req, res)
Returns a Not Supported message to the user.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  
**Implements**: <code>error.UnsupportedJSON</code>, <code>logger.HTTPLog</code>  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_common_handler..siteWideNotFound"></a>

### common_handler~siteWideNotFound(req, res)
Returns the SiteWide 404 page to the end user.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  
**Implements**: <code>error.SiteWide404</code>, <code>logger.HTTPLog</code>  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_common_handler..badRepoJSON"></a>

### common_handler~badRepoJSON(req, res)
Returns the BadRepoJSON message to the user.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  
**Implements**: <code>error.BadRepoJSON</code>, <code>logger.HTTPLog</code>  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_common_handler..badPackageJSON"></a>

### common_handler~badPackageJSON(req, res)
Returns the BadPackageJSON message to the user.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  
**Implements**: <code>error.BadPackageJSON</code>, <code>logger.HTTPLog</code>  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_common_handler..handleError"></a>

### common_handler~handleError(req, res, obj)
Generic error handler mostly used to reduce the duplication of error handling in other modules.It checks the short error string and calls the relative endpoint.Note that it's designed to be called as the last async function before the return.

**Kind**: inner method of [<code>common\_handler</code>](#module_common_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |
| obj | <code>object</code> | the Raw Status Object of the User, expected to return from `VerifyAuth`. |

<a name="module_oauth_handler"></a>

## oauth\_handler
Endpoint Handlers for Authentication URLs

**Implements**: <code>config</code>, <code>common\_handler</code>  

* [oauth_handler](#module_oauth_handler)
    * [~getLogin(req, res)](#module_oauth_handler..getLogin)
    * [~getOauth(req, res)](#module_oauth_handler..getOauth)

<a name="module_oauth_handler..getLogin"></a>

### oauth_handler~getLogin(req, res)
Endpoint used to direct users to login, directing the user to theproper GitHub OAuth Page based on the backends client id.

**Kind**: inner method of [<code>oauth\_handler</code>](#module_oauth_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_oauth_handler..getOauth"></a>

### oauth_handler~getOauth(req, res)
Endpoint intended to use as the actual return from GitHub to login.

**Kind**: inner method of [<code>oauth\_handler</code>](#module_oauth_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_package_handler"></a>

## package\_handler
Endpoint Handlers in all relating to the packages themselves.

**Implements**: <code>common\_handler</code>, <code>users</code>, <code>data</code>, <code>collection</code>, <code>query</code>, <code>git</code>, <code>logger</code>, <code>error</code>, <code>config</code>  

* [package_handler](#module_package_handler)
    * [~getPackages(req, res)](#module_package_handler..getPackages)
    * [~postPackages(req, res)](#module_package_handler..postPackages)
    * [~getPackagesFeatured(req, res)](#module_package_handler..getPackagesFeatured)
    * [~getPackagesSearch(req, res)](#module_package_handler..getPackagesSearch)
    * [~getPackagesDetails(req, res)](#module_package_handler..getPackagesDetails)
    * [~deletePackagesName(req, res)](#module_package_handler..deletePackagesName)
    * [~postPackagesStar(req, res)](#module_package_handler..postPackagesStar)
    * [~deletePackageStar(req, res)](#module_package_handler..deletePackageStar)
    * [~getPackagesStargazers(req, res)](#module_package_handler..getPackagesStargazers)
    * [~postPackagesVersion(req, res)](#module_package_handler..postPackagesVersion)
    * [~getPackagesVersion(req, res)](#module_package_handler..getPackagesVersion)
    * [~getPackagesVersionTarball(req, res)](#module_package_handler..getPackagesVersionTarball)
    * [~deletePackageVersion(req, res)](#module_package_handler..deletePackageVersion)
    * [~postPackagesEventUninstall(req, res)](#module_package_handler..postPackagesEventUninstall)

<a name="module_package_handler..getPackages"></a>

### package_handler~getPackages(req, res)
Endpoint to return all packages to the user. Based on any filteringtheyved applied via query parameters.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/packages |

<a name="module_package_handler..postPackages"></a>

### package_handler~postPackages(req, res)
This endpoint is used to publish a new package to the backend server.Taking the repo, and your authentication for it, determines if it can be published,then goes about doing so.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | POST |
| <code>http\_endpoint</code> | /api/packages |

<a name="module_package_handler..getPackagesFeatured"></a>

### package_handler~getPackagesFeatured(req, res)
Allows the user to retreive the featured packages, as package object shorts.This endpoint was originally undocumented. The decision to return 200 is based off similar endpoints.Additionally for the time being this list is created manually, the same method usedon Atom.io for now. Although there are plans to have this become automatic later on.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**See**

- [Source Code](https://github.com/atom/apm/blob/master/src/featured.coffee)
- [Discussion](https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23)


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/packages/featured |

<a name="module_package_handler..getPackagesSearch"></a>

### package_handler~getPackagesSearch(req, res)
Allows user to search through all packages. Using their specifiedquery parameter.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema, additionally determine how to integrate customsearching method into SQL Database.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/packages/search |

<a name="module_package_handler..getPackagesDetails"></a>

### package_handler~getPackagesDetails(req, res)
Allows the user to request a single package object full, dependingon the package included in the path parameter.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/packages/:packageName |

<a name="module_package_handler..deletePackagesName"></a>

### package_handler~deletePackagesName(req, res)
Allows the user to delete a repo they have ownership of.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | DELETE |
| <code>http\_endpoint</code> | /api/packages/:packageName |

<a name="module_package_handler..postPackagesStar"></a>

### package_handler~postPackagesStar(req, res)
Used to submit a new star to a package from the authenticated user.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | POST |
| <code>http\_endpoint</code> | /api/packages/:packageName/star |

<a name="module_package_handler..deletePackageStar"></a>

### package_handler~deletePackageStar(req, res)
Used to remove a star from a specific package for the authenticated usesr.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | DELETE |
| <code>http\_endpoint</code> | /api/packages/:packageName/star |

<a name="module_package_handler..getPackagesStargazers"></a>

### package_handler~getPackagesStargazers(req, res)
Endpoint returns the array of `star_gazers` from a specified package.Taking only the package wanted, and returning it directly.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/packages/:packageName/stargazers |

<a name="module_package_handler..postPackagesVersion"></a>

### package_handler~postPackagesVersion(req, res)
Allows a new version of a package to be published. But also can allowa user to rename their application during this process.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema, and find methodology of handling rename.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | POST |
| <code>http\_endpoint</code> | /api/packages/:packageName/versions |

<a name="module_package_handler..getPackagesVersion"></a>

### package_handler~getPackagesVersion(req, res)
Used to retreive a specific version from a package.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/packages/:packageName/versions/:versionName |

<a name="module_package_handler..getPackagesVersionTarball"></a>

### package_handler~getPackagesVersionTarball(req, res)
Allows the user to get the tarball for a specific package version.Which should initiate a download of said tarball on their end.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/packages/:packageName/versions/:versionName/tarball |

<a name="module_package_handler..deletePackageVersion"></a>

### package_handler~deletePackageVersion(req, res)
Allows a user to delete a specific version of their package.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**Todo**

- [ ] Migrate to new Database Schema


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | DELETE |
| <code>http\_endpoint</code> | /api/packages/:packageName/versions/:versionName |

<a name="module_package_handler..postPackagesEventUninstall"></a>

### package_handler~postPackagesEventUninstall(req, res)
Used when a package is uninstalled, decreases the download count by 1.And saves this data. Originally an undocumented endpoint.The decision to return a '201' was based on how other POST endpoints return,during a successful event.

**Kind**: inner method of [<code>package\_handler</code>](#module_package_handler)  
**See**: [https://github.com/atom/apm/blob/master/src/uninstall.coffee](https://github.com/atom/apm/blob/master/src/uninstall.coffee)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | POST |
| <code>http\_endpoint</code> | /api/packages/:packageName/versions/:versionName/events/uninstall |

<a name="module_star_handler"></a>

## star\_handler
Handler for any endpoints whose slug after `/api/` is `star`.

<a name="module_star_handler..getStars"></a>

### star_handler~getStars(req, res)
Endpoint for `GET /api/stars`. Whose endgoal is to return an array of all packagesthe authenticated user has stared.

**Kind**: inner method of [<code>star\_handler</code>](#module_star_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_theme_handler"></a>

## theme\_handler
Endpoint Handlers relating to themes only.

**Implements**: <code>command\_handler</code>  
<a name="module_theme_handler..getThemeFeatured"></a>

### theme_handler~getThemeFeatured(req, res)
Used to retreive all Featured Packages that are Themes. Originally an undocumentedendpoint. Returns a 200 response based on other similar responses.Additionally for the time being this list is created manually, the same method usedon Atom.ioi for now. Although there are plans to have this become automatic later on.

**Kind**: inner method of [<code>theme\_handler</code>](#module_theme_handler)  
**See**

- [Source Code](https://github.com/atom/apm/blob/master/src/featured.coffee)
- [Discussion](https://github.com/confused-Techie/atom-community-server-backend-JS/issues/23)

**Todo**

- [ ] This function has never been implemented on this system.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/themes/featured |

<a name="module_update_handler"></a>

## update\_handler
Endpoint Handlers relating to updating the editor.

**Implments**: <code>command\_handler</code>  
<a name="module_update_handler..getUpdates"></a>

### update_handler~getUpdates(req, res)
Used to retreive new editor update information.

**Kind**: inner method of [<code>update\_handler</code>](#module_update_handler)  
**Todo**

- [ ] This function has never been implemented on this system. Since there is currently noupdate methodology.


| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Properties**

| Type | Description |
| --- | --- |
| <code>http\_method</code> | GET |
| <code>http\_endpoint</code> | /api/updates |

<a name="module_user_handler"></a>

## user\_handler
Handler for endpoints whose slug after `/api/` is `user`.

<a name="module_user_handler..getLoginStars"></a>

### user_handler~getLoginStars(req, res)
Endpoint for `GET /api/users/:login/stars`. Whose goal is to returnAn array of Package Object Short's collected from the authenticated user'sstar gazer list.

**Kind**: inner method of [<code>user\_handler</code>](#module_user_handler)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

