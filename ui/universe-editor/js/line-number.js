export function registerLineNumbers(_this) {
    _this.codeContainer.addEventListener('scroll', () => {
        // Synchronize vertical scroll between line numbers and code editor
        const lineNumberContainer = _this.shadow.getElementById('line-number-container');
        lineNumberContainer.style.marginTop = `${-_this.codeContainer.scrollTop}px`;
    });
}

export function updateLineNumbersHeight(_this, value) {
    const lineNumberContainer = _this.shadow.getElementById('line-number-container');
    lineNumberContainer.style.height = `${value}px`;
}