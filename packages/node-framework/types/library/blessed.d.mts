/**
 * Created on 06/07/2023
 *
 * /blessed.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 */
export default class BlessedInterface {
    static indexedBoxes: {};
    static boxes: any[];
    static activeBox: any;
    static ready: boolean;
    /**
     * Representa cada linha da caixa de log, será convertido para texto e será o conteudo do box
     * Indexado pelo nome do box
     *
     * @type {{}}
     */
    static boxesLines: {};
    /**
     * Boxs para serem atualizados (quando tem novo log)
     *
     * @type {{}}
     */
    static boxesForUpdate: {};
    /**
     * Initializes the application. This function prepares the screen, sets shortcuts and creates a status bar.
     *
     * @static
     */
    static init(): void;
    /**
     * Connect to socket server
     */
    static connectSocketServer(): void;
    /**
     *
     * @param level
     */
    static _getLevelColor(level: any): "\u001B[0m" | "\u001B[33m" | "\u001B[31m" | "\u001B[92m" | "\u001B[39m";
    /**
     * Formatting raw message received from the server
     *
     * @param           logObj
     * @return {string}
     */
    static _parselogObj(logObj: any): string;
    /**
     * Adds a message to the specified box. If the box does not exist, it creates a new box.
     *
     * @param {string} message  - The message to add to the box.
     * @param {string} boxName  - The name of the box to add the message to.
     * @static
     */
    static log(message: string, boxName: string): void;
    /**
     *
     */
    static _updateLogs(): void;
    /**
     * Sets application shortcuts.
     *
     * @private
     * @static
     */
    private static _setShortcuts;
    /**
     * Creates a status bar at the bottom of the screen.
     *
     * @private
     * @param {string} boxName  - Name of the box to which the status bar will be added.
     * @static
     */
    private static _createStatusBar;
    /**
     * Creates a box on the screen with the specified name.
     *
     * @private
     * @param {string} boxName  - The name of the box to create.
     * @static
     */
    private static _createBox;
    /**
     * Resizes all boxes according to the screen size and given custom dimensions and offsets.
     *
     * @private
     * @param {number} customWidth   - Custom width for the boxes. If negative, it's subtracted from screen width.
     * @param {number} customHeight  - Custom height for the boxes. If negative, it's subtracted from screen height.
     * @param {number} offsetWidth   - The amount of space left on the sides of the boxes.
     * @param {number} offsetHeight  - The amount of space left on top and bottom of the boxes.
     * @static
     */
    private static _resizeBoxes;
    /**
     * Moves focus to a specific direction. If there are no boxes in the direction, nothing happens.
     *
     * @private
     * @param {string} direction  - The direction to move the focus to. Can be 'up', 'down', 'left', 'right'.
     * @static
     */
    private static _moveBoxFocusTo;
}
//# sourceMappingURL=blessed.d.mts.map