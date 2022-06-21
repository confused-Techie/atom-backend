# Endpoints

# Behavior

* Any HTTP Method that falls out of allowed methods returns the Site Wide 404 page.
* Query parameters are ignored if invalid and default to their respective defaults.
* Any type of failed authentication requests return the same missing auth response.
* Referencing Invalid Packages returns a "Not Found" Message
* Referencing Stars with Invalid Users/Packages returns "Not found" but this response will instead mirror the "Not Found" Message.

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
