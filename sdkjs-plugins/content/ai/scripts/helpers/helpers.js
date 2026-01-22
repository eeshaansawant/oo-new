/*
 * (c) Copyright Ascensio System SIA 2010-2025
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

var HELPERS = {};

HELPERS.word = [];
HELPERS.word.push((function(){

let func = new RegisteredFunction({
    name: "insertTable",
    description: "Use this function to insert a table at the current cursor position or at the start/end of the document. You can specify the number of rows and columns, and optionally add headers.",
    parameters: {
        type: "object",
        properties: {
            rows: { type: "number", description: "number of rows in the table" },
            columns: { type: "number", description: "number of columns in the table" },
            hasHeaders: { type: "boolean", description: "whether the first row should be formatted as headers" },
            tableStyle: { type: "string", description: "optional table style name (e.g., 'Table Grid', 'Light Grid')" },
            width: { type: "number", description: "table width percentage (default is 100)" },
            widthType: { type: "string", description: "width type - 'percent' or 'point' (default is 'percent')" },
            position: { type: "string", description: "where to insert the table - 'current', 'start', or 'end' (default is 'current')" }
        },
        required: ["rows", "columns"]
    }
});


func.call = async function(params) {
    Asc.scope.rows = params.rows || 3;
    Asc.scope.columns = params.columns || 3;
    Asc.scope.hasHeaders = params.hasHeaders || false;
    Asc.scope.tableStyle = params.tableStyle;
    Asc.scope.width = params.width || 100;
    Asc.scope.widthType = params.widthType || "percent";
    Asc.scope.position = params.position || "current";

    await Asc.Editor.callCommand(function() {
        let doc = Api.GetDocument();
        
        if (Asc.scope.position === "start") {
            doc.MoveCursorToStart();
        } else if (Asc.scope.position === "end") {
            doc.MoveCursorToEnd();
        }
        
        let table = Api.CreateTable(Asc.scope.rows, Asc.scope.columns);
        doc.InsertContent([table]);
    
        let unit = (Asc.scope.widthType === "point") ? "twips" : Asc.scope.widthType;
        let widthValue = (Asc.scope.widthType === "point") ? (Asc.scope.width * 20) : Asc.scope.width;
        table.SetWidth(unit, widthValue);
    
        if (Asc.scope.tableStyle) {
            table.SetStyle(Asc.scope.tableStyle);
        }
    
        if (Asc.scope.hasHeaders) {
            for (let col = 0; col < Asc.scope.columns; col++) {
                let cell = table.GetCell(0, col);
                if (cell) {
                    let para = cell.GetContent().GetElement(0);
                    if (para) {
                        let textPr = para.GetTextPr();
                        textPr.SetBold(true);
                        para.SetTextPr(textPr);
                    }
                }
            }
        }
    });
};

return func;

})());
HELPERS.word.push((function () {
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
    returns: {
      type: "object",
      description: "An object indicating which styles were changed.",
      properties: {
        isApply: {
          type: "boolean",
          description: "Indicates whether the text style was changed.",
        },
      },
      required: ["isApply"],
    },
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
  name: "extractActionItems",
  description:
    "Analyzes selected text, meeting notes, or a document section and extracts clear action items or to-dos, formatting them as a structured list. Can optionally remove the original text.",
  parameters: {
    type: "object",
    properties: {
      scope: {
        type: "string",
        description:
          "whether to extract action items from the 'currentParagraph', 'selection', or the 'entireDocument' (default is 'selection')",
      },
      format: {
        type: "string",
        description:
          "how to format the extracted items - as 'bullet' or 'numbered' list (default is 'bullet')",
      },
    },
    required: ["prompt"],
  },
  examples: [
    {
      prompt: "Extract action items from selected text",
      arguments: { scope: "selection", format: "bullet" },
    },
    {
      prompt: "Turn meeting notes in the current paragraph into a to-do list",
      arguments: { scope: "currentParagraph", format: "numbered" },
    },
    {
      prompt:
        "Extract all action items from the entire document as a numbered list",
      arguments: { scope: "entireDocument", format: "numbered" },
    },
    {
      prompt: "Extract action items from the selected text",
      arguments: { scope: "selection" },
    },
  ],
});


func.call = async function (params) {
    Asc.scope.scope = params.scope || "selection";
    Asc.scope.format = params.format || "bullet";

    let text = await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let content = "";
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
        if (range && range.GetText()) content = range.GetText();
        else {
          let par = doc.GetCurrentParagraph();
          if (par) {
            par.Select();
            content = par.GetText();
          }
        }
      }
      return content;
    });

    if (!text || text.trim().length === 0) return;

    let argPrompt =
      "Extract all action items and to-dos from the following text.\n" +
      "Format your response EXACTLY as follows:\n" +
      "- First action item\n" +
      "- Second action item\n" +
      "- Third action item\n\n" +
      "Each action item MUST start with '- ' and be on its own line.\n" +
      "Do NOT include any explanations, summaries, or extra text.\n" +
      "If no action items are found, respond with 'No action items found.'\n\n" +
      text;

    let requestEngine = AI.Request.create(AI.ActionType.Chat);
    if (!requestEngine) return;

    await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
    await Asc.Editor.callMethod("StartAction", [
      "Block",
      "AI (" + requestEngine.modelUI.name + ")",
    ]);

    async function checkEndAction() {
      await Asc.Editor.callMethod("EndAction", [
        "Block",
        "AI (" + requestEngine.modelUI.name + ")",
      ]);
    }

    let actionItems = "";
    await requestEngine.chatRequest(argPrompt, false, async function (data) {
      if (!data) return;
      actionItems += data;
    });

    await checkEndAction();

    if (actionItems.trim() !== "No action items found.") {
      const normalizedText = actionItems.replace(/\s+- /g, "\n- ").trim();
      Asc.scope.actionItems = normalizedText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .map((item) => item.replace(/^- /, ""))
        .filter((item) => item.length > 0);

      await Asc.Editor.callCommand(async function () {
        let doc = Api.GetDocument(),
          data = Asc.scope.actionItems;
        let numbering = doc.CreateNumbering(
          Asc.scope.format === "numbered" ? "numbered" : "bullet"
        );
        let numLvl = numbering.GetLevel(0);

        if (
          Asc.scope.scope === "entireDocument" ||
          Asc.scope.scope === "currentParagraph"
        ) {
          let contextPara =
            Asc.scope.scope === "entireDocument"
              ? doc.GetElement(0)
              : doc.GetCurrentParagraph();
          let paraPr = contextPara.GetTextPr();
          let currentParagraph = contextPara;

          for (let i = data.length - 1; i >= 0; i--) {
            let itemPara = Api.CreateParagraph();
            itemPara.AddText(data[i]);
            itemPara.SetTextPr(paraPr);
            itemPara.SetNumbering(numLvl);
            itemPara.SetContextualSpacing(true);
            currentParagraph.InsertParagraph(itemPara, "before", true);
            currentParagraph = itemPara;
          }

          if (Asc.scope.scope === "entireDocument") {
            while (contextPara) {
              let nextPara = contextPara.GetNext();
              contextPara.Delete();
              contextPara = nextPara;
            }
          } else {
            contextPara.Delete();
          }
        } else {
          let range = doc.GetRangeBySelect();

          let firstPara = range.GetParagraph(0);
          let paraPr = firstPara.GetTextPr();
          let currentParagraph = [];

          if (range.GetStartPos() !== firstPara.GetRange(0, 1).GetStartPos()) {
            let dummyParagraph = Api.CreateParagraph();
            dummyParagraph.SetContextualSpacing(true);
            currentParagraph.push(dummyParagraph);
          }

          for (let i = 0; i < data.length; i++) {
            let itemPara = Api.CreateParagraph();
            itemPara.AddText(data[i]);
            itemPara.SetTextPr(paraPr);
            itemPara.SetNumbering(numLvl);
            itemPara.SetContextualSpacing(true);
            currentParagraph.push(itemPara);
          }

          range.MoveCursorToPos(range.GetStartPos());
          range.Delete();
          doc.InsertContent(currentParagraph);
        }
      });
    }
    await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
  };
  return func;

})());
HELPERS.word.push((function () {
  let func = new RegisteredFunction({
    name: "changeParagraphStyle",
    description:
      "Changes the style of a specific paragraph in the document by paragraph number.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "Instruction for the AI (e.g., 'Change paragraph 3 to Heading 1')",
        },
        parNumber: {
          type: "number",
          description: "The paragraph number to apply style changes to",
        },
        style: {
          type: "string",
          description:
            "The style name to apply (e.g., 'Heading 1', 'Heading 2', 'Normal', 'Title')",
        },
      },
      required: ["prompt"],
    },
    examples: [
      {
        prompt: "Change paragraph 3 to Heading 1.",
        arguments: { prompt: "Change paragraph 3 to Heading 1.", parNumber: 3, style: "Heading 1" },
      },
      {
        prompt: "Make the first paragraph a Title.",
        arguments: { prompt: "Make the first paragraph a Title.", parNumber: 1, style: "Title" },
      },
      {
        prompt: "Set paragraph 5 to Normal style.",
        arguments: { prompt: "Set paragraph 5 to Normal style.", parNumber: 5, style: "Normal" },
      },
    ],
  });

  func.call = async function (params) {
    Asc.scope.parNumber = params.parNumber;
    Asc.scope.styleName = params.style;
    await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let par = doc.GetElement(Asc.scope.parNumber - 1);
      if (!par) return;
      let style = doc.GetStyle(Asc.scope.styleName);
      par.SetStyle(style);
    });
  };

  return func;
})());
HELPERS.word.push((function(){


    let func = new RegisteredFunction({
    name: "insertList",
    description: "Use this function to create simple numbered or bulleted lists at the current cursor position or at the start/end of the document.",
    parameters: {
        type: "object",
        properties: {
            items: { type: "array", description: "array of strings representing list items", items: { type: "string" } },
            listType: { type: "string", description: "'numbered' for numbered list, 'bulleted' for bulleted list (default is 'bulleted')" },
            position: { type: "string", description: "where to insert the list - 'current', 'start', or 'end' (default is 'current')" }
        },
        required: ["items"]
    }
});

func.call = async function(params) {
    Asc.scope.items = params.items || ["Item 1", "Item 2", "Item 3"];
    Asc.scope.listType = params.listType || "bulleted";
    Asc.scope.position = params.position || "current";

    await Asc.Editor.callCommand(function() {
        let doc = Api.GetDocument();
        
        if (Asc.scope.position === "start") {
            doc.MoveCursorToStart();
        } else if (Asc.scope.position === "end") {
            doc.MoveCursorToEnd();
            let newParagraph = Api.CreateParagraph();
            doc.InsertContent([newParagraph]);
        } else if (Asc.scope.position === "current") {
            let newParagraph = Api.CreateParagraph();
            doc.InsertContent([newParagraph]);
        }
        
        let paragraphs = [];
        let numbering;
        
        if (Asc.scope.listType === "numbered") {
            numbering = doc.CreateNumbering("numbered");
        } else {
            numbering = doc.CreateNumbering("bullet");
        }
        
        let numLvl = numbering.GetLevel(0);
        
        for (let i = 0; i < Asc.scope.items.length; i++) {
            let item = Asc.scope.items[i];
            let paragraph = Api.CreateParagraph();
            paragraph.AddText(item);
            paragraph.SetNumbering(numLvl);
            paragraph.SetContextualSpacing(true);
            paragraphs.push(paragraph);
        }
        
        doc.InsertContent(paragraphs);
    });
};

return func;
    
})());
HELPERS.word.push((function () {
  let func = new RegisteredFunction({
    name: "generateHashtags",
    description:
      "Use this function if you need to generate relevant hashtags for the selected text or current word.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "Instruction for the AI, for example: 'Generate hashtags for this text.'",
        },
        count: {
          type: "number",
          description: "How many hashtags to generate (default is 5)",
        },
      },
      required: ["prompt"],
    },
    examples: [
      {
        prompt: "Generate hashtags for this text.",
        arguments: { prompt: "Generate hashtags for this text." },
      },
      {
        prompt: "Generate 10 hashtags for the selected text.",
        arguments: { prompt: "Generate hashtags for this text.", count: 10 },
      },
      {
        prompt: "Create 3 hashtags for this paragraph.",
        arguments: { prompt: "Create hashtags for this paragraph.", count: 3 },
      },
    ],
  });

  func.call = async function (params) {
    let count = params.count || 5;

    let text = await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let range = doc.GetRangeBySelect();
      let txt = range ? range.GetText() : "";

      if (!txt) {
        txt = doc.GetCurrentWord();
        doc.SelectCurrentWord();
      }

      return txt;
    });

    if (!text || text.trim().length === 0) return;

    let argPrompt =
      params.prompt +
      ":\n" +
      "Text:\n" +
      text +
      "\n" +
      "Generate " +
      count +
      " short and relevant hashtags. " +
      "Output hashtags only, separated by spaces.";

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

    let resultText = "";

    await requestEngine.chatRequest(argPrompt, false, async function (data) {
      if (!data) return;
      resultText += data;
    });

    await checkEndAction();

    resultText = resultText.replace(/\s+/g, " ").trim();

    if (resultText) {
      Asc.scope.text = resultText;
      await Asc.Editor.callCommand(function () {
        let doc = Api.GetDocument();
        doc.MoveCursorToEnd();
        let par = Api.CreateParagraph();
        par.AddText(Asc.scope.text);
        doc.Push(par);
      });
    }

    await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
  };

  return func;
})());
HELPERS.word.push((function(){

let func = new RegisteredFunction({
  name: "renameFormKeys",
  description:
    "Collect all form fields (keys/placeholders), ask the AI to generate unique UPPER_SNAKE_CASE keys, then rename the fields (and optionally update placeholders).",
  // Define parameters so the AI knows what to ask for
  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description:
          "Instruction for the AI (e.g., 'Rename all form keys to UPPER_SNAKE_CASE' or 'Create unique keys from placeholders').",
      },
    },
    required: ["prompt"],
  },
  // Provide examples to train the AI on usage
  examples: [
    {
      prompt: "Rename all form keys",
      arguments: {
        prompt: "Rename all form keys to be unique and descriptive",
      },
    },
    {
      prompt: "Generate unique form fields",
      arguments: {
        prompt: "Generate unique UPPER_SNAKE_CASE keys for all form fields",
      },
    },
    {
      prompt: "Create keys from placeholders",
      arguments: {
        prompt:
          "Create new keys for the form fields based on their placeholders",
      },
    },
    {
      prompt: "Standardize form field names",
      arguments: {
        prompt: "Standardize all form field names to UPPER_SNAKE_CASE format",
      },
    },
    {
      prompt: "Make form keys consistent",
      arguments: {
        prompt:
          "Make all form keys consistent and meaningful using UPPER_SNAKE_CASE",
      },
    },
  ],
});


func.call = async function (params) {
  // Helper function for parsing JSON from AI response
  function safeParseJsonFromText(text) {
    if (!text) throw new Error("Empty AI content");
    let trimmed = ("" + text).trim();
    try {
      return JSON.parse(trimmed);
    } catch (_) {
      // Extract JSON from text if wrapped in other content
      const i1 = trimmed.indexOf("{");
      const i2 = trimmed.lastIndexOf("}");
      if (i1 === -1 || i2 === -1 || i2 <= i1) {
        throw new Error(
          'AI content is not valid JSON. Got: "' +
            trimmed.slice(0, 200) +
            '..."'
        );
      }
      return JSON.parse(trimmed.slice(i1, i2 + 1));
    }
  }

  // Step 1: Collect all form fields from the document
  let fieldsMap = await Asc.Editor.callCommand(function () {
    var doc = Api.GetDocument();
    var forms = doc.GetAllForms();
    var out = {};

    // Build a map of form fields
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      var key = f.GetFormKey();
      var t = f.GetFormType();
      var ph = "";
      if (typeof f.GetPlaceholderText === "function") {
        try {
          ph = f.GetPlaceholderText() || "";
        } catch (e) {
          ph = "";
        }
      }

      var val = "";
      var chk = null;
      if (t === "textForm" || t === "comboBoxForm") {
        // Get text value for text and combo box forms
        if (typeof f.GetText === "function") {
          try {
            val = f.GetText() || "";
          } catch (e) {
            val = "";
          }
        }
      } else if (t === "checkBoxForm") {
        // Get checked state for checkbox forms
        if (typeof f.IsChecked === "function") {
          try {
            chk = !!f.IsChecked();
          } catch (e) {
            chk = null;
          }
        }
      }

      out[key] = { type: t, ph: ph, val: val, chk: chk };
    }
    return out;
  });

  // Exit if no form fields found
  if (!fieldsMap || !Object.keys(fieldsMap).length) return;

  // Step 2: Prepare system instructions for AI
  const systemHint =
    "Return ONLY valid JSON with two properties: " +
    '"keys" (map oldKey->newKey) and "newValues" (map newKey->placeholder). ' +
    "Rules: " +
    "1) New keys MUST be UPPER_SNAKE_CASE (letters, numbers, underscores only). " +
    '2) Derive each new key from the semantic meaning of the field. Prefer "ph" (placeholder), ' +
    '   but if "ph" is empty, use "val" (current text). Do NOT include words like ENTER/INDICATE in the key. ' +
    "3) If multiple fields share the same meaning, add numeric suffixes (_1, _2, …). " +
    "4) All new keys must be globally unique. " +
    '5) "newValues" must map each new key to a short placeholder (≤60 chars). ' +
    "Output JSON only — no explanations, no code fences.";

  // Combine system hint with form fields data
  const argPrompt =
    systemHint + "\n\nFIELDS_JSON:\n" + JSON.stringify({ fields: fieldsMap });
  console.log("[AI PROMPT PREVIEW]", argPrompt);

  // Step 3: Create AI chat request
  let requestEngine = AI.Request.create(AI.ActionType.Chat);
  if (!requestEngine) return;

  // Begin action group
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

  // Step 4: Send request to AI and collect response
  let resultText = "";

  let result = await requestEngine.chatRequest(
    argPrompt,
    false,
    async function (data) {
      if (!data) return;
      console.log("[AI RAW RESPONSE]", data);
      await checkEndAction();
      resultText += data;
      await Asc.Editor.callMethod("EndAction", ["GroupActions", "", "cancel"]);
      await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
    }
  );

  await checkEndAction();

  await Asc.Editor.callMethod("EndAction", ["GroupActions", "", "cancel"]);
  await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

  // Step 5: Parse AI response
  let ai;
  try {
    ai = safeParseJsonFromText(resultText);
  } catch (e) {
    try {
      ai =
        result && result.message && typeof result.message.content === "string"
          ? safeParseJsonFromText(result.message.content)
          : null;
    } catch (_) {}
  }

  // Validate AI response structure
  if (
    !ai ||
    typeof ai !== "object" ||
    !ai.keys ||
    typeof ai.keys !== "object"
  ) {
    await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
    return;
  }
  if (!ai.newValues || typeof ai.newValues !== "object") {
    ai.newValues = {};
  }

  // Step 6: Apply new keys to form fields
  Asc.scope._keysMap = ai.keys;
  Asc.scope._newValues = ai.newValues;
  await Asc.Editor.callCommand(function () {
    var keysMap = Asc.scope._keysMap || {};
    var newValues = Asc.scope._newValues || {};
    var doc = Api.GetDocument();
    var forms = doc.GetAllForms();

    // Rename each form key based on AI mapping
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      var oldKey = form.GetFormKey();
      var newKey = oldKey in keysMap ? keysMap[oldKey] : null;
      if (!newKey) continue;

      form.SetFormKey(newKey);
    }
  });

  // End action group
  await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
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
HELPERS.slide.push(




(function () {
  let func = new RegisteredFunction({
    name: "addChartToSlide",
    description:
      "Adds a chart to a slide in the presentation (152x89mm, centered). Supports various chart types including bar, line, pie, scatter, and more. Can generate chart data using AI if a prompt is provided.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "Instruction for the AI (e.g., 'Add a bar chart showing sales data on slide 2')",
        },
        slideNumber: {
          type: "number",
          description:
            "Slide number to add chart to (optional, defaults to current slide)",
        },
        chartType: {
          type: "string",
          description:
            "Type of chart: bar, barStacked, barStackedPercent, bar3D, barStacked3D, barStackedPercent3D, barStackedPercent3DPerspective, horizontalBar, horizontalBarStacked, horizontalBarStackedPercent, horizontalBar3D, horizontalBarStacked3D, horizontalBarStackedPercent3D, lineNormal, lineStacked, lineStackedPercent, line3D, pie, pie3D, doughnut, scatter, stock, area, areaStacked, areaStackedPercent",
        },
        data: {
          type: "array",
          description:
            "2D array of numeric data values - all sub-arrays must have same length, number of arrays must match series count",
        },
        series: {
          type: "array",
          description:
            "Array of series names - must have same length as data arrays count",
        },
        categories: {
          type: "array",
          description:
            "Array of category names - must have same length as each data array",
        },
        aiDataPrompt: {
          type: "string",
          description:
            "Description of what kind of data to generate for the chart using AI (optional, use instead of data/series/categories)",
        },
      },
      required: ["prompt"],
    },
    examples: [
      {
        prompt: "Add a bar chart showing sales data on slide 2.",
        arguments: {
          prompt: "Add a bar chart showing sales data on slide 2.",
          slideNumber: 2,
          chartType: "bar3D",
          data: [
            [100, 120, 140],
            [90, 110, 130],
          ],
          series: ["Product A", "Product B"],
          categories: ["Q1", "Q2", "Q3"],
        },
      },
      {
        prompt: "Add a pie chart on the current slide.",
        arguments: {
          prompt: "Add a pie chart on the current slide.",
          chartType: "pie",
          data: [[30, 25, 20, 15, 10]],
          series: ["Market Share"],
          categories: [
            "Company A",
            "Company B",
            "Company C",
            "Company D",
            "Others",
          ],
        },
      },
      {
        prompt: "Add a line chart with 3 series and 4 data points.",
        arguments: {
          prompt: "Add a line chart with 3 series and 4 data points.",
          chartType: "lineNormal",
          data: [
            [10, 20, 30, 40],
            [15, 25, 35, 45],
            [12, 22, 32, 42],
          ],
          series: ["Series 1", "Series 2", "Series 3"],
          categories: ["Jan", "Feb", "Mar", "Apr"],
        },
      },
      {
        prompt: "Create a chart showing monthly revenue for 2024 with steady growth.",
        arguments: {
          prompt: "Create a chart showing monthly revenue for 2024 with steady growth.",
          slideNumber: 3,
          chartType: "lineNormal",
          aiDataPrompt:
            "Create monthly revenue data for 2024 showing steady growth from $50k to $120k",
        },
      },
    ],
  });

  func.call = async function (params) {
    Asc.scope.params = params;
    if (params.prompt && !params.data) {
      let requestEngine = AI.Request.create(AI.ActionType.Chat);
      if (!requestEngine) return;
      let isSendedEndLongAction = false;
      async function checkEndAction() {
        if (!isSendedEndLongAction) {
          let actionName =
            "AI" +
            (requestEngine.modelUI && requestEngine.modelUI.name
              ? " (" + requestEngine.modelUI.name + ")"
              : " (Chart Generation)");
          await Asc.Editor.callMethod("EndAction", ["Block", actionName]);
          isSendedEndLongAction = true;
        }
      }
      let actionName =
        "AI" +
        (requestEngine.modelUI && requestEngine.modelUI.name
          ? " (" + requestEngine.modelUI.name + ")"
          : " (Chart Generation)");
      await Asc.Editor.callMethod("StartAction", ["Block", actionName]);
      await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
      try {
        let chartPrompt =
          "Generate chart data for the following request: " +
          params.prompt +
          "\n\nReturn ONLY a JSON object in this exact format (no other text):\n" +
          "{\n" +
          '  "data": [[number, number, ...], [number, number, ...]],\n' +
          '  "series": ["Series1", "Series2", ...],\n' +
          '  "categories": ["Category1", "Category2", ...]\n' +
          "}\n\n" +
          "IMPORTANT RULES:\n" +
          "1. The number of arrays in 'data' MUST equal the number of items in 'series'\n" +
          "2. ALL arrays in 'data' MUST have exactly the same length\n" +
          "3. The number of items in 'categories' MUST equal the length of each data array\n" +
          "Example: if data=[[10,20,30],[40,50,60]], then series must have 2 names and categories must have 3 names";
        let generatedData = await requestEngine.chatRequest(chartPrompt, false);
        await checkEndAction();
        try {
          let parsedData = JSON.parse(generatedData);
          Asc.scope.params.data = parsedData.data;
          Asc.scope.params.series = parsedData.series;
          Asc.scope.params.categories = parsedData.categories;
          let dataLength = Asc.scope.params.data.length;
          let seriesLength = Asc.scope.params.series.length;
          let pointsLength = Asc.scope.params.data[0]
            ? Asc.scope.params.data[0].length
            : 0;
          let categoriesLength = Asc.scope.params.categories.length;
          for (let i = 1; i < Asc.scope.params.data.length; i++) {
            if (Asc.scope.params.data[i].length !== pointsLength) {
              while (Asc.scope.params.data[i].length < pointsLength) {
                Asc.scope.params.data[i].push(0);
              }
              Asc.scope.params.data[i] = Asc.scope.params.data[i].slice(
                0,
                pointsLength
              );
            }
          }
          if (dataLength !== seriesLength) {
            while (Asc.scope.params.series.length < dataLength) {
              Asc.scope.params.series.push(
                "Series " + (Asc.scope.params.series.length + 1)
              );
            }
            Asc.scope.params.series = Asc.scope.params.series.slice(
              0,
              dataLength
            );
          }
          if (pointsLength !== categoriesLength) {
            while (Asc.scope.params.categories.length < pointsLength) {
              Asc.scope.params.categories.push(
                "Cat " + (Asc.scope.params.categories.length + 1)
              );
            }
            Asc.scope.params.categories = Asc.scope.params.categories.slice(
              0,
              pointsLength
            );
          }
        } catch (e) {
          Asc.scope.params.data = [
            [100, 120, 140],
            [90, 110, 130],
          ];
          Asc.scope.params.series = ["Series 1", "Series 2"];
          Asc.scope.params.categories = ["Cat 1", "Cat 2", "Cat 3"];
        }
      } catch (error) {
        await checkEndAction();
        Asc.scope.params.data = [
          [100, 120, 140],
          [90, 110, 130],
        ];
        Asc.scope.params.series = ["Series 1", "Series 2"];
        Asc.scope.params.categories = ["Cat 1", "Cat 2", "Cat 3"];
      }
      await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
    }
    await Asc.Editor.callCommand(function () {
      let presentation = Api.GetPresentation();
      let slide;
      if (Asc.scope.params.slideNumber) {
        slide = presentation.GetSlideByIndex(
          Asc.scope.params.slideNumber - 1
        );
      } else {
        slide = presentation.GetCurrentSlide();
      }
      if (!slide) return;
      let chartType = Asc.scope.params.chartType || "bar3D";
      let data = Asc.scope.params.data || [
        [100, 120, 140],
        [90, 110, 130],
      ];
      let series = Asc.scope.params.series || ["Series 1", "Series 2"];
      let categories = Asc.scope.params.categories || [
        "Category 1",
        "Category 2",
        "Category 3",
      ];
      if (
        !data ||
        data.length === 0 ||
        !data[0] ||
        data[0].length === 0
      ) {
        data = [
          [100, 120, 140],
          [90, 110, 130],
        ];
        series = ["Series 1", "Series 2"];
        categories = ["Category 1", "Category 2", "Category 3"];
      }
      if (data.length > 0 && data[0].length > 0) {
        let dataLength = data.length;
        let pointsLength = data[0].length;
        for (let i = 1; i < data.length; i++) {
          if (data[i].length !== pointsLength) {
            while (data[i].length < pointsLength) {
              data[i].push(0);
            }
            data[i] = data[i].slice(0, pointsLength);
          }
        }
        if (series.length !== dataLength) {
          while (series.length < dataLength) {
            series.push("Series " + (series.length + 1));
          }
          series = series.slice(0, dataLength);
        }
        if (categories.length !== pointsLength) {
          while (categories.length < pointsLength) {
            categories.push("Category " + (categories.length + 1));
          }
          categories = categories.slice(0, pointsLength);
        }
      }
      let slideWidth = presentation.GetWidth();
      let slideHeight = presentation.GetHeight();
      let width = 5472000;
      let height = 3204000;
      let x = (slideWidth - width) / 2;
      let y = (slideHeight - height) / 2;
      let chart = Api.CreateChart(
        chartType,
        data,
        series,
        categories,
        width,
        height,
        24
      );
      if (chart) {
        chart.SetPosition(x, y);
        slide.AddObject(chart);
      }
    });
  };

  return func;
})());


HELPERS.cell = [];
HELPERS.cell.push((function(){
let func = new RegisteredFunction({
  name: "calculateValues",
  description:
    "Allows performing basic mathematical operations (addition, subtraction, multiplication, division, median, average) on selected cells or a specified range and writing the result to a specified cell or below the last used cell in the column.",
  parameters: {
    type: "object",
    properties: {
      range: {
        type: "string",
        description:
          "Cell range containing values to calculate (e.g., 'A1:A10'). Used for add, multiply, median, average operations",
      },
      targetCell: {
        type: "string",
        description:
          "Cell where to write the result (e.g., 'A12', 'B5'). If omitted, writes result beneath the last used cell in column A",
      },
      operation: {
        type: "string",
        description:
          "Mathematical operation to perform - 'add', 'subtract', 'multiply', 'divide', 'median', 'average'. Default: 'add'",
      },
      cell1: {
        type: "string",
        description: "First cell for subtract/divide operations (e.g., 'A5')",
      },
      cell2: {
        type: "string",
        description: "Second cell for subtract/divide operations (e.g., 'B7')",
      },
    },
    required: ["prompt"],
  },
  examples: [
    {
      prompt: "Calculate the sum of selected cells",
      arguments: { operation: "add" },
    },
    {
      prompt: "Calculate the sum of selected range and write in cell A12",
      arguments: { targetCell: "A12", operation: "add" },
    },
    {
      prompt: "Subtract cell A5 from cell B7 and write result in C10",
      arguments: {
        cell1: "B7",
        cell2: "A5",
        targetCell: "C10",
        operation: "subtract",
      },
    },
    {
      prompt: "Divide cell C3 by cell D4",
      arguments: { cell1: "C3", cell2: "D4", operation: "divide" },
    },
    {
      prompt: "Multiply selected cells",
      arguments: { operation: "multiply" },
    },
    {
      prompt: "Find median of selected cells",
      arguments: { operation: "median" },
    },
    {
      prompt: "Calculate average of range A1:A20 and write in D5",
      arguments: {
        range: "A1:A20",
        targetCell: "D5",
        operation: "average",
      },
    },
  ],
});

func.call = async function (params) {
  Asc.scope.range = params.range;
  Asc.scope.targetCell = params.targetCell;
  Asc.scope.operation = params.operation || "add";
  Asc.scope.cell1 = params.cell1;
  Asc.scope.cell2 = params.cell2;

  await Asc.Editor.callCommand(function () {
    let ws = Api.GetActiveSheet();
    let result = 0;
    let operationLabel = "";

    // Handle subtract and divide operations with two specific cells
    if (
      (Asc.scope.operation.toLowerCase() === "subtract" ||
        Asc.scope.operation.toLowerCase() === "subtraction") &&
      Asc.scope.cell1 &&
      Asc.scope.cell2
    ) {
      let value1 = ws.GetRange(Asc.scope.cell1).GetValue();
      let value2 = ws.GetRange(Asc.scope.cell2).GetValue();

      let num1 = parseFloat(value1);
      let num2 = parseFloat(value2);

      if (!isNaN(num1) && !isNaN(num2)) {
        result = num1 - num2;
        operationLabel = "DIFFERENCE";
      } else {
        result = "ERROR: Invalid numbers";
        operationLabel = "";
      }
    } else if (
      (Asc.scope.operation.toLowerCase() === "divide" ||
        Asc.scope.operation.toLowerCase() === "division") &&
      Asc.scope.cell1 &&
      Asc.scope.cell2
    ) {
      let value1 = ws.GetRange(Asc.scope.cell1).GetValue();
      let value2 = ws.GetRange(Asc.scope.cell2).GetValue();

      let num1 = parseFloat(value1);
      let num2 = parseFloat(value2);

      if (!isNaN(num1) && !isNaN(num2)) {
        if (num2 !== 0) {
          result = num1 / num2;
          operationLabel = "QUOTIENT";
        } else {
          result = "DIV/0 ERROR";
          operationLabel = "";
        }
      } else {
        result = "ERROR: Invalid numbers";
        operationLabel = "";
      }
    } else {
      // Handle other operations (add, multiply, median, average) with range/selection
      let numbers = [];

      if (Asc.scope.range) {
        // User specified a range - process it normally
        let sourceRange = ws.GetRange(Asc.scope.range);
        let values = sourceRange.GetValue2();

        if (values && values.length > 0) {
          for (let i = 0; i < values.length; i++) {
            let row = values[i];
            if (Array.isArray(row)) {
              for (let j = 0; j < row.length; j++) {
                let value = row[j];
                if (value !== null && value !== undefined && value !== "") {
                  let numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    numbers.push(numValue);
                  }
                }
              }
            } else {
              if (row !== null && row !== undefined && row !== "") {
                let numValue = parseFloat(row);
                if (!isNaN(numValue)) {
                  numbers.push(numValue);
                }
              }
            }
          }
        } else if (values !== null && values !== undefined) {
          if (values !== "") {
            let numValue = parseFloat(values);
            if (!isNaN(numValue)) {
              numbers.push(numValue);
            }
          }
        }
      } else {
        // Get selection - try to handle multi-area selections
        let selection = Api.GetSelection();
        let address = selection.GetAddress();

        // Check if address contains comma (indicates multiple areas like "B3:C4,E7")
        if (address.indexOf(",") !== -1) {
          // Multiple areas - split and process each
          let areas = address.split(",");
          for (let a = 0; a < areas.length; a++) {
            let areaAddress = areas[a].trim();
            let areaRange = ws.GetRange(areaAddress);
            let areaValues = areaRange.GetValue2();

            if (areaValues && Array.isArray(areaValues)) {
              for (let i = 0; i < areaValues.length; i++) {
                let row = areaValues[i];
                if (Array.isArray(row)) {
                  for (let j = 0; j < row.length; j++) {
                    let value = row[j];
                    if (value !== null && value !== undefined && value !== "") {
                      let numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        numbers.push(numValue);
                      }
                    }
                  }
                } else {
                  if (row !== null && row !== undefined && row !== "") {
                    let numValue = parseFloat(row);
                    if (!isNaN(numValue)) {
                      numbers.push(numValue);
                    }
                  }
                }
              }
            } else if (
              areaValues !== null &&
              areaValues !== undefined &&
              areaValues !== ""
            ) {
              let numValue = parseFloat(areaValues);
              if (!isNaN(numValue)) {
                numbers.push(numValue);
              }
            }
          }
        } else {
          // Single contiguous area
          let values = selection.GetValue2();

          if (values && values.length > 0) {
            for (let i = 0; i < values.length; i++) {
              let row = values[i];
              if (Array.isArray(row)) {
                for (let j = 0; j < row.length; j++) {
                  let value = row[j];
                  if (value !== null && value !== undefined && value !== "") {
                    let numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      numbers.push(numValue);
                    }
                  }
                }
              } else {
                if (row !== null && row !== undefined && row !== "") {
                  let numValue = parseFloat(row);
                  if (!isNaN(numValue)) {
                    numbers.push(numValue);
                  }
                }
              }
            }
          } else if (values !== null && values !== undefined) {
            if (values !== "") {
              let numValue = parseFloat(values);
              if (!isNaN(numValue)) {
                numbers.push(numValue);
              }
            }
          }
        }
      }

      // Perform the requested operation on the range
      if (numbers.length === 0) {
        result = 0;
        operationLabel = "NO DATA";
      } else {
        switch (Asc.scope.operation.toLowerCase()) {
          case "add":
          case "sum":
            result = numbers.reduce((acc, val) => acc + val, 0);
            operationLabel = "TOTAL";
            break;

          case "multiply":
          case "multiplication":
            result = numbers.reduce((acc, val) => acc * val, 1);
            operationLabel = "PRODUCT";
            break;

          case "median":
            let sorted = numbers.slice().sort((a, b) => a - b);
            let mid = Math.floor(sorted.length / 2);
            if (sorted.length % 2 === 0) {
              result = (sorted[mid - 1] + sorted[mid]) / 2;
            } else {
              result = sorted[mid];
            }
            operationLabel = "MEDIAN";
            break;

          case "average":
          case "mean":
            result =
              numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
            operationLabel = "AVERAGE";
            break;

          default:
            result = numbers.reduce((acc, val) => acc + val, 0);
            operationLabel = "TOTAL";
        }
      }
    }

    // Format the result value
    let resultValue = operationLabel ? operationLabel + ": " + result : result;

    // Determine where to write the result
    let targetCell;

    if (Asc.scope.targetCell) {
      targetCell = ws.GetRange(Asc.scope.targetCell);
    } else {
      let usedRange = ws.GetUsedRange();
      if (usedRange) {
        let address = usedRange.GetAddress();
        let matches = address.match(/:([A-Z]+)(\d+)$/);
        let lastRow;
        if (matches && matches[2]) {
          lastRow = parseInt(matches[2]) + 1;
        } else {
          lastRow = 2;
        }
        let targetAddress = "A" + lastRow;
        targetCell = ws.GetRange(targetAddress);
      } else {
        targetCell = ws.GetRange("A1");
      }
    }

    targetCell.SetValue(resultValue);
  });
};

return func;

})());
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


