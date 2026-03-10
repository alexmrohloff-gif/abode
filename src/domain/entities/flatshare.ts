export interface FlatshareProps {
  id: string;
  name: string;
  memberIds: string[];
}

export class Flatshare {
  private readonly props: FlatshareProps;

  constructor(props: FlatshareProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get memberIds(): string[] {
    return [...this.props.memberIds];
  }
}
