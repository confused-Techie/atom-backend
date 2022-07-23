# Quick Notes (Needing Organization)

Its a good thing to note, that essentially any time you request data programmatically you will get an object back.

This object contains some values,

* ok: A boolean, indicating if the request for data is okay, true if everything is fine, false otherwise.
* content: The content of the request you need. The content should never be a nested content object.
* short: Will only be present if ok is false. Contains a short string to indicate why the request is not okay.

'Short' Should only end up being a few very generic errors, with content then including the exact error message for server side logging.

Possible values of Short:

* "Server Error" to indicate that an error has occurred, and something didn't happen right. To which the server can report back an error.
* "Not Found" to indicate that whatever resource has been requested is missing, or not findable given the information.
* "Bad Auth" to indicate that the auth provided has failed to be validated.
* "File Not Found" to indicate that whatever file was intended to be read, is missing.

### Why?

This is implemented as a method of 'bubbling up' any errors, to let the server respond to the user accordingly.

### Expected Possible Returns:

#### Data.js

* GetUsers(): 
  - Bubbles from resources.Read()
  - Bubbles from resources.Write()
* GetPackagePointer(): 
  - Bubbles from resources.Read()
* GetAllPackages(): "Not Found"
  - Bubbles from data.GetPackagePointer()
  - Bubbles from getNew()
* GetPackageByID(): 
  - Bubbles from resources.Read()
* SetUsers():
  - Bubbles from resources.Write()
* SetPackagePointer():
  - Bubbles from resources.Write()
* SetPackageByID():
  - Bubbles from resources.Write()
* RemovePackageByPointer(): "Server Error"
* RestorePackageByPointer(): "Not Found"
* RemovePackageByName(): "Not Found", "Server Error"
  - Bubbles from data.GetPackagePointer()
  - Bubbles from data.RemovePackageByPointer()
* GetPackageByName(): "Server Error", "Not Found"
  - Bubbles from data.GetPackagePointer()
* GetPackagePointerByName(): "Not Found"
  - Bubbles from data.GetPackagePointer()
* GetPackageCollection(): 
  - Bubbles from data.GetPackageByName() (EXCEPT Not Found)
* StarPackageByName():
  - Bubbles from data.GetPackagePointerByName()
  - Bubbles from data.GetPackageByID()
  - Bubbles from data.SetPackageByID()
* UnStarPackageByName(): "Not Found"
  - Bubbles from data.GetPackagePointerByName()
  - Bubbles from data.GetPackageByID()
  - Bubbles from data.SetPackageByID()
* SetPackageByName(): "Not Found"
  - Bubbles from data.GetPackagePointer()
  - Bubbles from data.SetPackageByID()
* NewPackage(): "Server Error"
  - Bubbles from data.GetPackagePointer()
  - Bubbles from data.SetPackagePointer()

#### Users.js

* VerifyAuth(): "Bad Auth"
  - Bubbles from GetUsers()
* GetUser(): "Not Found"
  - Bubbles from GetUsers()
* AddUserStar():
  - Bubbles from GetUser()
  - Bubbles from data.GetUsers()
  - Bubbles from data.SetUsers()
* RemoveUserStar(): "Not Found"
  - Bubbles from GetUser()
  - Bubbles from data.GetUsers()
  - Bubbles from data.SetUsers()

#### Resources.js

* Read(): 
  - Bubbles from resources.readFile()
* readFile(): "File Not Found", "Server Error"
* Write():
  - Bubbles from resources.writeFile()
* writeFile(): "Server Error"
* Delete(): "Server Error"

#### Git.js

* Ownership(): "No Repo Access", "Server Error"
* CreatePackage(): "Bad Repo", "Bad Package", "Server Error"
* doesUserHaveRepo(): "No Access", "Failed Request", "No Auth", "Server Error"
