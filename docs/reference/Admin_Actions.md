# Admin Actions

When you consider that most backend services are a black box of code and decision making, the Pulsar Backend aims to change this. Aims to be as open and transparent as possible.

With that said this document will serve as the ongoing history of administrative actions that must be taken against the backend.

## 2022 - December 14

### Blocked Access to a specific Set of IP Addresses

After it came to our attention that a specific user was hammering our servers on a specific couple of endpoints we had to block their access to the backend.

This user had requested the two endpoints over 6,000 times over 4 days. This behavior had not been observed by any other users, and considering the server hosting costs are handled entirely by the Pulsar Team and community donations, this simply wasn't an expense that could be afforded.

Considering this their access was completely cut off from the backend, to prevent this abuse of our systems.

### 2022 - December 9

Modified some packages data on the backend database, due to incompatibility with the new database constraints.

- `totaljs/atom-syntax` - Removed `v0.1.2`
- `pkrll/doc-green-syntax` - Removed `1.0`
- `Cronos87/atom-laravel` - Removed `0.1`
- `ReeSilva/atom-homestead` - Removed `v0.10.0`
- `kraih/atom-perltidy` - Removed `0.1`, `0.2`, `0.3`
- `swdotcom/swdc-atom` - Removed Package 
