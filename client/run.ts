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

type Expression = Number | VarGet;

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


export type Statement = VarSet | FunctionCall;

interface BaseLog {
    type: string;
    message: string;
}

export interface BaseError extends BaseLog {
    type: 'error';
    line_num: number;
    error_type: string;
}

export interface BaseLogText extends BaseLog {
    type: 'log';
}

export type Log = BaseError | BaseLogText
type LogToConsole = (toLog: Log) => void

interface State {
    log: LogToConsole,
    vars: Map<string, number>;
    funcs: Map<string, (state: State, args: any[]) => void>;
}

export async function runCode(ast: Statement[], log: (toLog: Log) => void) {
    const state: State = {
        log: log,
        vars: new Map(),
        funcs: new Map([
            ["log", funcLog]
        ]),
    };
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
    }
}

async function execExpr(state: State, expr: Expression): Promise<number> {
    switch (expr.type) {
        case "number":
            return expr.value;

        case "var_get":
            return state.vars.get(expr.name)!;
    }

    throw new Error("unknown expression type");
}

async function funcLog(state: State, args: any[]) {
    state.log(
        {
            type: 'log',
            message: args[0]
        }
    )
}
