# War Thunder OBS/Streaming overlay

## Description

This project models a web source displaying [War Thunder](https://warthunder.com/) in-game events to be integrated into
[OBS](https://obsproject.com/) or similar streaming software. The primary focus is the integration of a kill feed for squad
members during match. You can see demonstration here:

[Kill overlay.webm](https://github.com/user-attachments/assets/f61f20fa-680b-49d0-852d-6f0a91345aa2)

### Features

* Supports different vehicle types:
    * Tanks
    * Planes
    * Helicopter
    * Ships
* Detects nukes
* Clean up quirky file names like
    * carriage returns
    * cyrillic names
    * etc.

#### Further ideas

* Events based on other battle log data:
    * Awards
    * Other player disconnects from battle/game
    * Other damage events: fire, crit, severe damage
* Sound effects if not possible with the game client itself
    * Realistic sounds like from this awesome video [Battlefield 1](https://www.youtube.com/watch?v=J2JBmYt2Z44)
        * Detection for events like following are possible would be possible with the webinterface:
            * lost crew members
            * marked enemies on map
            * and more.
        * However, we are required to re-create or find another source for these type of sounds as those above are copyrighted
    * "Streamer" sounds
        * "Dumb ways to die" if you fly into a wall (`selfkill`)
        * "Wilhelm scream" if you lost a crew member
    * Drive gear switching sound
    * etc.
    * Similar to this great project: [WTRTI](https://github.com/MeSoftHorny/WTRTI/), but for ground vehicles

### Goals

The goal of this project is solely to provide visual appealing overlay for viewer. For example by displaying the vehicle
images for people not familiar with the vehicle names or display squad kills in a more prominent way.

This goal of this project is **never** to provide gameplay advantages over the vanilla behavior to the player.

## Building (development)

```shell
# Install dependencies
pnpm install
# Optional (Development): run the test suit
pnpm test
# Optional (Development): linting
pnpm lint
# Compile TypeScript
pnpm watchJS
```

## Installation

Warning: the overlay needs to refreshed after starting War Thunder at the moment.

### Notification feed

1. Add browser source pointing to local file `NotificationFeed`
2. Set browser size to: `1200x400`
3. Move it to the correct position
    * I found horizontal centered and height `150px` a good fit below mission object and above a kill notification
4. Cut out at the bottom `200px` using transformation to make it slide out of nowhere

### Team

<details>
<summary>
Only a mockup:
</summary>

![Squad.avif](https://github.com/user-attachments/assets/9fe25aef-86f5-472b-b982-c49e394f61d6)
</details>

### Summary

<details>
<summary>
Only a mockup:
</summary>

![Summary.avif](https://github.com/user-attachments/assets/66c67265-050d-4ce4-b393-03100e5626d8)
</details>

## Ideas

* Make squadron tag and/or player name toggleable
* Multi language support
* Multiple layouts
    * User selectable
    * Type based like: vehicle, damage source, etc.

## FAQ

### What doesn't work?

* Squad members cannot be extracted automatically and have to be added manually
    * The data from the webinterface indicates that this feature is only available for game chat (`mode` field)
* Count kill assists reliably
    * There is a streak award, but it would only be printed for > 2 kills in a row
    * We can detect critical damage from the battle log, but it doesn't seem to be reliable. Maybe you could proove it otherwise?
* Avatars cannot be downloaded on the fly i.e. for enemies
    * There is a limited amount of avatars you can choose
    * However, we found no way to find out which of those is selected
    * There is:
        * The stats site, but it's bot protected [Stats](https://warthunder.com/de/community/userinfo?nick=TuxCode)
        * Maybe the mobile app or in-game could provide an API endpoint, but this would be highly
        dependend on internal changes and not **approved** by `Gaijin`. Therefore it was not investigated further.
* Which kind of ammunition was used
    * This data is exposed in the in-game battle log, but not available in the web interface
    * Well, we could use optical character recognition, but this would be overkill and a performance hit
    * We could make a database of standard ammunition per tank, but it would be very time consuming and not always true
* Vehicle images could be mapped to multiple names and is therefore not precise
    * The name `T-34` is mapped to multiple vehicles like `ussr_t_34_1941` or `ussr_t_34_1942`, so only a single image is mapped
    * A few names are not unique across all vehicle types
        * `English` has only two cases. Namely `Milan`->[`mirage_milan`(air), `fr_destroyer_aigle_class_milan`] and `Ariete`
        * The maximum of those cases across all languages are only `6` however
        * It's possible to detect the destroyed vehicle type based on destroyed trigger word (e.g. `shot down` or `destroyed`). Although this is not possible for damage source vehicle, because a tank or aircraft could destroy it and the trigger would be the same.

### The overlay doesn't work with the minimal client

The web server from the game client is only provided by the full client version.

### How does it work?

It extracts the data from the battle log. This log is pulled from the the web server `http://localhost:9111` provided
by the War Thunder client itself. It parses the corresponding raw data to player and vehicle names and then looks up
the corresponding image data provided by the wiki.

## Credits

* Smoke video from: [kinwun@vecteezy](https://www.vecteezy.com/video/40944070-muzzle-flash-on-green-background)
    * Production video: allowed for up to 1,000 $ for free
* Fonts:
    * Death icon in Team mockup [FontAwesome](https://fontawesome.com/icons/skull-crossbones?f=classic&s=solid)
    * By the War Thunder wiki:
        * Text font
        * Foreign vehicle prefix
    * Vehicle symbols (i.e. fighter and tank) from the webinterface itself
* Vehicle images from the wiki or game client
* APFDS shell from shooting range video created by War Thunder
