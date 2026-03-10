export interface TenantProps {
  id: string;
  email: string;
  name?: string;
}

export class Tenant {
  private readonly props: TenantProps;

  constructor(props: TenantProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string | undefined {
    return this.props.name;
  }
}
