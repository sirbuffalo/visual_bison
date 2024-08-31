interface BaseExpression {
}

interface Number extends BaseExpression {
    type: "number";
    value: number;
}

interface VarGet extends BaseExpression {
    type: "var_get";
    name: string;
}

interface Range extends BaseExpression {
    type: "range";
    start: Expression;
    end: Expression;
}

interface BaseOperation extends BaseExpression {
    value1: Expression
    value2: Expression
}

interface Add extends BaseOperation {
    type: "add"
}

interface Subtract extends BaseOperation {
    type: "subtract"
}

interface Multiply extends BaseOperation {
    type: "multiply"
}

interface Divide extends BaseOperation {
    type: "divide"
}

type Operation = Add | Subtract | Multiply | Divide;
type Expression = Number | VarGet | Range | Operation;

interface BaseStatement {
    type: string;
    line_num: number;
}

interface VarSet extends BaseStatement {
    type: "var_set";
    name: string;
    value: Expression;
}

interface FunctionCall extends BaseStatement {
    type: "function_call";
    name: string;
    args: Expression[];
}

interface ForLoop extends BaseStatement {
    type: "for";
    var_name: string;
    list: Expression;
    code: Statement[];
}


export type Statement = VarSet | FunctionCall | ForLoop;

interface BasePrint {
    type: string;
    message: string;
}

export interface BaseError extends BasePrint {
    type: 'error';
    line_num: number;
    error_type: string;
}

export interface BasePrintText extends BasePrint {
    type: 'print';
}

export type Print = BaseError | BasePrintText
type PrintToConsole = (toPrint: Print) => void

interface State {
    print: PrintToConsole,
    vars: Map<string, number>;
    funcs: Map<string, (state: State, args: any[]) => void>;
}

export async function runCode(ast: Statement[], print: (toPrint: Print) => void, state: State): Promise<void> {
    if (!state) {
        state = {
            print: print,
            vars: new Map(),
            funcs: new Map([
                ["print", funcPrint]
            ]),
        };
    }
    for (const stmt of ast) {
        await execStmt(state, stmt);
    }
}

async function execStmt(state: State, stmt: Statement) {
    switch (stmt.type) {
        case "var_set":
            state.vars.set(stmt.name, await execExpr(state, stmt.value));
            break;

        case "function_call":
            const args = [];
            for (const arg of stmt.args) {
                args.push(await execExpr(state, arg));
            }
            state.funcs.get(stmt.name)!(state, args);
            break;

        case "for":
            const listToLoopThrough = await execExpr(state, stmt.list);
            for (const varValue of listToLoopThrough) {
                state.vars.set(stmt.var_name, varValue);
                await runCode(stmt.code, state.print, state);
            }
            break;
    }
}

async function execExpr(state: State, expr: Expression): Promise<any> {
    switch (expr.type) {
        case "number": {
            return expr.value;
        }

        case "var_get": {
            return state.vars.get(expr.name)!;
        }

        case "range": {
            const start = await execExpr(state, expr.start);
            const end = await execExpr(state, expr.end);
            return range(start, end)
        }

        case "add": {
            const value1Computed = await execExpr(state, expr.value1);
            const value2Computed = await execExpr(state, expr.value2);
            return value1Computed + value2Computed;
        }

        case "subtract": {
            const value1Computed = await execExpr(state, expr.value1);
            const value2Computed = await execExpr(state, expr.value2);
            return value1Computed - value2Computed;
        }

        case "multiply": {
            const value1Computed = await execExpr(state, expr.value1);
            const value2Computed = await execExpr(state, expr.value2);
            return value1Computed * value2Computed;
        }

        case "divide": {
            const value1Computed = await execExpr(state, expr.value1);
            const value2Computed = await execExpr(state, expr.value2);
            return value1Computed / value2Computed;
        }
    }

    throw new Error("unknown expression type");
}

async function funcPrint(state: State, args: any[]) {
    state.print(
        {
            type: 'print',
            message: args[0]
        }
    )
}

function range(n: number, p: number) {
    let arr = [];
    for (let i = n; i <= p; i++) {
        arr.push(i);
    }
    return arr;
}

