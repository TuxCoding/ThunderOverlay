# War Thunder OBS/Streaming overlay

![Project logo](https://github.com/user-attachments/assets/6b1a4727-3f88-4fd7-9ba9-22092f6dd238)

## Description

This project models a web source displaying [War Thunder](https://warthunder.com/) in-game events to be integrated into
[OBS](https://obsproject.com/) or similar streaming software. The primary focus is the integration of a visual kill feed
for squad members during matches. This could include an image of the vehicle helping people who are not familiar with all
the vehicle names.

You can see demonstration here (low quality to be hosted on GitHub):

[Kill overlay.webm](https://github.com/user-attachments/assets/f61f20fa-680b-49d0-852d-6f0a91345aa2)

### Features

-   Supports different vehicle types:
    -   Tanks
    -   Planes
    -   Helicopter
    -   Navy
    -   Nukes and drones too ;)
-   Multi language support
-   Sound effects
    -   Like [this](https://www.youtube.com/watch?v=e-ZLycuRLwc) for nukes

#### Further ideas

-   Events based on other `battle log` data:
    -   Awards
    -   Other player disconnects from battle/game a.k.a. deserted from battle
    -   Other damage events: fire, crit, severe damage
-   Sound effects if not possible with the game client itself
    -   Realistic sounds like from this awesome video [Battlefield 1](https://www.youtube.com/watch?v=J2JBmYt2Z44)
        -   Detection for events like following are possible would be possible with the webinterface:
            -   lost crew members
            -   marked enemies on map
            -   and more.
        -   However, we are required to re-create or find another source for these type of sounds as those above are copyrighted
    -   `Streamer` sounds
        -   "Dumb ways to die" if you fly into a wall (`selfkill`)
        -   "Wilhelm scream" if you lost a crew member
    -   Drive gear switching sound
    -   Similar to this great project: [WTRTI](https://github.com/MeSoftHorny/WTRTI/), but for ground vehicles

### Goals

The goal of this project is solely to provide visual appealing overlay for viewers. For example by displaying the vehicle
images for people not familiar with the vehicle names or displaying kills from squad members in a more prominent way.

This goal of this project is **never** to provide gameplay advantages over the vanilla behavior to the player.

## Building (development)

```shell
# Install dependencies
pnpm install
# Optional (Development): run the test suit
pnpm test
# Optional (Development): linting
pnpm lint
# Compile TypeScript to build the project
pnpm watchJS
```

## Requirements

* OBS 31+
    * Project uses CSS nesting which the browser inside OBS in older version doesn't support
* Use the full game client (don't have game quality set to minimal)
    * The web server accessible under `http://localhost:9111` from the game client is only provided by the full client version.

## Installation

Warning: the overlay needs to be refreshed after starting War Thunder at the moment.

1. Download the project
2. Open `src/settings.json` in a text editor and edit
<details>
<summary>
settings.json
</summary>

```json
{
    // required to read the battle log, available language identifiers can be retrieved from "src/mappings" folder based on the file names
    "lang": "german",
    // list of your squad and you and the corresponding avatar names
    "squad": [
        {
            // again username without squadron tag
            "username": "TuxCode",
            // Avatar name can be extracted from: https://warthunder.com/de/community/userinfo?nick=TuxCode
            // and opening getting the image url like opening it in a new tab
            "avatar": "cardicon_esport_drops"
        },
        {
            "username": "Wingman",
            "avatar": "cardicon_bundeswehr_infantryman"
        }
    ],
    // what should happen for certain game events
    "events": [
        {
            // <kill|firstblood|nuke>
            "event": "kill",
            // Either one of those <me|squad|all>
            "src": "squad",
            // what visual representation should be displayed
            "layout": "xyz"
        },
        {
            "event": "firstblood",
            "src": "me",
            "sound": [
                {
                    // sound file from src/assets/sound
                    "file": "xyz.opus",
                    // percentage value from 0-100%
                    "volume": 10
                }
            ]
        },
        {
            "event": "nuke",
            "src": "all",
            "sound": [
                // if multiple sounds are given, a random one will be played
                {
                    "file": "xyz.opus",
                    "volume": 10
                },
                {
                    "file": "xyz.opus",
                    "volume": 10
                }
            ]
        }
    ]
}
```
</details>

### Kill feed

1. Add browser source pointing to local file `NotificationFeed`
2. Set browser size to: `1200x400`
3. Move it to the correct position
    - I found horizontal centered and height `150px` a good fit below the mission objective and above a kill notification
4. Cut out at the bottom `200px` using transformation to make it slide out

<details>
<summary>
Earlier variants
</summary>

![2Avatars.avif](https://github.com/user-attachments/assets/e64fcdfb-8f27-4b25-b041-009b55e90593)

![Single line.avif](https://github.com/user-attachments/assets/e6c15087-ea43-4655-b6cf-b57c008c4ab9)
</details>

### Videos/GIF kill feed

For example for special events like bomb kills.

<details>
<summary>
Only a mockup:
</summary>

[Video killfeed.avif](https://github.com/user-attachments/assets/ff106699-cd60-4e57-93d8-7ea4d4802ba6)

</details>

### Team (idea only)

<details>
<summary>
Only a mockup:
</summary>

![Squad.avif](https://github.com/user-attachments/assets/9fe25aef-86f5-472b-b982-c49e394f61d6)

</details>

### Summary (idea only)

<details>
<summary>
Only a mockup:
</summary>

![Summary.avif](https://github.com/user-attachments/assets/66c67265-050d-4ce4-b393-03100e5626d8)

</details>

### Have any issues?

If you have any issues, you could check the logs for any errors.

Either:
1. Open the overlay in a standard webbrowser
    * Then open the developer tools - Press F12
    * Click on `console` to check for any errors.
2. Check the OBS logs
    * by opening OBS in a terminal or find the `obs-studio/logs` folder

## FAQ

### What doesn't work?

-   Squad members cannot be extracted automatically and have to be added manually
    -   The data from the webinterface indicates that this feature is only available for game chat (`mode` field).
        For kill activity the field is empty.
-   Count kill assists
    -   There is a streak award, but it would only be printed for `> 2` kills in a row
    -   We can detect critical damage from the battle log, but it could be unreliable to assume assists later.
-   Avatars cannot be downloaded on the fly i.e. for enemies
    -   There is only a limited set of avatars available
    -   However, we found no way to find out which of those is selected
    -   There is:
        -   The stats site, but it's bot protected [Stats](https://warthunder.com/de/community/userinfo?nick=TuxCode)
        -   Maybe the mobile app or in-game could provide an API endpoint, but this would be highly
            dependend on internal changes and not **approved** by `Gaijin`. Therefore it was not investigated further.
-   Which kind of ammunition was used
    -   This data is exposed in the in-game battle log, but not available in the web interface
    -   Well, we could use optical character recognition, but this would be overkill and a performance hit
    -   We could make a database of standard ammunition per tank, but it would be very time consuming and not always match the reality
-   Vehicle images could be mapped to multiple names and is therefore not precise
    -   The name `T-34` is mapped to multiple vehicles like `ussr_t_34_1941` or `ussr_t_34_1942`, so only a single image is used
    -   A few names are not unique across all vehicle types
        -   `English` has only two cases. Namely `Milan`->[`mirage_milan`(air), `fr_destroyer_aigle_class_milan`] and `Ariete`
        -   However, the maximum of those cases across all languages are only `6`
        -   It's possible to detect the destroyed vehicle type based on destroyed trigger word (e.g. `shot down` or `destroyed`), but this is dependend on
        damage source vehicle and won't help to verify the type of the destroyed vehicle

### How does it work?

It extracts the data from the battle log. This log is pulled from the the web server `http://localhost:9111` provided
by the War Thunder client itself. It parses the corresponding textual data about player and vehicle names. Then, the localized vehicle
names are translated back to vehicle identifiers using name mappings from the game client. This allows us to find the correct vehicle image,
because the game files uses those identifiers. Squad membership and player avatars are unfortunatly manually configurred, but are less likely to change.

The kill notification is then displayed using CSS animations on a transparant background. The smoke effect is shown with a video where
the green background is keyed out to add an alpha channel in order to make it transparant as well.

## Credits

-   Smoke video from: [kinwun@vecteezy](https://www.vecteezy.com/video/40944070-muzzle-flash-on-green-background)
    -   Production video: allowed for up to 1,000 $ for free
-   Fonts:
    -   Death icon in Team mockup [FontAwesome](https://fontawesome.com/icons/skull-crossbones?f=classic&s=solid)
    -   By the War Thunder wiki:
        -   Text font
        -   Foreign vehicle prefix
    -   Vehicle symbols (i.e. fighter and tank) from the webinterface itself
-   Vehicle images from the wiki or game client
-   APFDS shell from shooting range video created by War Thunder
