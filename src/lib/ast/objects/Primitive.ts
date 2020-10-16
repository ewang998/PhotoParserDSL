import INodeVisitor from '../../Visitor/INodeVisitor';
import IObject from './IObject';
/**
 * Any primitive type (string/text, number, etc.)
 */
class Primitive implements IObject {
    public value;

    constructor(value: any) {
        this.value = value;
    }

    accept<T>(visitor: INodeVisitor<T>): T {
        return visitor.visitPrimitive(this);
    }
}

export default Primitive;
