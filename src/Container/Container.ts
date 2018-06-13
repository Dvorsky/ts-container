import { InvalidPrototypeProvided } from "./errors/InvalidPrototypeProvided";
import { NonExistingElementError } from "./errors/NonExistingElementError";

/**
 * Dependency injection container
 */
export class Container {
    public static getInstance(): Container {
        if (Container.instance === null) {
            Container.instance = new Container();
        }

        return Container.instance;
    }

    public static get<T>(element: string): T {
        return Container.getInstance().getElement<T>(element);
    }

    public static define(element: string, prototype: any): void {
        Container.getInstance().defineElement(element, prototype);
    }

    private static instance: Container | null = null;
    private _definitions: Map<string, any>;
    private _elements: Map<string, any>;

    constructor() {
        this._definitions = new Map();
        this._elements = new Map();
    }

    public defineElement(element: string, prototype: any): void {
        // Only elements in JS that have property `prototype` are prototypes thyself
        if (!prototype.hasOwnProperty(`prototype`)) {
            throw new InvalidPrototypeProvided(`Provided element is not a prototype.`);
        }
        this._definitions.set(element, prototype);
    }

    public getElement<T>(element: string): T {
        if (!this._definitions.has(element)) {
            throw new NonExistingElementError(`You haven't provided instance definitions for ${element}`);
        }

        if (this._elements.has(element)) {
            return this._elements.get(element);
        }

        // We have class definitions in definitions map. To allow TS to know that he can instance an object from this
        // definition, we have to let it know that it has a `new()` method
        const definition: { new(): T } = this._definitions.get(element);
        const instance: T = new definition();

        this._elements.set(element, instance);

        return instance;
    }
}
