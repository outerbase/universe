const css = `
    #line-number-container {
        padding: var(--padding-horizontal);
        font-family: var(--font-family-mono);
        font-size: var(--font-size);
        line-height: var(--line-height);
        color: var(--color-neutral-500);
        text-align: right;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .dark #line-number-container {
        color: var(--color-neutral-400);
    }

    .active-line-number {
        color: var(--color-neutral-800);
    }

    .dark .active-line-number {
        color: var(--color-neutral-50);
    }
`;
export default css;