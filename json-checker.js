document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('json-input');
    const validationResult = document.getElementById('validation-result');
    const formatBtn = document.getElementById('format-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    let debounceTimeout;

    // Validate JSON on input
    jsonInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(validateJSON, 500);
    });

    // Format JSON
    formatBtn.addEventListener('click', () => {
        try {
            const json = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(json, null, 2);
            validateJSON();
        } catch (e) {
            // If JSON is invalid, just validate and show error
            validateJSON();
        }
    });

    // Minify JSON
    minifyBtn.addEventListener('click', () => {
        try {
            const json = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(json);
            validateJSON();
        } catch (e) {
            // If JSON is invalid, just validate and show error
            validateJSON();
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(jsonInput.value);
            showCopyFeedback();
        } catch (e) {
            validationResult.textContent = 'Failed to copy to clipboard';
            validationResult.className = 'error';
        }
    });

    // Clear input
    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        validationResult.textContent = '';
    });

    function validateJSON() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            validationResult.textContent = '';
            return;
        }

        try {
            const json = JSON.parse(input);
            const formatted = JSON.stringify(json, null, 2);
            validationResult.innerHTML = `<span class="success">✓ Valid JSON</span>\n\nParsed Result:\n${syntaxHighlight(formatted)}`;
        } catch (e) {
            validationResult.innerHTML = `<span class="error">✗ Invalid JSON: ${e.message}</span>`;
        }
    }

    function showCopyFeedback() {
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    }

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                    match = match.slice(0, -1) + '<span style="color: var(--text-secondary);">:</span>';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span style="color: ' + getColor(cls) + ';">' + match + '</span>';
        });
    }

    function getColor(type) {
        const colors = {
            key: '#7289da',     // Primary color
            string: '#43b581',  // Secondary color
            number: '#faa61a',  // Orange
            boolean: '#f04747', // Error color
            null: '#b9bbbe'     // Text secondary
        };
        return colors[type] || 'var(--text)';
    }
});
