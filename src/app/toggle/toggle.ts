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
                hint: 'Remember the visibility state between closing and reopening.',
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

    private readonly default = ['Combat', 'Non-Combat', 'Passive', 'Into the Abyss'];
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

        let once = false;
        this.context.patch(RealmSidebarSelectOption, 'showRealmSidebarOption').after(function () {
            if (!once && this.realm.id === 'melvorItA:Abyssal') {
                once = true;
                that.toggle(['Into the Abyss'], (id: string, visibility: Visibility) => visibility[id] ?? true);
            }
        });

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
            this.patchCombatStats();
            this.patchMinibar();

            this.toggleCombatStats();
            this.toggleMinibar();

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

    private toggleCombatStats() {
        if (!this.isEnabled) {
            return;
        }

        const visibility = (this.context.characterStorage.getItem('combat-stats') as boolean) ?? false;
        const combatElement = document.querySelector('combat-skill-progress-table');

        if (
            (combatElement?.classList.contains('d-none') && visibility) ||
            (!combatElement?.classList.contains('d-none') && !visibility)
        ) {
            toggleCombatSkillMenu();
        }
    }

    private patchCombatStats() {
        const context = this.context;

        if ('toggleCombatSkillMenu' in window) {
            const _original = toggleCombatSkillMenu;
            const combatElement = document.querySelector('combat-skill-progress-table');

            window.toggleCombatSkillMenu = function (...args) {
                _original(...args);

                const isVisible = !(combatElement?.classList.contains('d-none') ?? false);

                context.characterStorage.setItem('combat-stats', isVisible);
            };
        }
    }

    private toggleMinibar() {
        if (!this.isEnabled) {
            return;
        }

        const visibility = (this.context.characterStorage.getItem('minibar') as boolean) ?? true;
        const minibar = document.getElementById('skill-footer-minibar');

        if (
            (minibar?.classList.contains('d-none') && visibility) ||
            (!minibar?.classList.contains('d-none') && !visibility)
        ) {
            toggleSkillMinibar();
        }
    }

    private patchMinibar() {
        const context = this.context;

        if ('toggleCombatSkillMenu' in window) {
            const _original = toggleSkillMinibar;
            const minibar = document.getElementById('skill-footer-minibar');

            window.toggleSkillMinibar = function (...args) {
                _original(...args);

                const isVisible = !(minibar?.classList.contains('d-none') ?? false);

                context.characterStorage.setItem('minibar', isVisible);
            };
        }
    }
}
