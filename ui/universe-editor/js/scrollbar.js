export function setupScrollbars(_this) {
    console.log('Parent: ', _this.codeContainer)

    setup();
    updateScrollbarThumbWidth();

    window.addEventListener('resize', updateScrollbarThumbWidth);

    _this.codeContainer.addEventListener('scroll', () => {
        // Synchronize horizontal scroll between code editor and scrollbar thumb
        const scrollWidth = _this.codeContainer.scrollWidth - _this.codeContainer.clientWidth;
        const scrollX = _this.codeContainer.scrollLeft;
        const thumbX = (scrollX / scrollWidth) * 100; // Convert scroll position to percentage
        _this.scrollbarBottomThumb.style.left = `${thumbX}%`;
    });

    function updateScrollbarThumbWidth() {
        if (!_this.codeContainer) return
        // const codeContainer = document.getElementById('code-container');
        // const scrollbarThumb = document.getElementById('scrollbar-bottom-thumb');
        const containerWidth = _this.codeContainer.offsetWidth; // Visible width
        const scrollWidth = _this.codeContainer.scrollWidth; // Total scrollable content width
        const scrollbarWidth = containerWidth / scrollWidth * 100; // Percentage of visible width to total width
    
        _this.scrollbarBottomThumb.style.width = `${scrollbarWidth}%`; // Set thumb width as a percentage of its parent
    }

    function setup() {
        let isDragging = false;
        let startX;
        let scrollStartX;

        _this.scrollbarBottomThumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX; // Starting X position of the mouse
            scrollStartX = _this.codeContainer.scrollLeft; // Starting scroll position
            document.body.classList.add('user-select-none'); // Optional: Disable text selection during drag

            e.preventDefault(); // Prevent text selection/dragging behavior
        });

        document.addEventListener('mouseup', (e) => {
            isDragging = false;
            document.body.classList.remove('user-select-none'); // Re-enable text selection after dragging
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
