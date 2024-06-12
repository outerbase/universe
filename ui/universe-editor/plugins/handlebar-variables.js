export class HandlebarVariablesPlugin {
    constructor() { }

    init(parent, attributeValue) {
        this.updatePrismLogic();
    }

    updatePrismLogic() {
        if (typeof Prism !== 'undefined') {
            if (Prism.languages.sql) {
                const schemaPattern = {
                    'variable-token': { // This is the token name
                        pattern: /\{\{(.*?)\}\}/, // Matches any text within double curly braces
                        alias: 'variable-token' // Use 'alias' to apply a special CSS class
                    }
                };
    
                // Insert the new token in the SQL language before 'keyword', or another suitable token
                Prism.languages.insertBefore('sql', 'keyword', schemaPattern);
            }
    
            Prism.highlightAllUnder(this.parent);
        }
    }

    attributeName() {
        return "plugin-handlebar-variables";
    }

    css() {
        return `
            .variable-token { 
                position: relative; 
                color: var(--color-neutral-700);
            }

            .variable-token::before {
                content: "";
                position: absolute;
                left: -4px;
                right: -4px;
                top: -2px;
                bottom: -2px;
                background: var(--color-neutral-200);
                z-index: -1;
                border-radius: 4px;
            }

            .dark .variable-token {
                color: var(--color-neutral-300);
            }

            .dark .variable-token::before {
                background: var(--color-neutral-800);
            }
        `;
    }

    html() {
        return null
    }

    location() {
        return 'center'
    }
}

window.HandlebarVariablesPlugin = HandlebarVariablesPlugin;
