export interface Component<T> extends ComponentProps {
    update(...args: T[]): void;
}
export interface Definition<T> {
    component: Component<T>;
    shouldRender: () => boolean;
    getUpdateState: () => T;
}

export class Renderer {
    private isUpdated = false;

    constructor(private readonly context: Modding.ModContext) {}

    public create<T>({ shouldRender, getUpdateState, component }: Definition<T>) {
        this.context.patch(Game, 'render').before(() => {
            if (shouldRender()) {
                component.update(getUpdateState());
            }
        });

        this.context.patch(<any>Skill, 'addXP').after(() => {
            this.isUpdated = shouldRender();
        });

        this.context.patch(<any>Skill, 'addXP').after(() => {
            if (!this.isUpdated) {
                return;
            }

            this.isUpdated = false;
            component.update(getUpdateState());
        });

        return component;
    }
}
