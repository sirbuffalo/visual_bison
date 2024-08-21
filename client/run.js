export async function runCode(ast, log) {
    const state = {
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
    }
}
async function execExpr(state, expr) {
    switch (expr.type) {
        case "number":
            return expr.value;
        case "var_get":
            return state.vars.get(expr.name);
    }
    throw new Error("unknown expression type");
}
async function funcLog(state, args) {
    state.log({
        type: 'log',
        message: args[0]
    });
}
/*
varibles = {}
function interpretExpression(expression) {
if (expression.type === 'number') {
return expression
}
if (expression.type === 'var_get') {
return
}
if (expression.type === 'add') {
return {
type: 'number',
value: interpretExpression(expression.value1).value + interpretExpression(expression.value2).value
}
}
if (expression.type === 'subtract') {
return {
type: 'number',
value: interpretExpression(expression.value1).value + interpretExpression(expression.value2).value
}
}
if (expression.type === 'multiply') {
return {
type: 'number',
value: interpretExpression(expression.value1).value + interpretExpression(expression.value2).value
}
}
if (expression.type === 'divide') {
return {
type: 'number',
value: interpretExpression(expression.value1).value + interpretExpression(expression.value2).value
}
}
}

function interpret(semanticAnalyzed) {
for (const semanticAnalyzedPart of semanticAnalyzed) {
if (semanticAnalyzedPart.type === 'var_set') {

}
}
}

*/ 
