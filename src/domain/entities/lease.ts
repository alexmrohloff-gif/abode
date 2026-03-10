export interface LeaseProps {
  id: string;
  flatshareId: string;
  propertyLabel: string;
  monthlyRentCents: number;
  currency: string;
  dueDayOfMonth: number;
}

export class Lease {
  private readonly props: LeaseProps;

  constructor(props: LeaseProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get flatshareId(): string {
    return this.props.flatshareId;
  }

  get propertyLabel(): string {
    return this.props.propertyLabel;
  }

  get monthlyRentCents(): number {
    return this.props.monthlyRentCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get dueDayOfMonth(): number {
    return this.props.dueDayOfMonth;
  }
}
