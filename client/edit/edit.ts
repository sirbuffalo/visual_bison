// @ts-ignore
import { runCode, Statement, State, Log } from '/run.js';
declare var CodeMirror: any;

let editor: any;
let runDivider: HTMLDivElement;
let runContainer: HTMLDivElement;
let rightSide: HTMLDivElement;
let consoleContainer: HTMLDivElement;
let consoleDragBar: HTMLDivElement;
let consoleDiv: HTMLDivElement;
let exitConsole: HTMLDivElement;
let exitPopup: HTMLDivElement;
let darken: HTMLDivElement;
let addEvent: HTMLDivElement;
let textArea: HTMLTextAreaElement;
let addedEvents: HTMLDivElement;
let chooseEvent: HTMLDivElement;
let eventHidden: HTMLInputElement;
let popupContainer: HTMLDivElement;
let runControl: HTMLDivElement;
let runButton: HTMLDivElement;
let openConsoleButton: HTMLDivElement;
let runTabOpen: boolean = false;
let resizing: boolean = false;
let draggingConsole: boolean = false;
let dragConsoleOffsetX: number | null = null;
let dragConsoleOffsetY: number | null = null;
let lastChoice: HTMLDivElement | null = null;

interface PageData {
    code: string;
    events: [string, boolean, boolean][];
}

CodeMirror.defineMode('visual_bison', function (config: any, parserConfig: any) {
    const keywords = new Set(['print']);
    const operators = new Set(['+', '-', '*', '/', '=']);

    return {
        token: function (stream: any, state: any): string | null {
            if (stream.eatSpace()) return null;

            const ch = stream.next();

// Handle potential signed numbers (e.g., +10, -10, +5.3, -5.3)
            if ((ch === '+' || ch === '-') && /\d/.test(stream.peek())) {
                stream.eatWhile(/\d|\./);
                return 'number';
            }

// Handle operators
            if (operators.has(ch)) {
                return 'operator';
            }

// Handle strings
            if (ch === '"' || ch === "'") {
                stream.match(/.*?["']/);
                return 'string';
            }

// Handle numbers (including floating-point numbers like 5.3)
            if (/\d/.test(ch)) {
                stream.eatWhile(/\d/); // Consume the digits before the decimal
                if (stream.peek() === '.') {
                    stream.next(); // Consume the decimal point
                    stream.eatWhile(/\d/); // Consume the digits after the decimal
                }
                return 'number';
            }

// Handle words (keywords or variable names)
            stream.eatWhile(/[a-zA-Z_]/);
            const word = stream.current();
            if (keywords.has(word)) {
                return 'keyword';
            }

            return null;
        }
    };
});

function chooseEventHandler(event: Event): void {
    const elm = event.currentTarget as HTMLDivElement;
    if (lastChoice) {
        lastChoice.classList.remove('chosen');
    }
    elm.classList.add('chosen');
    lastChoice = elm;
    eventHidden.value = elm.innerText;
}

function closePopup(): void {
    popupContainer.style.display = 'none';
    popupContainer.style.opacity = '0%';
}

function openPopup(): void {
    popupContainer.style.display = 'inline';
    popupContainer.style.opacity = '100%';
}

async function run(): Promise<void> {
    if (!runTabOpen) {
        editor.setSize('calc(50vw - .25vh)', '77vh');
        rightSide.style.width = 'calc(50vw - 0.25vh)';
        rightSide.style.display = 'inline';
        runDivider.style.display = 'inline';
        runTabOpen = true;
    }

    const responseJSON = await (await fetch('/parse', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: editor.getValue()
        })
    })).json()

    consoleDiv.innerHTML = ''
    if (responseJSON.error) {
        printToConsole(responseJSON.parsed)
    } else {
        await runCode(responseJSON.parsed, printToConsole)
    }
}

function openConsole(): void {
    consoleContainer.style.display = 'inline';
}

function closeConsole(): void {
    consoleContainer.style.display = 'none';
}

function printToConsole(toLog: Log) {
    switch (toLog.type) {
        case ('error'):
            const errorDiv = document.createElement('div')
            const lineNumDiv = document.createElement('span')
            const lineNumTextNode = document.createTextNode(toLog.line_num.toString())
            const messageDiv = document.createElement('span')
            const messageTextNode = document.createTextNode(`${toLog.error_type}: ${toLog.message}`)
            errorDiv.classList.add('error-console')
            lineNumDiv.classList.add('line-num-console')
            messageDiv.classList.add('message-console')
            lineNumDiv.appendChild(lineNumTextNode)
            messageDiv.appendChild(messageTextNode)
            errorDiv.appendChild(lineNumDiv)
            errorDiv.appendChild(messageDiv)
            consoleDiv.appendChild(errorDiv)
            break;
        case ('print'):
            const printDiv = document.createElement('div')
            const printTextNode = document.createTextNode(toLog.message)
            printDiv.classList.add('print-console')
            printDiv.appendChild(printTextNode)
            consoleDiv.appendChild(printDiv)
            break;
    }
}

function onDragConsoleStart(event: MouseEvent): void {
    event.preventDefault()
    dragConsoleOffsetX = event.offsetX
    dragConsoleOffsetY = event.offsetY
    draggingConsole = true
}

function onDragConsoleEnd(event: MouseEvent): void {
    event.preventDefault()
    dragConsoleOffsetY = null
    dragConsoleOffsetX = null
    draggingConsole = false
}

function onResizeStart(event: MouseEvent): void {
    event.preventDefault()
    resizing = true;
}

function onResizeEnd(event: MouseEvent): void {
    event.preventDefault()
    resizing = false;
}

function onMouseMove(event: MouseEvent): void {
    if (resizing) {
        event.preventDefault();

        const newMouseX: string = `min(max(${event.clientX}px, 0.25vh), 100vw - 0.25vh)`

        editor.setSize(`calc(${newMouseX} - 0.25vh)`, '77vh');
        rightSide.style.width = `calc(100vw - ${newMouseX} - 0.25vh)`;
    }
    if (draggingConsole && dragConsoleOffsetX != null && dragConsoleOffsetY != null) {
        event.preventDefault()
        consoleContainer.style.left = `min(max(${event.clientX - dragConsoleOffsetX}px, 0px), calc(100vw - 40vw))`
        consoleContainer.style.top = `min(max(${event.clientY - dragConsoleOffsetY}px, 0px), calc(100vh - 30vw))`
    }
}

async function fetchPageData(): Promise<PageData> {
    return fetch('/edit.json', {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Failed to fetch page data:', error);
            return {code: '', events: []};
        });
}

function createEventElement(eventTitle: string, selected: boolean): HTMLDivElement {
    const eventDiv = document.createElement('div');
    eventDiv.classList.add('event');
    if (selected) {
        eventDiv.classList.add('selected');
    }
    eventDiv.textContent = eventTitle;
    return eventDiv;
}

function createEventChoiceElement(eventTitle: string, added: boolean): HTMLDivElement {
    const eventChoiceDiv = document.createElement('div');
    eventChoiceDiv.classList.add('event-choice');
    if (added) {
        eventChoiceDiv.classList.add('already-added');
    } else {
        eventChoiceDiv.addEventListener('click', chooseEventHandler);
    }
    const circle = document.createElement('div');
    circle.classList.add('circle');
    eventChoiceDiv.appendChild(circle);
    eventChoiceDiv.appendChild(document.createTextNode(eventTitle));
    return eventChoiceDiv;
}

document.addEventListener('DOMContentLoaded', async () => {
    runDivider = document.getElementById('run-divider') as HTMLDivElement;
    runContainer = document.getElementById('run-container') as HTMLDivElement;
    rightSide = document.getElementById('right-side') as HTMLDivElement;
    consoleContainer = document.getElementById('console-container') as HTMLDivElement;
    consoleDragBar = document.getElementById('console-drag-bar') as HTMLDivElement;
    consoleDiv = document.getElementById('console') as HTMLDivElement;
    exitConsole = document.getElementById('exit-console') as HTMLDivElement;
    exitPopup = document.getElementById('exit-popup') as HTMLDivElement;
    darken = document.getElementById('darken') as HTMLDivElement;
    addEvent = document.getElementById('add-event') as HTMLDivElement;
    textArea = document.getElementById('code') as HTMLTextAreaElement;
    addedEvents = document.getElementById('events') as HTMLDivElement;
    chooseEvent = document.getElementById('choose-event') as HTMLDivElement;
    eventHidden = document.getElementById('event-title') as HTMLInputElement;
    popupContainer = document.getElementById('popup-container') as HTMLDivElement;
    runControl = document.getElementById('run-control') as HTMLDivElement;
    runButton = document.getElementById('run-button') as HTMLDivElement;
    openConsoleButton = document.getElementById('open-console') as HTMLDivElement;

    const pageData = await fetchPageData();

    textArea.focus();
    textArea.select();
    textArea.value = pageData.code;
    editor = CodeMirror.fromTextArea(textArea, {
        lineNumbers: true,
        mode: 'visual_bison',
        indentUnit: 4,
        theme: 'material-darker',
        autoCloseBrackets: true
    });
    editor.setSize('100vw', '77vh');

    let errorLine: null | HTMLDivElement = null
    editor.on("change", (instance: any, changeObj: any) => {
        if (errorLine) {
            errorLine.classList.remove('error')
        }
        fetch('/parse', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: instance.getValue()
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(parseJSON => {
                if (parseJSON.error) {
                    const error = parseJSON.parsed
                    errorLine = document.querySelector(`.CodeMirror-code > div:nth-child(${error.line_num}) > .CodeMirror-line`) as HTMLDivElement
                    errorLine.classList.add('error')
                }
            })
            .catch(error => {
                console.error('Failed to fetch page data:', error);
            });
    });

    pageData.events.forEach(([eventTitle, added, selected]) => {
        if (added) {
            const eventDiv = createEventElement(eventTitle, selected);
            addedEvents.appendChild(eventDiv);
        }
        const eventChoiceDiv = createEventChoiceElement(eventTitle, added);
        chooseEvent.appendChild(eventChoiceDiv);
    });

    exitPopup.addEventListener('click', closePopup);
    runButton.addEventListener('click', run)
    darken.addEventListener('click', closePopup);
    addEvent.addEventListener('click', openPopup);
    openConsoleButton.addEventListener('click', openConsole);
    exitConsole.addEventListener('click', closeConsole);
    runDivider.addEventListener('mousedown', onResizeStart);
    consoleDragBar.addEventListener('mousedown', onDragConsoleStart);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', (event: MouseEvent) => {
        onResizeEnd(event)
        onDragConsoleEnd(event)
    });
});