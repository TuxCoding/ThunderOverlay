# War Thunder OBS/Streaming overlay

## Description

## Building

>
# Install dependencies
pnpm install
# Compile typescript
pnpm esbuild
# Optional (Development): run the test suit
pnpm jest
# Optional (Development): linting
pnpm lint

## Installation

Warning: the overlay needs to refresh after starting War Thunder at the moment.

### Notification feed

1. Add browser source pointing to local file `NotificationFeed`
2. Set browser size to: `1200x400`
3. Move it to the correct position
    * I found horizontal centered and height `150px` a good fit below mission object and above a kill notification
4. Cut out at the bottom `200px` using transformation to make it slide out of nowhere

### Summary

Only a mockup

### Team

Only a mockup

## Ideas

* Make squadron tag and/or player name toggleable

## FAQ

### What doesn't work?

* Squad members cannot be extracted automatically and have to be added manually
    * The webinterface has indication that this feature was available or planned at least (`mode`)
* Avatars cannot be downloaded on the fly i.e. for enemies
    * There is only a limited amount of avatars you can choose
    * However, we found no way to find out which of those is selected
    * There is:
        * The stats site, but it's bot protected [Stats](https://warthunder.com/de/community/userinfo?nick=TuxCode)
        * Maybe the mobile app or in-game could provide an endpoint, but this would be highly
        dependend on internal changes and not **approved** by `Gaijin`
* Which kind of ammunition was used
    * This data is exposed in the in-game, but not available in the web interface
    * Well, we could use optical character recognition, but this would be overkill and a performance hit
    * We could make a database of standard ammunition per tank, but it would be very time consuming

### The overlay doesn't work with the minimal client

The web server from the game client is only provided by the full client version.

### How does it work?

It extracts the data from the battle log. This log is pulled from the the web server `http://localhost:9111` provided
by the War Thunder client itself. It parses the corresponding raw data to player names and vehicles and then looks up
the corresponding image data provided by the wiki.
