export function registerKeyboardShortcuts(editor, container, codeContainer, visualizer, language, redrawSyntaxHighlighting, updateLineNumbers, highlightItems, adjustTextAreaSize, indentLine, dispatchCustomEvent) {
    editor.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "Backspace") {
            // For an instant reflection of the active line and line number on key press
            // we use the `keydown` event instead of `keyup` or `input`. It won't be able
            // to calculate the correct details immediately because of `keydown`, so we
            // defer the calculation to the next tick using `setTimeout`.
            setTimeout(() => {
                highlightItems();
            }, 0);
        }
    });

    editor.addEventListener("input", (e) => {
        visualizer.innerHTML = e.target.value;

        // Update the line numbers
        updateLineNumbers(); 

        // Highlight the active line, line number, and code syntax
        Prism.highlightElement(visualizer);

        // Update the height & width of the textarea to match the content
        adjustTextAreaSize();
    });

    // Use arrow function here to ensure `this` refers to the class instance
    editor.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault(); // Stop the default tab behavior
            var start = e.target.selectionStart;
            var end = e.target.selectionEnd;

            // Set textarea value to: text before caret + tab + text after caret
            e.target.value = e.target.value.substring(0, start) +
                                "    " + // This is where the tab character or spaces go
                                e.target.value.substring(end);

            // Put caret at right position again
            e.target.selectionStart =
            e.target.selectionEnd = start + 4; // Move the caret after the tab
        }  
        else if (e.key === "Backspace") {
            adjustTextAreaSize();
        }
        else if (e.metaKey && e.key === "Enter") {
            e.preventDefault(); // Prevent the default action
            dispatchCustomEvent(new CustomEvent('outerbase-editor-event', { bubbles: true, composed: true, detail: { execute: true, code: editor.value } }));
        }
        else if (e.key === "Enter") {
            e.preventDefault(); // Prevent the default enter behavior

            var start = e.target.selectionStart;
            var end = e.target.selectionEnd;
            var beforeText = e.target.value.substring(0, start);
            var afterText = e.target.value.substring(end);

            // Find the start of the current line
            var lineStart = beforeText.lastIndexOf("\n") + 1;
            // Calculate the indentation of the current line
            var indentation = beforeText.substring(lineStart).match(/^(\s*)/)[0];

            // Insert newline and the same indentation
            e.target.value = beforeText + "\n" + indentation + afterText;

            // Update cursor position
            var newPos = start + 1 + indentation.length; // Move cursor after the new line and indentation
            e.target.selectionStart = e.target.selectionEnd = newPos;

            // Scroll code container to the far left
            codeContainer.scrollLeft = 0;
            
            // Scroll container down 18 pixels to show the new line
            // setTimeout(() => {
            //     container.scrollTop = container.scrollHeight;
            //   }, 0);

            // const beforeHeight = container.scrollHeight;

            // Use setTimeout to check the scrollHeight after the key action
            // setTimeout(() => {
            //     const afterHeight = container.scrollHeight;

            //     // Compare before and after heights to determine if a change occurred
            //     if (afterHeight > beforeHeight) {
            //         // Scroll the parent container to the bottom if there was a change
            //         container.scrollTop = container.scrollHeight;
            //     }
            // }, 0);

            const cursorPosition = editor.selectionStart;
            // Check if the cursor is at the end of the text (or on the last line)
            if (cursorPosition === editor.value.length) {
                // Use setTimeout to allow the textarea to update
                setTimeout(() => {
                // Scroll the parent container to the bottom
                    codeContainer.scrollTop = codeContainer.scrollHeight;
                }, 0);
            }

            // Defer the update of line numbers, required or the line number will be off by 1
            updateLineNumbers();
            adjustTextAreaSize();
        }
        else  if (e.metaKey && e.key === ']') {
            // Check for CMD + ] for right indent
            e.preventDefault(); // Prevent the default action
            indentLine('right');
        }
        else if (e.metaKey && e.key === '[') {
            // Check for CMD + [ for left indent
            e.preventDefault(); // Prevent the default action
            indentLine('left');
        } 
        else if (e.metaKey && e.key === '/') {
            e.preventDefault(); // Prevent the default action
        
            var start = e.target.selectionStart;
            var end = e.target.selectionEnd;
            var text = e.target.value;
        
            // Find the start and end of the current line
            var lineStart = text.lastIndexOf("\n", start - 1) + 1;
            var lineEnd = text.indexOf("\n", end);
            lineEnd = lineEnd === -1 ? text.length : lineEnd;
        
            var beforeLine = text.substring(0, lineStart);
            var lineText = text.substring(lineStart, lineEnd);
            var afterLine = text.substring(lineEnd);
        
            const commentCharacters = language === "sql" ? "-- " : "// ";
        
            // Check if the line is already commented out
            if (lineText.startsWith(commentCharacters)) {
                // Remove comment characters at the start of the line
                var newLineText = lineText.substring(commentCharacters.length);
                e.target.value = beforeLine + newLineText + afterLine;
        
                // Adjust the cursor position after removing the comment
                e.target.selectionStart = start - commentCharacters.length < lineStart ? lineStart : start - commentCharacters.length;
                e.target.selectionEnd = end - commentCharacters.length;
            } else {
                // Add comment characters at the start of the line
                e.target.value = beforeLine + commentCharacters + lineText + afterLine;
        
                // Adjust the cursor position after adding the comment
                e.target.selectionStart = start + commentCharacters.length;
                e.target.selectionEnd = end + commentCharacters.length;
            }
        }
        
        
        
        setTimeout(() => {
            dispatchCustomEvent(new CustomEvent('outerbase-editor-event', { bubbles: true, composed: true, detail: { code: editor.value } }));
        }, 50);
        
        // After updating the textarea's value, manually trigger Prism highlighting
        redrawSyntaxHighlighting();
    });
}