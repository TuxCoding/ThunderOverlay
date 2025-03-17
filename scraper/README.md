# War Thunder scraping tool

## Description

Here lies the toolset for extracting assets and file name mappings from game files and wiki.
It's only tool, so don't expect perfect code, tests or concurrent processing.

### Web scraping

An old version used the scrape the War Thunder wiki for name translations. However, it showed that these files
are not translated to the local languages and therefore not precise enough. In [Update file name mappings](#update-file-name-mappings)
is a lot better way documented.

#### Images

To download the images at once you can use this tool and then download the list images. However, those files are
only distributed in `.png`. In [Adding vehicle images](#adding-vehicle-images) you use the files part of the game
client provided in an optimized `.avif` format.

```shell
wget -v -e robots=off -D encyclopedia.warthunder.com -N --convert-links --wait 4.2 -i images.list
```

### Update file name mappings

The [wt-tools](https://github.com/kotiq/wt-tools) project can be used to extract game files and is cross-platform.
The relevant file for this project is the `units.csv` file. This file is part of `lang.vromfs.bin`. Therefore:

1. Unpack the `vromfs.bin` file
>vromfs_unpacker lang.vromfs.bin
2. Copy the units.csv file into this folder
3. Then you can run the go scraper to update mappings if necesseary

#### Adding vehicle images

The vehicles are located inside `tex.vromfs.bin`. There you can find `tanks`, `ships` and `aircrafts` (incl. helicopter).
Unpack the file similar to above and copy the files into `src/assets/img/VEHICLE_TYPE/.`. So for example that you have:
`src/assets/img/vehicles/ground/bt_5.avif`
