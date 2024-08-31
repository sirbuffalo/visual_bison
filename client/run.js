export async function runCode(ast, print, state) {
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
async function execStmt(state, stmt) {
    switch (stmt.type) {
        case "var_set":
            state.vars.set(stmt.name, await execExpr(state, stmt.value));
            break;
        case "function_call":
            const args = [];
            for (const arg of stmt.args) {
                args.push(await execExpr(state, arg));
            }
            state.funcs.get(stmt.name)(state, args);
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
async function execExpr(state, expr) {
    switch (expr.type) {
        case "number": {
            return expr.value;
        }
        case "var_get": {
            return state.vars.get(expr.name);
        }
        case "range": {
            const start = await execExpr(state, expr.start);
            const end = await execExpr(state, expr.end);
            return range(start, end);
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
async function funcPrint(state, args) {
    state.print({
        type: 'print',
        message: args[0]
    });
}
function range(n, p) {
    let arr = [];
    for (let i = n; i <= p; i++) {
        arr.push(i);
    }
    return arr;
}
