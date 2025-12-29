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
HELPERS.word.push((function () {
  let func = new RegisteredFunction({
    name: "insertTable",
    description:
      "Use this function to insert a table at the current cursor position or at the start/end of the document. You can specify the number of rows and columns, and optionally add headers.",
    parameters: {
      type: "object",
      properties: {
        rows: { type: "number", description: "number of rows in the table" },
        columns: {
          type: "number",
          description: "number of columns in the table",
        },
        hasHeaders: {
          type: "boolean",
          description: "whether the first row should be formatted as headers",
        },
        tableStyle: {
          type: "string",
          description:
            "optional table style name (e.g., 'Table Grid', 'Light Grid')",
        },
        width: {
          type: "number",
          description: "table width percentage (default is 100)",
        },
        widthType: {
          type: "string",
          description:
            "width type - 'percent' or 'point' (default is 'percent')",
        },
        position: {
          type: "string",
          description:
            "where to insert the table - 'current', 'start', or 'end' (default is 'current')",
        },
      },
      required: ["rows", "columns"],
    },
  });

  func.call = async function (params) {
    Asc.scope.rows = params.rows || 3;
    Asc.scope.columns = params.columns || 3;
    Asc.scope.hasHeaders = params.hasHeaders || false;
    Asc.scope.tableStyle = params.tableStyle;
    Asc.scope.width = params.width || 100;
    Asc.scope.widthType = params.widthType || "percent";
    Asc.scope.position = params.position || "current";

    await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();

      if (Asc.scope.position === "start") {
        doc.MoveCursorToStart();
      } else if (Asc.scope.position === "end") {
        doc.MoveCursorToEnd();
      }

      let table = Api.CreateTable(Asc.scope.rows, Asc.scope.columns);
      doc.InsertContent([table]);

      let unit =
        Asc.scope.widthType === "point" ? "twips" : Asc.scope.widthType;
      let widthValue =
        Asc.scope.widthType === "point"
          ? Asc.scope.width * 20
          : Asc.scope.width;
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

    func.call = async function (params) {
        Asc.scope.items = params.items || ["Item 1", "Item 2", "Item 3"];
        Asc.scope.listType = params.listType || "bulleted";
        Asc.scope.position = params.position || "current";

        await Asc.Editor.callCommand(function () {
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
    name: "insertTable",
    description:
      "Use this function to insert a table at the current cursor position or at the start/end of the document. You can specify the number of rows and columns, and optionally add headers.",
    parameters: {
      type: "object",
      properties: {
        rows: { type: "number", description: "number of rows in the table" },
        columns: {
          type: "number",
          description: "number of columns in the table",
        },
        hasHeaders: {
          type: "boolean",
          description: "whether the first row should be formatted as headers",
        },
        tableStyle: {
          type: "string",
          description:
            "optional table style name (e.g., 'Table Grid', 'Light Grid')",
        },
        width: {
          type: "number",
          description: "table width percentage (default is 100)",
        },
        widthType: {
          type: "string",
          description:
            "width type - 'percent' or 'point' (default is 'percent')",
        },
        position: {
          type: "string",
          description:
            "where to insert the table - 'current', 'start', or 'end' (default is 'current')",
        },
      },
      required: ["rows", "columns"],
    },
  });

  func.call = async function (params) {
    Asc.scope.rows = params.rows || 3;
    Asc.scope.columns = params.columns || 3;
    Asc.scope.hasHeaders = params.hasHeaders || false;
    Asc.scope.tableStyle = params.tableStyle;
    Asc.scope.width = params.width || 100;
    Asc.scope.widthType = params.widthType || "percent";
    Asc.scope.position = params.position || "current";

    await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();

      if (Asc.scope.position === "start") {
        doc.MoveCursorToStart();
      } else if (Asc.scope.position === "end") {
        doc.MoveCursorToEnd();
      }

      let table = Api.CreateTable(Asc.scope.rows, Asc.scope.columns);
      doc.InsertContent([table]);

      let unit =
        Asc.scope.widthType === "point" ? "twips" : Asc.scope.widthType;
      let widthValue =
        Asc.scope.widthType === "point"
          ? Asc.scope.width * 20
          : Asc.scope.width;
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
        await Asc.Editor.callMethod("EndAction", [
          "GroupActions",
          "",
          "cancel",
        ]);
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
HELPERS.word.push(
(function () {
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
		} catch (_) { }
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
}) ());
HELPERS.word.push((function () {
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


HELPERS.slide = [];
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "addTableToSlide",
		"description": "Adds a table to the slide (194x97mm, centered)",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "the slide number to add table",
					"minimum": 1
				},
				"rows": {
					"type": "number",
					"description": "number of rows"
				},
				"columns": {
					"type": "number",
					"description": "number of columns"
				},
				"data": {
					"type": "array",
					"description": "2D array of cell values - rows x columns"
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "add a 3x3 table on slide 2",
				"arguments": {"slideNumber": 2, "rows": 3, "columns": 3}
			},
			{
				"prompt": "add a table with data on current slide",
				"arguments": {"data": [["Name", "Age", "City"], ["John", "30", "New York"], ["Jane", "25", "London"]]}
			}
		]
	});
	
	func.call = async function (params) {
		Asc.scope.params = params;

		await Asc.Editor.callCommand(function () {
			let presentation = Api.GetPresentation();
			let slide;

			if (Asc.scope.params.slideNumber) {
				slide = presentation.GetSlideByIndex(Asc.scope.params.slideNumber - 1);
			}
			else {
				slide = presentation.GetCurrentSlide();
			}

			if (!slide) return;

			let slideWidth = presentation.GetWidth();
			let slideHeight = presentation.GetHeight();

			let data = Asc.scope.params.data;
			let rows = Asc.scope.params.rows || 3;
			let columns = Asc.scope.params.columns || 3;

			if (data && Array.isArray(data) && data.length > 0) {
				rows = data.length;
				if (data[0] && Array.isArray(data[0])) {
					columns = data[0].length;
				}
			}

			let tableWidth = 7000000;
			let tableHeight = 3500000;
			let x = (slideWidth - tableWidth) / 2;
			let y = (slideHeight - tableHeight) / 2;

			let table = Api.CreateTable(columns, rows);

			if (table) {
				table.SetPosition(x, y);
				table.SetSize(tableWidth, tableHeight);
				let rowHeight = tableHeight / rows;
				if (data && Array.isArray(data)) {
					let rowCount = Math.min(data.length, rows);
					for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
						let row = table.GetRow(rowIdx);
						if (Array.isArray(data[rowIdx])) {
							let cellCount = Math.min(data[rowIdx].length, columns);
							for (let col = 0; col < cellCount; col++) {
								let cell = row.GetCell(col);
								if (cell) {
									let cellContent = cell.GetContent();
									if (cellContent) {
										cellContent.RemoveAllElements();
										let paragraph = Api.CreateParagraph();
										let value = data[rowIdx][col];
										if (value !== null && value !== undefined) {
											paragraph.AddText(value);
											cellContent.Push(paragraph);
										}
									}
								}
							}
						}
					}
				}

				slide.AddObject(table);
			}
		});
	};
	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "addChartToSlide",
		"description": "Adds a chart to the slide (152x89mm, centered)",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "slide number to add chart to (optional, defaults to current)",
					"minimum": 1
				},
				"chartType": {
					"type": "string",
					"description": "type of chart - bar, barStacked, barStackedPercent, bar3D, barStacked3D, barStackedPercent3D, barStackedPercent3DPerspective, horizontalBar, horizontalBarStacked, horizontalBarStackedPercent, horizontalBar3D, horizontalBarStacked3D, horizontalBarStackedPercent3D, lineNormal, lineStacked, lineStackedPercent, line3D, pie, pie3D, doughnut, scatter, stock, area, areaStacked, areaStackedPercent"
				},
				"data": {
					"type": "array",
					"description": "2D array of numeric data values - all sub-arrays must have same length, number of arrays must match series count"
				},
				"series": {
					"type": "array",
					"description": "array of series names - must have same length as data arrays count"
				},
				"categories": {
					"type": "array",
					"description": "array of category names - must have same length as each data array"
				},
				"prompt": {
					"type": "string",
					"description": "description of what kind of data to generate for the chart"
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "add a bar chart showing sales data on slide 2",
				"arguments": {"slideNumber": 2, "chartType": "bar3D", "data": [[100, 120, 140], [90, 110, 130]], "series": ["Product A", "Product B"], "categories": ["Q1", "Q2", "Q3"]}
			},
			{
				"prompt": "add a pie chart on current slide",
				"arguments": {"chartType": "pie", "data": [[30, 25, 20, 15, 10]], "series": ["Market Share"], "categories": ["Company A", "Company B", "Company C", "Company D", "Others"]}
			},
			{
				"prompt": "add a line chart with 3 series and 4 data points",
				"arguments": {"chartType": "lineNormal", "data": [[10, 20, 30, 40], [15, 25, 35, 45], [12, 22, 32, 42]], "series": ["Series 1", "Series 2", "Series 3"], "categories": ["Jan", "Feb", "Mar", "Apr"]}
			},
			{
				"prompt": "add chart with AI generated data",
				"arguments": {"slideNumber": 3, "chartType": "lineNormal", "prompt": "Create monthly revenue data for 2024 showing steady growth from $50k to $120k"}
			}
		]
	});
	
	func.call = async function (params) {
		Asc.scope.params = params;

		if (params.prompt && !params.data) {
			let requestEngine = AI.Request.create(AI.ActionType.Chat);
			if (!requestEngine) return;

			let isSendedEndLongAction = false;

			async function checkEndAction() {
				if (!isSendedEndLongAction) {
					let actionName = "AI" + (requestEngine.modelUI && requestEngine.modelUI.name ? " (" + requestEngine.modelUI.name + ")" : " (Chart Generation)");
					await Asc.Editor.callMethod("EndAction", ["Block", actionName]);
					isSendedEndLongAction = true;
				}
			}

			let actionName = "AI" + (requestEngine.modelUI && requestEngine.modelUI.name ? " (" + requestEngine.modelUI.name + ")" : " (Chart Generation)");
			await Asc.Editor.callMethod("StartAction", ["Block", actionName]);
			await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

			try {
				let chartPrompt = "Generate chart data for the following request: " + params.prompt + "\n\nReturn ONLY a JSON object in this exact format (no other text):\n" + "{\n" + "  \"data\": [[number, number, ...], [number, number, ...]],\n" + "  \"series\": [\"Series1\", \"Series2\", ...],\n" + "  \"categories\": [\"Category1\", \"Category2\", ...]\n" + "}\n\n" + "IMPORTANT RULES:\n" + "1. The number of arrays in 'data' MUST equal the number of items in 'series'\n" + "2. ALL arrays in 'data' MUST have exactly the same length\n" + "3. The number of items in 'categories' MUST equal the length of each data array\n" + "Example: if data=[[10,20,30],[40,50,60]], then series must have 2 names and categories must have 3 names";

				let generatedData = await requestEngine.chatRequest(chartPrompt, false);

				await checkEndAction();

				try {
					let parsedData = JSON.parse(generatedData);
					Asc.scope.params.data = parsedData.data;
					Asc.scope.params.series = parsedData.series;
					Asc.scope.params.categories = parsedData.categories;

					let dataLength = Asc.scope.params.data.length;
					let seriesLength = Asc.scope.params.series.length;
					let pointsLength = Asc.scope.params.data[0] ? Asc.scope.params.data[0].length : 0;
					let categoriesLength = Asc.scope.params.categories.length;

					for (let i = 1; i < Asc.scope.params.data.length; i++) {
						if (Asc.scope.params.data[i].length !== pointsLength) {
							while (Asc.scope.params.data[i].length < pointsLength) {
								Asc.scope.params.data[i].push(0);
							}
							Asc.scope.params.data[i] = Asc.scope.params.data[i].slice(0, pointsLength);
						}
					}

					if (dataLength !== seriesLength) {
						while (Asc.scope.params.series.length < dataLength) {
							Asc.scope.params.series.push("Series " + (Asc.scope.params.series.length + 1));
						}
						Asc.scope.params.series = Asc.scope.params.series.slice(0, dataLength);
					}

					if (pointsLength !== categoriesLength) {
						while (Asc.scope.params.categories.length < pointsLength) {
							Asc.scope.params.categories.push("Cat " + (Asc.scope.params.categories.length + 1));
						}
						Asc.scope.params.categories = Asc.scope.params.categories.slice(0, pointsLength);
					}
				} catch (e) {
					Asc.scope.params.data = [[100, 120, 140], [90, 110, 130]];
					Asc.scope.params.series = ["Series 1", "Series 2"];
					Asc.scope.params.categories = ["Cat 1", "Cat 2", "Cat 3"];
				}
			} catch (error) {
				await checkEndAction();
				Asc.scope.params.data = [[100, 120, 140], [90, 110, 130]];
				Asc.scope.params.series = ["Series 1", "Series 2"];
				Asc.scope.params.categories = ["Cat 1", "Cat 2", "Cat 3"];
			}

			await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
		}

		await Asc.Editor.callCommand(function () {
			let presentation = Api.GetPresentation();
			let slide;

			if (Asc.scope.params.slideNumber) {
				slide = presentation.GetSlideByIndex(Asc.scope.params.slideNumber - 1);
			}
			else {
				slide = presentation.GetCurrentSlide();
			}

			if (!slide) return;

			let chartType = Asc.scope.params.chartType || "bar3D";
			let data = Asc.scope.params.data || [[100, 120, 140], [90, 110, 130]];
			let series = Asc.scope.params.series || ["Series 1", "Series 2"];
			let categories = Asc.scope.params.categories || ["Category 1", "Category 2", "Category 3"];

			if (!data || data.length === 0 || !data[0] || data[0].length === 0) {
				data = [[100, 120, 140], [90, 110, 130]];
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

			let chart = Api.CreateChart(chartType, data, series, categories, width, height, 24);

			if (chart) {
				chart.SetPosition(x, y);
				slide.AddObject(chart);
			}
		});
	};
	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "deleteSlide",
		"description": "Deletes slide with the specific index or current",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "the slide number to delete",
					"minimum": 1
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "delete slide 5",
				"arguments": {"slideNumber": 5}
			},
			
			{
				"prompt": "delete slide",
				"arguments": {}
			}
		]
	});
	
	func.call = async function (params) {
		Asc.scope.slideNum = params.slideNumber;

		let data = await Asc.Editor.callCommand(function () {
			let presentation = Api.GetPresentation();
			let slide;
			if (Asc.scope.slideNum !== undefined && Asc.scope.slideNum !== null) {
				slide = presentation.GetSlideByIndex(Asc.scope.slideNum - 1);
			}
			if (!slide)
				slide = presentation.GetCurrentSlide();
			if (!slide) {
				return null;
			}
			let curSlideIdx = presentation.GetCurSlideIndex();
			let slideIdx = slide.GetSlideIndex();
			slide.Delete();
			return {"curSlideIdx": curSlideIdx, "slideIdx": slideIdx};
		});
		if (data) {
			if (data["slideIdx"] <= data["curSlideIdx"]) {
				await Asc.Editor.callMethod("GoToSlide", [data["curSlideIdx"]]);
			}
		}
	};
	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "addShapeToSlide",
		"description": "Adds a shape to the slide with optional text (139x42mm, centered, blue fill with dark border)",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "Slide number to add shape to",
					"minimum": 1
				},
				"shapeType": {
					"type": "string",
					"description": "shape type - rect, roundRect, ellipse, triangle, diamond, pentagon, hexagon, star5, plus, mathMinus, mathMultiply, mathEqual, mathNotEqual, heart, cloud, leftArrow, rightArrow, upArrow, downArrow, leftRightArrow, chevron, bentArrow, curvedRightArrow, blockArc, wedgeRectCallout, cloudCallout, ribbon, wave, can, cube, pie, donut, sun, moon, smileyFace, lightningBolt, noSmoking"
				},
				"text": {
					"type": "string",
					"description": "text to add to the shape"
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "add a rectangle with text on slide 2",
				"arguments": { "slideNumber": 2, "shapeType": "rect" }
			},
			{
				"prompt": "add a star shape on current slide",
				"arguments": { "shapeType": "star5" }
			},
			{
				"prompt": "add a rounded rectangle with text",
				"arguments": { "text": "Key Message" }
			},
			{
				"prompt": "add a diamond shape with text",
				"arguments": { "shapeType": "diamond", "text": "Decision Point" }
			},
			{
				"prompt": "add a right arrow with text",
				"arguments": { "shapeType": "rightArrow", "text": "Next Step" }
			}
		]
	});
	
	func.call = async function(params) {
		Asc.scope.params = params;
		await Asc.Editor.callCommand(function () {
				let presentation = Api.GetPresentation();
				let slide;

				if (Asc.scope.params.slideNumber) {
					slide = presentation.GetSlideByIndex(Asc.scope.params.slideNumber - 1);
				}
				else {
					slide = presentation.GetCurrentSlide();
				}

				if (!slide) return;

				let slideWidth = presentation.GetWidth();
				let slideHeight = presentation.GetHeight();

				let shapeType = Asc.scope.params.shapeType || "rect";
				let width = 2500000;
				let height = 2500000;
				let x = (slideWidth - width) / 2;
				let y = (slideHeight - height) / 2;

				let fill = Api.CreateSolidFill(Api.CreateSchemeColor("accent1"));
				let stroke = Api.CreateStroke(12700, Api.CreateSolidFill(Api.CreateRGBColor(51, 51, 51)));

				let shape = Api.CreateShape(shapeType, width, height, fill, stroke);
				shape.SetPosition(x, y);

				if (Asc.scope.params.text) {
					let docContent = shape.GetDocContent();
					if (docContent) {
						let paragraph = docContent.GetElement(0);
						if (!paragraph) {
							paragraph = Api.CreateParagraph();
							docContent.Push(paragraph);
						}
						paragraph.SetJc("center");
						paragraph.AddText(Asc.scope.params.text);
						shape.SetVerticalTextAlign("center");
					}
				}
				slide.AddObject(shape);
		});
	};

	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "addNewSlide",
		"description": "Adds a new slide at the end of presentation using default layout from current slide's master",
		"parameters": {
			"type": "object",
			"properties": {
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "Add new slide",
				"arguments": {}
			}
		]
	});
	
	func.call = async function(params) {
		Asc.scope.params = params;
		await Asc.Editor.callCommand(function () {
				let presentation = Api.GetPresentation();
				let currentSlide = presentation.GetCurrentSlide();
				let master;
				if (currentSlide) {
					currentSlide = presentation.GetSlideByIndex(0);
					let curLayout = currentSlide.GetLayout();
					master = curLayout.GetMaster();
				}
				else {
					master = presentation.GetMasterByIndex(0);
				}
				if (!master) {
					return;
				}

				let layout = master.GetLayoutByType("obj");
				if (!layout) {
					let layoutsCount = master.GetLayoutsCount();
					if (layoutsCount > 0) {
						layout = master.GetLayout(0);
					}
				}

				if (!layout) return;
				let newSlide = Api.CreateSlide();

				if (layout) {
					newSlide.ApplyLayout(layout);
				}

				presentation.AddSlide(newSlide);
		});
	};

	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "addImageByDescription",
		"description": "Adds an image on the slide in the presentation",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "the slide number to add generated image to",
					"minimum": 1
				},
				"description": {
					"type": "string",
					"description": "text description of the image to generate"
				},
				"width": {
					"type": "number",
					"description": "image width in mm"
				},
				"height": {
					"type": "number",
					"description": "image height in mm"
				},
				"style": {
					"type": "string",
					"description": "image style (realistic, cartoon, abstract, etc.)"
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "add an image of a sunset over mountains to slide 1",
				"arguments": { "slideNumber": 1, "description": "beautiful sunset over mountain range with orange and purple sky"}
			},
			{
				"prompt": "add a cartoon style image of office workers with custom size",
				"arguments": {"description": "team of diverse office workers collaborating around a table", "style": "cartoon" }
			}
		]
	});
	
	func.call = async function(params) {
		Asc.scope.params = params;
		Asc.scope.description = params.description;

		let widthMm = params.width || 100;
		let heightMm = params.height || 100;
		Asc.scope.width = widthMm * 36000;
		Asc.scope.height = heightMm * 36000;
		Asc.scope.style = params.style || "realistic";

		let widthPx = Math.round((widthMm / 25.4) * 96);
		let heightPx = Math.round((heightMm / 25.4) * 96);

		let requestEngine = null;
		requestEngine = AI.Request.create(AI.ActionType.ImageGeneration);
		if (!requestEngine) {
			return;
		}

		let fullPrompt = Asc.scope.description;
		if (Asc.scope.style && Asc.scope.style !== "realistic") {
			fullPrompt = Asc.scope.style + " style, " + fullPrompt;
		}

		fullPrompt += ", image size " + widthPx + "x" + heightPx + " pixels";

		let aspectRatio = widthPx / heightPx;
		if (aspectRatio > 1.8) {
			fullPrompt += ", wide panoramic format";
		}
		else if (aspectRatio < 0.6) {
			fullPrompt += ", tall vertical format";
		}
		else if (aspectRatio > 0.9 && aspectRatio < 1.1) {
			fullPrompt += ", square format";
		}

		let isSendedEndLongAction = false;

		async function checkEndAction() {
			if (!isSendedEndLongAction) {
				let actionName = "AI (" + requestEngine.modelUI.name + ")";
				await Asc.Editor.callMethod("EndAction", ["Block", actionName]);
				isSendedEndLongAction = true;
			}
		}

		let actionName = "AI (" + requestEngine.modelUI.name + ")";
		await Asc.Editor.callMethod("StartAction", ["Block", actionName]);
		await Asc.Editor.callMethod("StartAction", ["GroupActions"]);

		try {
			let imageUrl;
			imageUrl = await requestEngine.imageGenerationRequest(fullPrompt);

			await checkEndAction();

			if (imageUrl) {
				Asc.scope.imageUrl = imageUrl;
				await Asc.Editor.callCommand(function () {
					let oPresentation = Api.GetPresentation();
					let oSlide;
					if (params.slideNumber !== undefined && params.slideNumber !== null) {
						oSlide = oPresentation.GetSlideByIndex(params.slideNum - 1);
					}
					else {
						oSlide = oPresentation.GetCurrentSlide();
					}
					if (!oSlide) return;

					let slideWidth = oPresentation.GetWidth();
					let slideHeight = oPresentation.GetHeight();

					let x = (slideWidth - Asc.scope.width) / 2;
					let y = (slideHeight - Asc.scope.height) / 2;

					let oImage = Api.CreateImage(Asc.scope.imageUrl, Asc.scope.width, Asc.scope.height);
					oImage.SetPosition(x, y);
					oSlide.AddObject(oImage);
				});
			}
		} catch (error) {
			await checkEndAction();
		}

		await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
	};

	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "changeSlideBackground",
		"description": "Changes the color of the slide in the presentation.",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "Slide number to apply the color",
					"minimum": 1
				},
				"backgroundType": {
					"type": "string",
					"description": "type of background - 'solid', 'gradient'"
				},
				"color": {
					"type": "string",
					"description": "hex color for solid background (e.g., '#FF5733')"
				},
				"gradientColors": {
					"type": "array",
					"description": "array of hex colors for gradient"
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "set blue background on slide 1",
				"arguments": { "slideNumber": 1, "backgroundType": "solid", "color": "#0066CC" }
			},
			{
				"prompt": "set gradient background",
				"arguments": {"backgroundType": "gradient", "gradientColors": ["#FF0000", "#0000FF"] }
			}
		]
	});
	
	func.call = async function(params) {
		Asc.scope.params = params;
		await Asc.Editor.callCommand(function () {
				let presentation = Api.GetPresentation();
				let slide = presentation.GetSlideByIndex(Asc.scope.params.slideNumber - 1);
				if (!slide) 
					slide = presentation.GetCurrentSlide();
				if (!slide) return;

				let fill;

				switch (Asc.scope.params.backgroundType) {
					case "solid":
						if (Asc.scope.params.color) {
							let rgb = parseInt(Asc.scope.params.color.slice(1), 16);
							let r = (rgb >> 16) & 255;
							let g = (rgb >> 8) & 255;
							let b = rgb & 255;
							fill = Api.CreateSolidFill(Api.CreateRGBColor(r, g, b));
						}
						break;

					case "gradient":
						if (Asc.scope.params.gradientColors && Asc.scope.params.gradientColors.length >= 2) {
							let stops = [];
							let step = 100000 / (Asc.scope.params.gradientColors.length - 1);

							for (let i = 0; i < Asc.scope.params.gradientColors.length; i++) {
								let color = Asc.scope.params.gradientColors[i];
								let rgb = parseInt(color.slice(1), 16);
								let r = (rgb >> 16) & 255;
								let g = (rgb >> 8) & 255;
								let b = rgb & 255;
								let stop = Api.CreateGradientStop(Api.CreateRGBColor(r, g, b), i * step);
								stops.push(stop);
							}

							fill = Api.CreateLinearGradientFill(stops, 5400000);
						}
						break;
				}

				if (fill) {
					slide.SetBackground(fill);
				}
		});
	};

	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "generatePresentationWithTheme",
		"description": "Generates a complete presentation with custom theme, fonts, and streaming content",
		"parameters": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "presentation topic"
				},
				"slideCount": {
					"type": "string",
					"description": "number of slides"
				},
				"style": {
					"type": "string",
					"description": "visual style - modern, classic, minimal, corporate"
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "create a presentation about AI",
				"arguments": {"topic": "Artificial Intelligence in Healthcare", "slideCount": 8, "style": "modern"}
			}
		]
	});

	func.call = async function (params) {

		let isSendedEndLongAction = false;

		async function checkEndAction() {
			if (!isSendedEndLongAction) {
				await Asc.Editor.callMethod("EndAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
				isSendedEndLongAction = true
			}
		}

		function Logger(enabled) {
			this.enabled = !!enabled;
		}
		Logger.prototype.setEnabled = function (v) {
			this.enabled = !!v;
		};
		Logger.prototype._fmt = function (level, msg) {
			return "[AI-PPT][" + level + "] " + msg;
		};
		Logger.prototype.debug = function (msg) {
			if (this.enabled) {
				console.debug(this._fmt("DEBUG", msg));
			}
		};
		Logger.prototype.info = function (msg) {
			if (this.enabled) {
				console.info(this._fmt("INFO", msg));
			}
		};
		Logger.prototype.warn = function (msg) {
			console.warn(this._fmt("WARN", msg));
		};
		Logger.prototype.error = function (msg) {
			console.error(this._fmt("ERROR", msg));
		};
		const log = new Logger(true);

		function JsonObjectFramer(logger) {
			this.buf = "";
			this.log = logger;
			this.all = "";
		}
		JsonObjectFramer.prototype.push = function(chunk) {
			if (chunk) {
				this.buf += chunk;
				//this.log.debug(`chunk += ${chunk.length} chars`);
				//this.log.debug(chunk);
				this.all += chunk;
			}
		};
		JsonObjectFramer.prototype.drainObjects = function() {
			const out = [];
			let i = 0, depth = 0, inStr = false, esc = false, start = -1;
			const s = this.buf;
			while (i < s.length) {
				const ch = s[i];
				if (inStr) {
					if (esc) {
						esc = false;
					}
					else if (ch === "\\") {
						esc = true;
					}
					else if (ch === "\"") {
						inStr = false;
					}
				}
				else {
					if (ch === "\"") inStr = true; else if (ch === "{") {
						if (depth === 0) start = i;
						depth++;
					}
					else if (ch === "}") {
						depth--;
						if (depth === 0 && start !== -1) {
							out.push(s.slice(start, i + 1));
							start = -1;
						}
					}
				}
				i++;
			}
			this.buf = (depth === 0) ? "" : s.slice(start >= 0 ? start : s.length);
			return out;
		};
		
		function parseCmd(str, logger) {
			try {
				const obj = JSON.parse(str);
				if (!obj || typeof obj.t !== "string") {
					return null;
				}
				return obj;
			} catch (e) {
				return null;
			}
		}

		
		
		function normalizeName(name, mapAllowedNames) {
			const n = String(name || "").trim();
			let lowCaseName = n.replace(/[\s_\-]/g, "").toLowerCase();
			if (mapAllowedNames && mapAllowedNames[lowCaseName]) {
				return mapAllowedNames[lowCaseName];
			}
			return lowCaseName;
		}
		function isEqualNames(name1, name2) {
			return normalizeName(name1) === normalizeName(name2);
		}
		function normalizePhType(type) {
			if (!type) return "body";
			return normalizeName(type, {
				"picture": "picture",
				"ctrtitle": "ctrTitle",
				"subtitle": "subTitle"
			});
		}
		function normalizeLayoutName(name) {
			return normalizeName(name, {
				"title": "title",
				"obj": "obj",
				"twoobj": "twoObj",
				"twotxtwoobj": "twoTxTwoObj",
				"sechead": "secHead",
				"titleonly": "titleOnly",
				"blank": "blank",
				"objtx": "objTx",
				"pictx": "picTx",
				"verttx": "vertTx",
				"verttitleandtx": "vertTitleAndTx"
			});
		}
		function Ph(type, idx) {
			return {ph_type: type, ph_idx: idx};
		}
		function getFromMapByKey(map, key) {
			if (!map || typeof map !== "object")
				return null;
			if (typeof key !== "string")
				return null;
			let key_ = key.toLowerCase();
			for (let mapKey in map) {
				if (map.hasOwnProperty(mapKey)) {
					let mapKey_ = mapKey.toLowerCase();
					if (mapKey_ === key_) {
						return map[mapKey];
					}
				}
			}
			return null;
		}
		function getLayoutSpec(ltType) {
			return getFromMapByKey(LAYOUT_SPECS, ltType);
		}

		const LAYOUT_SPECS = {
			"title": [
				Ph("ctrTitle", 0), 
				Ph("subTitle", 1), 
				Ph("dt", 10),
				Ph("ftr", 11),
				Ph("sldNum", 12)
			], 
			"obj": [
				Ph("title", 0), 
				Ph("body", 1), 
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"secHead": [
				Ph("title", 0), 
				Ph("body", 1), 
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"twoObj": [
				Ph("title", 0), 
				Ph("body", 1), 
				Ph("body", 2), 
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"twoTxTwoObj": [
				Ph("title", 0), 
				Ph("body", 1), // text
				Ph("body", 2), // content
				Ph("body", 3), // text
				Ph("body", 4), // content
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"titleOnly": [
				Ph("title", 0), 
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"blank": [
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"objTx": [
				Ph("title", 0), 
				Ph("body", 1), // object (generic)
				Ph("body", 2), // caption
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"picTx": [
				Ph("title", 0), 
				Ph("picture", 1), 
				Ph("body", 2), 
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"vertTx": [
				Ph("title", 0), 
				Ph("body", 1), // vertical body
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			], 
			"vertTitleAndTx": [
				Ph("title", 0),     // vertical title
				Ph("body", 1),     // vertical text
				Ph("dt", 10), 
				Ph("ftr", 11), 
				Ph("sldNum", 12)
			]
		};

		function ExecState() {
			this.presentationCreated = false;
			this.currentSlideIndex = null;
			this.currentLayout = null;
			this.hasAnySlide = false;
			this.docContentId = null;
			this.paraId = null;
			this.tableId = null;
			this.chartCtx = null;
			this.theme = {colors: {}, fonts: {major: "Arial", minor: "Arial"}};
			this.imageQueue = [];
			this.imageBusy = false;
			this._started = false;
			this._ended = false;
			this._pendingPictureDrawingId = null;
		}

		function Executor(requestEngine, logger) {
			this.s = new ExecState();
			this.requestEngine = requestEngine;
			this.log = logger;
		}
		Executor.prototype.ensureAction = async function () {
			if (this.s._ended) {
				return;
			}
			if (!this.s._started) {
				this.s._started = true;
				await Asc.Editor.callMethod("StartAction", ["Block", "AI (" + this.requestEngine.modelUI.name + ")"]);
				await Asc.Editor.callMethod("StartAction", ["GroupActions", "AI: Build presentation"]);
				//this.log.info("StartAction");
			}
		};
		Executor.prototype.endAction = async function () {
			if (!this.s._ended && this.s._started) {
				await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
				await Asc.Editor.callMethod("EndAction", ["Block", "AI"]);
				this.s._ended = true;
				//this.log.info("EndAction");
			}
		};
		Executor.prototype._inSlide = function () {
			return this.s.currentSlideIndex !== null && this.s.currentSlideIndex !== undefined;
		};
		Executor.prototype._requireInSlide = function (role) {
			if (!this._inSlide()) {
				//this.log.warn(role + ": ignored (no open slide)");
				return false;
			}
			return true;
		};
		Executor.prototype._themeAllowed = function () {
			if (this.s.hasAnySlide) {
				return false;
			}
			return true;
		};
		Executor.prototype._validatePlaceholder = function (ph_type, ph_idx, role) {
			const layout = this.s.currentLayout;
			if (!layout) {
				return true;
			}
			const spec = getLayoutSpec(layout);
			if (!spec) {
				return true;
			}
			const t = normalizePhType(ph_type);
			const i = Number(ph_idx || 0);
			const isContentRole = role === "figure" || role === "picture" || role === "table" || role === "chart";
			const allowed = spec.some(function (ph) {
				const isService = ph.ph_type === "dt" || ph.ph_type === "ftr" || ph.ph_type === "sldNum";
				if (isContentRole && isService) {
					return false;
				}
				const isTitle = ph.ph_type === "title" || ph.ph_type === "ctrTitle" || ph.ph_type === "subTitle";
				if (isTitle && role !== "figure") {
					return false;
				}
				const typeMatch = ph.ph_type === t || (ph.ph_type === "body" && (t === "body" || t === "" || t === "unknown"));
				const idxMatch = ph.ph_idx === i;
				return typeMatch && idxMatch;
			});
			return allowed;
		};
		Executor.prototype._findDrawingByPlaceholder = async function (slideIndex, ph_type, ph_idx) {
			Asc.scope._slideIndex = slideIndex;
			Asc.scope._ph_type = normalizePhType(ph_type);
			Asc.scope._ph_idx = Number(ph_idx || 0);
			let drawingId = await Asc.Editor.callCommand(function () {
				const pres = Api.GetPresentation();
				const slide = pres.GetSlideByIndex(Asc.scope._slideIndex);
				if (!slide) {
					return null;
				}
				const drawings = slide.GetAllDrawings();
				for (let d of drawings) {
					const ph = d.GetPlaceholder();
					if (!ph) {
						continue;
					}
					const type = ph.GetType();
					const typeOk = type === Asc.scope._ph_type || (type === "unknown" && Asc.scope._ph_type === "body") || (type === "ctrTitle" && Asc.scope._ph_type === "title");
					if (!typeOk) {
						continue;
					}
					const phIdx = parseInt(ph.GetIndex() || "0");
					const want = parseInt(Asc.scope._ph_idx || 0);
					const match = phIdx === want || (!ph.GetIndex() && want === 0);
					if (match) {
						return d.GetInternalId();
					}
				}
				return null;
			});
			Asc.scope._slideIndex = null;
			Asc.scope._ph_type = null;
			Asc.scope._ph_idx = null;
			return drawingId;
		};
		Executor.prototype._bindDocContentFromDrawingId = async function (drawingId) {
			Asc.scope._drawId = drawingId;
			const ids = await Asc.Editor.callCommand(function () {
				const drawing = Api.GetByInternalId(Asc.scope._drawId);
				if (!drawing) {
					return null;
				}
				const dc = drawing.GetDocContent ? drawing.GetDocContent() : null;
				if (!dc) {
					return null;
				}
				if (dc.GetElementsCount() > 0) {
					const p = dc.GetElement(0);
					return {docContentId: dc.GetInternalId(), paraId: p.GetInternalId()};
				}
				else {
					const p = Api.CreateParagraph();
					dc.Push(p);
					return {docContentId: dc.GetInternalId(), paraId: p.GetInternalId()};
				}
			});
			Asc.scope._drawId = null;
			if (ids) {
				this.s.docContentId = ids.docContentId;
				this.s.paraId = ids.paraId;
			}
			return !!ids;
		};
		Executor.prototype._newParagraphIfNeeded = async function () {
			if (this.s.docContentId && !this.s.paraId) {
				Asc.scope._dcId = this.s.docContentId;
				this.s.paraId = await Asc.Editor.callCommand(function () {
					const dc = Api.GetByInternalId(Asc.scope._dcId);
					if (!dc) {
						return null;
					}
					const p = Api.CreateParagraph();
					dc.Push(p);
					return p.GetInternalId();
				});
				Asc.scope._dcId = null;
			}
		};
		Executor.prototype.presentationStart = async function (sLanguage) {
			this.s.language = sLanguage;
		};
		Executor.prototype.presentationEnd = async function () {
			this.s.presentationEnd = true;
			await this._drainImages();
		};
		Executor.prototype.themeStart = async function () {
			if (!this._themeAllowed()) {
				return;
			}
			this.s.theme = {
				colors: {}, 
				fonts: {
					major: "Arial", 
					minor: "Arial"
				}
			};
		};
		Executor.prototype.themeColors = async function (colors) {
			if (!this._themeAllowed()) {
				return;
			}
			const keys = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				if (colors[k]) {
					this.s.theme.colors[k] = colors[k];
				}
			}
		};
		Executor.prototype.themeFonts = async function (major, minor) {
			if (!this._themeAllowed()) {
				return;
			}
			this.s.theme.fonts = {major: major, minor: minor};
		};
		Executor.prototype.themeDecorStart = async function (decor) {
			if (!this._themeAllowed()) {
				return;
			}
			this.s.theme.decor = {};
		};
		Executor.prototype.themeDecorEnd = async function () {
		};
		Executor.prototype.layoutDecor = async function (layoutDecor) {
			
			let decor = this.s.theme.decor;
			if (!decor)
				return;
			
			if (!decor[layoutDecor.layoutType]) 
				decor[layoutDecor.layoutType] = [];
			decor[layoutDecor.layoutType].push(layoutDecor);
		};
		Executor.prototype.themeEnd = async function () {
		};
		Executor.prototype.slideStart = async function (layoutRaw) {
			if (this._inSlide()) {
				await this.slideEnd();
			}
			this.s.hasAnySlide = true;
			this.s.currentLayout = normalizeLayoutName(layoutRaw);
			Asc.scope._layout = this.s.currentLayout;
			if (!this.s.presentationCreated && this.s.theme) {
				
				Asc.scope._theme = {
					colors: this.s.theme.colors,
					fonts: this.s.theme.fonts,
					decor: this.s.theme.decor
				};
				Asc.scope.language = this.s.language;
				
				let data = await Asc.Editor.callCommand(function () {
					const pres = Api.GetPresentation();
				
					pres.SetLanguage(Asc.scope.language);
					for (let i = pres.GetSlidesCount() - 1; i >= 0; i--) {
						pres.GetSlideByIndex(i).Delete();
					}
					const master = Api.CreateDefaultMasterSlide();
					pres.AddMaster(master);
					const theme = master.GetTheme();
					const fs = theme.GetFontScheme();
					const fonts = Asc.scope._theme.fonts;
					fs.SetFonts(fonts.major, fonts.major, fonts.major, fonts.minor, fonts.minor, fonts.minor);
					const colors = Asc.scope._theme.colors;
					const map = {
						"dk1": 6,
						"lt1": 10,
						"dk2": 7,
						"lt2": 11,
						"accent1": 0,
						"accent2": 1,
						"accent3": 2,
						"accent4": 3,
						"accent5": 4,
						"accent6": 5,
						"hlink": 9,
						"folHlink": 8
					};

					function hexToRGB(hex) {
						const n = parseInt(hex.slice(1), 16);
						return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
					}


					let pW = pres.GetWidth();
					let pH = pres.GetHeight();
					
					const colorScheme = theme.GetColorScheme();
					Object.keys(colors).forEach(function(colorKey) {
						if (Object.prototype.hasOwnProperty.call(map, colorKey)) {
							const rgbArray = hexToRGB(colors[colorKey]);
							
							const colorIndex = map[colorKey];
							
							const newColor = Api.CreateRGBColor(rgbArray[0], rgbArray[1], rgbArray[2]);
							colorScheme.ChangeColor(colorIndex, newColor);
						}
					});
					const lay = master.GetLayoutByType(Asc.scope._layout) || master.GetLayout(0);
					const slide = Api.CreateSlide();
					if (lay) {
						slide.ApplyLayout(lay);
					}
					pres.AddSlide(slide);
					
					let decor = Asc.scope._theme.decor;
					
					for (let ltType in decor) {
						let layout = master.GetLayoutByType(ltType);
						
						if (layout) {
							let decoObjects = decor[ltType];
							if (decoObjects) {
								for (let sp = 0; sp < decoObjects.length; ++sp) {
									let decoObject = decoObjects[sp];
								
									
									let svgPathString = decoObject.d;
									let commands = svgPathString.split(" ");
									
									let aPathCommands = [];
									let cmdIdx = 0;
									while (cmdIdx < commands.length) {
										let type = commands[cmdIdx];
										if (type === "M") {
											let x = parseFloat(commands[++cmdIdx]);
											let y = parseFloat(commands[++cmdIdx]);
											if (!isNaN(x) && !isNaN(y)) {
												aPathCommands.push({op: "M", x: x, y: y});
											}
											else {
												aPathCommands.length = 0;
												break;
											}
										}
										else if (type === "C") {
											let x1 = parseFloat(commands[++cmdIdx]);
											let y1 = parseFloat(commands[++cmdIdx]);
											let x2 = parseFloat(commands[++cmdIdx]);
											let y2 = parseFloat(commands[++cmdIdx]);
											let x = parseFloat(commands[++cmdIdx]);
											let y = parseFloat(commands[++cmdIdx]);
											
											if (!isNaN(x) && !isNaN(y) &&
												!isNaN(x1) && !isNaN(y1) && 
												!isNaN(x2) && !isNaN(y2)) {
												aPathCommands.push({op: "C", x1: x1, y1: y1, x2: x2, y2: y2, x: x, y: y});
											}
											else {
												aPathCommands.length = 0;
												break;
											}
										}
										else if (type === "L") {
											let x = parseFloat(commands[++cmdIdx]);
											let y = parseFloat(commands[++cmdIdx]);
											if (!isNaN(x) && !isNaN(y)) {
												aPathCommands.push({op: "L", x: x, y: y});
											}
											else {
												aPathCommands.length = 0;
												break;
											}
										}
										else if (type === "Z") {
											aPathCommands.push({op: "Z"});
										}
										else {
											aPathCommands.length = 0;
											break;
										}
										if (aPathCommands.length > 0) {
											++cmdIdx;
										}
									}
									
									if (aPathCommands.length > 0) {
										let fill = Api.CreateSolidFill(Api.CreateSchemeColor(decoObject.fill));
										let stroke = Api.CreateStroke(0, Api.CreateNoFill());
										let shape = Api.CreateShape("rect", pW, pH, fill, stroke);
										let customGeometry = Api.CreateCustomGeometry();
										let path = customGeometry.AddPath();
										let scale = 100000;
										path.SetWidth(scale);
										path.SetHeight(scale);
										path.SetStroke(false);
										for (let cmdIdx = 0; cmdIdx < aPathCommands.length; ++cmdIdx) {
											let cmdSvg = aPathCommands[cmdIdx];
											switch (cmdSvg.op) {
												case "M":
													path.MoveTo(cmdSvg.x * scale, cmdSvg.y * scale);
													break;
												case "C":
													path.CubicBezTo(
														cmdSvg.x1 * scale,
														cmdSvg.y1 * scale,
														cmdSvg.x2 * scale,
														cmdSvg.y2 * scale,
														cmdSvg.x * scale,
														cmdSvg.y * scale
													);
													break;
												case "L":
													path.LineTo(cmdSvg.x * scale, cmdSvg.y * scale);
													break;
												case "Z":
													path.Close();
													break;
											}
										}
										shape.SetGeometry(customGeometry);
										shape.SetPosition(0, 0);
										layout.AddObject(shape);
									}
									
								}
							}
						}
					}
					let notesPage = slide.GetNotesPage();
					if (notesPage) {
						let notesTheme = notesPage.GetTheme();
						if (notesTheme) {
							let notesFS = notesTheme.GetFontScheme();
							notesFS.SetFonts(fonts.major, fonts.major, fonts.major, fonts.minor, fonts.minor, fonts.minor);
						}
					}
					return {curSlideIdx: pres.GetSlidesCount() - 1, masterId: master.GetInternalId()};
				});
				this.s.currentSlideIndex = data.curSlideIdx;
				Asc.scope.masterId = data.masterId;
				this.s.theme = null;
				Asc.scope._theme = null;
				
				Asc.scope.language = null;
				this.s.presentationCreated = true;
			}
			else {
				this.s.currentSlideIndex = await Asc.Editor.callCommand(function () {
					const pres = Api.GetPresentation();
					const master = Api.GetByInternalId(Asc.scope.masterId);
					const lay = master.GetLayoutByType(Asc.scope._layout) || master.GetLayout(0);
					const slide = Api.CreateSlide();
					if (lay) {
						slide.ApplyLayout(lay);
					}
					pres.AddSlide(slide);
					return pres.GetSlidesCount() - 1;
				});
			}
			this.s.docContentId = null;
			this.s.paraId = null;
			this.s.tableId = null;
			this.s.chartCtx = null;
			this.s._pendingPictureDrawingId = null;
			Asc.scope._layout = null;
		};
		Executor.prototype.slideEnd = async function () {
			if (!this._inSlide()) {
				return;
			}
			this.s.currentSlideIndex = null;
			this.s.currentLayout = null;
			this.s.docContentId = null;
			this.s.paraId = null;
			this.s.tableId = null;
			this.s.chartCtx = null;
			this.s._pendingPictureDrawingId = null;
		};
		Executor.prototype.figureStart = async function (ph) {
			if (!this._requireInSlide("figure.start")) {
				return;
			}
			if (!this._validatePlaceholder(ph.ph_type, ph.ph_idx, "figure")) {
				return;
			}
			const drawingId = await this._findDrawingByPlaceholder(this.s.currentSlideIndex, ph.ph_type, ph.ph_idx);
			if (!drawingId) {
				return;
			}
			await this._bindDocContentFromDrawingId(drawingId);
		};
		Executor.prototype.figureEnd = async function () {
			if (!this._requireInSlide("figure.end")) {
				return;
			}
			this.s.docContentId = null;
			this.s.paraId = null;
		};
		Executor.prototype.para = async function (text) {
			if (!this._requireInSlide("para")) {
				return;
			}
			if (!this.s.docContentId) {
				return;
			}
			await this._newParagraphIfNeeded();
			Asc.scope._pid = this.s.paraId;
			Asc.scope._dcId = this.s.docContentId;
			Asc.scope._text = text || "";
			await Asc.Editor.callCommand(function () {
				let p = Api.GetByInternalId(Asc.scope._pid);
				if (!p) {
					const dc = Api.GetByInternalId(Asc.scope._dcId);
					p = Api.CreateParagraph();
					dc.Push(p);
				}
				p.AddText(Asc.scope._text);
			});
			this.s.paraId = null;
			
			Asc.scope._pid = null;
			Asc.scope._dcId = null;
			Asc.scope._text = null;
		};
		Executor.prototype.pictureStart = async function (ph) {
			if (!this._requireInSlide("picture.start")) {
				return;
			}
			const ph_type = normalizePhType(ph.ph_type || "picture");
			if (!this._validatePlaceholder(ph_type, ph.ph_idx || 0, "picture")) {
				return;
			}
			await checkEndAction();
			const drawingId = await this._findDrawingByPlaceholder(this.s.currentSlideIndex, ph_type, ph.ph_idx || 0);
			this.s._pendingPictureDrawingId = drawingId || null;
		};
		Executor.prototype.pictureDesc = async function (prompt) {
			if (!this._requireInSlide("picture.desc")) {
				return;
			}
			if (!this.s._pendingPictureDrawingId) {
				return;
			}
			if (!prompt) {
				return;
			}
			Asc.scope._drawId = this.s._pendingPictureDrawingId;
			this.s._pendingPictureDrawingId = null;
			await checkEndAction();
			let placeholderData = await Asc.Editor.callCommand(function () {
				const imagePlaceholder = Api.GetByInternalId(Asc.scope._drawId);
				if (!imagePlaceholder) {
					return null;
				}
				let posX = imagePlaceholder.GetPosX();
				let posY = imagePlaceholder.GetPosY();
				let width = imagePlaceholder.GetWidth();
				let height = imagePlaceholder.GetHeight();
				return {x: posX, y: posY, width: width, height: height, drawingId: Asc.scope._drawId};
			});
			if (placeholderData) {
				placeholderData.prompt = prompt || "";
				this.s.imageQueue.push(placeholderData);
			}
		};
		Executor.prototype.pictureEnd = async function () {
			if (!this._requireInSlide("picture.end")) {
				return;
			}
		};
		Executor.prototype.loadImage = async function (url) {
			const img = new Image();
			img.src = url;
			if (img.complete && img.naturalWidth) {
				return img;
			}
			if (img.decode) {
				await img.decode();
			}
			else {
				await new Promise(function (res, rej) {
					img.onload = function () {
						res();
					};
					img.onerror = function (e) {
						rej(e);
					};
				});
			}
			return img;
		};
		Executor.prototype._drainImages = async function () {
			if (this.s.imageBusy) {
				return;
			}
			const job = this.s.imageQueue.shift();
			if (!job) {
				
				await Asc.Editor.callMethod("EndAction", ["GroupActions", "AI: Build presentation"]);
				return;
			}
			this.s.imageBusy = true;
			try {
				const imageEngine = AI.Request.create(AI.ActionType.ImageGeneration);
				if (!imageEngine) {
					await Asc.Editor.callMethod("EndAction", ["GroupActions", "AI: Build presentation"]);
					return;
				}
				Asc.scope._drawId = job.drawingId;
				await checkEndAction();
				await Asc.Editor.callCommand(function () {
					const d = Api.GetByInternalId(Asc.scope._drawId);
					if (d) {
						d.Select();
					}
				});
				const url = await imageEngine.imageGenerationRequest(job.prompt);
				if (url) {
					let img = await this.loadImage(url);
					Asc.scope._url = url;
					Asc.scope._drawId = job.drawingId;
					let scaleW = img.naturalWidth / job.width;
					let scaleH = img.naturalHeight / job.height;
					if (scaleW > scaleH) {
						Asc.scope.phW = job.width;
						Asc.scope.phH = (img.naturalHeight / scaleW + 0.5 >> 0);
					}
					else {
						Asc.scope.phH = job.height;
						Asc.scope.phW = (img.naturalWidth / scaleH + 0.5 >> 0);
					}
					Asc.scope.phX = (job.x + job.width / 2 - Asc.scope.phW / 2 + 0.5 >> 0);
					Asc.scope.phY = (job.y + job.height / 2 - Asc.scope.phH / 2 + 0.5 >> 0);
					await checkEndAction();
					await Asc.Editor.callCommand(function () {
						const img = Api.CreateImage(Asc.scope._url, Asc.scope.phW, Asc.scope.phH);
						const d = Api.GetByInternalId(Asc.scope._drawId);
						if (d) {
							if (d.ReplacePlaceholder(img)) {
								img.SetPosX(Asc.scope.phX);
								img.SetPosY(Asc.scope.phY);
								img.SetSize(Asc.scope.phW, Asc.scope.phH);
							}
						}
					});
					Asc.scope._url = null;
					Asc.scope._drawId = null;
					Asc.scope.phH = null;
					Asc.scope.phW = null;
					Asc.scope.phX = null;
					Asc.scope.phY = null;
				}
				else {
				}
			} catch (e) {
			}
			
			const self = this;
			this.s.imageBusy = false;
			setTimeout(function () {
				self._drainImages();
			}, 1000);
		};
		Executor.prototype.tableStart = async function (ph) {
			if (!this._requireInSlide("table.start")) {
				return;
			}
			if (!this._validatePlaceholder(ph.ph_type, ph.ph_idx, "table")) {
				return;
			}
			const slideIndex = this.s.currentSlideIndex;
			Asc.scope._slideIndex = slideIndex;
			Asc.scope._ph_type = ph.ph_type;
			Asc.scope._ph_idx  = ph.ph_idx;
			Asc.scope._rows = Number(ph.rows || 0);
			Asc.scope._cols = Number(ph.cols || 0);
			this.s.tableId = await Asc.Editor.callCommand(function () {
				const pres = Api.GetPresentation();
				const slide = pres.GetSlideByIndex(Asc.scope._slideIndex);
				if (!slide) {
					return null;
				}
				const drawings = slide.GetAllDrawings();
				for (let d of drawings) {
					const ph = d.GetPlaceholder();
					if (!ph) {
						continue;
					}
					const typeOk = ph.GetType() === "body" || ph.GetType() === "unknown";
					const want = parseInt(Asc.scope._ph_idx || 0);
					const phIdx = parseInt(ph.GetIndex() || "0");
					const match = typeOk && (phIdx === want || (!ph.GetIndex() && want === 0));
					if (match) {
						const tbl = Api.CreateTable(Asc.scope._cols, Asc.scope._rows);
						d.ReplacePlaceholder(tbl);
						return tbl.GetInternalId();
					}
				}
				return null;
			});
			Asc.scope._slideIndex = null;
			Asc.scope._ph = null;
			Asc.scope._rows = null;
			Asc.scope._cols = null;
		};
		Executor.prototype.cellStart = async function (row, col) {
			if (!this._requireInSlide("cell.start")) {
				return;
			}
			if (!this.s.tableId) {
				return;
			}
			Asc.scope._tid = this.s.tableId;
			Asc.scope._row = Number(row || 0);
			Asc.scope._col = Number(col || 0);
			const ids = await Asc.Editor.callCommand(function () {
				const tbl = Api.GetByInternalId(Asc.scope._tid);
				if (!tbl) {
					return null;
				}
				const r = tbl.GetRow(Asc.scope._row);
				if (!r) {
					return null;
				}
				const c = r.GetCell(Asc.scope._col);
				if (!c) {
					return null;
				}
				const dc = c.GetContent();
				if (!dc) {
					return null;
				}
				if (dc.GetElementsCount() > 0) {
					const p = dc.GetElement(0);
					return {docContentId: dc.GetInternalId(), paraId: p.GetInternalId()};
				}
				else {
					const p = Api.CreateParagraph();
					dc.Push(p);
					return {docContentId: dc.GetInternalId(), paraId: p.GetInternalId()};
				}
			});
			
			Asc.scope._tid = null;
			Asc.scope._row = null;
			Asc.scope._col = null;
			if (ids) {
				this.s.docContentId = ids.docContentId;
				this.s.paraId = ids.paraId;
			}
			else {
			}
		};
		Executor.prototype.cellEnd = async function () {
			if (!this._requireInSlide("cell.end")) {
				return;
			}
			this.s.docContentId = null;
			this.s.paraId = null;
		};
		Executor.prototype.tableEnd = async function () {
			if (!this._requireInSlide("table.end")) {
				return;
			}
			this.s.tableId = null;
		};
		Executor.prototype.chartStart = async function (ph) {
			if (!this._requireInSlide("chart.start")) {
				return;
			}
			if (!this._validatePlaceholder(ph.ph_type, ph.ph_idx, "chart")) {
				return;
			}
			this.s.chartCtx = {
				ph: ph, 
				type: ph.chartType || "bar3D", 
				title: "", x: "", y: "", 
				categories: [], 
				series: []
			};
		};
		Executor.prototype.chartTitle = async function (text) {
			if (this.s.chartCtx) {
				this.s.chartCtx.title = text || "";
			}
		};
		Executor.prototype.chartAxes = async function (x, y) {
			if (this.s.chartCtx) {
				this.s.chartCtx.x = x || "";
				this.s.chartCtx.y = y || "";
			}
		};
		Executor.prototype.chartCategories = async function (items) {
			if (this.s.chartCtx) {
				this.s.chartCtx.categories = Array.isArray(items) ? items : [];
			}
		};
		Executor.prototype.chartSeries = async function (name, values) {
			if (this.s.chartCtx) {
				this.s.chartCtx.series.push([name || "", Array.isArray(values) ? values.map(Number) : []]);
			}
		};
		Executor.prototype.chartEnd = async function () {
			if (!this._requireInSlide("chart.end")) {
				return;
			}
			const ctx = this.s.chartCtx;
			if (!ctx) {
				return;
			}
			const slideIndex = this.s.currentSlideIndex;
			Asc.scope._slideIndex = slideIndex;
			Asc.scope._ph = ctx.ph;
			Asc.scope._ph_idx = ctx.ph.ph_idx;
			Asc.scope._ph_type = ctx.ph.ph_type;
			Asc.scope._ctx = ctx;
			await Asc.Editor.callCommand(function () {
				const pres = Api.GetPresentation();
				const slide = pres.GetSlideByIndex(Asc.scope._slideIndex);
				if (!slide) {
					return;
				}
				const drawings = slide.GetAllDrawings();
				for (let d of drawings) {
					const ph = d.GetPlaceholder();
					if (!ph) {
						continue;
					}
					const typeOk = ph.GetType() === "body" || ph.GetType() === "unknown";
					const want = parseInt(Asc.scope._ph_idx || 0);
					const phIdx = parseInt(ph.GetIndex() || "0");
					const match = typeOk && (phIdx === want || (!ph.GetIndex() && want === 0));
					if (match) {
						const values = Asc.scope._ctx.series.map(function (s) {
							return s[1];
						});
						const names = Asc.scope._ctx.series.map(function (s) {
							return s[0];
						});
						const chart = Api.CreateChart(Asc.scope._ctx.type, values, names, (Asc.scope._ctx.categories || []));
						if (Asc.scope._ctx.title) {
							chart.SetTitle(Asc.scope._ctx.title);
						}
						d.ReplacePlaceholder(chart);
						break;
					}
				}
			});
			this.s.chartCtx = null;
			
			Asc.scope._slideIndex = null;
			Asc.scope._ph = null;
			Asc.scope._ctx = null;
		};
		Executor.prototype.notesStart = async function () {
			if (!this._requireInSlide("notes.start")) {
				return;
			}
			const slideIndex = this.s.currentSlideIndex;
			Asc.scope._slideIndex = slideIndex;
			const ids = await Asc.Editor.callCommand(function () {
				const pres = Api.GetPresentation();
				const slide = pres.GetSlideByIndex(Asc.scope._slideIndex);
				if (!slide) {
					return null;
				}
				const notes = slide.GetNotesPage();
				if (!notes) {
					return null;
				}
				const body = notes.GetBodyShape();
				if (!body) {
					return null;
				}
				const dc = body.GetDocContent();
				if (!dc) {
					return null;
				}
				if (dc.GetElementsCount() > 0) {
					const p = dc.GetElement(0);
					return {docContentId: dc.GetInternalId(), paraId: p.GetInternalId()};
				}
				else {
					const p = Api.CreateParagraph();
					dc.Push(p);
					return {docContentId: dc.GetInternalId(), paraId: p.GetInternalId()};
				}
			});
			if (ids) {
				this.s.docContentId = ids.docContentId;
				this.s.paraId = ids.paraId;
			}
			else {
			}
			Asc.scope._slideIndex = null;
		};
		Executor.prototype.notesEnd = async function () {
			if (!this._requireInSlide("notes.end")) {
				return;
			}
			this.s.docContentId = null;
			this.s.paraId = null;
		};

		const fontList = await Asc.Editor.callMethod("GetFontList");
		const availableFonts = fontList.map(f => f.m_wsFontName).filter(Boolean);

		const requestEngine = AI.Request.create(AI.ActionType.Chat);
		if (!requestEngine) return;


		const topic = params.topic || "Untitled presentation";
		let intSlideCount = parseInt(params.slideCount, 10);
		const userSlideCount = (Number.isFinite(intSlideCount) && intSlideCount > 0) ? intSlideCount : null;
		const style = params.style || "modern";

		const additionalConstrait = userSlideCount !== null ? `- You have a HARD CAP of ${userSlideCount} slide blocks: output exactly ${userSlideCount} {"t":"slide.start"}...{"t":"slide.end"} pairs.` : ``;

		const goalSlidesText = userSlideCount ? `with exactly ${userSlideCount} slides` : `with an optimal number of slides (do NOT state a number)`;

		const slideCountContract = userSlideCount ? `
SLIDE COUNT CONTRACT (CRITICAL — HARD CAP):
- You MUST output exactly ${userSlideCount} slide blocks.
- A slide block is defined as one pair: {"t":"slide.start",...} ... {"t":"slide.end"}.
- Produce **no more and no fewer** than ${userSlideCount} such blocks.
- If you feel you need more space, compress or merge content into the existing slides instead of starting a new slide.
- Never emit a ${userSlideCount + 1}-th {"t":"slide.start"} under any circumstances.
` : ``;


const fontsContract = `
FONT SELECTION POLICY
Choose {"t":"theme.fonts","major":...,"minor":...} **only** from AVAILABLE FONTS.

Rules:
1. Match the language from {"t":"presentation.start","language":...}:
   - Latin → Inter, Roboto, Open Sans, Lato, Noto Sans, Arial
   - Cyrillic → Noto Sans/Serif, PT Sans/Serif, Inter, Roboto, Arial
   - Greek → Noto Sans/Serif, Roboto, Arial
   - Arabic/Hebrew → Noto Sans Arabic/Hebrew, Arial (RTL support required)
   - CJK/Devanagari/Thai → Noto Sans [script], Malgun Gothic, Microsoft YaHei
2. Style alignment:
   - modern/minimal/corporate → Sans for minor, Sans or transitional Serif for major
   - classic/editorial → Serif for major, Serif for minor
3. Fallbacks:
   - If font not in AVAILABLE FONTS, pick the first available with correct script coverage.
   - Avoid decorative/display faces for body text.
4. Major = headings; Minor = body text.
5. Output exactly one valid pair.
`;

const prompt = `
You must stream a sequence of JSON objects (JSON Lines). Each line is one complete JSON object with a field "t".
ABSOLUTELY NO prose, no markdown, no code fences — only JSON objects, one per line.

Goal: generate a complete PPTX presentation about "${topic}" ${goalSlidesText} in ${style} style.
${slideCountContract}

AVAILABLE FONTS (use only these for theme.fonts):
${availableFonts.join(", ")}

Top-level envelope (MANDATORY):
- {"t":"presentation.start","language":"<a language identifier as defined by RFC 4646/BCP 47. Example: "en-CA">"}
  ... all commands MUST be here ...
- {"t":"presentation.end"}


Allowed commands (flat placeholder fields; NO nested "placeholder" objects):
- {"t":"theme.start"}
- {"t":"theme.colors","dk1":"#RRGGBB","lt1":"#RRGGBB","dk2":"#RRGGBB","lt2":"#RRGGBB","accent1":"#RRGGBB","accent2":"#RRGGBB","accent3":"#RRGGBB","accent4":"#RRGGBB","accent5":"#RRGGBB","accent6":"#RRGGBB","hlink":"#RRGGBB","folHlink":"#RRGGBB"}
- {"t":"theme.fonts","major":"<one of AVAILABLE FONTS>","minor":"<one of AVAILABLE FONTS>"}
- {"t":"theme.decor.start"}
- {"t":"layoutDecor","layoutType":"title|obj|twoObj|twoTxTwoObj|secHead|titleOnly|blank|objTx|picTx|vertTx|vertTitleAndTx","fill":"accent1|accent2|accent3|accent4|accent5|accent6|dk1|lt1|dk2|lt2|hlink|folHlink","opacity":0.08_to_0.30,"d":"M 0.00 0.90 L 1.00 0.82 L 1.00 1.00 L 0.00 1.00 Z"}
- {"t":"theme.decor.end"}
- {"t":"theme.end"}

- {"t":"slide.start","layout":"title|obj|twoObj|twoTxTwoObj|secHead|titleOnly|blank|objTx|picTx|vertTx|vertTitleAndTx"}
- {"t":"slide.end"}

- {"t":"figure.start","ph_type":"ctrTitle|subTitle|title|body|dt|ftr|sldNum","ph_idx":<number>}
- {"t":"para","text":"..."}           // each para is one paragraph; NO bullets/dashes/checkboxes/emojis/numeric prefixes
- {"t":"figure.end"}

- {"t":"picture.start","ph_type":"body|picture","ph_idx":<number>}
- {"t":"picture.desc","text":"detailed image prompt..."}  // one-shot description
- {"t":"picture.end"}

- {"t":"table.start","ph_type":"body","ph_idx":<number>,"rows":R,"cols":C}
- {"t":"cell.start","row":r,"col":c}
- {"t":"para","text":"..."}           // still no bullets here
- {"t":"cell.end"}
- {"t":"table.end"}

- {"t":"chart.start","ph_type":"body","ph_idx":<number>,"chartType":"bar|barStacked|barStackedPercent|bar3D|barStacked3D|barStackedPercent3D|barStackedPercent3DPerspective|horizontalBar|horizontalBarStacked|horizontalBarStackedPercent|horizontalBar3D|horizontalBarStacked3D|horizontalBarStackedPercent3D|lineNormal|lineStacked|lineStackedPercent|line3D|pie|pie3D|doughnut|scatter|area|areaStacked|areaStackedPercent"}
- {"t":"chart.title","text":"..."}
- {"t":"chart.axes","x":"...","y":"..."}
- {"t":"chart.categories","items":["A","B","C",...]}
- {"t":"chart.series","name":"Series Name","values":[10,12,15]}
- {"t":"chart.end"}

- {"t":"notes.start"}
- {"t":"para","text":"speaker note..."}  // no bullets in notes either
- {"t":"notes.end"}


${additionalConstrait}

Constraints:
- The VERY FIRST object must be {"t":"presentation.start"} and the VERY LAST must be {"t":"presentation.end"}.
- All commands (theme.*, slide.*, figure.*, para, picture.*, table.*, chart.*, notes.*) MUST appear STRICTLY between presentation.start and presentation.end.
- Inside the presentation, all slide content and notes MUST appear strictly between that slide’s {"t":"slide.start"} and {"t":"slide.end"}.
- Do NOT emit any figure/table/chart/picture/notes/para outside an open slide.
- Theme commands (theme.*) MUST be inside the presentation and BEFORE the first slide.start.
- {"t":"slide.start"} MUST include ONLY the keys "t" and "layout". Do NOT include any extra fields (like ph_type, chartType, etc.).
- **Text formatting rule (critical):** never prefix any paragraph with bullets, dashes, asterisks, checkbox marks, numerals with separators, or emojis.
  Disallowed starts include: "•", "·", "▪", "◦", "*", "-", "–", "—", "1)", "1.", "[ ]", "[x]", "✅", etc.
  For list-like content, emit multiple {"t":"para","text":"Item"} lines as plain sentences with no leading marks.
- **Slide count rule:** If a fixed slide count is provided by the user, produce EXACTLY that many slides. If the user did NOT provide a slide count, choose the optimal number yourself and DO NOT state or promise any specific number anywhere in the output.
- Use AVAILABLE FONTS only for theme.fonts major/minor.
- Start with theme.* then the first slide as "title".
- Do NOT place tables/charts/pictures into title/ctrTitle/subTitle placeholders.
- Do NOT place any content into dt/ftr/sldNum placeholders.
- Provide concise speaker notes for most content slides via notes.start/para/notes.end.
- Each JSON must be valid and standalone. Do not split objects across lines.
- Layout value is STRICT: it MUST be EXACTLY one of:
  title, obj, twoObj, twoTxTwoObj, secHead, titleOnly, blank, objTx, picTx, vertTx, vertTitleAndTx.
- Never use any value that looks like a command token (e.g., "chart.start", "notes.end") or contains a dot.
- {"t":"slide.start"} MUST contain ONLY keys "t" and "layout". Any other keys are forbidden.
- If you are unsure which layout to choose, use "obj".

- Slide count rule (critical):
  * If the user provided a slide count, you MUST produce exactly that many slides.
  * A slide = one {"t":"slide.start",...} ... {"t":"slide.end"} pair.
  * Never exceed or fall short of this number. If you need more content, compress/merge within existing slides.
  * If the user did not provide a slide count, choose an optimal number yourself and do NOT state any number.

- Language (critical):
  * The "language" property in {"t":"presentation.start", ...} defines the language for ALL human-readable text in this deck:
	slide titles, body paragraphs, captions, picture.desc, chart titles/axes/categories/series names, speaker notes, etc.
  * Use a valid BCP 47 tag (RFC 4646). Example: "en-CA".
  * JSON field names and command tokens stay in English as specified; only the TEXT CONTENT follows the selected language.
  * Choose fonts (theme.fonts major/minor) that exist in AVAILABLE FONTS and have glyph coverage for the selected language/script.


Layout selection guide (pick the one that best matches the intent of the slide):
- title — Opening slide. Big headline + subtitle.
  Placeholders: ctrTitle(0), subTitle(1). Use ONLY for slide 1 (and rarely for a closing recap).
- obj — Default content slide. One title + a single body area for text/table/chart/image.
  Placeholders: title(0), body(1). Use for most slides: overviews, short lists (as multiple plain paras), a single chart or table, or one illustration.
- twoObj — Comparison / Two columns. Title + left body + right body.
  Placeholders: title(0), body(1), body(2). Use for A/B comparisons, Pros vs Cons, Before/After.
- twoTxTwoObj — Four-block grid. Title + 4 bodies.
  Placeholders: title(0), body(1..4). Use for 2×2 matrices, KPI grids, SWOT, roadmap quadrants. Keep each block short.
- secHead — Section divider. Big section title + optional single line of context.
  Placeholders: title(0), body(1). Use to split the deck into parts; minimal content only.
- titleOnly — Divider/quote slide with a single large title line.
  Placeholders: title(0). Use for a clean break or a single statement.
- blank — Empty canvas. No content placeholders.
  Use only for full-bleed visuals or highly custom compositions (rare in this protocol).
- objTx — Object with caption. Title + main object (image/table/chart) + caption text.
  Placeholders: title(0), body(1)=object, body(2)=caption. Use when an illustration needs a short explanation.
- picTx — Image + text. Title + picture + text.
  Placeholders: title(0), picture(1), body(2). Use for hero image with supporting text, case studies, product shots with commentary.
- vertTx — Vertical body (rare). Vertical typography scenarios only (explicit request).
  Placeholders: title(0), body(1). Avoid by default; if unsure, choose obj.
- vertTitleAndTx — Vertical title and body (very rare). Niche vertical design.
  Placeholders: title(0), body(1). Do not use unless explicitly asked for vertical text.


Placeholder compatibility for media (tables/charts/pictures):
- title:     NO media in ctrTitle/subTitle. (Text only.)
- obj:       Put ALL media into body(1). Use {"t":"picture.start","ph_type":"body","ph_idx":1}, etc.
- twoObj:    Media goes into body(1) or body(2) (left/right).
- twoTxTwoObj: Media goes into body(1..4).
- objTx:     Main object region is body(1); caption is body(2). Put pictures/charts/tables into body(1).
- picTx:     Picture MUST target placeholder "picture(1)"; text goes to body(2).
- secHead/titleOnly/vert*:  Prefer text only; if media is absolutely needed, use the body placeholder if present. 
- blank:     No placeholders — do NOT emit media here.


- Never use ph_type:"picture" unless the current layout actuallyactually provides a "picture" placeholder (currently only "picTx").
  For all other layouts (e.g., "obj", "twoObj", "objTx"), always target a "body" placeholder for pictures/charts/tables.

Chart type selection guide (choose ONLY from the exact values listed; no aliases and no combo/stock):
DATA SHAPE → CHART TYPE
1) Single series over time (years, months, dates) → "lineNormal"
   - Multiple time series (2–6): "lineNormal" for trend comparison, or "lineStacked" if showing cumulative totals
   - Percent shares over time (each point sums ≈100%) → "lineStackedPercent"
   - Use "line3D" only if the user explicitly requests 3D
2) Categories (not time) + 1–N series → column/bar family:
   - Short category labels → "bar"
   - Long labels or many categories → "horizontalBar"
   - Additive parts per category → "barStacked" / "horizontalBarStacked"
   - Percent shares per category (sum 100%) → "barStackedPercent" / "horizontalBarStackedPercent"
   - 3D variants only on explicit 3D request
3) Parts of a whole for FEW categories (≤6, sums ≈100%) → "pie" or "doughnut"
   - If >6 categories or values are too similar, do NOT use pie/doughnut — choose "bar" or "horizontalBar"
   - "pie3D" only on explicit 3D request
4) Area charts (accumulation across X):
   - One series volume over time → "area"
   - Multiple additive series → "areaStacked"
   - Normalized to 100% → "areaStackedPercent"
5) Two quantitative variables (x and y) without categories → "scatter"
6) NEVER use: any "combo*" types, "stock", or "unknown". Prefer 2D unless explicitly demanded.


Theme color & font guide (OOXML-aligned):
- Theme color slots (choose hex values that fit both the topic and the OOXML role):
  dk1     — Primary text on light backgrounds. Near-black or very dark neutral; must pass WCAG AA (≥4.5:1) on lt1.
  lt1     — Primary background. Near-white or very light neutral; avoid color casts that reduce contrast.
  dk2     — Secondary text/accents on light backgrounds. Dark neutral or dark tinted; AA vs lt1 preferred.
  lt2     — Secondary background/panels. Very light neutral/tinted; keep sufficient contrast vs dk1/dk2 text.
  accent1 — Main brand/topic accent. High-chroma hue matching the subject; used for highlights and primary charts.
  accent2 — Complementary accent (distinct from accent1); used for secondary emphasis.
  accent3 — Additional accent; ensure it is distinguishable from accent1/2 in charts.
  accent4 — Additional accent for multi-series charts.
  accent5 — Additional accent for multi-series charts.
  accent6 — Additional accent for multi-series charts.
  hlink   — Hyperlink color (typically a readable blue aligned with the palette); must be readable on lt1 and distinct from body text.
  folHlink— Visited hyperlink color; distinct from hlink and body text (e.g., a darker/desaturated variant).
- Palette guidance by topic (suggestions; adapt as needed):
  Technology/AI → cool blues & violets; neutrals slightly cool.
  Healthcare/Medical → clean blues & greens; avoid alarming reds as primaries.
  Environment/Nature → greens & earth tones; neutrals warm/earthy.
  Finance/Business → confident blues & neutrals (gray/charcoal); accents conservative.
  Education → approachable blues & oranges; balanced, accessible hues.
- Chart palette: assign series colors in order from accent1..accent6; ensure sufficient contrast vs backgrounds and between series.
- Contrast & accessibility:
  * Body text (dk1 on lt1) should meet WCAG AA (≈≥4.5:1). Large headings (major) ≥3:1.
  * Do not choose overly light accents for text over light backgrounds.
  * Links should be clearly identifiable and legible; underline is acceptable.
- Fonts (theme.fonts):
  * major — headings/titles; minor — body text. Choose ONLY from AVAILABLE FONTS.
  * Language/script coverage: pick fonts that contain glyphs for the presentation language(s). For Cyrillic/Greek/Arabic/Hebrew/CJK, use fonts with native script coverage if present in AVAILABLE FONTS.
  * Purpose/style alignment: 
	  - modern/corporate → clean sans-serif for minor, sturdy sans or transitional serif for major.
	  - classic/editorial → serif major + readable serif/sans minor.
	  - technical/code snippets → consider monospaced only for the snippet figures, not as theme minor.
  * Readability first: avoid decorative/display faces for minor; ensure consistent x-height and weight contrast.
  * If multiple languages appear, prefer a pair with broad Unicode support and harmonious metrics.
- IMPORTANT: Do NOT copy any fixed hex examples; you must PICK COLORS dynamically to fit the topic and roles above.

Good choices:
- Neutral light theme: lt1="#FFFFFF", dk1="#111111", dk2="#333333", lt2="#F5F7FA"; accent1="#2A67FF", accent2="#00B894", ...
- Healthcare: cool lt1, dk1; accents in clean blues/greens; readable hlink blue; folHlink darker.
- Environment: soft warm lt2; greens/browns as accents with sufficient contrast.

Bad choices (avoid):
- dk1 too light to read on lt1; overly saturated lt1; accent colors indistinguishable in charts; hyperlink color identical to body text; fonts lacking glyphs for the language.

Remember:
- Choose theme.colors and theme.fonts BEFORE the first slide.
- Colors must be valid hex "#RRGGBB" values.
- Font names must be from AVAILABLE FONTS exactly as listed.

THEME DECOR (MANDATORY, FLAT JSON BETWEEN START/END)

- You MUST emit exactly one {"t":"theme.decor.start"} and one {"t":"theme.decor.end"} between theme.fonts and theme.end.
- Between them, emit ONLY flat {"t":"layoutDecor",...} lines — no arrays or nested objects.

LAYOUT COVERAGE GUARANTEE (ABSOLUTE)
- Before emitting the first {"t":"slide.start"}, decide the exact set of layouts you will use in the entire deck.
- For EVERY layout that will later appear in {"t":"slide.start","layout":...} (including "title"), emit 2–3 {"t":"layoutDecor"} lines (layers) before any slides.
- Missing decor for any used layout is forbidden.
- Do NOT include decor for layouts that will not appear in the slides.
- After {"t":"theme.decor.end"} you MUST NOT introduce any new layout value in slides.

DECOR STRUCTURE (PER LAYOUT, FLAT LINE)
- Each layer is one flat object:
  {"t":"layoutDecor",
   "layoutType":"title|obj|twoObj|twoTxTwoObj|secHead|titleOnly|blank|objTx|picTx|vertTx|vertTitleAndTx",
   "fill":"accent1|accent2|accent3|accent4|accent5|accent6|dk1|lt1|dk2|lt2|hlink|folHlink",
   "opacity":0.08..0.30,
   "d":"M 0.00 0.90 L 1.00 0.82 L 1.00 1.00 L 0.00 1.00 Z"}
- Exactly ONE closed path per layer (via "d" string). Path MUST start with "M" and end with "Z".
- "d" uses ONLY M/L/C/Z with normalized coordinates in [0..1], quantized to 0.05 (0.00, 0.05, …, 1.00).
- Each layer should cover ~15%–20% of slide area and stay near edges/corners (background only). Do NOT overlap core text zones (title/body/picture placeholders).
- Consistency: the same layout type must keep the same decoration across all slides using that layout.

FILL & OPACITY
- "fill" MUST be one of the theme color keys ONLY: accent1..accent6, dk1, lt1, dk2, lt2, hlink, folHlink. Hex (#RRGGBB) is FORBIDDEN in decor.
- "opacity" MUST be between 0.08 and 0.30. Layers SHOULD vary in fill and/or opacity to create depth.

STYLE → GEOMETRY RULES (CRITICAL)
- Corporate / Official / Classic / Minimal → STRAIGHT polygons (no curves).
- Modern / Playful / Creative / Nature / Ocean / Marketing / Growth / Education / Wellness → at least one layer uses curve ("C").
- Technical / Technology / AI / Data / Engineering / Cloud / Cyber / System / Architecture → mixed: one polygon layer, one curved.

SHAPE LIBRARY (REFERENCE ONLY)
The "d" path must implement one of these archetypes but you must NOT include any "shape" field.
- DIAGONAL_BAND: [ M(0,B) L(1,B-T) L(1,B-T+H) L(0,B+H) Z ]
- CORNER_BLOCK: [ M(0,0) L(S,0) L(0,S) Z ] or [ M(1-S,0) L(1,0) L(1,S) L(1-S,S*0.6) Z ]
- BOTTOM_WAVE: [ M(0,A) C(0.4,A+U,0.7,A+V,1.0,A+W) L(1,1) L(0,1) Z ]
- CORNER_ARC: [ M(0,R) C(0.0,R*0.55,R*0.55,0.0,R,0.0) L(R,0.0) L(0,0) Z ]

HARD GEOMETRY GUARDRAILS
- Each layer MUST be closed (M...Z), convex, edge ≥ 0.10, ≤35% area, near edges/corners.
- No thin lines, spikes, or overlaps with text zones.

${fontsContract}
`;



		const framer = new JsonObjectFramer(log);
		const exec = new Executor(requestEngine, log);

	
		try {
			async function handler(chunk) {
				if (!chunk) return;
				framer.push(chunk);
				const objs = framer.drainObjects();
				//console.log(framer.all);

				for (const objStr of objs) {
					const cmd = parseCmd(objStr, log);
					if (!cmd) continue;
					
					const t = cmd.t;

					// PRESENTATION
					if (t === "presentation.start") {
						await exec.presentationStart(cmd.language);
						continue;
					}
					if (t === "presentation.end") {
						await exec.presentationEnd();
						continue;
					}


					// THEME
					if (t === "theme.start") {
						await exec.themeStart();
						continue;
					}
					if (t === "theme.colors") {
						await exec.themeColors(cmd);
						continue;
					}
					if (t === "theme.fonts") {
						await exec.themeFonts(cmd.major, cmd.minor);
						continue;
					}
					
					if (t === "theme.decor.start") {
						await exec.themeDecorStart(cmd);
						continue;
					}
					if (t === "layoutDecor") {
						await exec.layoutDecor(cmd);
						continue;
					}
					if (t === "theme.decor.end") {
						await exec.themeDecorEnd(cmd);
						continue;
					}
					if (t === "theme.end") {
						await exec.themeEnd();
						await Asc.Editor.callMethod("EndAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
						continue;
					}

					// SLIDE
					if (t === "slide.start") {
						await exec.slideStart(cmd.layout);
						continue;
					}
					if (t === "slide.end") {
						await exec.slideEnd();
						continue;
					}

					// FIGURE
					if (t === "figure.start") {
						await exec.figureStart(cmd);
						continue;
					}
					if (t === "figure.end") {
						await exec.figureEnd();
						continue;
					}

					// PARA
					if (t === "para") {
						await exec.para(cmd.text || "");
						continue;
					}

					// PICTURE
					if (t === "picture.start") {
						await exec.pictureStart(cmd);
						continue;
					}
					if (t === "picture.desc") {
						await exec.pictureDesc(cmd.text || "");
						continue;
					}
					if (t === "picture.end") {
						await exec.pictureEnd();
						continue;
					}

					// TABLE
					if (t === "table.start") {
						await exec.tableStart(cmd);
						continue;
					}
					if (t === "cell.start") {
						await exec.cellStart(cmd.row | 0, cmd.col | 0);
						continue;
					}
					if (t === "cell.end") {
						await exec.cellEnd();
						continue;
					}
					if (t === "table.end") {
						await exec.tableEnd();
						continue;
					}

					// CHART
					if (t === "chart.start") {
						await exec.chartStart(cmd);
						continue;
					}
					if (t === "chart.title") {
						await exec.chartTitle(cmd.text || "");
						continue;
					}
					if (t === "chart.axes") {
						await exec.chartAxes(cmd.x || "", cmd.y || "");
						continue;
					}
					if (t === "chart.categories") {
						await exec.chartCategories(cmd.items || []);
						continue;
					}
					if (t === "chart.series") {
						await exec.chartSeries(cmd.name || "", cmd.values || []);
						continue;
					}
					if (t === "chart.end") {
						await exec.chartEnd();
						continue;
					}

					// NOTES
					if (t === "notes.start") {
						await exec.notesStart();
						continue;
					}
					if (t === "notes.end") {
						await exec.notesEnd();
						continue;
					}
				}
			}

			await Asc.Editor.callMethod("StartAction", ["GroupActions", "AI: Build presentation"]);
			await Asc.Editor.callMethod("StartAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
			await requestEngine.chatRequest(prompt, false, handler);
			if (!exec.s.presentationEnd) {
				await Asc.Editor.callMethod("EndAction", ["GroupActions", "AI: Build presentation"]);
			}
		} catch (e) {
			
			await Asc.Editor.callMethod("EndAction", ["GroupActions", "AI: Build presentation"]);
		}
	};
	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "addTextToPlaceholder",
		"description": "Universal function for adding ANY text content to slides. Use this for ALL text addition requests: recipes, lists, instructions, notes, ideas, or any other text content.",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "the slide number to add text to (optional, default current slide)",
					"minimum": 1
				},
				"text": {
					"type": "string",
					"description": "ANY text content to add - recipes, lists, instructions, notes, ideas, descriptions, stories, data, or whatever user asks to add"
				},
				"textType": {
					"type": "string",
					"description": "type of text - 'body', 'chart', 'clipArt', 'ctrTitle', 'diagram', 'date', 'footer', 'header', 'media', 'object', 'picture', 'sldImage', 'sldNumber', 'subTitle', 'table', 'title' (optional, default 'body')"
				},
				"prompt": {
					"type": "string",
					"description": "AI instructions for text enhancement or generation (optional)"
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "add [anything] or write [anything] or create text about [anything]'",
				"arguments": {"text": "[generated or specified content]", "textType": "body"}
			},
			{
				"prompt": "add recipe for coffee or just recipe for coffee",
				"arguments": {"text": "Coffee Recipe:\\n1. Grind coffee beans\\n2. Heat water to 95°C\\n3. Pour water over coffee\\n4. Wait 4 minutes\\n5. Enjoy", "textType": "body"}
			},
			{
				"prompt": "generate content",
				"arguments": {"text": "Topic", "textType": "body", "prompt": "generate detailed content about this topic"}
			}
		]
	});
	
	func.call = async function (params) {
		Asc.scope.slideNum = params.slideNumber;
		Asc.scope.text = params.text;
		Asc.scope.textType = params.textType || "body";
		Asc.scope.prompt = params.prompt;

		await Asc.Editor.callCommand(function () {
			let presentation = Api.GetPresentation();
			let slide;

			if (Asc.scope.slideNum) {
				slide = presentation.GetSlideByIndex(Asc.scope.slideNum - 1);
			}
			else {
				slide = presentation.GetCurrentSlide();
			}

			if (!slide) return;

			const placeholderGroups = {
				titles: ['title', 'ctrTitle'],
				subTitles: ['subTitle'],
				content: ['body', 'object', 'unknown'],
				media: ['picture', 'chart', 'media', 'clipArt', 'diagram', 'sldImage', 'table'],
				footer: ['footer', 'date', 'sldNumber', 'header']
			};

			function findPlaceholderGroup(type) {
				for (let groupName in placeholderGroups) {
					if (placeholderGroups[groupName].includes(type)) {
						return placeholderGroups[groupName];
					}
				}
				return [type];
			}

			function findShapeByPlaceholderType(slide, placeholderTypes) {
				let allDrawings = slide.GetAllDrawings();

				for (let type of placeholderTypes) {
					for (let i = 0; i < allDrawings.length; i++) {
						let drawing = allDrawings[i];

						let ph = drawing.GetPlaceholder();
						if (ph) {
							if (ph.GetType() === type) {
								return {shape: drawing, foundType: type};
							}
						}
					}
				}

				return null;
			}

			let placeholderGroup = findPlaceholderGroup(Asc.scope.textType);

			let searchResult = findShapeByPlaceholderType(slide, placeholderGroup);
			let targetShape = searchResult ? searchResult.shape : null;
			let foundType = searchResult ? searchResult.foundType : null;

			if (!targetShape && !placeholderGroups.content.includes(Asc.scope.textType)) {
				searchResult = findShapeByPlaceholderType(slide, placeholderGroups.content);
				targetShape = searchResult ? searchResult.shape : null;
				foundType = searchResult ? searchResult.foundType : null;
			}

			let bNewShape = false;
			if (!targetShape) {
				let slideWidth = presentation.GetWidth();
				let slideHeight = presentation.GetHeight();

				let sizes = {
					title: {width: 0.8, height: 0.1},
					ctrTitle: {width: 0.8, height: 0.1},
					subTitle: {width: 0.8, height: 0.08},
					body: {width: 0.8, height: 0.6},
					object: {width: 0.8, height: 0.6},
					picture: {width: 0.5, height: 0.4},
					chart: {width: 0.6, height: 0.5},
					table: {width: 0.8, height: 0.6},
					media: {width: 0.6, height: 0.5},
					clipArt: {width: 0.3, height: 0.3},
					diagram: {width: 0.7, height: 0.5},
					sldImage: {width: 0.6, height: 0.5},
					footer: {width: 0.8, height: 0.06},
					header: {width: 0.8, height: 0.06},
					date: {width: 0.2, height: 0.04},
					sldNumber: {width: 0.1, height: 0.04}
				};

				let size = sizes[Asc.scope.textType] || sizes.body;
				let shapeWidth = slideWidth * size.width;
				let shapeHeight = slideHeight * size.height;
				let x = (slideWidth - shapeWidth) / 2;
				let y = (slideHeight - shapeHeight) / 2;

				let oFill = Api.CreateNoFill();
				let oStroke = Api.CreateStroke(0, Api.CreateNoFill());
				targetShape = Api.CreateShape("rect", shapeWidth, shapeHeight, oFill, oStroke);
				targetShape.SetPosition(x, y);

				slide.AddObject(targetShape);
				foundType = Asc.scope.textType;
				bNewShape = true;
			}

			let docContent = targetShape.GetDocContent();
			if (docContent) {
				let internalContent = docContent.Content || docContent;

				while (internalContent.GetElementsCount() > 1) {
					internalContent.RemoveElement(1);
				}

				let lines = Asc.scope.text.split('\n').filter(line => line.trim() !== '');

				if (lines.length === 1) {
					let paragraph = internalContent.GetElement(0);
					if (paragraph) {
						paragraph.RemoveAllElements();
						paragraph.AddText(lines[0]);
					}
				}
				else {
					let firstParagraph = internalContent.GetElement(0);
					if (firstParagraph) {
						firstParagraph.RemoveAllElements();
						let run = firstParagraph.AddText(lines[0]);
						if (bNewShape) {
							run.SetFill(Api.CreateSolidFill(Api.CreateSchemeColor("tx1")));
						}
					}

					for (let i = 1; i < lines.length; i++) {
						let newParagraph = Api.CreateParagraph();
						let run = newParagraph.AddText(lines[i]);
						if (bNewShape) {
							run.SetFill(Api.CreateSolidFill(Api.CreateSchemeColor("tx1")));
						}
						internalContent.Push(newParagraph);
					}
				}

				return;
			}

			return;
		});

	};
	return func;
})());
HELPERS.slide.push((function(){
	let func = new RegisteredFunction({
		"name": "duplicateSlide",
		"description": "Duplicates slide with the specific index or current",
		"parameters": {
			"type": "object",
			"properties": {
				"slideNumber": {
					"type": "number",
					"description": "the slide number to duplicate",
					"minimum": 1
				}
			},
			"required": []
		},
		"examples": [
			{
				"prompt": "duplicate slide 3",
				"arguments": {"slideNumber": 3}
			},
			
			{
				"prompt": "duplicate slide",
				"arguments": {}
			}
		]
	});
	
	func.call = async function (params) {
		Asc.scope.slideNum = params.slideNumber;
		let data = await Asc.Editor.callCommand(function () {
			let presentation = Api.GetPresentation();
			let slide;
			if (Asc.scope.slideNum !== undefined && Asc.scope.slideNum !== null) {
				slide = presentation.GetSlideByIndex(Asc.scope.slideNum - 1);
			}
			if (!slide)
				slide = presentation.GetCurrentSlide();
			if (!slide) {
				return null;
			}
			let slideIdx = slide.GetSlideIndex();
			if (slide) {
				slide.Duplicate(slideIdx + 1);
				return {"idx": slideIdx + 1};
			}
			return null;
		});
		if (data) {
			await Asc.Editor.callMethod("GoToSlide", [data["idx"] + 1]);
		}
	};
	return func;
})());


HELPERS.cell = [];
HELPERS.cell.push((function () {
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
          description:
            "Second cell for subtract/divide operations (e.g., 'B7')",
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
                      if (
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                      ) {
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
      let resultValue = operationLabel
        ? operationLabel + ": " + result
        : result;

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


