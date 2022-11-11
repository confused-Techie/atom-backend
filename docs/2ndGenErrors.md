As the final push to get the Backend ready for Atom's sunset is here, there is a lot that is supposed to be happening to the backend.

The last of the tests are seemingly all integration tests. And at this point that means it's hard to find what's causing errors on tests that fail.

With so many moving parts and a single function touching so many modules and functions, it can make life difficult, especially when all you see is the final error returned to the end user. And your logs all come from one module.

So in this effort I'm introducing something I've always not been the biggest fan of.

## Numeric Error Codes

While I always disliked them because of their associated non-existent documentation, here is where I make sure that doesn't happen.

For Developers, if adding in a new Numeric Error Code please do the following:
  * Ensure your error code doesn't already exist. There should never be the same code originated from separate locations.
  * Ensure you add your error code here. Without adding it below, it is worthless as an error code.
  * Lastly Numeric Error Codes are only shown within `warningLog && errorLog`

While Numeric Error Codes will now accompany traditional error messages, this will aim to make reporting bugs, and fixing bugs during testing easier and faster. So lets begin:

# Numeric Error Codes

### 0000

The numeric error code `0000` means that whatever reported the error either doesn't support Numeric Error Codes yet, or was unable to return anything to help. Likely meaning something truly unexpected happened.

### 1000

Error codes within `1000-1999` are error codes that relate to an error originating from either the SQL Database, or direct interactions with it.

- 1001 : `package_handler.getPackages()` - The initial request `database.getSortedPackages()` Returned `ok: false`.
- 1002 : `package_handler.getPackages()` - The request `database.getTotalPackageEstimate()` Returned `ok: false`.

### 2000

Error codes within `2000-2999` are error codes that relate to errors originated from Google Cloud modules or direct interactions with it.

### 3000

Error codes within `3000-3999` are error codes that relate to errors utility and helper modules throughout the codebase.

### 4000

Error codes within `4000-4999` relate to the catch all of other interactions on the codebase. And could relate to many different modules, but the documentation for your error code should provide insight.
