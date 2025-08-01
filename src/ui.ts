/**
 * Notification displaying from destroy msg
 */
export interface Notification {
    /** killer name with clan */
    readonly killer: string;
    /** avatar location */
    readonly killerAvatar: string;
    /** killer vehicle location */
    readonly killerTankIcon: string;

    /** killed player name with clan */
    readonly killed: string;
    /** destroyed vehicle location */
    readonly destroyedTank: string;
}

let notificationQueueRunning = false;

/**
 * Trigger the notification loop if not running
 */
export function startNotificationLoop() {
    // loop entry start loop if not running
    if (notificationQueueRunning) {
        // already running
        return;
    }

    notificationQueueRunning = true;
    console.debug("Starting notification loop");
    notificationLoop();
}

const NOTIFICATION_SHOW_INTERVAL = 10 * 1_000;

/** Queue of not delivered notifications */
const notificationQueue: Notification[] = [];

export function addNotification(notification: Notification) {
    notificationQueue.push(notification);

    if (notificationQueue.length !== 0) {
        // trigger the notification runtime if not running yet
        startNotificationLoop();
    }
}

/**
 * Runtime loop for showing the next notification
 */
function notificationLoop() {
    console.debug("Notification loop iteration");

    const lastNot = notificationQueue.pop();
    if (!lastNot) {
        // do not schedule another iteration if there are no new entries
        notificationQueueRunning = false;
        return;
    }

    console.debug("Showing notification: ", lastNot);
    showNotification(lastNot);
    setTimeout(notificationLoop, NOTIFICATION_SHOW_INTERVAL);
}

// HTML ids
const NOTIFICATION_CONTAINER_ELEMENT = "notification";
const KILLER_TEXT_ELEMENT = "killer-name";
const KILLED_TEXT_ELEMENT = "killed-name";

const KILLER_AVATAR_ELEMENT = "killer-avatar";
const KILLER_VEHICLE_ELEMENT = "killer-tank";

const DESTROYED_VEHICLE_ELEMENT = "destroyed-tank";

// HTML tags
const VIDEO_HTML_TAG = "video";
const IMG_HTML_TAG = "img";

// Timings
const IN_SECONDS = 2;
const SHOW_SECONDS = 8;
const OUT_SECONDS = 2;

const FIRE_START_EARLY = 300;

/**
 * Show notification contents to the user
 * @param notification notification content
 */
export function showNotification(notification: Notification) {
    /**
     * Get type safe html image element
     * @param id html id
     * @returns html image
     */
    function getImageElement(id: string): HTMLImageElement | null {
        // drops the usuage of unchecked type casting
        return document.getElementsByTagName(IMG_HTML_TAG).namedItem(id);
    }

    const container = document.getElementById(NOTIFICATION_CONTAINER_ELEMENT);

    const killerEl = document.getElementById(KILLER_TEXT_ELEMENT);
    const killedEl = document.getElementById(KILLED_TEXT_ELEMENT);

    const killerAvatar = getImageElement(KILLER_AVATAR_ELEMENT);
    const killerTank = getImageElement(KILLER_VEHICLE_ELEMENT);

    const destroyedTank = getImageElement(DESTROYED_VEHICLE_ELEMENT);
    if (
        !container ||
        !killerEl ||
        !killedEl ||
        !killerAvatar ||
        !killerTank ||
        !destroyedTank
    ) {
        console.warn("HTML elements not found");
        return;
    }

    // update document
    killerEl.textContent = notification.killer;
    killedEl.textContent = notification.killed;

    // images
    killerAvatar.src = notification.killerAvatar;

    killerTank.src = notification.killerTankIcon;
    destroyedTank.src = notification.destroyedTank;

    // delay the pop by one ms to load the image first
    setTimeout(
        () => popup(container, IN_SECONDS, SHOW_SECONDS, OUT_SECONDS),
        1,
    );
}

// HTML animation classes
const FIRING_ANIMATION_CLASS = "ammu-firing";
const POP_IN_ANIMATION_CLASS = "pop-in";
const POP_OUT_ANIMATION_CLASS = "pop-out";

// HTML Effect ids
const AMMUNITION_ELEMENT = "ammunition";
const SMOKE_VIDEO_ELEMENT = "smoke";

/**
 * Start popup animation for the container
 * @param container html div element of the notification
 * @param startSec animation showing seconds
 * @param showSec showing seconds without any animation
 * @param endSec disappear animation
 */
function popup(
    container: HTMLElement,
    startSec: number,
    showSec: number,
    endSec: number,
) {
    // reset the last animation position
    const ammunitionEl = document.getElementById(AMMUNITION_ELEMENT);
    ammunitionEl?.classList.remove(FIRING_ANIMATION_CLASS);

    // activate show animation and make it visible
    container.classList.remove(POP_OUT_ANIMATION_CLASS);
    container.classList.add(POP_IN_ANIMATION_CLASS);
    container.style.animationDuration = `${startSec}s`;

    // start fire animation
    setTimeout(() => onShow(ammunitionEl), startSec * 1_000 - FIRE_START_EARLY);

    // start hide animation after showed it for showSec
    setTimeout(() => hide(container, endSec), showSec * 1_000);
}

/**
 * Trigger when element is fully visible
 * @param ammunitionEl animation container
 */
function onShow(ammunitionEl: HTMLElement | null) {
    // animate shell
    ammunitionEl?.classList.add(FIRING_ANIMATION_CLASS);

    // start firing video
    const smokeVideoEl = document
        .getElementsByTagName(VIDEO_HTML_TAG)
        .namedItem(SMOKE_VIDEO_ELEMENT);
    smokeVideoEl?.play().catch((error) => {
        // Videos would stop playing if the window is not visible for browser energy savings
        console.debug("Video paused, because window is not in focus", error);
    });
}

/**
 * Hide notification container
 * @param container html container
 * @param hideSec hide animation duration
 */
function hide(container: HTMLElement, hideSec: number) {
    // add the hide animation and make it invisible after it
    container.classList.replace(
        POP_IN_ANIMATION_CLASS,
        POP_OUT_ANIMATION_CLASS,
    );
    container.style.animationDuration = `${hideSec}s`;
}

/**
 * Add missing image file handler so that they are empty and not show broken placeholder icons
 */
export function addErrorHandlerImg() {
    /**
     * Restore visibility
     * @param this html container
     */
    function restore(this: HTMLElement) {
        this.style.opacity = "1";
    }

    /**
     * Disable images if they are not found without showing browser default missing icon
     * @param this html container
     */
    function hideImg(this: HTMLImageElement) {
        console.error(`Failed to load image for: ${this.src}`);
        this.style.opacity = "0";
    }

    // document id of flaky images
    const imgIcons = [
        DESTROYED_VEHICLE_ELEMENT,
        KILLER_VEHICLE_ELEMENT,
        KILLER_AVATAR_ELEMENT,
    ];

    for (const id of imgIcons) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("load", restore);
            el.onerror = hideImg;
        } else {
            console.warn(
                `Couldn't find img element "${id}" for error handling`,
            );
        }
    }
}
