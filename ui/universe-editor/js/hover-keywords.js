export function registerHoverKeywords() {
    if (typeof document === 'undefined') return

    /**
     * TODO:
     * - Can we track when multiple words are hovered over, such as `CREATE TABLE`?
     * - Can we track when a word is hovered over and it's a prefix of a keyword, such as `VARCHAR`?
     */

    var css = `
        .hover-tooltip {
            position: absolute;
            z-index: 1000;
            background-color: var(--color-neutral-400);
            width: 300px;
            max-height: 300px;
            overflow-y: hidden;
            left: 0;
            top: 0;
            border-radius: 4px;
            transition: opacity 0.2s;
            display: flex;
            flex-direction: column;
            opacity: 0;
            z-index: 0;
            font-family: sans-serif;
        }

        .tooltip-container {
            flex: 1;
            overflow-y: scroll;
        }

        .tooltip-title {
            background-color: var(--color-neutral-600);
            color: white;
            padding: 4px 8px;
            font-family: var(--font-family-mono);
            font-size: 12px;
        }

        .tooltip-description {
            padding: 8px 8px 4px 8px;
            color: var(--color-neutral-100);
            font-size: 14px;
            line-height: 1.25;
        }

        .tooltip-example {
            padding: 8px;
            display: none;
            font-size: 12px;
            font-weight: 600;
        }
    `

    var html = `<div class="hover-tooltip">
        <div class="tooltip-title">Title</div>

        <div class="tooltip-container">
            <div class="tooltip-description">Variable-length character string that can hold letters, numbers and special characters. By default the length is 1 character, but to define a maximum length you can pass in an integer value. To use the maximum length available in the database you can use</div>
            
            <div class="tooltip-example">
                <div style="margin-bottom: 4px;">Examples:</div>
                <div style="background: black; padding: 8px; border-radius: 4px;">
                    <outerbase-editor
                        id="sql-editor"
                        code="SELECT * FROM table\nSELECT * FROM another"
                        language="sql"
                        theme="moondust"
                        mode="dark"
                    ></outerbase-editor>
                </div>
            </div>
        </div>
    </div>`

    // Create a new DOM element that will contain the hover tooltip
    var insertDiv = document.createElement('div')
    insertDiv.innerHTML = html
    this.shadowRoot.getElementById('code-container').appendChild(insertDiv)

    // Add css to the shadow DOM
    var style = document.createElement('style')
    style.innerHTML = css
    this.shadowRoot.appendChild(style)

    var previousWord = ''
    let tooltipDebounceTime = 250
    let hoverTimeout // For showing the tooltip
    let leaveTimeout // For hiding the tooltip

    // Prevent tooltip from hiding when mouse is over it
    this.shadowRoot.querySelector('.hover-tooltip').addEventListener('mouseenter', () => {
        // console.log('Enter: ', leaveTimeout)
        clearTimeout(leaveTimeout)
    })

    this.shadowRoot.querySelector('.hover-tooltip').addEventListener('mouseleave', (event) => {
        // console.log('Leave from tooltip', 'Target:', event.target, 'RelatedTarget:', event.relatedTarget);
        leaveTimeout = setTimeout(() => hideTooltip.apply(this), tooltipDebounceTime)
    })

    this.shadowRoot.getElementById('code-container').addEventListener('mouseout', (event) => {
        // console.log('Leave from container', 'Target:', event.target, 'RelatedTarget:', event.relatedTarget);
        leaveTimeout = setTimeout(() => hideTooltip.apply(this), tooltipDebounceTime)
    })

    this.shadowRoot.getElementById('code-container').addEventListener('mousemove', (e) => {
        clearTimeout(hoverTimeout)
        clearTimeout(leaveTimeout)

        const codeElement = this.shadowRoot.querySelector('code')
        const lineHeight = parseInt(getComputedStyle(codeElement).lineHeight)
        const line = Math.floor(e.offsetY / lineHeight)
        const lineText = this.editor.value.split('\n')[line]

        // Get word at cursor position on the line
        const rect = codeElement.getBoundingClientRect()
        const x = e.clientX - rect.left - 10
        const y = e.clientY - rect.top

        // Get character at X position if each character width is 15px
        const charWidth = 7.8
        const charIndex = Math.floor(x / charWidth)
        const word = getWordAtIndex(lineText, charIndex)
        const wordX = getXPositionOfWordAtIndex(lineText, charIndex, charWidth) + 10

        // If no word is found, exit early to help performance.
        if (!word) {
            return
        }

        const accepted_keywords = [
            {
                word: 'VARCHAR',
                description:
                    'Variable-length character string that can hold letters, numbers and special characters. By default the length is 1 character, but to define a desired maximum length you can pass in an integer value. To use the maximum length available in the database you can use MAX.',
                example: `VARCHAR -- Default length is 1 character
VARCHAR(255) -- Maximum length is 255 characters
VARCHAR(MAX) -- Maximum length available in the database`,
                performance: 'Medium',
                complexity: 'Low',
            },
        ]

        var acceptedWord = false
        for (var i = 0; i < accepted_keywords.length; i++) {
            if (word?.toUpperCase() === accepted_keywords[i].word) {
                acceptedWord = accepted_keywords[i]
                break
            }
        }

        // If the word is accepted, show the tooltip
        if (acceptedWord) {
            previousWord = word
            hoverTimeout = setTimeout(() => showTooltip(wordX, lineHeight, line, acceptedWord).apply(this), 1000)
        }
    })

    // TODO removeEventListener()s
}

const showTooltip = (wordX, lineHeight, line, acceptedWord) => {
    const hoverTooltip = this.shadowRoot.querySelector('.hover-tooltip')
    hoverTooltip.style.left = `${wordX}px`
    hoverTooltip.style.top = `${line * lineHeight + lineHeight}px`
    hoverTooltip.style.opacity = '1'
    hoverTooltip.style.zIndex = '1000'

    const tooltipTitle = hoverTooltip.querySelector('.tooltip-title')
    const tooltipDescription = hoverTooltip.querySelector('.tooltip-description')
    tooltipTitle.innerHTML = acceptedWord.word
    tooltipDescription.innerHTML = acceptedWord.description

    // Scroll `tooltip-container` to top
    const tooltipContainer = hoverTooltip.querySelector('.tooltip-container')
    tooltipContainer.scrollTop = 0

    // Replace code in `sql-editor` with the example
    const tooltipExample = hoverTooltip.querySelector('.tooltip-example')
    if (acceptedWord.example) {
        tooltipExample.style.display = 'block'

        // Get outerbase-editor where id = `sql-editor`
        const sqlEditor = tooltipExample.querySelector('#sql-editor')
        sqlEditor.setAttribute('code', acceptedWord.example)
    } else {
        tooltipExample.style.display = 'none'
    }
}

const hideTooltip = () => {
    const hoverTooltip = this.shadowRoot.querySelector('.hover-tooltip')
    hoverTooltip.style.opacity = '0'
    hoverTooltip.style.zIndex = '0'
}

function getWordAtIndex(str, index) {
    if (!str) return null;

    // Check if the index is within the bounds of the string
    if (index < 0 || index >= str.length) {
        return null // or throw an error, or return an empty string, depending on your needs
    }

    // Use a regular expression to split the string into words
    // This regex will split the string at spaces, punctuation, and line breaks
    // Adjust the regex as needed based on what you consider a word boundary
    const words = str.split(/\b/)

    // Find the word that contains the index
    let currentIndex = 0
    for (let word of words) {
        if (index >= currentIndex && index < currentIndex + word.length) {
            // Check if the word is actually a word and not just spaces or punctuation
            if (/\w/.test(word)) {
                return word
            } else {
                // If the character at the index is not part of a word (e.g., a space or punctuation),
                // you might want to return an empty string or null, depending on your requirements
                return null
            }
        }

        currentIndex += word.length
    }

    // Return null if no word is found at the index
    // This could happen if the index is in spaces or punctuation
    return null
}

function getXPositionOfWordAtIndex(str, index, charWidth = 7.8) {
    if (!str) return null;
    
    // Check if the index is within the bounds of the string
    if (index < 0 || index >= str.length) {
        return null // or throw an error, or return an empty string, depending on your needs
    }

    // Use a regular expression to split the string into words and non-word segments
    const segments = str.split(/(\b)/)

    let currentIndex = 0
    let xPosition = 0 // Initialize X position

    for (let segment of segments) {
        if (index >= currentIndex && index < currentIndex + segment.length) {
            // If the segment at the index is a word
            if (/\w/.test(segment)) {
                // Calculate the X position of the start of the word
                xPosition = currentIndex * charWidth
                return xPosition
            } else {
                // If the index is not part of a word (e.g., space or punctuation),
                // you might want to handle this differently depending on your requirements
                return null
            }
        }
        currentIndex += segment.length
    }

    // Return null if no word is found at the index
    return null
}
