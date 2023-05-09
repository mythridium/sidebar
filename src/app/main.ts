interface Visibility {
    [index: string]: boolean;
    Combat: boolean;
    Passive: boolean;
    'Non-Combat': boolean;
}

export class App {
    private readonly categories = ['Combat', 'Non-Combat', 'Passive'];

    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        const that = this;

        this.context.onCharacterLoaded(() => {
            const visibility: Visibility = this.context.characterStorage.getItem('visibility') ?? {};

            for (const category of sidebar.categories()) {
                if (this.categories.includes(category.id)) {
                    category.toggle(visibility[category.id] ?? true);
                }
            }

            this.context.patch(SidebarCategory, 'toggle').after(function () {
                const visibility: Visibility = that.context.characterStorage.getItem('visibility') ?? {};

                if (that.categories.includes(this.id)) {
                    visibility[this.id] = this.expanded;
                }

                that.context.characterStorage.setItem('visibility', visibility);
            });
        });
    }
}
