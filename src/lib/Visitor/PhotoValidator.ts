import Draw from '../ast/Draw';
import Apply from '../ast/functions/Apply';
import Declare from '../ast/functions/Declare';
import INode from '../ast/INode';
import Canvas from '../ast/objects/Canvas';
import Clone from '../ast/objects/Clone';
import Color from '../ast/objects/Color';
import Let from '../ast/objects/Let';
import Var from '../ast/objects/Var';
import Program from '../ast/Program';
import Write from '../ast/Write';
import DefaultFunctionsEnum from '../functions/DefaultFunctionsEnum';
import INodeVisitor from './INodeVisitor';
import colorString from 'color-string';
import Primitive from '../ast/objects/Primitive';

enum MemoryType {
    FUNC = 'FUNCTION',
    PHOTO = 'PHOTO',
}

/**
 * Validates a given program, w/ static typing.
 * 1. Variables can be re-used, but types are static.
 *      They must match the type of the variable already defined.
 * 2. Variables must be defined before use.
 * 3. The first argument to any function must be a photo.
 *      Note that user defined functions can only be passed a photo.
 *      We can validate other values at runtime.
 * 4. Colors need to be validated to, well, be valid colors.
 */
class PhotoValidator implements INodeVisitor<string> {
    /**
     * Stores a mapping of key values to a memory type.
     * Once defined, a variable is typed.
     * We can clone things into the same type (ooooh functions!), or photos.
     */
    protected memory: { [key: string]: MemoryType };
    protected sourceFiles: Set<string>;

    public static createValidator(rawPhotos: { [key: string]: Buffer }) {
        return new PhotoValidator(rawPhotos);
    }

    private constructor(rawPhotos: { [key: string]: Buffer }) {
        this.memory = {};
        this.sourceFiles = new Set(Object.keys(rawPhotos));
        // Type constants (predefined functions; canvas) in memory.
        Object.keys(DefaultFunctionsEnum).forEach(v => (this.memory[v] = MemoryType.FUNC));
        this.memory['CANVAS'] = MemoryType.PHOTO;
    }

    /**
     * The tokenizer ends up parsing different values into the expected.
     * If parsing failed, i.e. we have a null or undefined value, we need to chuck an error.
     * @param p
     */
    visitPrimitive(p: Primitive) {
        return p.value === undefined || p.value === null ? 'Invalid function argument.' : '';
    }

    /**
     * Returns true if the variable is untyped or the current type matches.
     * @param key
     * @param type
     */
    private checkType(key: string, type: MemoryType): string {
        const currentType = this.memory[key];
        return !currentType || type === currentType ? '' : `Expected ${key} to be a ${type}, but was a ${currentType}.`;
    }

    private placeVariable(key: string, type: MemoryType): string {
        const currentType = this.memory[key];
        this.memory[key] = type;
        return currentType ? `Variable ${key} (a ${type}) cannot be redefined.` : '';
    }

    visit(n: INode): string {
        return n.accept(this);
    }

    visitProgram(p: Program) {
        for (const statment of p.statements) {
            const errorString = statment.accept(this);
            if (errorString) return errorString;
        }
        return '';
    }

    visitCanvas(c: Canvas) {
        const sizeError =
            c.height <= 0 || c.width <= 0
                ? `The dimensions of the given canvas must be positive and non-zero; passed ${c.width} x ${c.height}`
                : '';
        return c.color.accept(this) || sizeError;
    }

    /**
     * Check if this parses to a valid color string.
     * TODO: Take this check out of the parser, and make it more generalized.
     * @param c
     */
    visitColor(c: Color) {
        const parsedColor = colorString.get(c.hex);
        return parsedColor ? '' : `${c.hex} is not a valid color string.`;
    }

    visitVar(n: Var, type?: MemoryType) {
        const isDefined = !!this.memory[n.name];
        if (!isDefined) return `${n.name} is not defined.`;
        return type ? this.checkType(n.name, type) : '';
    }

    /**
     * TODO: Resolve if we have a "valid schema" of how to draw the images
     * @param d
     */
    visitDraw(d: Draw) {
        for (const instruction of d.instructions) {
            const varError = instruction.photo.accept(this, MemoryType.PHOTO);
            if (varError) return varError;
        }
        return '';
    }

    /**
     * Validates that the variable is a defined photo.
     * @param w
     */
    visitWrite(w: Write) {
        return w.photo.accept(this, MemoryType.PHOTO);
    }

    /**
     * Checks if the function name is valid, and then if the photo param is valid.
     * @param a
     */
    visitApply(a: Apply) {
        const funcError: string = a.func.accept(this, MemoryType.FUNC) || a.photo.accept(this, MemoryType.PHOTO);
        if (funcError) return funcError;
        for (const arg of a.args) {
            const argError = arg.accept(this);
            if (argError) return `Unable to call ${a.func.name}: ${argError}`;
        }
        return '';
    }

    /**
     * Checks if given variable is either a photo or not yet defined.
     * @param l
     */
    visitLet(l: Let) {
        return this.sourceFiles.has(l.filename)
            ? this.placeVariable(l.name, MemoryType.PHOTO)
            : `Failed to declare ${l.name}, as not provided a file called ${l.filename}.`;
    }

    /**
     * Checks that the declared name is valid, and then checks for applyThunk errors.
     * @param d
     */
    visitDeclare(d: Declare) {
        const nameError = this.placeVariable(d.name, MemoryType.FUNC);
        if (nameError) return nameError;

        for (const thunk of d.calls) {
            this.memory[thunk.uuid] = MemoryType.PHOTO;
            const applyThunkError = thunk.accept(this);
            this.memory[thunk.uuid] = undefined;
            if (applyThunkError) return applyThunkError;
        }

        return '';
    }

    /**
     * Validates that the first variable is a defined photo in memory,
     *  and that the destination is either undefined or a photo.
     * @param c
     */
    visitClone(c: Clone) {
        return c.src.accept(this, MemoryType.PHOTO) || this.placeVariable(c.dest, MemoryType.PHOTO);
    }
}

export default PhotoValidator;
