const css = `
    #outer-container:hover #scrollbar-bottom {
        opacity: 1;
    }

    .scrollbar-active {
        opacity: 1;
        background-color: var(--color-neutral-700) !important;
    }

    #scrollbar-bottom {
        opacity: 0;
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        height: 10px; 
        background-color: var(--color-neutral-900); 
        z-index: var(--z-scroll-bar);
        transition: opacity 0.3s;
        border-radius: 6px;
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
        background-color: var(--color-neutral-700);
        cursor: pointer;
    }
`;
export default css;