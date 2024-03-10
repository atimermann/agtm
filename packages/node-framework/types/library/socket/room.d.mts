/**
 * The Room class manages rooms within a Socket.io application, handling creation, data caching,
 * and synchronization of room states across connected clients.
 */
export default class Room {
    /**
     * A static map holding all active room instances, keyed by a unique identifier based on the event name and arguments.
     *
     * @type {Map<string, Room>}
     */
    static rooms: Map<string, Room>;
    /**
     * Creates or retrieves a room if it does not already exist, based on the combination of eventName and emitArgs.
     * Initializes a new room with the provided parameters if the specified room does not exist in the cache.
     *
     * @param  {string}             eventName          - The name of the event associated with the room.
     * @param  {any[]}              emitArgs           - Arguments that will be used when emitting events for this room.
     * @param  {SocketController[]} socketControllers  - A list of socket controllers associated with this room.
     * @param  {Namespace}          nsp                - The Socket.io Namespace associated with this room.
     *
     * @return {Room}                                 The newly created or existing room.
     *
     * @static
     */
    static createIfNotExist(eventName: string, emitArgs: any[], socketControllers: SocketController[], nsp: Namespace): Room;
    /**
     * Updates the data of all rooms associated with the given socket controller.
     * Iterates over all rooms in the cache, checking for rooms that include the specified
     * socket controller and triggering an update for those rooms.
     *
     * @param {SocketController} socketController  - The socket controller to use as a filter for updating rooms.
     */
    static updateByController(socketController: SocketController): void;
    /**
     * The name of the room, typically derived from a combination of the event name and arguments for uniqueness.
     *
     * @type {string}
     */
    name: string;
    /**
     * The name of the event that this room is linked to, used for emitting and listening for updates.
     *
     * @type {string}
     */
    eventName: string;
    /**
     * The list of arguments associated with the emit event. Used for constructing the unique room name and handling event emissions.
     *
     * @type {Array<any>}
     */
    emitArgs: Array<any>;
    /**
     * Cached data from requests associated with this room. This cache is used to avoid unnecessary data fetches and to synchronize client states.
     *
     * @type {any}
     */
    cacheData: any;
    /**
     * Instances of SocketController associated with this room, all operating under the same namespace. These controllers manage the logic for handling socket events specific to the room.
     *
     * @type {SocketController[]}
     */
    socketControllers: SocketController[];
    /**
     * The namespace instance from the Socket.io server that this room is associated with. This is used for emitting events and managing sockets within the namespace.
     *
     * @type {Namespace}
     */
    nsp: Namespace;
    /**
     * Shows information about the current room, including the number of connected sockets,
     * room size in bytes, total number of rooms, and total size of all rooms.
     * Logs this information for debugging purposes.
     */
    showRoomsInfo(): Promise<void>;
    /**
     * Adds a socket to this room, joining the socket to the Socket.io room.
     * Logs the event of a socket joining the room and displays room information.
     * If cached data exists for this room, it sends the cached data to the newly joined socket;
     * otherwise, it triggers an update to fetch and cache the latest data.
     *
     * @param {Socket} socket  - The socket instance to join to the room.
     */
    join(socket: Socket): void;
    /**
     * Updates the data for this room, caching the result, and emitting an update event to all sockets in the room.
     * If the room has no connected sockets, it clears the cached data and aborts the update.
     */
    update(): Promise<void>;
    /**
     * Triggers a query event to fetch data from associated socket controllers based on this room's event name.
     * Iterates over the socket controllers associated with this room and triggers the query event if the controller
     * has an event handler for the specified event name. Throws an error if no matching event handler is found.
     *
     * @return {Promise<any>} The data fetched from the socket controller.
     */
    triggerQueryEvent(): Promise<any>;
    /**
     * Calculates the approximate size of a JavaScript object in bytes.
     * This function converts the object into a JSON string and then uses the TextEncoder
     * to measure the length of the resulting string in UTF-8 bytes. It provides an estimate
     * of the memory usage of the object, although the exact byte size in memory may vary.
     *
     * @param  {any}    obj  - The object for which the size in bytes is to be calculated.
     * @return {number}      - The approximate size of the object in bytes.
     */
    getSizeInBytes(obj: any): number;
}
/**
 * Created on 09/03/24
 */
export type SocketController = import('../controller/socket.mjs').default;
/**
 * Created on 09/03/24
 */
export type Namespace = import("socket.io").Namespace;
/**
 * Created on 09/03/24
 */
export type Socket = import("socket.io").Socket;
//# sourceMappingURL=room.d.mts.map