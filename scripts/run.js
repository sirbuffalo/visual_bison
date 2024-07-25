const canvas = document.getElementById('canvas');

function resizeCanvas() {
    const aspectRatio = 4 / 3;
    let width = window.innerWidth;
    let height = window.innerHeight;

    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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