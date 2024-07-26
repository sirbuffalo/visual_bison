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
    // Assuming the AST is JSON stored in data-code attribute.
    const astElement = document.getElementById('code-parsed');
    if (!astElement) {
        throw new Error('AST element not found');
    }
    const codeData = astElement.dataset.code;
    console.log("Data-code attribute value:", codeData); // Log the data-code attribute value
    let ast;
    try {
        ast = JSON.parse(codeData || '[]');
    }
    catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error('Invalid JSON in data-code attribute');
    }
    const state = {
        log: log,
        vars: new Map(),
        funcs: new Map([
            ["log", funcLog],
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
        case "add":
            return (await execExpr(state, expr.value1)) + (await execExpr(state, expr.value2));
        case "subtract":
            return (await execExpr(state, expr.value1)) - (await execExpr(state, expr.value2));
        case "multiply":
            return (await execExpr(state, expr.value1)) * (await execExpr(state, expr.value2));
        case "divide":
            return (await execExpr(state, expr.value1)) / (await execExpr(state, expr.value2));
    }
    throw new Error("unknown expression type");
}
async function funcLog(state, args) {
    state.log.appendChild(document.createTextNode(args[0] + "\n"));
}
