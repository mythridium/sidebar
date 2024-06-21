import { Component } from '../../framework/component';
import { Renderer, Component as RenderComponent } from '../../framework/renderer';
import './abyssal-experience.scss';

interface RenderContext {
    component: RenderComponent<any>;
    skill: AnySkill;
    navs: SkillNavElem[];
}

export class AbyssalExperience implements Component {
    public readonly template = 'app/abyssal-experience/abyssal-experience.html';
    public readonly settings = {
        section: 'Abyssal Experience',
        config: [
            {
                type: 'switch',
                name: 'abyssal-experience-enabled',
                label: 'Display Abyssal Experience Progress',
                hint: 'Shows abyssal experience progress on sidebar items.',
                default: false,
                onChange: (value: boolean) => {
                    for (const { component, skill } of this.renderers) {
                        component.update({
                            // @ts-ignore // TODO: TYPES
                            progress: skill.nextAbyssalLevelProgress,
                            isVisible: this.isVisible(skill, value)
                        });
                    }
                }
            },
            {
                type: 'switch',
                name: 'abyssal-experience-active',
                label: 'Only Active',
                hint: 'Only displays progress for the currently active skills.',
                default: false,
                onChange: (value: boolean) => {
                    for (const { component, skill } of this.renderers) {
                        component.update({
                            // @ts-ignore // TODO: TYPES
                            progress: skill.nextAbyssalLevelProgress,
                            isVisible: this.isVisible(skill, undefined, value)
                        });
                    }
                }
            }
        ]
    };

    private readonly renderers: RenderContext[] = [];

    private get isEnabled() {
        return this.context.settings.section(this.settings.section).get(this.settings.config[0].name) as boolean;
    }

    private get onlyActive() {
        return this.context.settings.section(this.settings.section).get(this.settings.config[1].name) as boolean;
    }

    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        this.context.onCharacterLoaded(() => {
            for (const [skill, navs] of Array.from(skillNav.navs)) {
                this.renderers.push({
                    component: new Renderer(this.context).create<{ progress: number; isVisible: boolean }>({
                        shouldRender: (component, progress) =>
                            !loadingOfflineProgress &&
                            component.progress !== progress &&
                            // @ts-ignore // TODO: TYPES
                            (skill.renderQueue.abyssalXP ||
                                // @ts-ignore // TODO: TYPES
                                skill.renderQueue.abyssalLevel ||
                                skill.renderQueue.lock ||
                                game.renderQueue.activeSkills),
                        getUpdateState: () => ({
                            progress: this.getProgress(skill),
                            isVisible: this.isVisible(skill)
                        }),
                        getProgress: () => this.getProgress(skill),
                        component: {
                            $template: '#myth-sidebar-abyssal-experience',
                            progress: 0,
                            isVisible: true,
                            update({ progress, isVisible }) {
                                this.progress = progress;
                                this.isVisible = isVisible;
                            }
                        }
                    }),
                    skill,
                    navs
                });
            }
        });

        this.context.onInterfaceReady(() => {
            for (const { component, skill, navs } of this.renderers) {
                for (const nav of navs) {
                    ui.create(component, nav.item.itemEl);
                }
            }
        });
    }

    private getProgress(skill: AnySkill) {
        // @ts-ignore // TODO: TYPES
        return Math.floor(skill.nextAbyssalLevelProgress);
    }

    private isActive(skill: AnySkill) {
        return game.activeAction?.activeSkills.map(skill => skill.id).includes(skill.id);
    }

    private isVisible(skill: AnySkill, enabled = this.isEnabled, onlyActive = this.onlyActive) {
        if (onlyActive && !this.isActive(skill)) {
            return false;
        }

        // @ts-ignore // TODO: TYPES
        return enabled && skill.isUnlocked && skill.nextAbyssalLevelProgress !== 100;
    }
}
