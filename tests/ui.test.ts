import { addNotification } from "@App/ui";

function createClassList() {
    const classes = new Set<string>();

    return {
        add: (...tokens: string[]) => {
            for (const token of tokens) {
                classes.add(token);
            }
        },
        remove: (...tokens: string[]) => {
            for (const token of tokens) {
                classes.delete(token);
            }
        },
        replace: (oldToken: string, newToken: string) => {
            const removed = classes.delete(oldToken);
            if (removed) {
                classes.add(newToken);
            }
            return removed;
        },
        contains: (token: string) => classes.has(token),
    };
}

function createElement() {
    return {
        classList: createClassList(),
        style: {} as Record<string, string>,
        textContent: "",
        src: "",
        addEventListener: jest.fn(),
        pause: jest.fn(),
        play: jest.fn(() => Promise.resolve()),
    } as any;
}

describe("kill feed notification flow", () => {
    beforeEach(() => {
        jest.useFakeTimers();

        const container = createElement();
        container.classList.add("container");

        const killerName = createElement();
        const killedName = createElement();
        const killerAvatar = createElement();
        const killerTank = createElement();
        const destroyedTank = createElement();
        const ammunition = createElement();
        const smoke = createElement();

        const byId = new Map([
            ["notification", container],
            ["killer-name", killerName],
            ["killed-name", killedName],
            ["killer-avatar", killerAvatar],
            ["killer-tank", killerTank],
            ["destroyed-tank", destroyedTank],
            ["ammunition", ammunition],
            ["smoke", smoke],
        ]);

        const byTag = new Map([
            ["img", new Map([
                ["killer-avatar", killerAvatar],
                ["killer-tank", killerTank],
                ["destroyed-tank", destroyedTank],
                ["ammunition", ammunition],
            ])],
            ["video", new Map([["smoke", smoke]])],
        ]);

        Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {
                getElementById: (id: string) => byId.get(id) ?? null,
                getElementsByTagName: (tagName: string) => ({
                    namedItem: (id: string) => byTag.get(tagName)?.get(id) ?? null,
                }),
            },
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        delete (globalThis as { document?: Document }).document;
    });

    test("queues notifications until the current animation cycle completes", () => {
        const first = {
            killer: "alpha",
            killerAvatar: "avatar-a",
            killerTankIcon: "tank-a",
            killed: "bravo",
            destroyedTank: "destroyed-a",
        };

        const second = {
            killer: "charlie",
            killerAvatar: "avatar-b",
            killerTankIcon: "tank-b",
            killed: "delta",
            destroyedTank: "destroyed-b",
        };

        addNotification(first);
        addNotification(second);

        jest.advanceTimersByTime(1);

        const container = document.getElementById("notification");
        const smoke = document.getElementsByTagName("video").namedItem("smoke");
        if (!container || !smoke) {
            throw new Error("Test DOM is incomplete");
        }

        expect(document.getElementById("killer-name")?.textContent).toBe("alpha");
        expect(document.getElementById("killed-name")?.textContent).toBe("bravo");
        expect(container.classList.contains("pop-in")).toBeTruthy();

        jest.advanceTimersByTime(5_998);

        expect(document.getElementById("killer-name")?.textContent).toBe("alpha");
        expect(document.getElementById("killed-name")?.textContent).toBe("bravo");
        expect(container.classList.contains("pop-out")).toBeTruthy();
        expect((smoke as any).play).toHaveBeenCalled();

        jest.advanceTimersByTime(1);

        expect(document.getElementById("killer-name")?.textContent).toBe("charlie");
        expect(document.getElementById("killed-name")?.textContent).toBe("delta");
    });
});
