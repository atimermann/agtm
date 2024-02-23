/**
 *
 */
export default class SocketController extends BaseController {
    /**
     * Namespace associated with this controller.
     *
     * @type {string}
     */
    namespace: string;
    /**
     * Holds the instance of the Socket.io server.
     *
     * @type {import("socket.io").Server}
     */
    io: import("socket.io").Server;
    /**
     * Holds the instance of the Socket.io server namespaced.
     *
     * @type {import("socket.io").Namespace}
     */
    nsp: import("socket.io").Namespace;
    /**
     * A list of events to be registered on new connections.
     *
     * @type {SocketEvent[]}
     */
    events: SocketEvent[];
    /**
     * Registers an event listener and a callback function for the specified event.
     * If an event with the same name already exists, an error is thrown.
     *
     * @param {string}        path  The event name to listen for.
     * @param {EventCallback} fn    The async callback function to handle the event. It should return the data to be sent back to the client.
     *                              On success, the callback response includes { success: true, data }.
     *                              On failure, it includes { success: false, data: error.message }.
     * @throws {Error} If an event with the same name already exists.
     */
    on(path: string, fn: EventCallback): void;
    /**
     * Method that should be overridden by the user, implementing the application's logic.
     *
     * @async
     */
    setup(): Promise<void>;
    /**
     * Handles new client connections by registering predefined events.
     *
     * @param {import("socket.io").Socket} socket  - The socket instance for the connection.
     */
    newConnection(socket: import("socket.io").Socket): Promise<void>;
    #private;
}
/**
 * Created on 28/07/23
 */
export type CallbackResponse = {
    /**
     * Indicates if the operation was successful.
     */
    success: boolean;
    /**
     * The data to be sent back to the client. On success, it's the result data; on failure, it's the error message.
     */
    data: any;
};
/**
 * A callback function to handle socket events.
 */
export type EventCallback = Function;
/**
 * Represents a single event to be registered on a socket connection.
 */
export type SocketEvent = {
    /**
     * - The event name to listen for.
     */
    path: string;
    /**
     * - The async callback function to handle the event.
     */
    fn: EventCallback;
};
import BaseController from './base-controller.mjs';
//# sourceMappingURL=socket.d.mts.map