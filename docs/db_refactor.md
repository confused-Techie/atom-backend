This is a rough view of the current state of the backend:

* server.js : Starts up the server, and begins listening, passing 
              any endpoints to main.js
* main.js : Does the actual route handling, which depending on the 'root slug' 
            will then hand off the a few different files.
            
server.js
  -> main.js
    => package_handler.js
    => star_handler.js
    => theme_handler.js
    => user_handler.js
    => update_handler.js
    => star_handler.js
    => oauth_handler.js
        ||
        common_handler.js
    
All the above handlers then share very commonly usage, with common_handler.js

Generally then the rest of the modules are broken up by usage, some far more used than others.

So if we were to try and lay out how it was organized:

# Server Handling / Routes:

server.js -> main.js

# Endpoint Handlers:

common_handler.js
oauth_handler.js
package_handler.js
star_handler.js
theme_handler.js
update_handler.js
user_handler.js

# Utility Functions 

logger.js - Logged messages to console.
error.js - Defined error returns from endpoints.
utils.js - Super basic utility library.
config.js - Parsed and retrieved server side configuration.
debug_utils.js - Super basic debugging utility library.

# Complex Function Modules 

collection.js - Packaged, and processed large collections of JSON packages.
git.js - Collected data from GitHub to create new packages.
query.js - Parsed and checked query parameters.
search.js - Handled search algorithms against passed JSON data.

# Handling Parsing and retrival of data 

data.js - The major endpoint to any raw data handling, and more than raw data handling.
users.js - The major endpoint to any raw data handling for users.

# Handling File System Operations

resources.js - Purely handles reading, writing, deleting from disk
