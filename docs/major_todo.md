# Major Todo

This is a collection/list of all functions/methods of the Backend API, with their status of completion listed.

🏁 : Finished
⚒ : In Progress, or partially completed
🆘 : Hasn't been started.
🧪 : Needs Testing

### Main.js

* ALL endpoints need additional testing, as the underlying functions are seeing continuous change: 🧪

* GET /api/packages : 🏁
* POST /api/packages : ⚒
* GET /api/packages/search : 🏁
* GET /api/packages/:packageName : 🏁
* DELETE /api/packages/:packageName : 🆘
* POST /api/packages/:packageName/star : 🏁
* DELETE /api/packages/:packageName/star : 🏁
* GET /api/packages/:packageName/stargazers : 🏁
* POST /api/packages/:packageName/versions : 🆘
* GET /api/packages/:packageName/versions/:versionName : 🏁
* GET /api/packages/:packageName/versions/:versionName/tarball: 🆘
* DELETE /api/packages/:packageName/versions/:versionName : 🆘
* GET /api/users/:login/stars : 🏁
* GET /api/stars : 🏁
* GET /api/updates : 🆘

### Query.js

* page(): 🏁
* sort(): 🏁
* dir(): 🏁
* query(): 🏁
* engine(): 🏁
* repo(): 🏁
* tag(): 🏁
* rename(): 🏁
* pathTraversalAttempt(): 🏁

### Collection.js

* Sort(): 🏁
* Direction(): 🏁
* POFPrune(): 🏁
* POSPrune(): 🏁
* SearchWithinPackages(): 🏁
* EngineFilter(): 🆘

### Users.js

* VerifyAuth(): 🏁
* GetUser(): 🏁
* AddUserStar(): 🏁
* RemoveUserStar(): 🏁
* Prune(): 🏁

### Data.js

* GetUsers(): 🏁
* SetUsers(): 🏁
* GetPackagePointer(): 🏁
* SetPackagePointer(): 🆘
* GetPackageByID(): 🏁
* GetPackageByName(): 🏁
* GetPackagePointerByName(): 🏁
* GetAllPackages(): 🏁
* GetPackageCollection(): 🏁
* StarPackageByName(): 🏁
* UnStarPackageByName(): 🏁
* SetPackageByID(): 🏁
* NewPackage(): 🆘

### Git.js

* VerifyAuth(): 🆘
* Ownership(): 🆘

### Config.js

* GetConfig(): 🏁

### Search.js

* levenshtein(): 🏁
* vlEditDistance(): 🏁
* levenshteinWSDM(): 🏁
* lcs(): 🏁
* lcsTraceBack(): 🏁

### Error.js

* NotFoundJSON(): 🏁
* SiteWide404(): 🏁
* MissingAuthJSON(): 🏁
* ServerErrorJSON(): 🏁
* UnsupportedJSON(): 🏁

### Logger.js

* HTTPLog(): 🏁
* ErrorLog(): 🏁
* WarningLog(): 🏁
* InfoLog(): 🏁
