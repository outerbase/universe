const css = `
    /* Light theme */
    code[class*="language-"],
    pre[class*="language-"],
    .invasion .token.operator {
        color: #24292e !important;
    }

    .invasion .token.invalid {
        color: #ff0000 !important;
    }

    .invasion .token.keyword {
        color: #7f00ff !important;
    }

    .invasion .token.comment {
        color: #a3a3a3 !important;
    }

    .invasion .token.variable,
    .invasion .token.function {
        color: #000000 !important;
    }

    .invasion .token.punctuation {
        color: var(--color-primary-light) !important;
    }

    .invasion .token.number {
        color: #0000FF !important;
    }

    .invasion .token.string {
        color: #228B22 !important;
    }

    
    /* Dark theme */
    .invasion .dark code[class*="language-"],
    .invasion .dark pre[class*="language-"],
    .invasion .dark .token.operator {
        color: #f6f8fa !important;
    }

    .invasion .dark .token.invalid {
        color: #ff0000 !important;
    }

    .invasion .dark .token.keyword {
        color: #BD93F9 !important;
    }

    .invasion .dark .token.comment {
        color: var(--color-neutral-600) !important;
    }

    .invasion .dark .token.variable,
    .invasion .dark .token.function {
        color: #F8F8F2 !important;
    }

    .invasion .dark .token.punctuation {
        color: var(--color-primary-dark) !important;
    }

    .invasion .dark .token.number {
        color: #8BE9FD !important;
    }

    .invasion .dark .token.string {
        color: #50FA7B !important;
    }
`

export default css
