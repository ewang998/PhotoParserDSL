export enum RelativePositionEnum {
  BELOW = 'BELOW',
  ABOVE = 'ABOVE',
  LEFT = 'TO THE LEFT OF',
  RIGHT = 'TO THE RIGHT OF',
}

export class RelativePosition {
  public relativeTo: string;
  public position: RelativePositionEnum;

  constructor(relativeTo: string, position: RelativePositionEnum) {
    this.relativeTo = relativeTo;
    this.position = position;
  }
}

export default RelativePosition;
