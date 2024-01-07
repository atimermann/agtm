/**
 *
 * Represents a base controller class in the MVC architecture. It's an abstract class and should not be instantiated directly.
 */
export default class CoreController extends BaseController {
    /**
     * Abstract setup method, used for initial execution. Should be implemented by subclasses.
     */
    setup(): Promise<void>;
}
import BaseController from './base-controller.mjs';
//# sourceMappingURL=core.d.mts.map