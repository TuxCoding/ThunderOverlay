/**
 * Notification displaying from destroy msg
 */
export interface Notification {
    /** killer name with clan */
    killer: string,
    /** avatar location */
    killerAvatar: string,

    /** killer vehicle location */
    killerTankIcon: string,

    /** killed player name with clan */
    killed: string,
    /** destroyed vehicle location */
    destroyedTank: string
}

const KILLER_AVATAR_ELEMENT = 'killer-avatar';
const KILLER_VEHICLE_ELEMENT = 'killer-tank';

const DESTROYED_VEHICLE_ELEMENT = 'destroyed-tank';

export function showNotification(notification: Notification) {
    const container = document.getElementById('notification');

    const killerEl = document.getElementById('killer-name');
    const killedEl = document.getElementById('killed-name');

    const killerAvatar = document.getElementById(KILLER_AVATAR_ELEMENT) as HTMLImageElement;
    const killerTank = document.getElementById(KILLER_VEHICLE_ELEMENT) as HTMLImageElement;

    const destroyedTank = document.getElementById(DESTROYED_VEHICLE_ELEMENT) as HTMLImageElement;
    if (!container || !killerEl || !killedEl || !killerAvatar || !killerTank || !destroyedTank) {
        console.error("HTML elements not found");
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
    setTimeout(() => popup(container, 2, 8, 2), 1);
}

const FIRING_ANIMATION_CLASS = "ammu-firing";
const POP_IN_ANIMATION_CLASS = "pop-in";
const POP_OUT_ANIMATION_CLASS = "pop-out";

/**
 * Start popup animation for the container
 *
 * @param container
 * @param startSec animation showing seconds
 * @param showSec showing seconds without any animation
 * @param endSec disappear animation
 */
function popup(container: HTMLElement, startSec: number, showSec: number, endSec: number) {
    // reset the last animation position
    const ammunitionEl = (document.getElementById("ammunition") as HTMLElement);
    ammunitionEl.classList.remove(FIRING_ANIMATION_CLASS);

    // activate show animation and make it visible
    container.classList.remove(POP_OUT_ANIMATION_CLASS);
    container.classList.add(POP_IN_ANIMATION_CLASS);
    container.style.animationDuration = `${startSec}s`;

    // start fire animation
    setTimeout(() => onShow(ammunitionEl), startSec * 1000 - 500);

    // start hide animation after showed it for showSec
    setTimeout(() => hide(container, endSec), showSec * 1000);
}

function onShow(ammunitionEl: HTMLElement) {
    ammunitionEl.classList.add(FIRING_ANIMATION_CLASS);

    // start firing video
    const SmokeVideoEl = document.getElementById("smoke") as HTMLVideoElement;
    SmokeVideoEl
        .play()
        .catch(error => {
            // Videos would stop playing if the window is not visible for browser energy savings
            console.log(`Video paused, because window is not in focus ${error}`);
        });
}

function hide(container: HTMLElement, hideSec: number) {
    // add the hide animation and make it invisible after it
    container.classList.replace(POP_IN_ANIMATION_CLASS, POP_OUT_ANIMATION_CLASS);
    container.style.animationDuration = `${hideSec}s`;
}

export function addErrorHandlerImg() {
    // restore visibility
    function restore(this: HTMLElement) {
        this.style.opacity = "1";
    }

    // Disable images if they are not found without showing browser default missing icon
    function hideImg(this: HTMLImageElement) {
        console.error(`Failed to load image for: ${this.src}`);
        this.style.opacity = "0";
    }

    // document id of flaky images
    const imgIcons = [
        DESTROYED_VEHICLE_ELEMENT,
        KILLER_VEHICLE_ELEMENT,
        KILLER_AVATAR_ELEMENT
    ];

    for (const id of imgIcons) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('load', restore);
            el.onerror = hideImg;
        } else {
            console.error(`Couldn't find img element "${id}" for error handling`);
        }
    }
}

