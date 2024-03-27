const css = `
    :host {
        --font-family-mono: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        --font-size: 13px;
        --line-height: 18px;
        --padding-horizontal: 0 10px;
        
        --color-neutral-50: #fafafa;
        --color-neutral-200: #e5e5e5;
        --color-neutral-300: #d4d4d4;
        --color-neutral-400: #a3a3a3;
        --color-neutral-500: #737373;
        --color-neutral-600: #525252;
        --color-neutral-700: #404040;
        --color-neutral-800: #262626;
        --color-neutral-900: #171717;
        --color-primary-dark: white;
        --color-primary-light: black;

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    ::-moz-selection {
        background: var(--color-neutral-300) !important;
    }

    ::selection {
        background: var(--color-neutral-300) !important;
    }

    .dark ::-moz-selection {
        background: var(--color-neutral-700) !important;
    }

    .dark ::selection {
        background: var(--color-neutral-700) !important;
    }

    #outer-container {
        height: 100%; 
        display: flex; 
        flex-direction: column; 
        position: relative;
    }

    #container {
        position: relative;
        width: 100%;
        margin: 0;
        display: flex;
        flex-direction: row;
    }

    #code-container {
        flex: 1;
        position: relative;
        min-height: 100%;
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
    }

    #code-container::-webkit-scrollbar { 
        display: none;  /* Safari and Chrome */
    }

    textarea, code, .width-measure {
        padding: var(--padding-horizontal) !important;
        white-space: pre;
        width: 100%; /* Adjust width as needed */
        min-height: 50px; /* Minimum height */
        overflow-y: hidden; /* Prevent scrollbar */
    }

    textarea {
        resize: none;
        outline: none;
    }

    pre, textarea, code, .width-measure {
        margin: 0 !important;
        min-height: 100%;
        min-width: 100%;
        background-color: transparent !important;
        font-family: var(--font-family-mono);
        font-size: var(--font-size)  !important;
        line-height: var(--line-height) !important;
    }

    .editor, pre, code {
        z-index: 2;
    }

    .editor {
        color: transparent;
        caret-color: var(--color-primary-light);
        border: none;
    }

    .dark .editor {
        caret-color: var(--color-primary-dark);
    }

    pre {
        padding: 0 !important;
    }

    code {
        pointer-events: none;
        position: absolute;
        top: 0px;
        color: var(--color-primary-light);
    }

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
`;
export default css;
