export function registerLineHints(_this) {
    var css = `
        #line-hint-container {
            padding: 0 8px;
            font-family: var(--font-family-mono);
            font-size: var(--font-size);
            line-height: var(--line-height);
            color: var(--color-neutral-500);
            text-align: right;
            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        #line-hint-container .line-hint {
            display: inline-block;
            line-height: var(--line-height);
            /*
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background: white;
            */
        }
    `;

    var html = `<div id="line-hint-container">
        <span class="line-hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256"><path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z"></path></svg>
        </span>
    </div>`;

    // Create a new DOM element that will contain the hover tooltip
    var insertDiv = document.createElement('div');
    insertDiv.innerHTML = html;
    
    // Insert plugin at the first index of `#left`
    // _this.shadow.getElementById('left').insertBefore(insertDiv, _this.shadow.getElementById('left').childNodes[0]);
    _this.shadow.getElementById('right').appendChild(insertDiv);

    // Add css to the shadow DOM
    var style = document.createElement('style');
    style.innerHTML = css;
    _this.shadow.appendChild(style);

    // Set `svg` height to `var(--line-height)`
    var svg = _this.shadow.querySelector('svg');
    var lineHeight = _this.shadow.querySelector('.line-hint');
    lineHeight = window.getComputedStyle(lineHeight).getPropertyValue('line-height');
    lineHeight = Number(lineHeight.replace('px', ''));
    svg.setAttribute('height', lineHeight - 4)
    svg.setAttribute('width', lineHeight - 4)
}