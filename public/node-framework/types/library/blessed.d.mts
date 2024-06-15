/**
 * Implements a terminal-based user interface using the 'blessed' library, for displaying log messages in a structured and interactive manner.
 *
 * @author André Timermann <andre@timermann.com.br>
 */
export default class BlessedInterface {
    /**
     * Maps box names to their instances for quick access.
     *
     * @type {{[key: string]: blessed.Widgets.BoxElement}}
     */
    static indexedBoxes: {
        [key: string]: blessed.Widgets.BoxElement;
    };
    /**
     * Holds an array of all box instances for iteration purposes.
     *
     * @type {blessed.Widgets.BoxElement[]}
     */
    static boxes: blessed.Widgets.BoxElement[];
    /**
     * References the currently active (focused) box, if any.
     *
     * @type {blessed.Widgets.BoxElement|null}
     */
    static activeBox: blessed.Widgets.BoxElement | null;
    /**
     * Indicates whether the UI has been fully initialized and is ready to display logs.
     *
     * @type {boolean}
     */
    static ready: boolean;
    /**
     * Stores lines of log messages for each box. Indexed by box name.
     *
     * @type {{[key: string]: boolean}}
     */
    static boxesLines: {
        [key: string]: boolean;
    };
    /**
     * Tracks which boxes need to be updated due to new log messages.
     *
     * @type {{[key: string]: boolean}}
     */
    static boxesForUpdate: {
        [key: string]: boolean;
    };
    /**
     * Initializes the user interface, creating the main screen, setting up keyboard shortcuts, and establishing a socket connection for log messages.
     *
     * @static
     */
    static init(): void;
    /**
     * Establishes a connection to the specified log server using socket.io, handles connection events, and receives log messages.
     *
     * @static
     */
    static connectSocketServer(): void;
    /**
     * Determines the appropriate color code for log messages based on their severity level.
     *
     * @param  {string} level  - The severity level of the log message ('info', 'warn', 'error', 'debug').
     * @return {string}        The escape code for the color associated with the given severity level.
     * @static
     */
    static "__#11@#getLevelColor"(level: string): string;
    /**
     * Parses log objects received from the log server, formatting them for display in the UI.
     *
     * @param  {object} logObj  - The log object containing the level, module, and message.
     * @return {object}         An object containing the formatted message and the module name.
     * @static
     */
    static "__#11@#parselogObj"(logObj: object): object;
    /**
     * Appends a log message to the specified box, creating a new box if necessary.
     *
     * @param {string} message  - The log message to display.
     * @param {string} boxName  - The name of the box to which the message should be added.
     * @static
     */
    static log(message: string, boxName: string): void;
    /**
     * Periodically updates the content of all boxes marked for update with the latest log messages.
     *
     * @static
     */
    static "__#11@#updateLogs"(): void;
    /**
     * Sets up keyboard shortcuts for application control, such as quitting, restarting, and navigating between boxes.
     *
     * @static
     */
    static "__#11@#setShortcuts"(): void;
    /**
     * Creates a status bar at the bottom of the screen, displaying helpful shortcuts and real-time memory usage information.
     *
     * @param {string} [boxName]  - The name of the box for which the status bar is being created. Currently not used.
     * @static
     */
    static "__#11@#createStatusBar"(boxName?: string): void;
    /**
     * Creates a new box on the screen for displaying log messages.
     *
     * @param {string} boxName  - The name of the box to create.
     * @static
     */
    static "__#11@#createBox"(boxName: string): void;
    /**
     * Dynamically resizes all boxes based on the current screen size and optional custom dimensions.
     *
     * @param {number|null} customWidth     - Optional custom width for the boxes.
     * @param {number|null} customHeight    - Optional custom height for the boxes.
     * @param {number}      [offsetWidth]   - Horizontal space to leave empty on the sides of the boxes.
     * @param {number}      [offsetHeight]  - Vertical space to leave empty above and below the boxes.
     */
    static "__#11@#resizeBoxes"(customWidth: number | null, customHeight: number | null, offsetWidth?: number, offsetHeight?: number): void;
    /**
     * Moves focus to a specific direction. If there are no boxes in the direction, nothing happens.
     *
     * @param {string} direction  - The direction to move the focus to. Can be 'up', 'down', 'left', 'right'.
     */
    static "__#11@#moveBoxFocusTo"(direction: string): void;
}
import blessed from 'blessed';
//# sourceMappingURL=blessed.d.mts.map