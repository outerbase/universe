export function setupScrollbars(_this) {
    setup();
    updateScrollbarDimensions(_this);

    window.addEventListener('resize', () => updateScrollbarDimensions(_this));

    _this.codeContainer.addEventListener('scroll', () => {
        updateScrollbarDimensions(_this);

        // Synchronize horizontal scroll between code editor and scrollbar thumb
        const scrollWidth = _this.codeContainer.scrollWidth //- _this.codeContainer.clientWidth;
        const scrollX = _this.codeContainer.scrollLeft;
        const thumbX = (scrollX / scrollWidth) * 100; // Convert scroll position to percentage

        _this.scrollbarBottomThumb.style.left = `${thumbX}%`;
    });

    // function updateScrollbarThumbWidth() {
    //     if (!_this.codeContainer) return
        
    //     const containerWidth = _this.codeContainer.offsetWidth; // Visible width
    //     const scrollWidth = _this.codeContainer.scrollWidth; // Total scrollable content width
    //     const scrollbarWidth = containerWidth / scrollWidth * 100; // Percentage of visible width to total width

    //     console.log('containerWidth: ', containerWidth)
    //     console.log('scrollWidth: ', scrollWidth)
    //     console.log('scrollbarWidth: ', scrollbarWidth)
    
    //     _this.scrollbarBottomThumb.style.width = `${scrollbarWidth}%`; // Set thumb width as a percentage of its parent
    // }

    function setup() {
        let isDragging = false;
        let startX;
        let scrollStartX;

        _this.scrollbarBottomThumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX; // Starting X position of the mouse
            scrollStartX = _this.codeContainer.scrollLeft; // Starting scroll position
            document.body.classList.add('user-select-none'); // Optional: Disable text selection during drag
            
            _this.scrollbarBottomThumb.classList.add('scrollbar-active'); // Optional: Show scrollbar thumb as active

            e.preventDefault(); // Prevent text selection/dragging behavior
        });

        document.addEventListener('mouseup', (e) => {
            isDragging = false;
            document.body.classList.remove('user-select-none'); // Re-enable text selection after dragging
            _this.scrollbarBottomThumb.classList.remove('scrollbar-active'); // Optional: Show scrollbar thumb as active
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.pageX - startX; // Calculate mouse movement
            // const codeContainer = document.getElementById('code-container');
            // const scrollWidth = this.codeContainer.scrollWidth - this.codeContainer.clientWidth;
            const thumbWidthPercent = _this.codeContainer.clientWidth / _this.codeContainer.scrollWidth;
            const scrollX = scrollStartX + (deltaX / thumbWidthPercent);
            _this.codeContainer.scrollLeft = scrollX;
        });

    }
}

export function updateScrollbarDimensions(_this) {
    if (!_this.codeContainer) return

    _this.scrollbarBottom.style.left = `${_this.codeContainer.offsetLeft}px`; // Set scrollbar position to match the code container
    _this.scrollbarBottom.style.width = `${_this.codeContainer.offsetWidth}px`; // Set scrollbar width to match the code container
    
    const containerWidth = _this.codeContainer.offsetWidth; // Visible width
    const scrollWidth = _this.codeContainer.scrollWidth; // Total scrollable content width
    const scrollbarWidth = containerWidth / scrollWidth * 100; // Percentage of visible width to total width

    _this.scrollbarBottomThumb.style.width = `${scrollbarWidth}%`; // Set thumb width as a percentage of its parent
}
