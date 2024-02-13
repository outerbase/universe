export function setupLineNumbers(_this) {
    _this.codeContainer.addEventListener('scroll', () => {
        // Synchronize vertical scroll between line numbers and code editor
        const lineNumberContainer = _this.shadow.querySelector('#line-number-container');
        lineNumberContainer.style.marginTop = `${-_this.codeContainer.scrollTop}px`;
    });
}