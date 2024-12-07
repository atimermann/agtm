"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConsoleLogger = /** @class */ (function () {
    function ConsoleLogger() {
    }
    ConsoleLogger.prototype.info = function (message) {
        console.info("[INFO]: ".concat(message));
    };
    ConsoleLogger.prototype.debug = function (message) {
        console.debug("[DEBUG]: ".concat(message));
    };
    ConsoleLogger.prototype.warn = function (message) {
        console.warn("[WARN]: ".concat(message));
    };
    ConsoleLogger.prototype.error = function (message) {
        console.error("[ERROR]: ".concat(message));
    };
    return ConsoleLogger;
}());
exports.default = ConsoleLogger;
