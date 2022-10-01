# Welcome to atom-backend!

This project aims to solve a single issue, what happens to the Atom Package Repository when Atom is sunset?

Realistically once the sunset officially occurs Atom's existing backend will be shut down, and stop receiving requests.
Now this is actually already somewhat happening, with the backend getting more and more unstable. This means we need a replacement.

While this project is being made with the goal to eventually be moved to [`pulsar-edit`](https://github.com/pulsar-edit) that's not to say it's the only use.

I personally would love to see an ecosystem of new Atom Revivals appear after this sunset, with Pulsar being only one of them. And with that hope in mind here is `atom-backend` a new Backend Package Repository, that aims to replace Atom's seamlessly, doing everything we can to mirror the existing functionality **exactly**. From everything to the error messages returned, the format of data that is returned, the limitations, and the missing features I wish were there.

The intention is that one could take their existing Atom instance, and build from source by simply replacing the URL that Atom uses to contact it's backend. And after that you are up and running! To allow anyone from a new fork of Atom to use this code and run their backend, to someone that wants to keep using the discontinued Atom but still install packages.

## Message about the Future Location

Now like has already been said, this specific project is intended for Pulsar. What that means is the instance that is being hosted here, will eventually become incompatible with Atom, as it evolves to support features that Pulsar Users and Developers care about. This isn't to say it will happen overnight, but it's good to know that eventually it will. And when that happens this code will need somewhere new to live.

But, once this repo, that is `confused-Techie/atom-backend` has reached 100% feature parity with Atom's existing backend, it will stop receiving commits. That is, it will live at Version 1.0.0 forever, so that anyone else can use this existing codebase to get themselves up and running with their own instance of the Package Repository, and not have to worry about compatibility with anything else.

If you're goal is to get an instance of Atom's original Package Repository Backend up and running, feel free to look at the [guide](host-your-own.md).

## Message to Contributors

Now with all of that said, if you, a contributor, would like to advance and build on the base of Atom's Package Repository Backend, and want to create new features, or add things that haven't existed previously, that will exclusively happen on the Pulsar Based Backend Repository: [`pulsar-edit/package-backend`](https://github.com/pulsar-edit/package-backend). Since `confused-Techie/atom-backend` will **only** reach feature parity with Atom's existing Package Repository.

## Information on Development

Now with all of that out of the way, what makes Atom-Backend tick?

Well there's three major components:

### SQL Server

The data that's needed to have an effective Package Repository can be quite large, as in when the packages where originally migrated over there was a whapping `12,470` individual packages to migrate. This means that along with all of those individual packages, we also had to store individual users, and their stars, and each package's versions, and so on and so on.

So effectively the only way to manage this amount of data is via a SQL Server.

Now for the existing Instance of the Package Repository PostgreSQL was chosen as it's host. For it's speed, and familiarity with the developers.

### Compute Instance

Additionally this code needs somewhere to actually run right?

For this purpose Google's App Compute Engine was chosen, really due to it's native compatibility with Node and Express, and for the familiarity with the developers. That is the sole reason the configuration of the Backend is stored in an `app.yaml` file and has some values defined in there, that wouldn't be needed otherwise.

### Static Storage

Even with all of our major data in the SQL Server, there still comes a time to store small sets of data statically for easy access. For this the project uses Google's Cloud Storage. Really this stores some simple mostly static sets of data, such as the list of banned package names, and the list of featured packages (Since like the originally Atom Backend, this list is set manually. Even if that is not it's eventual goal).

### How these work together?

Well the SQL Server had its needed tables created, via the scripts that are available to view in the [`scripts` folder](https://github.com/confused-Techie/atom-backend/tree/main/scripts/database).

These scripts create five separate tables.
* `names` - Stores the names and the UUID of each package.
* `packages` - Stores the actual information about each package, that is the version agnostic data.
* `stars` - Stores the relation of stars from users to the packages.
* `users` - Stores the data of each unique user.
* `versions` - Stores the data for each version of each package. By far the largest of all tables, but contains loads of necessary information.

Then with the SQL Server setup, and our code hosted in the cloud, there's three major points of egress that happen within the codebase.

* `database.js` - Is the solve module that reaches out to the SQL Server, containing all functions and queries needed to get the correct and relevant information. Handling even the setup and teardown of the SQL Dependency itself.
* `storage.js` - The module that reaches out the Google's Cloud Storage. Retrieving the little amount of information needed there.
* `git.js` - Reaches out to GitHub to collect any information needed. Used mostly to confirm a user's ownership of a GitHub repo, or to collect the data needed to publish a package to the backend.

## Further Resources

Now that you have a general overview of what Atom-Backend is, who it's for, it's eventual goals, and how it works, here are some additional resources geared towards contributors.

* [Detailed Overview of the Database, it's schema and what data will reside within](https://github.com/confused-Techie/atom-backend/blob/main/docs/database.md)
* [The definition of the separate JSON Schemas in use throughout](https://github.com/confused-Techie/atom-backend/blob/main/docs/returns.md)
* [The general Queries that can be used to retrieve the above data](https://github.com/confused-Techie/atom-backend/blob/main/docs/queries.md)
* [How the Server Status Object Works](https://github.com/confused-Techie/atom-backend/blob/main/docs/bubbled-errors.md)
* [The JSDoc Generated Documentation of the Codebase](https://github.com/confused-Techie/atom-backend/blob/main/docs/JavaScript.md)
* [The JSDoc-Like Generated Documentation of the API Endpoints](https://github.com/confused-Techie/atom-backend/blob/main/docs/api.md)
* [The Generated Complexity Reports of the Codebase](https://github.com/confused-Techie/atom-backend/blob/main/docs/complexity-report.md)
* [How Global and Local Authentication Work](https://github.com/confused-Techie/atom-backend/blob/main/docs/auth.md)
* [A Possibly Outdated Overview of Documentation](https://github.com/confused-Techie/atom-backend/blob/main/docs/overview.md)
