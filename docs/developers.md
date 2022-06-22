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

* GetUsers(): "File Not Found", "Server Error"
* SetUsers(): "Server Error"
* GetPackagePointer(): "File Not Found", "Server Error"
* SetPackagePointer(): NOT IMPLEMENTED
* GetPackageByID(): "File Not Found", "Server Error"
* GetPackageByName(): "Server Error", "Not Found"
  - Bubbles from GetPackagePointer()
* GetPackagePointerByName(): "Not Found"
  - Bubbles from GetPacakgePointer()
* GetAllPackages():
  - Bubbles from GetPackagePointer()
  - Bubbles from GetPackageByID()
* GetPackageCollection():
  - Bubbles from GetPackageByName()
* SetPackage(): NOT IMPLEMENTED
* NewPackage(): NOT IMPLEMENTED

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
