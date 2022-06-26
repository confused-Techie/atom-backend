## Functions

<dl>
<dt><a href="#Sort">Sort(method, packages)</a> ⇒ <code>object</code></dt>
<dd><p>Intended for use for a collection of Packages, sort them according to any valid Sorting method.
Note this should be called before, any Pruning has taken place.</p>
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

