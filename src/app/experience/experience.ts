import { Component } from '../../framework/component';
import { Renderer, Component as RenderComponent } from '../../framework/renderer';
import './experience.scss';

interface RenderContext {
    component: RenderComponent<any>;
    skill: AnySkill;
    navs: SkillNavElem[];
}

export class Experience implements Component {
    public readonly template = 'experience/experience.html';
    public readonly settings = {
        section: 'Experience',
        config: [
            {
                type: 'switch',
                name: 'experience-enabled',
                label: 'Display Experience Progress',
                hint: 'Shows experience progress on sidebar items.',
                default: false,
                onChange: (value: boolean) => {
                    for (const { component, skill } of this.renderers) {
                        component.update({
                            progress: skill.nextLevelProgress,
                            isVisible: this.isVisible(skill, value)
                        });
                    }
                }
            },
            {
                type: 'switch',
                name: 'experience-active',
                label: 'Only Active',
                hint: 'Only displays progress for the currently active skills.',
                default: false,
                onChange: (value: boolean) => {
                    for (const { component, skill } of this.renderers) {
                        component.update({
                            progress: skill.nextLevelProgress,
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
                        shouldRender: () =>
                            skill.renderQueue.xp ||
                            skill.renderQueue.level ||
                            skill.renderQueue.lock ||
                            game.renderQueue.activeSkills,
                        getUpdateState: () => ({
                            progress: skill.nextLevelProgress,
                            isVisible: this.isVisible(skill)
                        }),
                        component: {
                            $template: '#myth-sidebar-experience',
                            progress: 0,
                            isVisible: true,
                            update({ progress, isVisible }) {
                                this.progress = Math.floor(progress);
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

                component.update({
                    progress: skill.nextLevelProgress,
                    isVisible: this.isVisible(skill)
                });
            }
        });
    }

    private isActive(skill: AnySkill) {
        return game.activeAction?.activeSkills.map(skill => skill.id).includes(skill.id);
    }

    private isVisible(skill: AnySkill, enabled = this.isEnabled, onlyActive = this.onlyActive) {
        if (onlyActive && !this.isActive(skill)) {
            return false;
        }

        return enabled && skill.isUnlocked && skill.nextLevelProgress !== 100;
    }
}
