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
     *
     * @type {{[eventName: string]: SocketEvent}}
     */
    indexedEvents: {
        [eventName: string]: SocketEvent;
    };
    /**
     * Registers an event listener with a callback function for the specified event.
     * This event type is designated as 'NOACTION', indicating that no action is taken
     * upon its invocation. It is not permitted to bind this event type, nor will it trigger
     * an update event. This is suitable for events that are purely informative and do not
     * require interaction with the data state or notification mechanisms.
     *
     * @param {string}        path  The event name to listen for.
     * @param {EventCallback} fn    The callback function to handle the event. The function can process the event but should not expect to alter data state or trigger updates.
     *
     *                              Note: Since this event type does not influence data state or client updates, it should be used for scenarios where event handling is self-contained and does not interact with broader application state or behaviors.
     */
    on(path: string, fn: EventCallback): void;
    /**
     * Registers a query event listener and a callback function for fetching data.
     * This type of event can be cached and can be called in a BIND event type,
     * which is a special event that keeps the frontend always up to date by sending
     * a bindUpdated event whenever a new data update occurs.
     *
     * @param {string}        path  The event name to listen for fetching data.
     * @param {EventCallback} fn    The async callback function to handle the event. It should return the data to be sent back to the client.
     *                              On success, the callback response includes { success: true, data }.
     *                              On failure, it includes { success: false, data: error.message }.
     */
    onQuery(path: string, fn: EventCallback): void;
    /**
     * Registers a mutate event listener and a callback function for operations that modify data.
     * This type of event cannot be cached and will generate an error if an attempt is made to bind it.
     * Whenever it is executed, it triggers an update event on the bind to update all connected client sockets.
     *
     * @param {string}        path  The event name to listen for operations that modify data.
     * @param {EventCallback} fn    The async callback function to handle the event. It should perform the data modification operation and return the result to be sent back to the client.
     *                              On success, the callback response includes { success: true, data }.
     *                              On failure, it includes { success: false, data: error.message }.
     * @throws {Error} If an attempt is made to bind this event type.
     */
    onMutate(path: string, fn: EventCallback): void;
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
    /**
     * Checks if an event with the specified name exists in the controller.
     *
     * @param  {string}  eventName  - The name of the event to check for existence.
     * @return {boolean}            - True if the event exists, false otherwise.
     */
    hasEvent(eventName: string): boolean;
    /**
     * Triggers a query event by its name with the provided arguments. Only query operations are allowed when using the bind feature.
     * If the event does not exist or is not a QUERY type, it throws an error. Otherwise, it resolves with the response from the event's callback function.
     *
     * @param  {string}       eventName  - The name of the query event to trigger.
     * @param  {...any}       args       - The arguments to pass to the event's callback function.
     * @return {Promise<any>}            - A promise that resolves with the callback response of the triggered event.
     * @throws {Error} If the event does not exist or is not a QUERY type.
     */
    triggerQueryEvent(eventName: string, ...args: any[]): Promise<any>;
    /**
     * Triggers an event by its name with the provided arguments. If the event does not exist,
     * it rejects the promise with an error. Otherwise, it resolves with the response from the event's callback function.
     *
     * @param  {Socket|null}  socket     - Socket.io  Socket. Only mutateEvent use socket here to emit update event
     * @param  {string}       eventName  - The name of the event to trigger.
     * @param  {...any}       args       - The arguments to pass to the event's callback function.
     * @return {Promise<any>}            - A promise that resolves with the callback response of the triggered event.
     * @throws {Error} - If the event does not exist.
     */
    triggerEvent(socket: Socket | null, eventName: string, ...args: any[]): Promise<any>;
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
 * Created on 28/07/23
 */
export type Socket = import("socket.io").Socket;
/**
 * The type of the socket event.
 *
 * `MUTATE`: Used for events that result in modifications to the data state.
 * These events can include creating, updating, or deleting data.
 * Events of this type typically trigger updates to all clients listening
 * to the affected data to ensure all users have the most current information.
 *
 * `QUERY`: Designed for events that fetch data without modifying the data state.
 * These events are used to request and retrieve data from the server.
 * Query events can be cached and may be used in conjunction with BIND events
 * to keep the frontend updated with the latest data without causing unnecessary data mutations.
 *
 * `NOACTION`: Indicates events that neither modify the data state nor fetch data.
 * These events are purely informative and might be used for logging,
 * debugging, or signaling specific states or actions within the application.
 * No action is taken in terms of data manipulation or updates, and binding
 * or triggering updates for these events is not permitted.
 */
export type SocketEventType = 'MUTATE' | 'QUERY' | 'NOACTION';
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
    /**
     * - The event type, can be either 'MUTATE', 'QUERY' or 'NOACTION'.
     */
    type: SocketEventType;
};
/**
 * Represents the structure of an error payload returned by event handlers.
 */
export type PayloadError = {
    /**
     * - Indicates if the operation was successful. Always false for errors.
     */
    success: boolean;
    /**
     * - Additional data about the error. Could be an error message, details, or any other relevant information.
     */
    data: any;
    /**
     * - The type of the error, such as 'API_ERROR' or 'GENERIC_ERROR'.
     */
    type: string;
    /**
     * - Optional metadata associated with the error. Can be used to provide additional context or details.
     */
    meta: any;
    /**
     * - A human-readable message describing the error.
     */
    message: string;
    /**
     * - An optional error code that can be used to categorize or identify the error.
     */
    code: string | number;
};
import BaseController from './base-controller.mjs';
//# sourceMappingURL=socket.d.mts.map