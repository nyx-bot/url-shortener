# url-shortener
Shorten links! (just a small service with no front-end, just an API that works with Nyx v2)

------

### Configuration

```js
{
    "baseURL": "awou.me", // this is the URL that you are hosting your URL shortener on -- do not prefix with http:// or https://, this is automatically handled.
    "port": 80, // what port should the server be active on? (note that the service was built under the intention of being ran behind a proxy -- SSL was NOT implemented)
    "apiKey": "Generate an API key for usage here", // the API key to be used for submitting new short links -- API will be public if this doesn't return a string.
    "config": {
        "allowUserIdentification": true, // if enabled, short URL creation requests will require a unique user identifier -- this allows the original requester to update a shortened link (vanity or not)
        "vanity": {
            "enabled": true, // self explanatory
            "expirationEnabled": true, // whether or not vanity links can expire
            "expiration": 30 // the time in days which vanity links expire
        },
        "default": {
            "enabled": true, // self explanatory
            "expirationEnabled": true, // whether or not regular short links can expire
            "expiration": 30 // the time in days which the regular short links expire
        }
    }
}
```

------

## Working with the API

If the authorization key is set in your config, you will need to authorize requests starting with `/api` using the `Authorization` header.

### Creating short URLs

Short URLs are established with a singular `POST` request to `/api/shorten`, but the parameters vary based on your configuration.

For example, if you have `allowUserIdentification` enabled, you must send a payload with a unique identifier in the `user` key. Otherwise, the parameter would be ignored.

*Sidenote: Vanity URLs must be longer than 5 characters to prevent collision with default URLs*

Example payload:

```json
{
    "destination": "https://nyx.bot/",
    "shortURL": "nyxsite",
    "user": "521881437360619560",
}
```

...this would return a response like so:

```jsonc
{
    "destination": "https://nyx.bot/",
    "shortURL": "nyxsite",
    "user": "521881437360619560",
    "expires": 1655328048352, // unix timestamp -- time of entry creation + amount of time it takes to expire
    "created": 1652735970078,
    "lastUpdated": 1652735970078
}
```

Or, if you were to omit the shortURL parameter, the service will create a 4-character link for you.

```json
{
    "destination": "https://nyx.bot/",
    "user": "521881437360619560",
}
```

...this would return a response like so:

```jsonc
{
    "destination": "https://nyx.bot/",
    "shortURL": "a7b9",
    "user": "521881437360619560",
    "expires": 1655328048352, // unix timestamp -- time of entry creation + amount of time it takes to expire
    "created": 1652735970078,
    "lastUpdated": 1652735970078
}
```

### Getting the information of a short URL

You can retrieve the information of a short URL with a simple `POST` request to `/api/find`. You can use this endpoint to search for multiple entries at once, or to pinpoint a singular entry -- this endpoint finds every match with the entries specified in your request's body.

Object entries are formatted the same way as it would be when creating a short URL -- the only difference is that finding results are organized in an array.

Example payload:

```json
{
    "shortURL": "nyxsite",
}
```

...this would return a response like so:

```jsonc
[
    {
        "destination": "https://nyx.bot/",
        "shortURL": "nyxsite",
        "user": "521881437360619560",
        "expires": 1655328048352, // unix timestamp -- time of entry creation + amount of time it takes to expire
        "created": 1652735970078,
        "lastUpdated": 1652735970078
    }
]
```

Or if you want to search everything posted from a single user:

```json
{
    "user": "521881437360619560",
}
```

This'd return every entry created by this user:


```jsonc
[
    {
        "destination": "https://nyx.bot/",
        "shortURL": "nyxsite",
        "user": "521881437360619560",
        "expires": 1655328048352, // unix timestamp -- time of entry creation + amount of time it takes to expire
        "created": 1652735970078,
        "lastUpdated": 1652735970078
    },
    {
        "destination": "https://nyx.bot/",
        "shortURL": "a7b9",
        "user": "521881437360619560",
        "expires": 1655328048352, // unix timestamp -- time of entry creation + amount of time it takes to expire
        "created": 1652735970078,
        "lastUpdated": 1652735970078
    }
]
```