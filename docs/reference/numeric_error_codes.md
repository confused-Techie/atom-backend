# Numeric Error Codes

In some locations of the backend numeric, non-personalized error codes can be returned to be output onto the console. This is intened to aid in tracking down where and how an error occured, to ensure debugging after the fact can be easier.

Currently this implementation is in development, and not all errors will provide an error code.

For developers that are looking to add in additional error codes there are some guides that should be considered while doing so. Please note, like this implementation, this guide is in progress and will likely change in the future.

* Ensure your error code doesn't already exist. There should never be the same code originating from separate locations.
* Ensure you add your error code here. Without adding it below, it disregards it major purpose of helping to locate the problem for developers and end users.
* Lastly Numeric Error Codes are only shown within `warningLog` && `errorLog`.

Although if an error code is collected, below is a guide to determine where it had originated.

# Numeric Error Codes

### 9999

The numeric error code `9999` means that whatever reported the error either doesn't support Numeric Error Codes yet, or was unable to return anything to help. Likely meaning something truly unexpected happened.

### 1000

Error codes within `1000-1999` are error codes that relate to an error originating from either the SQL Database, or direct interactions with it.

- 1001 : `package_handler.getPackages()` - The initial request `database.getSortedPackages()` Returned `ok: false`.
- 1002 : `package_handler.getPackages()` - The request `database.getTotalPackageEstimate()` Returned `ok: false`.
- 1003 : `package_handler.getPackagesFeatured()` - The request `database.getFeaturedPackages()` Returned `ok: false`.
- 1004 : `package_handler.getPackagesDetails()` - The request `database.getPackageByName()` Returned `ok: false`.
- 1005 : `package_handler.deletePackagesName()` - The request `database.verifyAuth()` Returned `ok: false`.
- 1006 : `package_handler.deletePackagesName()` - The Request `database.removePackageByName()` Returned `ok: false`.
- 1007 : `package_handler.getPakcagesSearch()` - The Request `database.simpleSearch()` Returned `ok: false`.
- 1008 : `package_handler.postPackagesStar()` - The Request `database.verifyAuth()` Returned `ok: false`.
- 1009 : `package_handler.postPackagesStar()` - The Request `database.updateStars()` Returned `ok: false`.
- 1010 : `package_handler.postPackagesStar()` - The Request `database.updatePackageIncrementStarByName()` Returned `ok: false`.
- 1011 : `package_handler.postPackagesStar()` - The Request `database.getPackageByName()` Returned `ok: false`.
- 1012 : `package_handler.postPackagesStar()` - The Request `database.getPackageByName()` Returned `ok: false`.

### 2000

Error codes within `2000-2999` are error codes that relate to errors originated from Google Cloud modules or direct interactions with it.

### 3000

Error codes within `3000-3999` are error codes that relate to errors utility and helper modules throughout the codebase.

### 4000

Error codes within `4000-4999` relate to the catch all of other interactions on the codebase. And could relate to many different modules, but the documentation for your error code should provide insight.

- 4001 : `package_handler.deletePackagesName()` - The request `git.ownership()` Returned `ok: false`.
