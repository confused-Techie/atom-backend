# Endpoints

# Behavior

* Any HTTP Method that falls out of allowed methods returns the Site Wide 404 page.
* Query parameters are ignored if invalid and default to their respective defaults.
* Any type of failed authentication requests return the same missing auth response.
* Referencing Invalid Packages returns a "Not Found" Message
* Referencing Stars with Invalid Users/Packages returns "Not found" but this response will instead mirror the "Not Found" Message.

# Data

After additional investigation, some things have come to light. Mainly that the package data has two forms depending on how it is accessed.

## Package Object

* This is the package object when it is accessed every single way except via the details endpoint.

### Schema:

```json

```

## Package Object Full

* This is the package object when it is accessed only via the details endpoint.

### Schema:

```json

```

## Login Object

* This is a rather simplistic format, and is the only time users are returned, this is the format they are saved to a package when starring.

### Schema:

```json
[
  {
    "login": "username"
  },
]
```

## User Object

* This is the format of each user within the server, this data is not publicly accessed. The only aspect that will be returned is the stars array.

### Schema:

```json
{
  "userName": {
    "name": "userName",
    "atom_token": "valid_atom_token",
    "github_token": "valid_github_access_token",
    "stars": [
      "packageName", "packageName2"
    ],
    "published_packages": [],
    "published_themes": [],
    "created_at": "date_time"
  }
}
```

# Authentication Research

When you go to login to Atom.io it redirects to OAuth Authorization within Github.

After doing so you are given an API token within Atom.io that would allow you to preform authenticated requests.

If important this code begins with '_' and contains alpha-numeric characters, but no additional special characters.

Within Github afterwards this application shows up under

Settings > Integrations > Applications > Authorized OAuth Apps

Here we can see the permissions that Atom.io has.

Read org and team membership, read org projects.

Seems its the least access needed to verify ownership of the repository field within packages. Which may be all that this is.

Looking at Githubs available scopes:


* read:org : Read-only access to organization membership, organization projects, and team membership.

When requesting OAuth Access from Github, after the OAuth flow you obviously only receive your access_token which be default starts with 'gho_' so we know the access token in Atom.io is not the basic code from Github, but likely with you Atom.io access token, helps them find your access_token from github, meaning both need to be saved.

It seems we could use 'List repositories for the authenticated user'
https://docs.github.com/en/rest/repos/repos#list-repositories-for-the-authenticated-user

To get a list of every repo the user has access too, and if the repo within the package.json they are linking to, is in this list, allow changes

Otherwise it seems that users have more data than originally marked:
* Published Packages
* Published Themes
* Stared Packages
* Atom.io Token
* Github Access Token


# Auth

There will be two levels of Auth. When an account is created, it will be done so with Github.

Which gives use the profile icon, as well as a Github User token, and the user name.

With this we store the gh user access token, and from it generate the atom token.

Storing both we now have our two tokens, and can define our auth.

Requests to data forms within Atom.io ONLY will rely on the atom token, meaning to star another package, or unstar all rely on the atom auth,

But once a user goes to publish or update the actual package they provide the atom token, which is used to grab the gh token, which can then be used to ensure they have access to the repo they are attempting to modify.
