export function registerLineNumbers(_this) {
    _this.isMouseDown = false;

    _this.codeContainer.addEventListener('scroll', () => {
        // Synchronize vertical scroll between line numbers and code editor
        const lineNumberContainer = _this.shadow.getElementById('line-number-container');
        lineNumberContainer.style.marginTop = `${-_this.codeContainer.scrollTop}px`;
    });

    // Listen for mouse down on the editor to start tracking a potential text selection
    _this.editor.addEventListener('mousedown', () => {
        _this.isMouseDown = true;
        _this.render(["line"]);
    });

    // Listen for mouse move on the editor to update the highlight as the user drags
    _this.editor.addEventListener('mousemove', () => {
        if (_this.isMouseDown) { // Only highlight if the mouse is down
            _this.render(["line"]);
        }
    });

    // Listen for mouse up on the entire document to handle the end of the selection
    _this.shadow.addEventListener('mouseup', () => {
        if (_this.isMouseDown) {
            _this.isMouseDown = false;
            _this.render(["line"]);
        }
    });

    _this.editor.addEventListener('keydown', (e) => {
        // Call the method to highlight all line numbers after a brief delay to ensure the 
        // selection has been updated 10ms is an arbitrary value that seems to work well.
        setTimeout(() => {
            _this.render(["line"]);
        }, 10);
    });
    
    _this.editor.addEventListener('click', () => {
        // Without the setTimeout and 10ms delay, the line numbers don't always update
        // correctly. It sometimes will select the correct row you clicked on and highlight
        // that row, but typically not when selecting a row with no contents and then line
        // numbers don't update in that scenario.
        setTimeout(() => {
            _this.render(["line"])
        }, 10);
    });
    _this.editor.addEventListener('blur', () => _this.render(["line"]));
}

export function updateLineNumbersHeight(_this, value) {
    const lineNumberContainer = _this.shadow.getElementById('line-number-container');
    lineNumberContainer.style.height = `${value}px`;
}