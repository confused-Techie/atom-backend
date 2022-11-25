Since so many terms are thrown around in the documentation and comments within the codebase below is a short glossary to ensure everyone is talking about the same thing.

* Original Atom Server / Atom.io Server: The Backend Package Repository Server that was built, maintianed, and sunset by Atom/GitHub/Microsoft. This server we have no access to, and has no source available. We are only able to learn about it by interactions with it, and the interactions baked into the source code of tools that rely on it.
* Atom Backend / Pulsar Backend: The new Open Source creation of the Package Repository Server. Where within Pulsar envirvonments it's refferred to simply as the Pulsar Package Repository.
* Server Status Object: The object most modules return within in the codebase, more details are [available](./bubbled_errors.md).
* Package Object Full: The largest form of Package data returned to end users, more details are [available](./returns.md#packageobjectfull).
* Package Object Short: The most common form of Package data returned to end users, more details are [available](./returns.md#packageobjectshort).
* Package Object Mini: The smallest possible return of Package data returned to end users, more details are [available](./returns.md#packageobjectmini).
* User Object: The only form of data returned to end users that contains user data, more details are [available](./returns.md#userobject).
* Bubbled Errors: The act of letting an error be easily caught and letting it bubble up from lower level modules back to the end users to ensure they see a proper report of what went wrong, more details are [available](./bubbled_errors.md).
