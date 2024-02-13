const css = `
    code[class*="language-"],
    pre[class*="language-"],
    .moondust .token.operator {
        color: var(--color-primary-light) !important;
    }

    .moondust .token.invalid {
        color: #ff0000 !important;
    }

    .moondust .keyword {
        color: var(--color-neutral-500) !important;
    }

    .moondust .comment {
        color: var(--color-neutral-500) !important;
    }

    .moondust .token.variable,
    .moondust .token.function {
        color: #111111 !important;
    }

    .moondust .token.punctuation {
        color: var(--color-primary-light) !important;
    }

    .moondust .token.number {
        color: var(--color-primary-light) !important;
    }

    .moondust .token.string {
        color: var(--color-neutral-500) !important;
    }




    .moondust .dark code[class*="language-"],
    .moondust .dark pre[class*="language-"],
    .moondust .dark .token.operator {
        color: var(--color-primary-dark) !important;
    }

    .moondust .dark .token.invalid {
        color: #ff0000 !important;
    }

    .moondust .dark .token.keyword {
        color: var(--color-neutral-400) !important;
    }

    .moondust .dark .token.comment {
        color: var(--color-neutral-500) !important;
    }

    .moondust .dark .token.variable,
    .moondust .dark .token.function {
        color: var(--color-primary-dark) !important;
    }

    .moondust .dark .token.punctuation {
        color: var(--color-primary-dark) !important;
    }

    .moondust .dark .token.number {
        color: var(--color-primary-dark) !important;
    }

    .moondust .dark .token.string {
        color: var(--color-neutral-400) !important;
    }
`;
export default css;