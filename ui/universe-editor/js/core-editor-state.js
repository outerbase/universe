/**
 * Provide 
 */
export class CoreEditorState {
    lines = [] 
    startLineNumber = 0
    endLineNumber = 0
    isMouseHold = false

    constructor() {}

    init(parent) {
        this.parent = parent
        this.editor = parent.shadowRoot.querySelector('.editor')
        this.previousState = this._getState()
    }

    attributeName() {
        return 'core'
    }

    onMouseDown() {
        this.isMouseHold = true
        requestAnimationFrame(() => {
            this._recalculateLineInfo()
            this._broadcastState()
        })
    }

    onMouseMove() {
        if (this.isMouseHold) {
            this._recalculateLineInfo()
            this._broadcastState()
        }
    }

    onMouseUp() {
        this.isMouseHold = false
        requestAnimationFrame(() => {
            this._recalculateLineInfo()
            this._broadcastState()
        })

    }

    onFocus() {
        this._recalculateLineInfo()
        this._broadcastState()
    }

    onBlur() {
        this._recalculateLineInfo()
        this._broadcastState()
    }

    onKeyDown() {
        this._recalculateLineInfo()
        this._broadcastState()
    }

    onInputChange(value) {
        this.lines = value.split('\n')
        this._recalculateLineInfo()
        this._broadcastState()
    }

    _recalculateLineInfo() {
        this.startLineNumber = this._getLineNumberFromPosition(this.editor.selectionStart)
        this.endLineNumber = this._getLineNumberFromPosition(this.editor.selectionEnd)
    }

    /**
     * Find the number line from the given character position.
     * The first number start from 0.
     * 
     * @param {*} position
     * @returns 
     */
    _getLineNumberFromPosition(position) {
        let startLinePos = 0
        for (let i = 0; i < this.lines.length; i++) {
            const endLinePos = startLinePos + this.lines[i].length + 1;
            if (position < endLinePos) return i
            startLinePos = endLinePos
        }

        return this.lines.length - 1;
    }

    _broadcastState() {
        const previousState = this.previousState
        const currentState = this._getState()

        // We only broadcast if there is actual change for performance
        if (
            previousState.lines !== currentState.lines ||
            previousState.selectionStart !== currentState.selectionStart ||
            previousState.selectionEnd !== currentState.selectionEnd
        ) {
            this.parent.broadcastEvent(this.parent, 'onStateChange', currentState)
            this.previousState = currentState
        }
    }

    _getState() {
        return {
            lines: this.lines,
            selectionStart: this.editor.selectionStart,
            selectionEnd: this.editor.selectionEnd,
            startLineNumber: this.startLineNumber,
            endLineNumber: this.endLineNumber,
        }
    }
}

window.CoreEditorState = CoreEditorState;