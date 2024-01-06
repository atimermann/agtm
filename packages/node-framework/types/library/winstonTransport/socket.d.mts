/**
 *
 */
export default class SocketIoTransport {
    /**
     *
     * @param opts
     */
    constructor(opts: any);
    name: string;
    /**
     *
     */
    handleSocketConnection(): Promise<boolean>;
    /**
     *
     * @param logObj
     * @param callback
     */
    log(logObj: any, callback: any): Promise<void>;
}
//# sourceMappingURL=socket.d.mts.map