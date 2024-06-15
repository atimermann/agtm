/**
 *
 */
export default class SocketIoTransport extends Transport {
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
import Transport from 'winston-transport';
//# sourceMappingURL=socket.d.mts.map