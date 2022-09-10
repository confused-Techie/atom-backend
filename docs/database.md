This document aims to make the database schema public for developers.

The database itself is hosted on Digital Ocean, and the current schema is as below.

Database: 'pulsar-packages'

Tables:

## names 

| name | data type | details | content |
| --- | --- | --- | --- |
| name | text | Primary key of names | The text name of the package |
| pointer | uuid | Foriegn key referencing `packages` | references the package pointer |

## stars 

| name | data type | details | content |
| --- | --- | --- | --- |
| package | uuid | TDB type of key | references the packages pointer |
| user | uuid | TDB type of key | references the users UUID |

## users 

| name | data type | details | content |
| --- | --- | --- | --- |
| uuid | uuid | Primary key | UUID generated for the user, unique among all users |
| created_at | timestamp | '' | Epoch based timestamp of when the account was created |
| username | text | '' | Username of the user, initially could be linked to the user name used to create the account. But later may be modifiable |
| token | text | '' | A hashed version of their OAuth token, to allow comparison later on when verifying user login |
| avatar | text | '' | A URL that links to the avatar, in the future should be modifiable, but for now can link to the users gravatar |
| data | jsonb | '' | Spare object to allow additional storage, that currently may not be in use. |

## packages 

| name | data type | details | content |
| --- | --- | --- | --- |
| pointer | uuid | primary key | The UUID of the package. |
| name | text | '' | The text of the package name itself. |
| created | timestamp | '' | An epoch timestamp of when the package was created. | 
| updated | timestamp | '' | Epoch timestamp of when the package was last updated. |
| creation_method | text | '' | Text based message indicating how the package was created. |
| downloads | bigint | '' | Count of the downloads of the package |
| stargazers_count | bigint | '' | Count of the stars a package has received. Derived from the count from `stars` and updated when modified. |
| data | jsonb | '' | Rest of the packages data, containing the readme, and any other data that does not fit. Could even be updated, to be the detailed return of a pacakge, when that data is modified, to allow faster return during queries. |

## versions 

| name | data type | details | content |
| --- | --- | --- | --- |
| id | integer | primary key | Auto-Incrementing integer for each version of each package published. |
| package_id | uuid | foreign key  | UUID refernece to the `packages` uuid |
| status | enum | '' | Text representation of its status. Could currently use `latest`, `published` but really that data will currently be determined by the `id` of the field, since its auto incrementing nature, allows easy historical sorting. But once `beta` packages are supported, could indicate this. |
| semver | varchar(256) | '' | Actual semver of the new version. | 
| engine | jsonb | '' | The engine object from the package.json |
| license | varchar(256) | '' | The License of the specific package. |
| meta | jsonb | '' | A JSON blob of the full object. Including information that doesn't fit nicely in here, as well as the data here. |
