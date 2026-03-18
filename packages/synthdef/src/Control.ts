import { Rate } from "./Rate";

export class Control {
  constructor(public rate: Rate, public name: string, public defaultValue: number, public index: number) {}
}
