export = Log2gelf;
/**
 *
 */
declare class Log2gelf extends Transport {
    /**
     * Constructs an instance of the Log2gelf transport.
     *
     * @param {object} options  - Configuration options for the transport.
     */
    constructor(options: object);
    name: any;
    hostname: any;
    host: any;
    port: any;
    protocol: any;
    reconnect: any;
    wait: any;
    exitOnError: any;
    exitDelay: any;
    service: any;
    level: any;
    silent: any;
    environment: any;
    release: any;
    customPayload: {};
    send: any;
    end: any;
    clusterNode: string;
    clusterLeader: boolean;
    /**
     * Parse a Winston log level string and return its equivalent numeric value.
     * The log levels are mapped as follows: error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5.
     * Any unrecognized level defaults to 0.
     *
     * @param  {string} level  - The log level as a string.
     * @return {number}        The numeric value corresponding to the provided log level.
     */
    levelToInt(level: string): number;
    /**
     * Open a TCP socket and return a logger funtion.
     *
     * @return { Function } logger – logger(JSONlogs)
     */
    sendTCPGelf(): Function;
    /**
     * Set HTTP(S) connection and return logger function.
     *
     * @return { Function } logger – logger(JSONlogs)
     */
    sendHTTPGelf(): Function;
    /**
     * Handles the log message, formats it, and sends it to the logging service.
     * If 'silent' mode is on, the callback is invoked immediately without logging.
     * Converts the message to a structured format and merges it with any custom payload before sending.
     *
     * @param {object}   info      - Log object containing message and metadata.
     * @param {Function} callback  - Callback function to execute after logging.
     */
    log(info: object, callback: Function): void;
    /**
     * Updates the cluster node and leader information for the transport.
     *
     * @param {string}  node    - Identifier for the current cluster node.
     * @param {boolean} leader  - Indicates if the current node is the cluster leader.
     */
    updateClusterInfo(node: string, leader: boolean): void;
}
import Transport = require("winston-transport");
//# sourceMappingURL=winston-graylog.d.ts.map