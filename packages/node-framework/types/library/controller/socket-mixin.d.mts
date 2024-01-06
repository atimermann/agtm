/**
 *
 */
export default class SocketMixin {
    /**
     * Holds the instance of the Socket.io server.
     *
     * @type {import("socket.io").Server}
     */
    io: import("socket.io").Server;
    /**
     * Returns a namespace instance from the Socket.io server.
     *
     * @param  {string}                        path  Path of the namespace
     * @return {import("socket.io").Namespace}       The namespace instance
     */
    namespace(path: string): import("socket.io").Namespace;
    /**
     * Method that should be overridden by the user, implementing the application's logic.
     *
     * @async
     */
    socket(): Promise<void>;
}
//# sourceMappingURL=socket-mixin.d.mts.map