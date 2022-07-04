## Modules

<dl>
<dt><a href="#module_error">error</a></dt>
<dd><p>Contains different error messages that can be returned, adding them and their
respective HTTP Status Codes to the <code>Response</code> object provided to them.
Letting them all be defined in one place for ease of modification, and easily route
to them from different handlers.</p>
</dd>
<dt><a href="#module_resources">resources</a></dt>
<dd><p>This module provides a way for other functions to read/write/delete data without knowing or
thinking about the underlying file structure. Providing abstraction if the data resides on a local
filesystem, Google Cloud Storage, or something else entirely.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#Sort">Sort(method, packages)</a> ⇒ <code>object</code></dt>
<dd><p>Intended for use for a collection of Packages, sort them according to any valid Sorting method.
Note this should be called before, any Pruning has taken place.</p>
</dd>
<dt><a href="#GetConfig">GetConfig()</a> ⇒ <code>object</code></dt>
<dd><p>Used to get Server Config data from the <code>app.yaml</code> file at the root of the project.
Or from environment variables. Prioritizing environment variables.</p>
</dd>
<dt><a href="#VerifyAuth">VerifyAuth(token, [callback])</a> ⇒ <code>object</code></dt>
<dd><p>Checks every existing user within the users file, to see if the token provided exists within their valid
tokens. If it does will return the entire user object. If an optional callback is provided will invoke the
callback passing the user object, otherwise will just return the user object.
If no valid user is found returns null.</p>
</dd>
<dt><a href="#GetUser">GetUser(username)</a> ⇒ <code>object</code></dt>
<dd><p>Searches for a user within the user file, and if found will return the standard object
containing the full User Object. Otherwise an error.</p>
</dd>
<dt><a href="#AddUserStar">AddUserStar(packageName, userName)</a> ⇒ <code>object</code></dt>
<dd><p>Adds the desired Package to the list of packages the User has starred.</p>
</dd>
<dt><a href="#RemoveUserStar">RemoveUserStar(packageName, userName)</a> ⇒ <code>object</code></dt>
<dd><p>Removes the specified Package from the Users list of stars.</p>
</dd>
<dt><a href="#Prune">Prune(userObj)</a> ⇒ <code>object</code></dt>
<dd><p>Takes a single User Object, and prunes any server side only data from the object to return to the user.
This pruned item should never be written back to disk, as removed the data from it removes any pointers to those values.</p>
</dd>
</dl>

<a name="module_error"></a>

## error
Contains different error messages that can be returned, adding them and their
respective HTTP Status Codes to the `Response` object provided to them.
Letting them all be defined in one place for ease of modification, and easily route
to them from different handlers.


* [error](#module_error)
    * [~NotFoundJSON(res)](#module_error..NotFoundJSON)
    * [~SiteWide404(res)](#module_error..SiteWide404)
    * [~MissingAuthJSON(res)](#module_error..MissingAuthJSON)
    * [~ServerErrorJSON(res)](#module_error..ServerErrorJSON)
    * [~UnsupportedJSON(res)](#module_error..UnsupportedJSON)

<a name="module_error..NotFoundJSON"></a>

### error~NotFoundJSON(res)
The Standard JSON Handling when an object is not found. Setting:
Status Code: 404
JSON Respone Body: message: "Not Found"

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..SiteWide404"></a>

### error~SiteWide404(res)
The standard Website Page 404 not found handler.

**Kind**: inner method of [<code>error</code>](#module_error)  
**Todo**

- [ ] Currently this returns a JSON object, but in the future should return an HTML Not Found page.
Setting Currently:
Status Code: 404
JSON Response Body: message: "This is a standin for the proper site wide 404 page."


| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..MissingAuthJSON"></a>

### error~MissingAuthJSON(res)
JSON Handling when authentication fails. Setting:
Status Code: 401
JSON Response Body: message: "Requires authentication. Please update your token if you haven't done so recently."

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..ServerErrorJSON"></a>

### error~ServerErrorJSON(res)
The Standard Server Error JSON Endpoint. Setting:
Status Code: 500
JSON Response Body: message: "Application Error"

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_error..UnsupportedJSON"></a>

### error~UnsupportedJSON(res)
This is a standard JSON endpoint to define an endpoint that is currently not supported.
Used currently to delineate which endpoints have not been fully implemented. Or a specific error endpoint
that has not been written yet.
Setting:
Status Code: 501
JSON Response Body: message: "While under development this feature is not supported."

**Kind**: inner method of [<code>error</code>](#module_error)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

<a name="module_resources"></a>

## resources
This module provides a way for other functions to read/write/delete data without knowing or
thinking about the underlying file structure. Providing abstraction if the data resides on a local
filesystem, Google Cloud Storage, or something else entirely.


* [resources](#module_resources)
    * [~CacheObject](#module_resources..CacheObject)
        * [new CacheObject([name], contents)](#new_module_resources..CacheObject_new)
    * [~Read(type, name)](#module_resources..Read) ⇒ <code>object</code>
    * [~readFile(path)](#module_resources..readFile) ⇒ <code>object</code>
    * [~Write(type, data, name)](#module_resources..Write) ⇒ <code>object</code>
    * [~writeFile(path, data)](#module_resources..writeFile) ⇒ <code>object</code>
    * [~Delete(name)](#module_resources..Delete) ⇒ <code>object</code>

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

<a name="module_resources..Read"></a>

### resources~Read(type, name) ⇒ <code>object</code>
Exported function to read data from the filesystem, whatever that may be.

**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Returns**: <code>object</code> - If type is "package" or "pointer" returns a Server Status Object, with `content`
being a `CacheObject` class, already initialized and ready for consumption. Otherwise if type is
"package" returns the return from `readFile`. Errors bubble up from `readFile`.  
**Implments**: <code>readFile</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of data we are reading. Valid Types: "user", "pointer", "package". |
| name | <code>string</code> | The name of the file we are reading. Only needed if type is "package", in which case this <b>MUST</b> include `.json` for example `UUID.json`. |

<a name="module_resources..readFile"></a>

### resources~readFile(path) ⇒ <code>object</code>
Non-Exported function to read data from the filesystem. Whatever that may be.

**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Returns**: <code>object</code> - A Server Status Object, with `content` being the read file parsed from JSON.
If error returns "Server Error" or "File Not Found".  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The Path to whatever file we want. |

<a name="module_resources..Write"></a>

### resources~Write(type, data, name) ⇒ <code>object</code>
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
**Returns**: <code>object</code> - A Server Status Object, with `content` only on an error.
Errors returned "Server Error".  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to the file we are writing. Including the destination file. |
| data | <code>object</code> | The Data we are writing to the filesystem. Already encoded in a compatible format. |

<a name="module_resources..Delete"></a>

### resources~Delete(name) ⇒ <code>object</code>
**Kind**: inner method of [<code>resources</code>](#module_resources)  
**Returns**: <code>object</code> - A Server Status Object, with `content` non-existant on a successful deletion.
Errors returned as "Server Error".  
**Descc**: Exported function to delete data from the filesystem, whatever that may be. But since we know
we will only ever be deleting packages, these will only ever attempt to delete a package.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the package we want to delete. <b>MUST</b> include `.json`, as in `UUID.json`. |

<a name="Sort"></a>

## Sort(method, packages) ⇒ <code>object</code>
Intended for use for a collection of Packages, sort them according to any valid Sorting method.
Note this should be called before, any Pruning has taken place.

**Kind**: global function  
**Returns**: <code>object</code> - The provided packages now sorted accordingly.  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The Method to Sort By |
| packages | <code>object</code> | The Packages in which to sort. |

<a name="GetConfig"></a>

## GetConfig() ⇒ <code>object</code>
Used to get Server Config data from the `app.yaml` file at the root of the project.
Or from environment variables. Prioritizing environment variables.

**Kind**: global function  
**Returns**: <code>object</code> - The different available configuration values.  
**Example** *(Using &#x60;GetConfig()&#x60; during an import for a single value.)*  
```js
const { search_algorithm } = require("./config.js").GetConfig();
```
<a name="VerifyAuth"></a>

## VerifyAuth(token, [callback]) ⇒ <code>object</code>
Checks every existing user within the users file, to see if the token provided exists within their valid
tokens. If it does will return the entire user object. If an optional callback is provided will invoke the
callback passing the user object, otherwise will just return the user object.
If no valid user is found returns null.

**Kind**: global function  
**Implements**: <code>GetUsers</code>  
**Returns**: <code>object</code> - Error Object bubbled from GetUsers, Error Object of 'Bad Auth', Object containing the User Object.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | Provided Token to check against all valid users. |
| [callback] | <code>function</code> | Optional function to invoke passing the matched user. |

<a name="GetUser"></a>

## GetUser(username) ⇒ <code>object</code>
Searches for a user within the user file, and if found will return the standard object
containing the full User Object. Otherwise an error.

**Kind**: global function  
**Implements**: <code>GetUsers</code>  
**Returns**: <code>object</code> - An error object bubbled up from GetUsers, Error Object of 'Not Found',
Object containing full User Object.  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | The UserName we want to search for. |

<a name="AddUserStar"></a>

## AddUserStar(packageName, userName) ⇒ <code>object</code>
Adds the desired Package to the list of packages the User has starred.

**Kind**: global function  
**Implements**: [<code>GetUser</code>](#GetUser), <code>GetUsers</code>  
**Returns**: <code>object</code> - Error Object Bubbled from GetUser, Error Object Bubbled from GetUsers,
Error Object Bubbled from SetUsers, Short Object of 'ok' if successful.  
**Impmplements**: <code>SetUsers</code>  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The Name of the Package we want to add to the users star list. |
| userName | <code>string</code> | The user we want to make this modification to. |

<a name="RemoveUserStar"></a>

## RemoveUserStar(packageName, userName) ⇒ <code>object</code>
Removes the specified Package from the Users list of stars.

**Kind**: global function  
**Implements**: [<code>GetUser</code>](#GetUser), <code>GetUsers</code>, <code>SetUsers</code>  
**Returns**: <code>object</code> - Error Object Bubbled from GetUser, ErrorObject Bubbled from GetUsers,
Error Object Bubbled from SetUsers, Error Object of 'Not Found', Short Object of successful write ok.  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The Name of the package we want to remove from the users star list. |
| userName | <code>string</code> | The User we want to make these changes to. |

<a name="Prune"></a>

## Prune(userObj) ⇒ <code>object</code>
Takes a single User Object, and prunes any server side only data from the object to return to the user.
This pruned item should never be written back to disk, as removed the data from it removes any pointers to those values.

**Kind**: global function  
**Returns**: <code>object</code> - The Pruned userObj.  

| Param | Type | Description |
| --- | --- | --- |
| userObj | <code>object</code> | The object of which to preform the pruning on. |

