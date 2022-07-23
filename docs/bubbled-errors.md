Throughout the codebase, generally when ever interacting with a module, it should be expected that you will received a `Server Status Object` back, there are few exceptions to this. The reason being is it allows easy checks for success and allows an error message to bubble up from a core module like `resources.js` up to the user, to properly report what has happened or gone wrong.

## The Schema:

```
{
  ok: 'boolean true|false',
  short: 'A small set of predefined short messages, of why a failure occured. Keep in mind that if `ok` is true, and the request was successful the `short` key WILL NOT exist.',
  content: 'Either the content that was originally requested, or a more detailed error of what went wrong. That should never be checked directly as its content will depend on whats happened and is intended to be logged.'
}
```

Keeping that in mind, in general you shouldn't have to worry about these bubbled messages, as its planned to let any unsuccessful status be handled by `common_handler.HandleError` but if they are needed, this documentation here will try to keep up to date, and what errors are returned, and who they could be returned by.

## The Who, the What, the Where 

#### "File Not Found"
* Why this happens: Should be returned when the server attempts to read a file, that it can't find.
* What should happen: Generally this should return a "Server Error".

#### "Server Error"
* Why this happens: A Multide of reasons. Really anytime something unexpected happens. With no safe way to respond.
* What should happen: This should return a "Server Error"

#### "Bad Auth" 
* Why this happens: Happens when a user fails to authenticate with the provided token.
* What should happen: Should return "Auth Fail"

#### "Not Found"
* Why this happens: The requested resources was unable to be found.
* What should happen: Likely should return "Not Found", but could be "Server Error" depending on context.

#### "No Repo Access"
* Why this happens: The user has requested to make changes to a repo they do not own.
* What should happen: In the future may want to inform of this behavior exactly, but for now should return "Auth Fail"

#### "Bad Repo"
* Why this happens: The request for a repo has failed, or the repo itself doesn't exist.
* What should happen: Should return "Bad Repo JSON"

#### "Bad Package"
* Why this happens: Means the package at the specified repo on GitHub is incorrecct. Either bad JSON, or incompatible for pulsar.
* What should happen: Should return "Bad Package JSON"
