import INodeVisitor from '../../Visitor/INodeVisitor';
import IObject from './IObject';

export class Var implements IObject {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    accept<T>(visitor: INodeVisitor<T>, v?: any): T {
        return visitor.visitVar(this, v);
    }
}

export default Var;
