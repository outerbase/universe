const css = `
    :host {
        --z-scroll-bar: 3;
        --scroll-bar-active-color: var(--color-neutral-700);
    }

    #outer-container:hover #scrollbar-bottom {
        opacity: 1;
    }

    .scrollbar-active {
        opacity: 1;
        background-color: var(--scroll-bar-active-color) !important;
    }

    #scrollbar-bottom {
        opacity: 0;
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        height: 10px; 
        background-color: var(--color-neutral-200);
        z-index: var(--z-scroll-bar);
        transition: opacity 0.3s;
        border-radius: 6px;
    }

    .dark ~ #scrollbar-bottom {
        background-color: var(--color-neutral-900);
    }

    #scrollbar-bottom-thumb {
        position: absolute; 
        left: 0; 
        width: 50px; 
        height: 10px; 
        background-color: var(--color-neutral-800); 
        border-radius: 6px;
    }

    #scrollbar-bottom-thumb:hover {
        background-color: var(--scroll-bar-active-color);
        cursor: pointer;
    }
`;
export default css;