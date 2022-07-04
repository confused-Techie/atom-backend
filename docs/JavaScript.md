## Classes

<dl>
<dt><a href="#CacheObject">CacheObject</a></dt>
<dd></dd>
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
<dt><a href="#Read">Read(type, name)</a> ⇒ <code>object</code></dt>
<dd><p>Exported function to read data from the filesystem, whatever that may be.</p>
</dd>
<dt><a href="#readFile">readFile(path)</a> ⇒ <code>object</code></dt>
<dd><p>Non-Exported function to read data from the filesystem. Whatever that may be.</p>
</dd>
<dt><a href="#Write">Write(type, data, name)</a> ⇒ <code>object</code></dt>
<dd><p>The Exported Write function, to allow writing of data to the filesystem.</p>
</dd>
<dt><a href="#writeFile">writeFile(path, data)</a> ⇒ <code>object</code></dt>
<dd><p>Non-Exported write function. Used to directly write data to the filesystem. Whatever that may be.</p>
</dd>
<dt><a href="#Delete">Delete(name)</a> ⇒ <code>object</code></dt>
<dd></dd>
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

<a name="CacheObject"></a>

## CacheObject
**Kind**: global class  
<a name="new_CacheObject_new"></a>

### new CacheObject()
Allows simple interfaces to handle caching an object in memory. Used to cache data read from the filesystem.

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
<a name="Read"></a>

## Read(type, name) ⇒ <code>object</code>
Exported function to read data from the filesystem, whatever that may be.

**Kind**: global function  
**Returns**: <code>object</code> - If type is "package" or "pointer" returns a Server Status Object, with `content`
being a `CacheObject` class, already initialized and ready for consumption. Otherwise if type is
"package" returns the return from `readFile`.  
**Implments**: [<code>readFile</code>](#readFile)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of data we are reading. Valid Types: "user", "pointer", "package". |
| name | <code>string</code> | The name of the file we are reading. Only needed if type is "package", in which case this <b>MUST</b> include `.json` for example `UUID.json`. |

<a name="readFile"></a>

## readFile(path) ⇒ <code>object</code>
Non-Exported function to read data from the filesystem. Whatever that may be.

**Kind**: global function  
**Returns**: <code>object</code> - A Server Status Object, with `content` being the read file parsed from JSON.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The Path to whatever file we want. |

<a name="Write"></a>

## Write(type, data, name) ⇒ <code>object</code>
The Exported Write function, to allow writing of data to the filesystem.

**Kind**: global function  
**Implements**: [<code>writeFile</code>](#writeFile)  
**Returns**: <code>object</code> - Returns the object returned from `writeFile`.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The Type of data we are writing. Valid Types: "user", "pointer", "package" |
| data | <code>object</code> | A JavaScript Object that will be `JSON.stringify`ed before writing. |
| name | <code>string</code> | The path name of the file we are writing. Only required when type is "package", in which case it should be `UUID.json`, it <b>MUST</b> include the `.json`. |

<a name="writeFile"></a>

## writeFile(path, data) ⇒ <code>object</code>
Non-Exported write function. Used to directly write data to the filesystem. Whatever that may be.

**Kind**: global function  
**Returns**: <code>object</code> - A Server Status Object, with `content` only on an error.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to the file we are writing. Including the destination file. |
| data | <code>object</code> | The Data we are writing to the filesystem. Already encoded in a compatible format. |

<a name="Delete"></a>

## Delete(name) ⇒ <code>object</code>
**Kind**: global function  
**Returns**: <code>object</code> - A Server Status Object, with `content` non-existant on a successful deletion.  
**Descc**: Exported function to delete data from the filesystem, whatever that may be. But since we know
we will only ever be deleting packages, these will only ever attempt to delete a package.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the package we want to delete. <b>MUST</b> include `.json`, as in `UUID.json`. |

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

