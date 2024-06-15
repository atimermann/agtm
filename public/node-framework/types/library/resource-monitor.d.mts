/**
 * ResourceMonitor is a utility class for monitoring and logging various resource usage metrics
 * within an application, such as memory consumption. It can be configured to periodically dump memory usage stats
 * and identify changes in heap allocation to help in spotting memory leaks.
 */
export default class ResourceMonitor {
    /**
     * Indicates whether the resource monitoring is enabled.
     *
     * @type {boolean}
     */
    static enabled: boolean;
    /**
     * HeapDiff instance used for calculating differences in memory heap across dumps.
     *
     * @type {memwatch.HeapDiff}
     */
    static hd: memwatch.HeapDiff;
    /**
     * Size limit for detailing individual heap allocations in memory dumps.
     *
     * @type {number}
     */
    static detailSizeLimit: number;
    /**
     * Node limit for detailing changes in heap allocations in memory dumps.
     *
     * @type {number}
     */
    static detailNodesLimit: number;
    /**
     * Interval in minutes for performing memory dumps.
     *
     * @type {number}
     */
    static monitorInterval: number;
    /**
     * Initialize the ResourceMonitor class
     * Fetches configurations and initializes the logger and static properties.
     *
     * @static
     */
    static init(): void;
    /**
     * Initializes the memory dumping process. Sets an interval to periodically call the dumpMemory
     * method based on the configured monitor interval.
     *
     * @static
     */
    static "__#3@#initMemoryDump"(): void;
    /**
     * Collects and returns heap statistics as an object containing detailed memory usage information.
     * Provides data on total memory allocated, memory in use, memory limit, and the percentage of memory used.
     *
     * @return {object | null} An object containing memory statistics, or null if monitoring is not enabled.
     */
    static getMemoryInfo(): object | null;
    /**
     * Perform memory dumping
     * Analyzes heap differences since the last dump and logs the changes.
     */
    static "__#3@#dumpMemory"(): void;
}
import memwatch from '@airbnb/node-memwatch';
//# sourceMappingURL=resource-monitor.d.mts.map