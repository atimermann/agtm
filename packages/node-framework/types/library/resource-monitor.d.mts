/**
 * ResourceMonitor Class
 *
 * @class
 *
 * Monitoring application resources such as memory consumption, Event Listeners created, among others
 */
export default class ResourceMonitor {
    static enabled: any;
    static hd: any;
    static detailSizeLimit: any;
    static detailNodesLimit: any;
    static monitorInterval: any;
    /**
     * Initialize the ResourceMonitor class
     * Fetches configurations and initializes the logger and static properties.
     *
     * @static
     */
    static init(): void;
    /**
     * Initialize memory dumping
     * Sets an interval to call the dumpMemory method every monitorInterval minutes.
     *
     * @static
     * @private
     */
    private static _initMemoryDump;
    /**
     * Get memory information
     * Collects heap statistics and returns an object containing detailed information.
     *
     * @static
     * @return {object | null} Object containing memory statistics or null if monitoring is not enabled.
     */
    static getMemoryInfo(): object | null;
    /**
     * Perform memory dumping
     * Analyzes heap differences since the last dump and logs the changes.
     *
     * @static
     * @private
     */
    private static _dumpMemory;
}
//# sourceMappingURL=resource-monitor.d.mts.map