# Endpoints

# Behavior

* Any HTTP Method that falls out of allowed methods returns the Site Wide 404 page.
* Query parameters are ignored if invalid and default to their respective defaults.
* Any type of failed authentication requests return the same missing auth response.
* Referencing Invalid Packages returns a "Not Found" Message
* Referencing Stars with Invalid Users/Packages returns "Not found" but this response will instead mirror the "Not Found" Message.
