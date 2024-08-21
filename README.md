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

### Notification feed

1. Add browser source pointing to local file `NotificationFeed`
2. Set browser size to: `1200x400`
3. Move it to the correct position
    * I found horizontal centered and height `150px` a good fit below mission object and above a kill notification
4. Cut out at the bottom `200px` using transformation to make it slide out of nowhere

### Summary

### Team
