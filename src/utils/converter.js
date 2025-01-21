const PYTHON_TO_JSON = {
  'True': 'true',
  'False': 'false',
  'None': 'null',
};

const preprocessPythonInput = (input) => {
  // Replace Python keywords with JSON equivalents, but only when they're not part of other words
  return input.replace(/\b(True|False|None)\b/g, match => PYTHON_TO_JSON[match]);
};

export const convertToJson = (input) => {
  // Skip empty input
  if (!input.trim()) {
    return { output: '', error: null };
  }

  try {
    // Basic validation for dictionary-like structure
    const trimmedInput = input.trim();
    if (!trimmedInput.startsWith('{') || !trimmedInput.endsWith('}')) {
      return {
        output: null,
        error: 'Invalid Python dictionary format - must start with { and end with }'
      };
    }

    let errorLine = -1;
    let errorChar = -1;

    const lines = input.split('\n');
    let stack = [];
    let inString = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        // Handle string detection
        if ((char === '"' || char === "'") && 
            (j === 0 || line[j-1] !== '\\')) {
          if (!inString) {
            inString = char;
            // Store position where string started
            if (!stack.length || stack[stack.length - 1].type !== 'string') {
              stack.push({ type: 'string', char: inString, line: i, pos: j });
            }
          } else if (char === inString) {
            inString = null;
            // Remove the string marker if it matches
            if (stack.length && stack[stack.length - 1].type === 'string') {
              stack.pop();
            }
          }
          continue;
        }

        // Skip other characters if we're in a string
        if (inString) continue;

        // Track brackets and braces
        if (char === '{' || char === '[') {
          stack.push({ type: 'bracket', char, line: i, pos: j });
        } else if (char === '}' || char === ']') {
          const last = stack.length ? stack.pop() : null;
          const lastChar = last ? last.char : null;
          if (!last ||
              (char === '}' && lastChar !== '{') ||
              (char === ']' && lastChar !== '[')) {
            errorLine = i;
            errorChar = j;
            throw new Error(`Unmatched closing ${char === '}' ? 'brace' : 'bracket'}`);
          }
        }

        // Check for invalid quote pairs
        if (char === ':') {
          let k = j - 1;
          while (k >= 0 && /\s/.test(line[k])) k--; // skip whitespace
          if (k >= 0) {
            let quoteChar = null;
            if (line[k] === '"' || line[k] === "'") {
              quoteChar = line[k];
              k--;
              while (k >= 0 && line[k] !== quoteChar) k--;
              if (k < 0) {
                errorLine = i;
                errorChar = j;
                throw new Error('Unterminated string');
              }
            }
          }
        }
      }
    }

    // Check for unclosed elements
    if (stack.length > 0) {
      const last = stack[stack.length - 1];
      errorLine = last.line;
      errorChar = last.pos;
      if (last.type === 'string') {
        throw new Error(`Unclosed string starting with ${last.char}`);
      } else {
        throw new Error(`Unclosed ${last.char === '{' ? 'brace' : 'bracket'} '${last.char}'`);
      }
    }

    try {
      // Preprocess the input to handle Python keywords before evaluation
      const processedInput = preprocessPythonInput(input);
      const json = JSON.stringify(eval(`(${processedInput})`), null, 2);
      return { output: json, error: '' };
    } catch (err) {
      const match = err.message.match(/at position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        let currentPos = 0;
        for (let i = 0; i < lines.length; i++) {
          if (currentPos + lines[i].length >= pos) {
            errorLine = i;
            errorChar = pos - currentPos;
            break;
          }
          currentPos += lines[i].length + 1;
        }
      }
      throw new Error(`Invalid Python dictionary syntax: ${err.message}`);
    }
  } catch (error) {
    return {
      output: null,
      error: `Invalid Python dictionary format - ${error.message}`
    };
  }
};

export const formatError = (input, message, lineNum, charNum) => {
  const lines = input.split('\n');
  const errorLine = lineNum >= 0 ? lineNum : 0;
  const errorChar = charNum >= 0 ? charNum : 0;

  let errorDisplay = 'Syntax Error: ' + message + '\n\n';

  const start = Math.max(0, errorLine - 3);
  const end = Math.min(lines.length, errorLine + 4);

  for (let i = start; i < end; i++) {
    const lineNumber = String(i + 1).padStart(4, ' ');
    const lineContent = lines[i];
    errorDisplay += `${lineNumber} | ${lineContent}\n`;

    if (i === errorLine) {
      // Calculate exact position for the caret
      const caretPos = lineContent.slice(0, errorChar).length;
      errorDisplay += '     | ' + ' '.repeat(caretPos) + '^\n';
      errorDisplay += '     | ' + ' '.repeat(caretPos) + message + '\n';
    }
  }

  return errorDisplay;
};
