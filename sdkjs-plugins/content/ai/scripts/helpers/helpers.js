

var HELPERS = {};

HELPERS.word = [];
HELPERS.word.push(// В функцию changeTextStyle добавлена возможность изменять кейс текста (верхний, нижний, предложение, каждое слово, переключение)
(function () {
  let func = new RegisteredFunction({
    name: "changeTextStyle",
    description:
      "Changes the text style of the selected text in the document. You can make the text bold, italic, underline, strikeout, change font size, or change the case of the text.",
    parameters: {
      type: "object",
      properties: {
        bold: {
          type: "boolean",
          description: "Whether to make the text bold",
        },
        italic: {
          type: "boolean",
          description: "Whether to make the text italic",
        },
        underline: {
          type: "boolean",
          description: "Whether to underline the text",
        },
        strikeout: {
          type: "boolean",
          description: "Whether to strike out the text",
        },
        fontSize: {
          type: "number",
          description: "Font size to apply to the selected text",
        },
        caseType: {
          type: "string",
          description:
            "'upper' for UPPERCASE, 'lower' for lowercase, 'sentence' for Sentence case, 'capitalize' for Capitalize Each Word, 'toggle' for tOGGLE cASE",
        },
      },
      required: ["prompt"],
    },
    examples: [
      {
        prompt: "Make the selected text bold and italic.",
        arguments: { bold: true, italic: true },
      },
      {
        prompt: "Underline the selected text.",
        arguments: { underline: true },
      },
      {
        prompt: "Strike out the selected text.",
        arguments: { strikeout: true },
      },
      {
        prompt: "Set the font size of selected text to 18.",
        arguments: { fontSize: 18 },
      },
      {
        prompt: "Make the selected text bold.",
        arguments: { bold: true },
      },
      {
        prompt: "Make the selected text non-italic.",
        arguments: { italic: false },
      },
      {
        prompt: "Make the selected text uppercase.",
        arguments: { caseType: "upper" },
      },
      {
        prompt: "Make the selected text lowercase.",
        arguments: { caseType: "lower" },
      },
      {
        prompt: "Make the selected text ToGgle Case.",
        arguments: { caseType: "toggle" },
      },
      {
        prompt: "Make the selected text Sentence case.",
        arguments: { caseType: "sentence" },
      },
      {
        prompt: "Make the selected text Capitalize Each Word.",
        arguments: { caseType: "capitalize" },
      },
    ],
  });

  func.call = async function (params) {
    Asc.scope.bold = params.bold;
    Asc.scope.italic = params.italic;
    Asc.scope.underline = params.underline;
    Asc.scope.strikeout = params.strikeout;
    Asc.scope.fontSize = params.fontSize;
    Asc.scope.caseType = params.caseType;
    await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let range = doc.GetRangeBySelect();
      if (!range || "" === range.GetText()) {
        doc.SelectCurrentWord();
        range = doc.GetRangeBySelect();
      }

      if (!range) return;

      if (undefined !== Asc.scope.bold) range.SetBold(Asc.scope.bold);

      if (undefined !== Asc.scope.italic) range.SetItalic(Asc.scope.italic);

      if (undefined !== Asc.scope.underline)
        range.SetUnderline(Asc.scope.underline);

      if (undefined !== Asc.scope.strikeout)
        range.SetStrikeout(Asc.scope.strikeout);

      if (undefined !== Asc.scope.fontSize)
        range.SetFontSize(Asc.scope.fontSize);

      // Case Type - Updated with robust logic from textcleaner.js
      if (undefined !== Asc.scope.caseType) {
        let text = range.GetText();

        if (!text || text.trim() === "") {
          text = doc.GetCurrentWord();
          if (text) {
            doc.SelectCurrentWord();
            range = doc.GetRangeBySelect();
          }
        }

        if (text && text.trim() !== "") {
          // Define case conversion functions
          let convertCase;
          switch (Asc.scope.caseType) {
            case "upper":
              convertCase = (t) => t.toUpperCase();
              break;
            case "lower":
              convertCase = (t) => t.toLowerCase();
              break;
            case "sentence":
              convertCase = (t) =>
                t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
              break;
            case "capitalize":
              convertCase = (t) => t.replace(/\b\w/g, (l) => l.toUpperCase());
              break;
            case "toggle":
              convertCase = (t) =>
                t
                  .split("")
                  .map((c) =>
                    c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
                  )
                  .join("");
              break;
            default:
              convertCase = (t) => t;
          }

          // Process paragraphs
          const processParagraphs = (paragraphs) => {
            for (let i = 0; i < paragraphs.length; i++) {
              const para = paragraphs[i];

              if (!para.GetElementsCount) continue;

              const elementsCount = para.GetElementsCount();
              let fullText = "";
              let runs = [];

              for (let j = 0; j < elementsCount; j++) {
                const elem = para.GetElement(j);
                if (elem.GetText) {
                  const text = elem.GetText();
                  if (text) {
                    fullText += text;
                    runs.push({
                      element: elem,
                      text: text,
                      length: text.length,
                    });
                  }
                }
              }

              if (fullText.trim() === "") continue;

              const newFullText = convertCase(fullText);

              if (newFullText !== fullText) {
                para.RemoveAllElements();
                let currentPos = 0;
                for (let k = 0; k < runs.length; k++) {
                  const run = runs[k];
                  const newRunText = newFullText.substring(
                    currentPos,
                    currentPos + run.length
                  );
                  const newRun = Api.CreateRun();

                  const oldPr = run.element.GetTextPr();
                  newRun.SetTextPr(oldPr);
                  newRun.AddText(newRunText);

                  para.AddElement(newRun);
                  currentPos += run.length;
                }
              }
            }
          };

          if (range && range.GetText && range.GetText().trim() !== "") {
            processParagraphs(range.GetAllParagraphs());
          } else {
            processParagraphs(doc.GetAllParagraphs());
          }
        }
      }
    });
  };

  return func;
})());





HELPERS.word.push((function(){
    let func = new RegisteredFunction({
    name: "describeImage",
    description:
        "Allows users to select an image and generate a meaningful title, description, caption, or alt text for it using AI.",
    parameters: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description:
                    "instruction for the AI (e.g., 'Add a short title for this chart.')",
            },
        },
        required: ["prompt"],
    },
    examples: [
        {
            prompt: "Add a short title for this chart.",
            arguments: { prompt: "Add a short title for this chart." },
        }
    ]
});

  func.call = async function (params) {
    let prompt = params.prompt;

    async function insertMessage(message) {
      Asc.scope._message = String(message || "");
      await Asc.Editor.callCommand(function () {
        const msg = Asc.scope._message || "";
        const doc = Api.GetDocument();
        const selected =
          (doc.GetSelectedDrawings && doc.GetSelectedDrawings()) || [];
        if (selected.length > 0) {
          for (let i = 0; i < selected.length; i++) {
            const drawing = selected[i];
            const para = Api.CreateParagraph();
            para.AddText(msg);
            drawing.InsertParagraph(para, "after", true);
          }
        } else {
          const para = Api.CreateParagraph();
          para.AddText(msg);
          let range = doc.GetCurrentParagraph();
          range.InsertParagraph(para, "after", true);
        }
        Asc.scope._message = "";
      }, true);
    }

    try {
      let imageData = await new Promise((resolve) => {
        window.Asc.plugin.executeMethod(
          "GetImageDataFromSelection",
          [],
          function (result) {
            console.log("describeImage: GetImageDataFromSelection result received", result ? "data found" : "no data");
            resolve(result);
          }
        );
      });

      if (!imageData || !imageData.src) {
        await insertMessage("Please select a valid image first.");
        return;
      }

      const whiteRectangleBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      if (imageData.src === whiteRectangleBase64) {
        await insertMessage("Please select a valid image first.");
        return;
      }

      let argPrompt = prompt + " (for the selected image)";
      let requestEngine = AI.Request.create(AI.ActionType.Vision);
      if (!requestEngine) {
        await insertMessage("AI request engine not available.");
        return;
      }
      await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
      
      let resultText = "";
      try {
        let result = await requestEngine.imageVisionRequest({
            prompt: argPrompt,
            image: imageData.src
        });
        
        if (result) {
            resultText = result;
        }
      } catch (e) {
          console.error("describeImage: imageVisionRequest failed", e);
      }

      Asc.scope.text = resultText || "";

      if (!Asc.scope.text.trim()) {
        await insertMessage(
          "⚠ AI request failed or returned empty response. The model may not support images."
        );
        await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
        return;
      }
      await insertMessage(Asc.scope.text);
      await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
    } catch (e) {
      try {
        await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
      } catch (ee) {
        /* ignore */
      }
      console.error("describeImage error:", e);
      await insertMessage(
        "An unexpected error occurred while describing the image: " + (e.message || e)
      );
    }
  };

  return func;
})());




HELPERS.word.push((function(){

let func = new RegisteredFunction({
  name: "smartHeadlineGenerator",
  description:
    "Generates a clear and relevant headline from the currently selected text (paragraph, slide, or section). This headline is meant to accurately represent the content, not be overly catchy.",
  parameters: {
    type: "object",
    properties: {
      scope: {
        type: "string",
        description:
          "whether to summarize the 'currentParagraph', 'selection', or the 'entireDocument' (default is 'selection')",
      },
    },
    required: ["prompt"],
  },
  examples: [
    {
      prompt: "Generate a headline for the selected text",
      arguments: {
        scope: "selection",
        prompt: "Generate a clear headline for this text",
      },
    },
    {
      prompt: "Write a headline for the current paragraph",
      arguments: {
        scope: "currentParagraph",
        prompt: "Write a precise headline for this paragraph",
      },
    },
    {
      prompt: "Create a headline",
      arguments: {
        scope: "entireDocument",
        prompt: "Create a headline that represents the full document",
      },
    },
    {
      prompt: "Suggest a simple headline for an announcement",
      arguments: {
        scope: "selection",
        prompt: "Provide a straightforward headline for this announcement",
      },
    },
    {
      prompt:
        "Generate a headline for the current paragraph without extra instructions",
      arguments: { scope: "currentParagraph" },
    },
  ],
});

func.call = async function (params) {
    let scope = params.scope || "selection";

    Asc.scope.scope = scope;
    let text = await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let content = "";
      // console.log('scope', Asc.scope.scope);
      if (Asc.scope.scope === "entireDocument") {
        content = doc.GetText();
      } else if (Asc.scope.scope === "currentParagraph") {
        let par = doc.GetCurrentParagraph();
        if (par) {
          par.Select();
          content = par.GetText();
        }
      } else {
        let range = doc.GetRangeBySelect();
        if (range && range.GetText()) {
          content = range.GetText();
        } else {
          let par = doc.GetCurrentParagraph();
          if (par) {
            par.Select();
            content = par.GetText();
          }
        }
      }
      return content;
    });
    if (!text) return;
    let argPrompt =
      params.prompt +
      ":\n" +
      text +
      "\n Answer with only the headline, do not add explanations.";

    let requestEngine = AI.Request.create(AI.ActionType.Chat);
    if (!requestEngine) return;

    await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
    await Asc.Editor.callMethod("StartAction", [
      "Block",
      "AI (" + requestEngine.modelUI.name + ")",
    ]);

    let isSendedEndLongAction = false;
    async function checkEndAction() {
      if (!isSendedEndLongAction) {
        await Asc.Editor.callMethod("EndAction", [
          "Block",
          "AI (" + requestEngine.modelUI.name + ")",
        ]);
        isSendedEndLongAction = true;
      }
    }

    let resultHeading = "";
    await requestEngine.chatRequest(argPrompt, false, async function (data) {
      if (!data) return;
      resultHeading += data;
    });

    await checkEndAction();
    if (resultHeading.startsWith('"') && resultHeading.endsWith('"')) {
      resultHeading = resultHeading.slice(1, -1);
    }
    Asc.scope.data = resultHeading;
    await Asc.Editor.callCommand(async function () {
      let doc = Api.GetDocument(),
        data = Asc.scope.data;
      if (
        Asc.scope.scope === "entireDocument" ||
        Asc.scope.scope === "currentParagraph"
      ) {
        const contextPara =
          Asc.scope.scope === "entireDocument"
            ? doc.GetElement(0)
            : doc.GetCurrentParagraph();
        const textProperties = contextPara.GetTextPr();
        let headLine = Api.CreateParagraph();
        headLine.AddText(data);
        headLine.SetTextPr(textProperties);
        contextPara.InsertParagraph(headLine, "before", true);
      } else {
        let range = doc.GetRangeBySelect();
        if (!range) return;
        range.AddText(data + "\n\n", "before");
      }
    });
    await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
  };
  return func;

  
})());


HELPERS.slide = [];
HELPERS.slide.push((function() {
     let func = new RegisteredFunction({
    "name": "describeImage",
    "description": "Allows users to select an image and generate a meaningful title, description, caption, or alt text for it using AI.",
    "parameters": {
      "type": "object",
      "properties": {
        "prompt": {
          "type": "string",
          "description": "instruction for the AI (e.g., 'Add a short title for this chart.')"
        }
      },
      "required": ["prompt"]
    },
    "examples": [
      {
        "prompt": "Add a short title for this chart.",
        "arguments": { "prompt": "Add a short title for this chart." }
      }
    ]
});

  func.call = async function (params) {
    async function insertMessage(message) {
      Asc.scope._message = String(message || "");
      await Asc.Editor.callCommand(function () {
        let presentation = Api.GetPresentation();
        let slide = presentation.GetCurrentSlide();

        let fill = Api.CreateNoFill();
        let stroke = Api.CreateStroke(0, Api.CreateNoFill());
        let shape = Api.CreateShape(
          "rect",
          300 * 36000,
          40 * 36000,
          fill,
          stroke
        );
        shape.SetPosition(720000, 3600000);

        let docContent = shape.GetDocContent();
        let p = docContent.GetElement(0);

        let run = Api.CreateRun();
        run.SetFontSize(22);
        run.SetColor(0, 0, 0);
        run.AddText(Asc.scope._message);
        p.AddElement(run);

        slide.AddObject(shape);
        Asc.scope._message = "";
      }, true);
    }

    try {
      let imageData = await new Promise((resolve) => {
        window.Asc.plugin.executeMethod(
          "GetImageDataFromSelection",
          [],
          function (result) {
            resolve(result);
          }
        );
      });
      if (!imageData || !imageData.src) {
        await insertMessage("Please select a valid image first.");
        return;
      }

      const whiteRectangleBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      if (imageData.src === whiteRectangleBase64) {
        await insertMessage("Please select a valid image first.");
        return;
      }

      let argPrompt = params.prompt + " (for the selected image)";
      let requestEngine = AI.Request.create(AI.ActionType.Vision);
      if (!requestEngine) {
        await insertMessage("AI request engine not available.");
        return;
      }
      await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

      let resultText = "";

      try {
        let result = await requestEngine.imageVisionRequest({
            prompt: argPrompt,
            image: imageData.src
        });
        
        if (result) {
            resultText = result;
        }
      } catch (e) {
          console.error("describeImage: imageVisionRequest failed", e);
      }

      Asc.scope.text = resultText || "";

      if (Asc.scope.text && Asc.scope.text.trim().length > 0) {
        await insertMessage(Asc.scope.text);
      }
      await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
    } catch (e) {
      try {
        await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
      } catch (ee) {}
      console.error("[describeImage] error:", e);
      await insertMessage("An error occurred while describing the image.");
    }
  };
  return func;
})());


HELPERS.cell = [];
HELPERS.cell.push((function(){
  let func = new RegisteredFunction({
  name: "explainError",
  description:
    " Explains the error in the specified cell by adding a comment with the explanation. Supports common Excel errors like #DIV/0!, #N/A, #VALUE!, #REF!, and #NAME?. If there is no error in the cell, adds a comment indicating that.Specify the cell range or use the active/selected cell. Natural language triggers are supported to identify the error type from user input.",
  parameters: {
    type: "object",
    properties: {
      range: {
        type: "string",
        description:
          "cell range containing error to explain (e.g., 'A1'). If omitted, uses active/selected cell",
      },
      userInput: {
        type: "string",
        description: "raw user query that may contain natural language trigger",
      },
    },
    required: ["prompt"],
  },

  examples: [
    {
      prompt: "Explain error in active cell",
      arguments: {},
    },
    {
      prompt: "Explain error in specific cell A1",
      arguments: { range: "A1" },
    },
    {
      prompt: "Explain error in cell B5",
      arguments: { range: "B5" },
    },
    {
      prompt: "Explain #DIV/0! error from user input",
      arguments: { userInput: "Why do I see #DIV/0! in my cell?" },
    },
    {
      prompt: "Explain #N/A error from user input",
      arguments: { userInput: "What does #N/A mean?" },
    },
    {
      prompt: "Explain #VALUE! error from user input",
      arguments: { userInput: "Explain the #VALUE! error" },
    },
  ],
});



func.call = async function (params) {
  Asc.scope.range = params.range;

  // Normalize error type based on user input triggers
  let normalizedError = null;
  if (params && params.userInput) {
    let text = params.userInput.toLowerCase();

    const triggers = ["why", "what", "explain", "meaning", "reason", "cause"];
    let hasTrigger = triggers.some((t) => text.includes(t));

    if (hasTrigger) {
      if (/div/.test(text)) normalizedError = "#DIV/0!";
      else if (/\bna\b/.test(text)) normalizedError = "#N/A";
      else if (/value/.test(text)) normalizedError = "#VALUE!";
      else if (/ref/.test(text)) normalizedError = "#REF!";
      else if (/name/.test(text)) normalizedError = "#NAME?";
    }
  }

  // Get error from the specified cell
  let errorData = null;
  if (!normalizedError) {
    errorData = await Asc.Editor.callCommand(function () {
      let ws = Api.GetActiveSheet();
      let _range;

      if (!Asc.scope.range) {
        _range = Api.GetSelection();
      } else {
        _range = ws.GetRange(Asc.scope.range);
      }

      if (!_range || !_range.GetCells(1, 1)) {
        return null;
      }

      let cell = _range.GetCells(1, 1);
      let error = cell.GetValue2();
      let cellAddress = cell.GetAddress();

      return {
        error: error,
        address: cellAddress,
        hasError: error && error.toString().startsWith("#"),
      };
    });
  } else {
    errorData = {
      error: normalizedError,
      address: Asc.scope.range || "?",
      hasError: true,
    };
  }

  // If no error, add comment indicating no error
  if (!errorData || !errorData.hasError) {
    await Asc.Editor.callCommand(function () {
      let ws = Api.GetActiveSheet();
      let _range;

      if (!Asc.scope.range) {
        _range = Api.GetSelection();
      } else {
        _range = ws.GetRange(Asc.scope.range);
      }

      if (_range) {
        let cell = _range.GetCells(1, 1);
        if (cell) {
          cell.AddComment("There is no error in this cell", "AI Assistant");
        }
      }
    });
    return;
  }

  let argPrompt =
    "Explain the following Excel error in detail:\n\n" +
    "Error: " +
    errorData.error +
    "\n" +
    "Cell: " +
    errorData.address +
    "\n\n" +
    "IMPORTANT RULES:\n" +
    "1. Identify the exact meaning of this error type (e.g., division by zero, invalid reference).\n" +
    "2. Explain why this error commonly occurs.\n" +
    "3. Give clear, step-by-step reasoning of the possible cause in this specific cell.\n" +
    "4. Suggest practical ways to fix or avoid the error.\n" +
    "5. Keep explanation simple, clear, and beginner-friendly.\n" +
    "6. Mention common mistakes that lead to this error.\n" +
    "7. If multiple causes are possible, list them briefly in order of likelihood.\n" +
    "8. Keep the explanation concise but comprehensive.\n" +
    "9. Avoid filler text and unnecessary theory.\n" +
    "10. Response length should be under 1024 characters (recommended), maximum 32767.\n" +
    "11. Prioritize the most important fix suggestions if length constraint requires cuts.\n" +
    "12. Output must be plain text only, without Markdown, JSON, or special formatting.\n\n" +
    "13. Formatting rules: each numbered point must start on a new line; if you include multiple causes, format them as sub-items starting on new lines.\n\n" +
    "Please provide a detailed but concise explanation of this error.";

  let requestEngine = AI.Request.create(AI.ActionType.Chat);
  if (!requestEngine) return;

  let isSendedEndLongAction = false;
  async function checkEndAction() {
    if (!isSendedEndLongAction) {
      await Asc.Editor.callMethod("EndAction", [
        "Block",
        "AI (" + requestEngine.modelUI.name + ")",
      ]);
      isSendedEndLongAction = true;
    }
  }

  await Asc.Editor.callMethod("StartAction", [
    "Block",
    "AI (" + requestEngine.modelUI.name + ")",
  ]);
  await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

  let explanation = await requestEngine.chatRequest(
    argPrompt,
    false,
    async function (data) {
      if (!data) return;
      await checkEndAction();
    }
  );

  await checkEndAction();
  await Asc.Editor.callMethod("EndAction", ["GroupActions"]);

  // Add comment with explanation to the cell
  if (explanation) {
    Asc.scope.explanation = explanation;
    await Asc.Editor.callCommand(function () {
      let ws = Api.GetActiveSheet();
      let _range;

      if (!Asc.scope.range) {
        _range = Api.GetSelection();
      } else {
        _range = ws.GetRange(Asc.scope.range);
      }

      if (_range) {
        let cell = _range.GetCells(1, 1);
        if (cell) {
          // Create comment with error explanation
          let commentText = "Error Explanation:\n\n" + Asc.scope.explanation;
          cell.AddComment(commentText, "AI Assistant");
        }
      }
    });
  }
};

return func;
})());


