## Functions

<dl>
<dt><a href="#Sort">Sort(method, packages)</a> ⇒ <code>object</code></dt>
<dd><p>Intended for use for a collection of Packages, sort them according to any valid Sorting method.</p>
</dd>
<dt><a href="#VerifyAuth">VerifyAuth(token, [callback])</a></dt>
<dd><p>Checks every existing user within the users file, to see if the token provided exists within their valid
tokens. If it does will return the entire user object. If an optional callback is provided will invoke the
callback passing the user object, otherwise will just return the user object.
If no valid user is found returns null.</p>
</dd>
</dl>

<a name="Sort"></a>

## Sort(method, packages) ⇒ <code>object</code>
Intended for use for a collection of Packages, sort them according to any valid Sorting method.

**Kind**: global function  
**Returns**: <code>object</code> - The provided packages now sorted accordingly.  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The Method to Sort By |
| packages | <code>object</code> | The Packages in which to sort. |

<a name="VerifyAuth"></a>

## VerifyAuth(token, [callback])
Checks every existing user within the users file, to see if the token provided exists within their valid
tokens. If it does will return the entire user object. If an optional callback is provided will invoke the
callback passing the user object, otherwise will just return the user object.
If no valid user is found returns null.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | Provided Token to check against all valid users. |
| [callback] | <code>function</code> | Optional function to invoke passing the matched user. |

