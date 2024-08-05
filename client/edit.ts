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

CodeMirror.defineMode('custom', function (config: any, parserConfig: any) {
    const keywords = new Set(['log']);
    const operators = new Set(['+', '-', '*', '/', '=']);

    return {
        token: function (stream: any, state: any) {
            if (stream.eatSpace()) return null;

            const ch = stream.next();

            if (operators.has(ch)) {
                return 'operator';
            }

            if (ch === '"' || ch === "'") {
                stream.match(/.*?["']/);
                return 'string';
            }

            if (/\d/.test(ch)) {
                stream.eatWhile(/\d/);
                return 'number';
            }

            stream.eatWhile(/[a-zA-Z_]/);
            const word = stream.current();
            if (keywords.has(word)) {
                return 'keyword';
            }

            stream.eatWhile(/[\w]/);
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

function run(): void {
    if (!runTabOpen) {
        editor.setSize('calc(50vw - .25vh)', '77vh');
        rightSide.style.width = 'calc(50vw - 0.25vh)';
        rightSide.style.display = 'inline';
        runDivider.style.display = 'inline';
        runTabOpen = true;
    }
}

function openConsole(): void {
    consoleContainer.style.display = 'inline';
}

function closeConsole(): void {
    consoleContainer.style.display = 'none';
}

function logToConsole(value: string): void {
    const valueSpan: HTMLSpanElement = document.createElement('span') as HTMLSpanElement;
    const valueTextNode: Text = document.createTextNode(value) as Text;
    valueSpan.appendChild(valueTextNode);
    consoleDiv.appendChild(valueSpan);
    consoleDiv.appendChild(document.createElement('br'))
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
        return { code: '', events: [] };
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
    openConsoleButton = document.getElementById('open-console') as HTMLDivElement;

    const pageData = await fetchPageData();

    textArea.focus();
    textArea.select();
    textArea.value = pageData.code;
    editor = CodeMirror.fromTextArea(textArea, {
        lineNumbers: true,
        mode: 'custom',
        indentUnit: 4,
        theme: 'material-darker',
        autoCloseBrackets: true
    });
    editor.setSize('100vw', '77vh');

    pageData.events.forEach(([eventTitle, added, selected]) => {
        if (added) {
            const eventDiv = createEventElement(eventTitle, selected);
            addedEvents.appendChild(eventDiv);
        }
        const eventChoiceDiv = createEventChoiceElement(eventTitle, added);
        chooseEvent.appendChild(eventChoiceDiv);
    });

    exitPopup.addEventListener('click', closePopup);
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