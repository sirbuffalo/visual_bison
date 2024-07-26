export async function main(cont) {
    cont.style.display = "flex";
    cont.style.flexDirection = "row";
    cont.style.alignItems = "stretch";
    cont.style.backgroundColor = "var(--color1)";
    cont.style.color = "var(--color2)";
    const editor = document.createElement("div");
    cont.appendChild(editor);
    editor.style.flexGrow = "1";
    editor.style.flexShrink = "0";
    editor.style.flexBasis = "0";
    editor.style.borderStyle = "solid";
    editor.style.borderWidth = "1px";
    editor.style.borderColor = "var(--color3)";
    const output = document.createElement("div");
    cont.appendChild(output);
    output.style.display = "flex";
    output.style.flexDirection = "column";
    output.style.flexGrow = "1";
    output.style.flexShrink = "0";
    output.style.flexBasis = "0";
    output.style.borderStyle = "solid";
    output.style.borderWidth = "1px";
    output.style.borderColor = "var(--color3)";
    const canv = document.createElement("div");
    output.appendChild(canv);
    canv.style.flexGrow = "5";
    canv.style.borderStyle = "solid";
    canv.style.borderWidth = "1px";
    canv.style.borderColor = "var(--color3)";
    const log = document.createElement("div");
    output.appendChild(log);
    log.style.flexGrow = "1";
    log.style.borderStyle = "solid";
    log.style.borderWidth = "1px";
    log.style.borderColor = "var(--color3)";
    const ast = await (await fetch("parsed.json")).json();
    const state = {
        log: log,
        vars: new Map(),
        funcs: new Map(),
    };
    for (const stmt of ast) {
        await execStmt(state, stmt);
    }
}
async function execStmt(state, stmt) {
    switch (stmt.type) {
        case "var_set":
            state.vars.set(stmt.name, await execExpr(stmt.value));
            break;
        case "function_call":
            //            state.funcs.get(stmt.name)()
            break;
        default:
            console.log("unknown statement:", stmt);
    }
}
async function execExpr(expr) {
    switch (expr.type) {
        case "number":
            return expr.value;
    }
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
