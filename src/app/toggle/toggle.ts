import { Component } from '../../framework/component';

interface Visibility {
    [index: string]: boolean;
    Combat: boolean;
    Passive: boolean;
    'Non-Combat': boolean;
}

export class Toggle implements Component {
    public readonly settings = {
        section: 'Visibility',
        config: [
            {
                type: 'switch',
                name: 'remember',
                label: 'Remember Visibility',
                hint: 'Remember the sidebar visibility state between closing and reopening.',
                default: true
            },
            {
                type: 'switch',
                name: 'visibility',
                label: 'Add Visibility To All Items',
                hint: 'Adds a visibility toggle to all sidebar items.',
                default: false,
                onChange: (value: boolean) => {
                    if (!value) {
                        this.toggle(this.toggleable, () => true);
                    }

                    this.configureToggleable(value);

                    if (value) {
                        this.toggle(this.toggleable, (id: string, visibility: Visibility) =>
                            this.isEnabled ? visibility[id] ?? true : true
                        );
                    }
                }
            }
        ]
    };

    private readonly default = ['Combat', 'Non-Combat', 'Passive'];
    private readonly toggleable = ['Minigame', 'Modding', 'General', 'Socials', 'Other'];

    private get isEnabled() {
        return this.context.settings.section(this.settings.section).get(this.settings.config[0].name) as boolean;
    }

    private get toggleAll() {
        return this.context.settings.section(this.settings.section).get(this.settings.config[1].name) as boolean;
    }

    private get categories() {
        return this.toggleAll ? [...this.default, ...this.toggleable] : [...this.default];
    }

    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        const that = this;

        this.context.onInterfaceReady(() => {
            if (!this.toggleAll) {
                return;
            }

            this.configureToggleable(true);

            if (!this.isEnabled) {
                return;
            }

            this.toggle(this.toggleable, (id: string, visibility: Visibility) => visibility[id] ?? true);
        });

        this.context.onCharacterLoaded(() => {
            if (!this.isEnabled) {
                return;
            }

            this.toggle(this.default, (id: string, visibility: Visibility) => visibility[id] ?? true);

            this.context.patch(SidebarCategory, 'toggle').after(function () {
                if (!that.isEnabled) {
                    return;
                }

                const visibility: Visibility = that.context.characterStorage.getItem('visibility') ?? {};

                if (that.categories.includes(this.id)) {
                    visibility[this.id] = this.expanded;
                }

                that.context.characterStorage.setItem('visibility', visibility);
            });
        });
    }

    private configureToggleable(value: boolean) {
        for (const category of sidebar.categories()) {
            if (this.toggleable.includes(category.id)) {
                sidebar.category(category.id, { toggleable: value });
            }
        }
    }

    private toggle(items: string[], value: (id: string, visibility: Visibility) => boolean) {
        const visibility: Visibility = this.context.characterStorage.getItem('visibility') ?? {};

        for (const category of sidebar.categories()) {
            if (items.includes(category.id)) {
                category.toggle(value(category.id, visibility));
            }
        }
    }
}
