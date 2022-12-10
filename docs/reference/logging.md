# Logging Module

There is a logging module built into the Atom-Backend, and is the recommended way to output content to the user.

Previously the codebase used simple function calls like `logger.debugLog()` or `logger.warningLog()`, but that is now being replaced all to `logger.generic()`. Any further documentation unless otherwise specified relates to `logger.generic()`.

To call the Generic Logger will look something like this:

```javascript
const logger = require("logger.js");

const LOG_LEVEL = 1;
const MSG = "Hello World!";

logger.generic(LOG_LEVEL, MSG);
```

## Log Level

When calling the Generic Logger first ensure to determine a Log Level for the information you are providing.

The supported Log Levels, including their Number, and examples are below.

| Log Level | Name | Example |
| --- | --- | --- |
| 1 | Fatal | An error so serious that the system is in an unrecoverable state, and will likely be shut down or crash. |
| 2 | Error | An error occurred where a critical part of the code has failed, and will return an error to the user. Or the system may attempt to recover, by avoiding this section of code entirely. |
| 3 | Warning | Something has failed within the code, but doesn't imply a critical component has failed. An error still may be returned to the end user, but won't necessarily be returned to the next user. |
| 4 | Information | Helpful information that should always be provided to those reviewing the logs. |
| 5 | Debug | More granular helpful information, that would likely only be needed when operating in a development environment. |
| 6 | Trace | Extremely fine levels of detail. More than would be needed, except when attempting to determine the behavior of every single step of the program. |

## Message

When providing a `message` to the `logger.generic()` it's recommended to try and ensure this is a standard string, or a template literal that will output a standard string.

## Meta

Lastly a third argument is accepted for `logger.generic()` that allows to specify type of log output, as well as extra data that will be included.

* `default`: The `meta.type` `default` is what is applied to all logs if not specified. And will craft a log that just includes the message and log level you have specified.

The two below code blocks are equivalent.

```javascript
const logger = require("logger.js");

logger.generic(1, "A fatal error or something!");
```

```javascript
const logger = require("logger.js");

logger.generic(1, "A fatal error or something!", { type: "default" });
```

---

* `error`: The `meta.type` `error` can be specified, to try to ensure that your log will include as many details as possible about an error that was thrown elsewhere in the code. If wished, you can create a new error manually that will be output here. If `meta.type` `error` is specified, you must also include an `err` object within our `meta` object, which should be the actual error message output.

```javascript
const logger = require("logger.js");

try {
  // Do something that might fail.
} catch(err) {
  logger.generic(2, "Our something has failed!", { type: "error", err: err });
}
```

```javascript
const logger = require("logger.js");

// Something has failed here, that didn't throw an Error.
// But we still want to try and collect information like Filename and line number of where occurred.

let logErr = new Error("Something bad happened here.");

logger.generic(2, "Whoops!", { type: "error", err: logErr });
```

If possible `error` types will additionally add the following fields to the log, but should fail gracefully if they don't exist.

- Error Name
- Error FileName
- Error LineNumber
- Error Cause
- Error as a String

---

* `object`: The `meta.type` `object` can be used to ensure that an object is properly viewable when in a log message. Using this type will require the additional specification of `meta.obj` which should be the object itself you want to show.

```javascript
const logger = require("logger.js");

let obj = functionToBuildObject();

if (!obj.ok) {
  // Our returned Server Status Object, isn't valid and has failed somehow.
  logger.generic(2, "Couldn't get our data!", { type: "object", obj: obj.content });
}
```

---

* `http`: The `meta.type` `http` can be used to show HTTP details along with your log. This isn't intended to handle purely logging HTTP Data, but instead when another type of log would benefit from displaying HTTP information.
