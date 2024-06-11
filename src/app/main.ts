import { ComponentMaker } from '../framework/component';
import { AbyssalExperience } from './abyssal-experience/abyssal-experience';
import { Experience } from './experience/experience';
import { Toggle } from './toggle/toggle';

export class App {
    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        ComponentMaker.create(this.context, Toggle);
        ComponentMaker.create(this.context, Experience);
        ComponentMaker.create(this.context, AbyssalExperience);
    }
}
