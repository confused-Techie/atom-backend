To all contributors wanting to help write integration tests, here's a few helpful notes.

Within the main Integration Test file `./src/tests_integration/main.test.js` There's a few `expect()` extensions to simplify what's needed to check certain aspects.

# `expect()` Extensions

## `.toBeArray()`

```javascript
expect(res.body).toBeArray();
```

Used to confirm if the object being passed is an array or not. While using `expect(array.isArray(res.body)).toBeTruthy()` would work just as well, this extension has better support for logging the exact object received to help debugging.

## `.toHaveHTTPCode()`

```javascript
const res = await request(app).get("/api/packages");
expect(res).toHaveHTTPCode(404);
```

Used to check `request` returns for having a specified HTTP Status Code.

# Test Data

Now there is a certain set of test data that is available while testing, which will **not** mirror the current public database.

## Banned Package Names

- slothoki
- slot-pulsa
- slot-dana
- hoki-slot

## Featured Packages

- hydrogen
- atom-clock
- hey-pane

## Featured Themes

- atom-material-ui
- atom-material-syntax

## Packages Available on the Database

- language-css
  * Versions:
    - 0.45.7
    - 0.46.0
- langauge-cpp
  * Versions:
    - 0.11.8
    - 0.11.9
- hydrogen
  * Version: 2.16.3
- atom-clock
  * Version: 0.1.18
- hey-pane
  * Version: 1.2.0
- atom-material-ui
  * Version: 2.1.3
- atom-material-syntax
  * Version: 1.0.8

## Users Available on the Database

- dever
  * Token: "valid-token"
  * User with no specific permissions to resources, and can safely be used for misc.
- no_perm_user
  * Token: "no-valid-token"
  * Will by denied access no matter what during GitHub Authorization Steps.
- admin_user
  * Token: "admin-token"
  * Will be granted access to every service, and should never be denied access.
  * On 'GitHub' has access to `admin_user/atom-backend`
- has-no-stars
  * Token: "no-star-token"
- has-all-stars
  * Token: "all-star-token"

## Conventions and Standards

To make sure we don't have any odd interactions between tests, and to make sure that anyone looking at your tests knows what's going on, there are a few standards or conventions about the data used during tests, which are below.

##### Invalid Token

If you need to use a token that no user can have use the following:

* `invalid`

##### Non-Existent Package

If you need to use a package that will never exist in the test suite use the following:

* `language-golang`
* `notARepo`

##### Valid Package

If you need a package that does exist, but will never be removed or modified:

* `language-css`

##### Valid Token without any Permissions

If you need a token that a user does have, but has no permissions to any resources:

* `valid-token`

##### Valid Token WITH Permissions

If you need a token that has permissions over all resources:

* `admin-token`
