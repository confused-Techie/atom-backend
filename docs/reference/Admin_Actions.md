# Admin Actions

When you consider that most backend services are a black box of code and decision making, the Pulsar Backend aims to change this. Aims to be as open and transparent as possible.

With that said this document will serve as the ongoing history of administrative actions that must be taken against the backend.

## 2022 - December 14

### Blocked Access to a specific Set of IP Addresses

After it came to our attention that a specific user was hammering our servers on a specific couple of endpoints we had to block their access to the backend.

This user had requested the two endpoints over 6,000 times over 4 days. This behavior had not been observed by any other users, and considering the server hosting costs are handled entirely by the Pulsar Team and community donations, this simply wasn't an expense that could be afforded.

Considering this their access was completely cut off from the backend, to prevent this abuse of our systems.
