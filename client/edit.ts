declare var CodeMirror: any;
let editor: any;
CodeMirror.defineMode('custom', function (config: any, parserConfig: any) {
    const keywords = new Set(['log']);
    const operators = new Set(['+', '-', '*', '/', '=']);

    return {
        token: function (stream: any, state: any) {
            if (stream.eatSpace()) return null;

            let ch = stream.next();

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

let lastChoice: HTMLDivElement | null = null;

function chooseEventHandler(event: Event) {
    const elm = event.currentTarget as HTMLDivElement;
    if (lastChoice != null) {
        lastChoice.classList.remove('chosen');
    }
    elm.classList.add('chosen');
    lastChoice = elm;
    const eventHidden = document.getElementById('event-title') as HTMLInputElement;
    eventHidden.value = elm.innerText
}

function closePopup() {
    const popupContainer = document.getElementById('popup-container') as HTMLDivElement;
    popupContainer.style.display = 'none';
    popupContainer.style.opacity = '0%';
}

function openPopup() {
    const popupContainer = document.getElementById('popup-container') as HTMLDivElement;
    popupContainer.style.display = 'inline';
    popupContainer.style.opacity = '100%';
}

function run() {
    editor.setSize('50vw', '77vh')
}


document.addEventListener('DOMContentLoaded', async event => {

    const pageData = await (await fetch(`/edit.json`, {
        method: 'POST'
    })).json()
    const textArea = document.getElementById('code') as HTMLTextAreaElement;
    textArea.focus();
    textArea.select();
    textArea.value = pageData['code']
    editor = CodeMirror.fromTextArea(textArea, {
        lineNumbers: true,
        mode: 'custom',  // Ensure the mode name matches your custom mode
        indentUnit: 4,
        theme: 'material-darker',
        autoCloseBrackets: true // Enable auto-closing brackets, quotes, ect
    });
    editor.setSize('100vw', '77vh')

    const addedEvents = document.getElementById('events') as HTMLDivElement;
    const chooseEvent = document.getElementById('choose-event') as HTMLDivElement;
    for (const [eventTitle, added, selected] of pageData['events']) {
        if (added) {
            const eventDiv = document.createElement('div') as HTMLDivElement;
            eventDiv.classList.add('event');
            if (selected) {
                eventDiv.classList.add('selected');
            }
            eventDiv.appendChild(document.createTextNode(eventTitle));
            addedEvents.appendChild(eventDiv);
        }
        const eventChoiceDiv = document.createElement('div') as HTMLDivElement;
        eventChoiceDiv.classList.add('event-choice');
        if (added) {
            eventChoiceDiv.classList.add('already-added');
        } else {
            eventChoiceDiv.addEventListener('click', chooseEventHandler);
        }
        const circle = document.createElement('div') as HTMLDivElement;
        circle.classList.add('circle');
        eventChoiceDiv.appendChild(circle);
        eventChoiceDiv.appendChild(document.createTextNode(eventTitle));
        chooseEvent.appendChild(eventChoiceDiv);
    }

    const exit = document.getElementById('exit') as HTMLDivElement;
    const darken = document.getElementById('darken') as HTMLDivElement;
    const addEvent = document.getElementById('add-event') as HTMLDivElement;

    exit.addEventListener('click', closePopup);
    darken.addEventListener('click', closePopup);
    addEvent.addEventListener('click', openPopup);
});