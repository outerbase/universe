const css = `
    :host {
        --z-scroll-bar: 3;
        --scroll-bar-background-color: var(--color-neutral-200);
        --scroll-bar-background-color-dark: var(--color-neutral-900);
        --scroll-bar-inactive-color: var(--color-neutral-300);
        --scroll-bar-inactive-color-dark: var(--color-neutral-800);
        --scroll-bar-active-color: var(--color-neutral-400);
        --scroll-bar-active-color-dark: var(--color-neutral-700);
    }

    #outer-container:hover #scrollbar-bottom {
        opacity: 1;
    }

    .scrollbar-active {
        opacity: 1;
        background-color: var(--scroll-bar-active-color) !important;
    }

    .dark ~ #scrollbar-bottom > .scrollbar-active {
        background-color: var(--scroll-bar-active-color-dark) !important;
    }

    #scrollbar-bottom {
        opacity: 0;
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        height: 10px; 
        background-color: var(--scroll-bar-background-color);
        z-index: var(--z-scroll-bar);
        transition: opacity 0.3s;
        border-radius: 6px;
    }

    .dark ~ #scrollbar-bottom {
        background-color: var(--scroll-bar-background-color-dark);
    }

    #scrollbar-bottom-thumb {
        position: absolute; 
        left: 0; 
        width: 50px; 
        height: 10px; 
        background-color: var(--scroll-bar-inactive-color);
        border-radius: 6px;
        cursor: pointer;
    }

    .dark ~ #scrollbar-bottom > #scrollbar-bottom-thumb {
        background-color: var(--scroll-bar-inactive-color-dark); 
    }

    #scrollbar-bottom-thumb:hover {
        background-color: var(--scroll-bar-active-color);
    }
    
    .dark ~ #scrollbar-bottom > #scrollbar-bottom-thumb:hover {
        background-color: var(--scroll-bar-active-color-dark) !important;
    }
`;
export default css;