export interface Component<T> extends ComponentProps {
    update(...args: T[]): void;
}
export interface Definition<T> {
    component: Component<T>;
    shouldRender: (component: Component<T>, progress: number) => boolean;
    getUpdateState: () => T;
    getProgress: () => number;
}

export class Renderer {
    private isUpdated = false;

    constructor(private readonly context: Modding.ModContext) {}

    public create<T>({ shouldRender, getUpdateState, getProgress, component }: Definition<T>) {
        // @ts-ignore Argument of type 'string' is not assignable to parameter of type 'never'.
        this.context.patch(Skill, 'renderXP').before(() => {
            this.isUpdated = shouldRender(component, getProgress());
        });

        // @ts-ignore Argument of type 'string' is not assignable to parameter of type 'never'.
        this.context.patch(Skill, 'renderXP').after(() => {
            if (!this.isUpdated) {
                return;
            }

            this.isUpdated = false;
            component.update(getUpdateState());
        });

        // @ts-ignore Argument of type 'string' is not assignable to parameter of type 'never'.
        this.context.patch(Skill, 'renderAbyssalXP').before(() => {
            this.isUpdated = shouldRender(component, getProgress());
        });

        // @ts-ignore Argument of type 'string' is not assignable to parameter of type 'never'.
        this.context.patch(Skill, 'renderAbyssalXP').after(() => {
            if (!this.isUpdated) {
                return;
            }

            this.isUpdated = false;
            component.update(getUpdateState());
        });

        return component;
    }
}
