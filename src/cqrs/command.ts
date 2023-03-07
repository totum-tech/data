import { ICommand } from './types';

export class Command<ICommandPayload> implements ICommand {
  name: string;
  data: ICommandPayload;

  constructor(payload?: ICommandPayload) {
    this.data = payload?? ({} as ICommandPayload);
  }
}
