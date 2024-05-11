export class CoreLineHighlight {
    parent = null
    editor = null
    codeContainer = null

    constructor() {}

    init(parent, attributeValue) {
        this.parent = parent
        this.editor = parent.shadowRoot.querySelector('.editor')
        this.codeContainer = this.parent.shadowRoot.getElementById('code-container')
    }

    attributeName() {
        return 'core'
    }

    css() {
        return `
        .background-highlight {
            position: absolute;
            width: 100%;
            height: var(--line-height);
            background-color: var(--color-neutral-200);
            opacity: 0;
            z-index: 1;
            pointer-events: none;
            border-radius: 4px;
            transition: transform 0.2s;
        }
    
        .dark .background-highlight {
            background-color: var(--color-neutral-800);
        }
        `
    }

    html() {
        return `
        <div class="background-highlight"></div>
        `
    }

    location() {
        return 'center'
    }

    insertBefore() {
        return 1
    }

    insertAsChild() {
        return '#code-container'
    }

    onFocus() {
        const backgroundHighlight = this.parent.shadowRoot.querySelector('.background-highlight')
        backgroundHighlight.style.opacity = 1
    }

    onBlur() {
        const backgroundHighlight = this.parent.shadowRoot.querySelector('.background-highlight')
        backgroundHighlight.style.opacity = 0
    }

    onMouseDown() {
        this.updateActives()
    }

    onKeyDown() {
        this.updateActives()
    }

    onInputChange(value) {
        this.updateActives()
    }

    updateActives() {
        requestAnimationFrame(() => {
            this.highlightActiveLine()
        })
    }

    highlightActiveLine() {
        const lineHeight = parseFloat(getComputedStyle(this.editor).lineHeight)
        const lineNumber = this.editor.value.substr(0, this.editor.selectionStart).split('\n').length
        const highlightPosition = (lineNumber - 1) * lineHeight
        const backgroundHighlight = this.parent.shadowRoot.querySelector('.background-highlight')

        requestAnimationFrame(() => {
            backgroundHighlight.style.top = `${highlightPosition}px`
            backgroundHighlight.style.width = this.editor.style.width

            // Animate the `backgroundHighlight` component by scaling up and down
            // to create a smooth transition between active lines
            backgroundHighlight.style.transform = 'scaleY(1.25)'
            setTimeout(() => {
                backgroundHighlight.style.transform = 'scaleY(1)'
            }, 200)
        })
    }
}

window.CoreLineHighlight = CoreLineHighlight
