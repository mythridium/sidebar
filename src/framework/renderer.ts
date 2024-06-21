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
        this.context.patch(<any>Skill, 'renderXP').before(() => {
            this.isUpdated = shouldRender(component, getProgress());
        });

        this.context.patch(<any>Skill, 'renderXP').after(() => {
            if (!this.isUpdated) {
                return;
            }

            this.isUpdated = false;
            component.update(getUpdateState());
        });

        this.context.patch(<any>Skill, 'renderAbyssalXP').before(() => {
            this.isUpdated = shouldRender(component, getProgress());
        });

        this.context.patch(<any>Skill, 'renderAbyssalXP').after(() => {
            if (!this.isUpdated) {
                return;
            }

            this.isUpdated = false;
            component.update(getUpdateState());
        });

        return component;
    }
}
